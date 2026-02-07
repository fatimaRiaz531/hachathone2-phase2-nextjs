from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from typing import List
import uuid
import os
from datetime import datetime

from database import get_async_session
from models import Conversation, Message, User
from schemas import ChatRequest, ChatResponse, ChatMessageResponse
from mcp_server import add_task, list_tasks, complete_task, delete_task, update_task, get_task_stats

# Import OpenAI-Agents
from openai import OpenAI
from agents import Agent, Runner, RunConfig
from agents.tool import function_tool

router = APIRouter()

# Initialize OpenAI client
api_key = os.getenv("OPENAI_API_KEY", "sk-placeholder")
base_url = "https://openrouter.ai/api/v1" if api_key.startswith("sk-or") else None
client = OpenAI(api_key=api_key, base_url=base_url)

# Define the Agent
todo_agent = Agent(
    name="Todo Agent",
    instructions="""You are a professional and friendly Todo List Assistant. 
    Your primary goal is to help users manage their tasks effectively.
    
    1. For Todo Management: Use the provided tools (add, list, complete, delete, update, get_task_stats) when users ask about their tasks. 
    2. Task Summaries: When users ask "how many tasks are left" or "what is my progress", use 'get_task_stats' to provide an accurate count.
    3. Mandatory Parameter: The 'user_id' is required for every tool call. Always use the provided user_id.
    
    Be concise, helpful, and high-performance. Respond in the same language as the user if possible (Hindi/Urdu/English).
    """,

    tools=[
        function_tool(add_task),
        function_tool(list_tasks),
        function_tool(complete_task),
        function_tool(delete_task),
        function_tool(update_task),
        function_tool(get_task_stats)
    ]
)

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest,
    db: AsyncSession = Depends(get_async_session)
):
    """
    Stateless chat endpoint that persists conversation history.
    """
    user_id = request.user_id
    user_message = request.message

    # 1. Fetch or create conversation
    statement = select(Conversation).where(Conversation.user_id == user_id).order_by(Conversation.updated_at.desc())
    result = await db.execute(statement)
    conversation = result.scalars().first()

    if not conversation:
        conversation = Conversation(user_id=user_id)
        db.add(conversation)
        await db.commit()
        await db.refresh(conversation)

    # 2. Save user message
    new_user_msg = Message(
        role="user",
        content=user_message,
        conversation_id=conversation.id
    )
    db.add(new_user_msg)
    await db.flush()  # Ensure it's in the session for history fetching
    
    # 3. Load history for the agent
    history_statement = select(Message).where(Message.conversation_id == conversation.id).order_by(Message.created_at.asc())
    history_result = await db.execute(history_statement)
    db_messages = history_result.scalars().all()
    
    # Convert DB messages to format expected by Agent
    agent_messages = []
    for m in db_messages:
        agent_messages.append({"role": m.role, "content": m.content})

    # 4. Run the Agent
    try:
        agent_instructions = f"""You are a helpful Todo List Assistant. 
        You can help users manage their tasks using the provided tools.
        Always be brief and friendly. 
        If a user wants to add, list, complete, delete, update, or get statistics for tasks, use the appropriate tool.
        The 'user_id' is required for all tool calls.
        
        The current user_id is: {user_id}"""
        
        model_name = "openai/gpt-4o-mini" if api_key.startswith("sk-or") else "gpt-4o"
        
        # Run the agent
        run_result = await Runner.run(
            starting_agent=todo_agent.clone(
                model=model_name,
                instructions=agent_instructions
            ),
            input=agent_messages
        )
        
        agent_response_content = str(run_result.final_output)

        # 5. Save assistant message
        new_assistant_msg = Message(
            role="assistant",
            content=agent_response_content,
            conversation_id=conversation.id
        )
        db.add(new_assistant_msg)
        
        # Update conversation timestamp
        conversation.updated_at = datetime.utcnow()
        await db.commit()

        # 6. Return response with history
        # Fetch updated history
        updated_history_result = await db.execute(history_statement)
        updated_db_messages = updated_history_result.scalars().all()
        
        history_response = [
            ChatMessageResponse(
                role=m.role,
                content=m.content,
                created_at=m.created_at
            ) for m in updated_db_messages
        ]

        return ChatResponse(
            response=agent_response_content,
            history=history_response
        )

    except Exception as e:
        await db.rollback()
        print(f"Agent Error: {e}")
        # Return a fallback response instead of 500 if possible, or raise
        raise HTTPException(status_code=500, detail=f"Agent Error: {str(e)}")

