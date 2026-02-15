# Features — Chatbot (Phase III)

**Scope**

- Natural-language based task management inside the Todo app.
- Supported operations (via chat): add task, list tasks, update task, complete task, delete task, query task details.
- Confirmation and error-handling UX for destructive/important operations.

**User Stories**

- As a user, I can tell the chatbot to "add" a task in natural language and have it saved to my task list.
- As a user, I can ask the chatbot "what are my open tasks?" and receive a concise list filtered by status/priority/date.
- As a user, I can say "mark the shopping task as done" and have the task completed, with a confirmation message returned.
- As a user, I can tell the chatbot to update a task (title, description, due date, priority) and receive confirmation with the updated task details.
- As a user, I can delete a task via chat, but the chatbot will ask for confirmation before performing destructive deletion.
- As a user, I can reference tasks by natural identifiers ("the task about taxes", "the second task", "task #1234") and the bot will resolve intent with disambiguation questions when necessary.
- As a user, I can start a new conversation or continue an existing one by providing `conversation_id` and the bot will use persisted history for context.

**Detailed Acceptance Criteria**

- Add Task (via chat)
  - Given a user sends a prompt like "Remind me to email Ana about the report tomorrow morning",
  - The assistant should extract task attributes (title, description, due date) and call `add_task` MCP tool.
  - The backend returns the created task details, and the assistant provides a confirmation message e.g., "Done — I created 'Email Ana about the report' due 2026-02-09 09:00."
  - If key attributes are ambiguous/missing (e.g., no due date), the assistant asks a single follow-up clarification question; the follow-up is part of the same conversation and stored.

- List Tasks
  - Given a prompt like "List my open tasks" or "what's due this week?",
  - The assistant calls `list_tasks` with appropriate filters and returns a short enumerated list, including task id, title, status, and due date.
  - When the list is long, paginate: present top 5 and offer to `show more` or accept a page parameter in follow-up.

- Complete Task
  - Given a prompt like "Mark the shopping task as done" or "complete task #42",
  - The assistant confirms the identified task; if unambiguous, it calls `complete_task` and returns a confirmation message.
  - If ambiguous, the assistant requests disambiguation (e.g., "Which of these three tasks did you mean?").

- Delete Task
  - For destructive operations (delete), the assistant must request explicit user confirmation ("Are you sure you want to delete 'Buy groceries'? Reply 'yes' to confirm.").
  - Only after explicit confirmation will the assistant call `delete_task`.

- Update Task
  - For updates including changing title, description, due date or priority, the assistant calls `update_task` with deltas and returns the updated task in the confirmation message.

- Error Handling
  - The assistant responds with a human-readable error when MCP tool returns error codes (see `specs/api/mcp-tools.md`) and suggests remediation.
  - For transient errors (e.g., DB was locked, service rate-limited), the assistant retries with an exponential backoff up to 2 attempts (backend responsibility), then returns a retry-possible message.
  - For authorization errors, the assistant prompts user to re-authenticate or informs them they lack privileges.

- Conversation Persistence
  - Every user prompt, assistant response, and tool call result is persisted as `Message` rows tied to a `Conversation`.
  - When a `conversation_id` is provided the backend loads the last N messages (configurable, default 50) to reconstruct context.

**Stateless Endpoint Behavior**

- The chat HTTP endpoint accepts a single user prompt plus optional `conversation_id`.
- Backend loads messages, builds system context, then calls ChatKit/Agents with the assembled context. Agents may call MCP tools; tool calls are executed by the backend and persisted.
- The endpoint returns the assistant's final message. No in-memory conversation is kept between HTTP calls.

**UX Flows (step-by-step)**

- Flow: Add Task — Simple
  1. User types: "Add a task to call mom tomorrow at 7pm"
  2. Chat endpoint loads conversation (if any) and sends context + prompt to Agents/ChatKit.
  3. Agent identifies intent `add_task` and extracts fields: title="Call mom", due_date=tomorrow 19:00.
  4. Agent requests MCP `add_task` via MCP SDK; backend executes and returns created task object.
  5. Assistant returns: "Got it — Created: [#123] Call mom — due 2026-02-09 19:00. Anything else?"
  6. Persist user message, assistant message, and tool call result to DB as `Message` rows.

- Flow: Delete Task — Confirm
  1. User: "Delete my grocery list"
  2. Agent resolves candidate task(s). If ambiguous, ask "Which task do you mean?"
  3. If unambiguous, assistant asks: "Are you sure you want to delete 'Grocery list'? Reply 'yes' to confirm."
  4. Only when user replies "yes" does the Agent call `delete_task`.
  5. Assistant confirms deletion: "Deleted 'Grocery list'."

- Flow: List Tasks — Filter
  1. User: "What are my high-priority tasks due this week?"
  2. Agent calls `list_tasks` with filter: status=open, priority>=high, due_date within week.
  3. Backend returns list; assistant formats and returns enumerated list of up to 5 items and a `show more` option.

**Examples — Chat Transcripts**

- Example 1: Quick add

User: "Remind me to schedule dentist appointment next Tuesday"

Assistant: "Do you want a due time or just the date?"

User: "No time, just the date."

Assistant: "Done — created 'Schedule dentist appointment' due 2026-02-17. Anything else?"

- Example 2: Mark complete by name

User: "I finished the shopping list"

Assistant: "I found two tasks that might match: 1) Shopping list — groceries, due 2026-02-09 18:00; 2) Shopping list — birthday gifts, due 2026-03-01. Which one do you mean?"

User: "The groceries one"

Assistant: "Marked 'Shopping list — groceries' as complete."

- Example 3: Delete with confirmation

User: "Delete my draft tasks"

Assistant: "I found 'Drafts for blog' (task #212). Are you sure you want to delete it? Reply 'yes' to confirm."

User: "yes"

Assistant: "Deleted 'Drafts for blog'."

**Developer Notes / Implementation Hints**

- Use entity extraction for dates/times (ISO normalized) and map to task `due_date`.
- Use `client_request_id` for user-side actions where duplicate submissions are possible (e.g., tapping send twice).
- Keep clarifying follow-ups short—only ask one question at a time.
- Persist tool call inputs and outputs to enable replay/debugging.

---

End of Chatbot feature spec.

# Feature: AI Chatbot (Phase III)

## 1. Introduction

The AI Chatbot allows users to manage their todo list using natural language commands. It is powered by the Model Context Protocol (MCP) and integrated directly into the web interface.

## 2. User Stories

- **US 3.1**: As a user, I want to add a task by typing "Add a task to buy milk" so I don't have to fill out a form.
- **US 3.2**: As a user, I want to ask "What do I have to do?" and get a list of my pending tasks.
- **US 3.3**: As a user, I want to complete a task by saying "I finished the reporting task" without searching for it in the list.
- **US 3.4**: As a user, I want to delete tasks via chat commands.
- **US 3.5**: As a user, I want the chatbot to understand context and history (e.g., "Change its priority to high" referring to the previous task).

## 3. Support for Urdu

- The chatbot must support Urdu commands (e.g., "Mera naya task add karo").
- The system prompt should explicitly enable multi-lingual understanding.

## 4. Acceptance Criteria

- **AC 1**: Chatbot interface is accessible from the main dashboard.
- **AC 2**: Chatbot responds to "Add task X" by actually creating the task in the DB.
- **AC 3**: Chatbot responds to "List tasks" by showing relevant tasks.
- **AC 4**: Chat commands respect user isolation (cannot see/edit other users' tasks).
- **AC 5**: Conversation history is persisted across sessions.
