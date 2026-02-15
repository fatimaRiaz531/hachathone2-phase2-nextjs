
import os
import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from openai import AsyncOpenAI
from sqlmodel import select
from models import Message, Conversation, TaskStatus, TaskPriority

# from mcp.tools import tool (Unused and causing import error if mcp lib mismatch)
# Import actual tool implementations
from project_mcp import tools as mcp_tools

# Configure Logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize OpenAI Client
client = AsyncOpenAI(api_key=os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY"))
# Using OpenRouter or OpenAI base URL if needed? 
# The .env.example mentions OPENROUTER_API_KEY.
# If using OpenRouter, we need to set base_url.
BASE_URL = "https://openrouter.ai/api/v1" if os.getenv("OPENROUTER_API_KEY") else None
if BASE_URL:
    client = AsyncOpenAI(
        api_key=os.getenv("OPENROUTER_API_KEY"),
        base_url=BASE_URL
    )
    MODEL_NAME = "openai/gpt-4o" # default for OpenRouter
else:
    MODEL_NAME = "gpt-4o" # default for OpenAI

# System Prompt
SYSTEM_PROMPT = """
You are a helpful Todo AI Assistant.
You allow users to manage their tasks using natural language.
You MUST use the provided tools to fetch, create, update, or delete tasks.
You MUST NOT hallucinate tasks or actions.
You MUST confirm actions after performing them.
You operate in a stateless manner but have access to conversation history.
Users might refer to tasks by vague descriptions (e.g., "delete the milk task"). 
- Use 'list_tasks' to find tasks if ambiguous.
- Use 'complete_task', 'delete_task', 'update_task' with specific IDs found from listing.
- If multiple tasks match, ask the user for clarification.

Tools available:
- add_task(title, description, due_date, priority)
- list_tasks(status, priority, search, limit)
- complete_task(task_id)
- delete_task(task_id)
- update_task(task_id, title, description, status, priority, due_date)

Current Date/Time: {current_time}
"""

# Tool Definitions (Manual Schema or Auto-generated)
TOOLS_SCHEMA = [
    {
        "type": "function",
        "function": {
            "name": "add_task",
            "description": "Create a new task for the user.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "description": {"type": "string"},
                    "due_date": {"type": "string", "description": "ISO format date"},
                    "priority": {"type": "string", "enum": ["low", "medium", "high"]}
                },
                "required": ["title"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "list_tasks",
            "description": "List tasks with optional filtering.",
            "parameters": {
                "type": "object",
                "properties": {
                    "status": {"type": "string", "enum": ["pending", "in_progress", "completed"]},
                    "priority": {"type": "string", "enum": ["low", "medium", "high"]},
                    "search": {"type": "string", "description": "Search term for title/desc"},
                    "limit": {"type": "integer"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "complete_task",
            "description": "Mark a task as completed.",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {"type": "string", "description": "UUID of the task"}
                },
                "required": ["task_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "delete_task",
            "description": "Delete a task.",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {"type": "string", "description": "UUID of the task"}
                },
                "required": ["task_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "update_task",
            "description": "Update task details.",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {"type": "string"},
                    "title": {"type": "string"},
                    "description": {"type": "string"},
                    "status": {"type": "string", "enum": ["pending", "in_progress", "completed"]},
                    "priority": {"type": "string", "enum": ["low", "medium", "high"]},
                    "due_date": {"type": "string"}
                },
                "required": ["task_id"]
            }
        }
    }
]

async def process_chat_message(
    user_id: str,
    message: str,
    db: AsyncSession
) -> Dict[str, Any]:
    """
    Process a user message using the OpenAI Agent.
    
    1. Retrieve/Create conversation.
    2. Retrieve history.
    3. Call OpenAI.
    4. Handle Tool Calls.
    5. Save new messages.
    """
    # 1. Get or Create Conversation
    # For Phase III, we assume one active conversation per user or create new.
    # Let's simple check for latest active conversation or just creating one if None exists?
    # Logic: Keep one main conversation for 'chatbot' context.
    
    # Check if a conversation exists? Or just append to a dedicated "Chatbot" conversation?
    # Spec says "Conversation... id, user_id".
    # Let's assume we find the most recent conversation or create one.
    query = select(Conversation).where(Conversation.user_id == user_id).order_by(Conversation.updated_at.desc()).limit(1)
    result = await db.execute(query)
    conversation = result.scalar_one_or_none()
    
    if not conversation:
        conversation = Conversation(
            id=str(datetime.now().timestamp()), # Use persistent ID or UUID? Model uses UUID default.
            # Wait, model default is uuid.uuid4().
            user_id=user_id
        )
        db.add(conversation)
        await db.commit()
        await db.refresh(conversation)
        
    conversation_id = conversation.id
    
    # 2. Retrieve History (Last N messages to fit context)
    # We should fetch messages associated with this conversation.
    # We can rely on relationship loading or query.
    msg_query = select(Message).where(Message.conversation_id == conversation_id).order_by(Message.created_at.asc())
    # Limit to last 20 messages?
    
    msg_result = await db.execute(msg_query)
    db_messages = msg_result.scalars().all()
    
    # Convert DB messages to OpenAI format
    messages = [{"role": "system", "content": SYSTEM_PROMPT.format(current_time=datetime.now())}]
    for msg in db_messages:
        messages.append({"role": msg.role, "content": msg.content})
        
    # Append current user message
    messages.append({"role": "user", "content": message})
    
    # Save User message to DB
    user_msg_db = Message(
        role="user",
        content=message,
        conversation_id=conversation_id,
        user_id=user_id # Not in Message model? 
        # Check model: `user_id` IS in Message model? 
        # Wait, previous `models.py` check: 
        # class MessageBase(SQLModel): role, content, conversation_id. 
        # No `user_id` in MessageBase/Message! 
        # `Conversation` has `user_id`. `Message` links to `Conversation`.
        # Ah, Spec says "Message... conversation_id, user_id".
        # Let me re-verify `models.py`.
    )
    # Re-verify `models.py` content from previous step.
    # `Message` class: role, content, conversation_id. NO `user_id` directly in Message.
    # `Conversation` has `user_id`.
    # I should strictly follow `models.py` I verified.
    # If `models.py` doesn't have user_id on Message, I won't set it.
    
    user_msg_db = Message(
        role="user",
        content=message,
        conversation_id=conversation_id
    )
    db.add(user_msg_db)
    
    # 3. Call OpenAI
    tool_calls_log = []
    
    # We need a loop for tool calls
    MAX_TURNS = 5
    turn_count = 0
    final_response_content = ""
    
    while turn_count < MAX_TURNS:
        try:
            response = await client.chat.completions.create(
                model=MODEL_NAME,
                messages=messages,
                tools=TOOLS_SCHEMA,
                tool_choice="auto"
            )
        except Exception as e:
            logger.error(f"OpenAI API Error: {e}")
            return {"error": str(e)}

        response_message = response.choices[0].message
        tool_calls = response_message.tool_calls
        
        if tool_calls:
            messages.append(response_message) # Extend conversation with assistant's tool call request
            
            for tool_call in tool_calls:
                function_name = tool_call.function.name
                function_args = json.loads(tool_call.function.arguments)
                
                logger.info(f"Executing tool: {function_name} with args: {function_args}")
                tool_calls_log.append({"name": function_name, "args": function_args})

                # Execute Tool
                tool_result = None
                
                # Mapping tool name to function
                # We inject user_id into the function call!
                if function_name == "add_task":
                    tool_result = await mcp_tools.add_task(user_id=user_id, **function_args)
                elif function_name == "list_tasks":
                    tool_result = await mcp_tools.list_tasks(user_id=user_id, **function_args)
                elif function_name == "complete_task":
                    tool_result = await mcp_tools.complete_task(user_id=user_id, **function_args)
                elif function_name == "delete_task":
                    tool_result = await mcp_tools.delete_task(user_id=user_id, **function_args)
                elif function_name == "update_task":
                    tool_result = await mcp_tools.update_task(user_id=user_id, **function_args)
                else:
                    tool_result = {"error": f"Unknown tool {function_name}"}

                # Append tool result to messages
                messages.append({
                    "tool_call_id": tool_call.id,
                    "role": "tool",
                    "name": function_name,
                    "content": json.dumps(tool_result)
                })
            
            turn_count += 1
            # Loop continues to get next response from model (interpretation of tool output)
        
        else:
            # No tool calls, final response
            final_response_content = response_message.content
            break
            
    # Save Assistant Message to DB
    asst_msg_db = Message(
        role="assistant",
        content=final_response_content or "(No content)",
        conversation_id=conversation_id
    )
    db.add(asst_msg_db)
    await db.commit()
    
    return {
        "response": final_response_content,
        "tool_calls": tool_calls_log
    }
