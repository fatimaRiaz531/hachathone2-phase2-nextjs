# AI-Powered Todo Chatbot Specification

## Overview
Phase III introduces a conversational agent that allows users to manage their todo list using natural language.

## Technology Stack
- **Frontend**: OpenAI ChatKit (integrated via `NEXT_PUBLIC_OPENAI_DOMAIN_KEY`).
- **Backend API**: FastAPI endpoint `/api/v1/chat`.
- **Agent Logic**: OpenAI Agents SDK (`Agent`, `Runner`).
- **Tools**: Official MCP SDK (Python) providing stateless task management tools.
- **Persistence**: Neon PostgreSQL (SQLModel) for tasks and conversation history.

## Multi-Agent / Tool Behavior
The Chatbot serves as a primary agent that:
1. Receives natural language input from ChatKit.
2. Fetches conversation history from the `messages` table.
3. Orchestrates tool calls via the MCP server based on user intent.
4. Generates a natural language response summarizing the action taken.
5. Persists both user and assistant messages to the DB.

## Sample Commands
- "Add a task to buy groceries tonight"
- "Show me all my pending tasks"
- "Mark task abc123 as complete"
- "Change the title of task xyz to 'Call Mom'"
- "Delete the old meeting task"

## Context Management
History is fetched for the current `user_id` to ensure the agent has context of previous interactions in the same session.
