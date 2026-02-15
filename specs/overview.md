# Phase III — AI-Powered Todo Chatbot

**Current Phase:** III — AI-Powered Todo Chatbot

**Purpose**

- Add a conversational interface powered by OpenAI ChatKit and the Agents SDK which exposes MCP tools to allow natural-language task management (create/list/update/complete/delete).
- Keep the chat HTTP endpoint stateless: conversation context is persisted in the DB and reconstructed by the backend when needed; each request contains a single user prompt and optional conversation identifier.

**New Stack (Phase III)**

- OpenAI ChatKit — primary LLM/chat orchestration and toolkit for building chat experiences.
- Agents SDK — orchestration layer that routes model decisions to MCP tools and external actions.
- MCP SDK — defines Tool interfaces (mcp tools) implemented by our backend to mutate/query tasks.
- Backend: FastAPI (existing) + MCP endpoints that the Agents/ChatKit call as tools.
- DB: SQLModel / PostgreSQL (existing) with new `Conversation` and `Message` models to persist chat history and enable stateless endpoint reconstruction.

**High-Level Goals**

- Provide an intuitive, natural-language interface to manage tasks inside the existing Todo application.
- Keep the chat endpoint stateless; reconstruct full context for Agents/ChatKit via DB lookups.
- Expose a small set of robust MCP tools that the Agent uses to perform task operations.
- Ensure atomic operations, idempotency where appropriate, and clear error handling and confirmation UX.
- Instrument rate limits and scopes for security and reliability.

**High-level Architecture (ASCII diagram)**

```
[Client App / Web UI]
       |
       |  POST /api/chat (prompt + optional conversation_id)
       v
[FastAPI Chat Endpoint - Stateless]
  - Validate auth
  - Load Conversation & recent Messages from DB (if conversation_id)
  - Build system + user context
  - Call OpenAI ChatKit / Agents SDK (stateless call)
       |  (Agents may request MCP tool calls via MCP SDK)
       v
  - MCP tool calls -> Internal REST MCP endpoints (add/list/update/delete/complete)
  - Persist Agent + Tool call results as Messages
  - Return final assistant message to client
       |
       v
[Postgres DB] <-> [Task Service / Task Table]

```

**Stateless Chat Endpoint — Core Principle**

- The chat endpoint accepts one request per HTTP call (a single user prompt plus optional `conversation_id`).
- The backend reconstructs the necessary history and metadata by loading the latest messages for the conversation from the DB and providing that to ChatKit/Agents as context.
- Tools invoked by the Agent are implemented as MCP endpoints inside the same backend (or an internal task service). All tool calls are persisted as `Message` records for auditability and replay.
- The endpoint itself does not hold in-memory conversations across requests.

**Atomicity & Idempotency**

- Tool operations that mutate data are designed to be atomic at the DB transaction level.
- All mutating MCP calls accept an optional `client_request_id` for idempotency; if provided the backend deduplicates requests with the same `client_request_id` and returns the original result.

**Phase III Acceptance Criteria (high-level)**

- Engineers can call `POST /api/chat` with a natural-language prompt and receive a meaningful assistant response.
- The assistant can create, list, update, complete, and delete tasks via the Agent using MCP tools.
- Each assistant response that performs a mutation includes an explicit, human-readable confirmation message and the persisted task state.
- Conversation history persists to DB, and subsequent requests with the `conversation_id` include prior messages for context reconstruction.
- The chat endpoint remains stateless (no in-memory conversation retention across requests).
- Basic rate limiting and auth scopes applied to MCP tool endpoints.

**Deliverables for Implementation**

- MCP tool definitions and endpoints (see `specs/api/mcp-tools.md`).
- Conversation + Message models and migration (see `specs/database/schema.md`).
- Chat UX flows and transcripts (see `specs/features/chatbot.md`).
- Integration test scenarios to validate stateless behavior, idempotency, and tool correctness.

**Tech Notes (short)**

- Use OpenAI ChatKit as the chat orchestration engine; Agents SDK drives tool calling decisions.
- Use MCP SDK to standardize tool signatures and payloads; backend implements these MCP tools as REST endpoints.
- Persist all tool call inputs/outputs as `Message` rows for traceability and debugging.

---

End of Phase III overview.
