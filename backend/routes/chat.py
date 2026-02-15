
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from database import get_async_session
from middleware.auth import get_current_user
from models import User, Conversation, Message
from app.agent import run_agent
import uuid
from datetime import datetime, timezone
import json

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    tool_calls: List[Dict[str, Any]] = []

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """
    Chat with the AI Agent.
    
    - User must be authenticated.
    - Conversation history is maintained.
    - Tools are executed statelessly.
    """
    if not request.message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # 1. Load conversation
    conversation_id = request.conversation_id
    conversation = None

    if conversation_id:
        # Fetch specific conversation
        query = select(Conversation).where(
            Conversation.id == conversation_id, 
            Conversation.user_id == current_user.id
        )
        result = await db.execute(query)
        conversation = result.scalar_one_or_none()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        # Fetch latest or create new?
        # For simplicity, let's fetch the most recent one. If none, create new.
        # Or always create new if not provided?
        # "Natural language task management" usually implies context.
        # Let's try to find the latest active one.
        query = select(Conversation).where(
            Conversation.user_id == current_user.id
        ).order_by(desc(Conversation.updated_at))
        
        result = await db.execute(query)
        conversation = result.scalar_one_or_none()
        
        if not conversation:
            # Create new conversation
            conversation = Conversation(
                id=str(uuid.uuid4()),
                user_id=current_user.id,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(conversation)
            await db.commit()
            await db.refresh(conversation)

    # 2. Load history (Messages)
    # We need to load messages for this conversation to pass to Agent
    # We sort by created_at asc
    msg_query = select(Message).where(
        Message.conversation_id == conversation.id
    ).order_by(Message.created_at.asc())
    
    msg_result = await db.execute(msg_query)
    db_messages = msg_result.scalars().all()
    
    # Convert DB messages to OpenAI format
    history = []
    for msg in db_messages:
        # We need to handle 'tool' roles and 'usage' if stored...
        # Our Message model has 'role' and 'content'.
        # It doesn't seem to store tool_calls structured data easily unless content is JSON?
        # The Spec Data Models says: "role (user | assistant)", "content".
        # It doesn't explicitly mention 'tool' role or 'tool_calls'.
        # PROBLEM: OpenAI Agent needs tool_call history to function correctly in loops.
        # If we only store text "content", we lose the tool call structure.
        # We might need to store tool calls in content as JSON or add a field.
        # Given "Data Models" spec is AUTHORITATIVE and minimal.
        # Maybe we serialize tool calls into 'content'?
        # Or maybe the agent just sees the text representation?
        # "Tool calls are visible in API responses" implies they are returned.
        # If we want the agent to *continue* a conversation, it needs to know "I called tool X".
        # If we flatten it to text, the agent might get confused or we need to prompt it with "You called tool X".
        
        # For now, let's assume 'content' holds the JSON of tool calls if role is 'assistant' and it has tool calls?
        # Or we skip complex history for now and just pass User/Assistant text.
        # But Agent behavior "Infer intent... Use MCP tools".
        
        # Let's attempt to parse content if it looks like JSON?
        # Or just pass content as is.
        # OpenAI requires 'tool_calls' field in message to be valid for 'tool' output.
        
        # Hack: If role is 'assistant', we might leave it as text.
        # If the user asks "what tasks did I just add?", the agent needs to know.
        
        history.append({"role": msg.role, "content": msg.content})

    # 3. Persist User Message
    user_msg_id = str(uuid.uuid4())
    user_message = Message(
        id=user_msg_id,
        conversation_id=conversation.id,
        user_id=current_user.id,
        role="user",
        content=request.message,
        created_at=datetime.utcnow()
    )
    db.add(user_message)
    # Don't commit yet? We can batch.
    
    # Add to history passed to agent
    history.append({"role": "user", "content": request.message})
    
    # 4. Run Agent
    # run_agent executes the loop and returns final response + ALL messages (including tool calls)
    agent_result = await run_agent(current_user.id, history)
    
    # 5. Persist Assistant Response and Tool Calls (if any)
    # agent_result["messages"] contains the full chain including the new tools interactions.
    # We need to identify appropriate things to save.
    # If we save EVERY tool call as a Message, we can.
    # Spec "Message... role (user | assistant)".
    # It doesn't strictly say "tool".
    # But usually 'tool' messages are needed for history.
    # We will save them with role='tool' or 'system' or 'assistant' with special content?
    # Let's save them as 'assistant' with content="Tool Call: ..." for valid viewing?
    # OR if we want to support the Agent correctly next time, we need to save the SCHEMA.
    
    # Compromise: We save the *Final* response as the Assistant message.
    # We might lose the intermediate tool calls in *DB persistence* if the model is strict.
    # "Success Criteria: Tool calls are visible in API responses".
    # "Conversation history persists".
    # If we don't persist tool calls, the agent forgets it did something in the next turn.
    # But maybe that's acceptable for "Stateless per request" if the *State* (DB tasks) is updated.
    # The agent checks DB to see tasks.
    
    # Let's save the final response.
    final_content = agent_result["content"]
    if final_content: # It might be None if it just ran tools? No, loop ensures response.
        asst_msg_id = str(uuid.uuid4())
        asst_message = Message(
            id=asst_msg_id,
            conversation_id=conversation.id,
            user_id=current_user.id,
            role="assistant",
            content=final_content,
            created_at=datetime.utcnow()
        )
        db.add(asst_message)
        
    # Update conversation updated_at
    conversation.updated_at = datetime.utcnow()
    db.add(conversation)
    
    await db.commit()
    
    # Extract tool calls from the *current turn* to return in API
    # We look at agent_result["messages"] and find tool calls that happened *after* our user message.
    # We know the user message index?
    # It was appended at `len(history)` (before run_agent).
    # So anything after that index in `agent_result["messages"]` is new.
    
    new_messages = agent_result["messages"][len(history)-1:] # -1 to include user msg? No.
    # history had N items. run_agent takes N. appends M. returns N+M.
    # We want M.
    generated_events = agent_result["messages"][len(history):]
    
    tool_calls_export = []
    for msg in generated_events:
        if hasattr(msg, "tool_calls") and msg.tool_calls:
            for tc in msg.tool_calls:
                tool_calls_export.append({
                    "name": tc.function.name,
                    "arguments": json.loads(tc.function.arguments),
                    "id": tc.id
                })
        # If role is tool, that's the output. Not strictly a "tool call" request.
    
    return ChatResponse(
        response=final_content if final_content else "...",
        conversation_id=conversation.id,
        tool_calls=tool_calls_export
    )
