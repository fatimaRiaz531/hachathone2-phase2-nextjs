import os
import json
from typing import List, Dict, Any, Optional
from openai import AsyncOpenAI
from openai.types.chat import ChatCompletionMessageParam, ChatCompletionToolParam
from app.mcp_server import add_task, list_tasks, complete_task, delete_task, update_task, AddTaskArgs, ListTasksArgs, CompleteTaskArgs, DeleteTaskArgs, UpdateTaskArgs
from middleware.auth import debug_log

# Initialize OpenAI Client
# Initialize OpenAI Client
api_key = os.getenv("OPENAI_API_KEY")
base_url = os.getenv("OPENAI_BASE_URL")

base_url = "https://openrouter.ai/api/v1"

debug_log(f"DEBUG AGENT: Loaded API Key prefix: {str(api_key)[:7]}...")
debug_log(f"DEBUG AGENT: Using Base URL: {base_url}")

client = AsyncOpenAI(
    api_key=api_key, 
    base_url=base_url,
    default_headers={
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Todo App AI",
    }
)

# Define Tool Schemas manually or via Pydantic
# Since we have Pydantic models in mcp_server.py, we can use them to generate schemas.

def get_function_schema(model: Any, name: str, description: str) -> ChatCompletionToolParam:
    schema = model.model_json_schema()
    # Remove user_id from schema so model doesn't ask for it
    if "properties" in schema and "user_id" in schema["properties"]:
        del schema["properties"]["user_id"]
    if "required" in schema and "user_id" in schema["required"]:
        schema["required"].remove("user_id")
        
    return {
        "type": "function",
        "function": {
            "name": name,
            "description": description,
            "parameters": schema
        }
    }

TOOLS: List[ChatCompletionToolParam] = [
    get_function_schema(AddTaskArgs, "add_task", "Create a new task for a user"),
    get_function_schema(ListTasksArgs, "list_tasks", "List tasks for a user with optional filtering"),
    get_function_schema(CompleteTaskArgs, "complete_task", "Mark a task as completed"),
    get_function_schema(DeleteTaskArgs, "delete_task", "Delete a task permanently"),
    get_function_schema(UpdateTaskArgs, "update_task", "Update details of an existing task"),
]

# Map tool names to functions
TOOL_MAP = {
    "add_task": add_task,
    "list_tasks": list_tasks,
    "complete_task": complete_task,
    "delete_task": delete_task,
    "update_task": update_task,
}

SYSTEM_PROMPT = """
You are a helpful Todo AI Assistant.
You allow users to manage their tasks using natural language.
You MUST use the provided tools to perform actions.
You DO NOT have direct database access. You ONLY have the tools.
All actions must be confirmed.
If a user asks to "cleanup" or "remove" tasks, ask for clarification or list tasks first to confirm which ones.
Always respond politely and concisely.
"""

async def run_agent(user_id: str, history: List[ChatCompletionMessageParam]) -> Dict[str, Any]:
    """
    Executes the agent loop:
    1. Sends history to OpenAI with Tools.
    2. If tool call, execute tool and add result to history.
    3. Loop until final response.
    4. Return final response and the updated history (or just the new messages).
    """
    
    current_messages = list(history)
    
    # Ensure system prompt is first?? 
    # The history passed in might already have it or we assume it's chat history.
    # We should stick the system prompt at the beginning if not present, but for now let's assume valid chat history
    # + we treat the 'developer' or 'system' role.
    
    # Add system prompt if empty or just prepend it for this session context
    if not current_messages or current_messages[0]["role"] != "system":
        current_messages.insert(0, {"role": "system", "content": SYSTEM_PROMPT})

    # Limit loop to avoid infinite loops
    MAX_TURNS = 5
    
    for _ in range(MAX_TURNS):
        debug_log(f"DEBUG AGENT: Sending request to OpenAI (Turn {_+1})")
        response = await client.chat.completions.create(
            model="google/gemma-3-27b-it:free", # Stable and verified available
            messages=current_messages,
            tools=TOOLS,
            tool_choice="auto",
            max_tokens=1000
        )
        debug_log(f"DEBUG AGENT: Received response from OpenAI")
        
        message = response.choices[0].message
        current_messages.append(message)
        
        if message.tool_calls:
            # Execute tool calls
            for tool_call in message.tool_calls:
                function_name = tool_call.function.name
                arguments = json.loads(tool_call.function.arguments)
                
                # Injection of user_id security context
                # The tool args expect user_id. The model might generate it if it knows it.
                # BUT we should ENFORCE it.
                # However, the Pydantic models require user_id. 
                # If the model didn't provide it (because we hid it? no we exposed it), 
                # we should override it for security.
                arguments["user_id"] = user_id
                
                # Re-validate with Pydantic model
                func = TOOL_MAP.get(function_name)
                if func:
                    tool_result_str = ""
                    try:
                        # Construct args object
                        if function_name == "add_task":
                            args_obj = AddTaskArgs(**arguments)
                            tool_result_str = await add_task(args_obj)
                        elif function_name == "list_tasks":
                            args_obj = ListTasksArgs(**arguments)
                            tool_result_str = await list_tasks(args_obj)
                        elif function_name == "complete_task":
                            args_obj = CompleteTaskArgs(**arguments)
                            tool_result_str = await complete_task(args_obj)
                        elif function_name == "delete_task":
                            args_obj = DeleteTaskArgs(**arguments)
                            tool_result_str = await delete_task(args_obj)
                        elif function_name == "update_task":
                            args_obj = UpdateTaskArgs(**arguments)
                            tool_result_str = await update_task(args_obj)
                        else:
                             tool_result_str = json.dumps({"error": f"Unknown tool {function_name}"})

                    except Exception as e:
                        tool_result_str = json.dumps({"error": str(e)})

                    # Append tool output
                    current_messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": tool_result_str
                    })
                else:
                    current_messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": json.dumps({"error": "Tool not found"})
                    })
            
            # Loop again to let model react to tool outputs
            continue
        
        else:
            # Final response
            return {
                "content": message.content,
                "messages": current_messages # Return full history to save?
                # Actually, the caller handles persistence.
                # We should return a list of new messages or the final answer.
                # The spec says "Return response + tool calls".
                # The ChatKit UI likely needs the intermediate steps to show "Running tool..."?
                # If we return the whole chain, the API can format it.
            }

    return {"content": "I'm sorry, I reached the maximum number of steps.", "messages": current_messages}
