# Database Schema & Models — Phase III

This file defines the Conversation and Message models (SQLModel / ORM) and their relationships to existing `User` and `Task` models.

General constraints and decisions

- Conversations and messages are journaled. Tool calls and their results are stored as `Message` rows to ensure reproducibility and auditing.
- The `chat` endpoint is stateless: to reconstruct context, the backend loads Messages for a Conversation.
- Default query window: when reconstructing context, load the latest N messages (configurable). Store full content to support audits.
- Retention policy: messages older than retention window (default 365 days) are archived or purged according to policy (see retention section).

## SQLModel (Python) definitions — illustrative

Note: These are implementation-ready SQLModel classes; adapt naming to project conventions.

```python
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime

class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(index=True, nullable=False)  # FK -> users.id
    title: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_archived: bool = Field(default=False)

    # Relationships
    messages: List["Message"] = Relationship(back_populates="conversation")

    # Index for quick retrieval of active conversations per user
    __table_args__ = (
        # Example SQLAlchemy Index creation if needed
    )

class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversations.id", index=True, nullable=False)
    sender: str = Field(index=True)  # 'user' | 'assistant' | 'system' | 'tool'
    message_type: str = Field(default="text")
    content: str = Field(sa_column_kwargs={"type_": "TEXT"})
    # For tool calls and results, store JSON payloads in dedicated fields
    tool_name: Optional[str] = Field(default=None, index=True)
    tool_input: Optional[str] = Field(default=None, sa_column_kwargs={"type_": "JSONB"})
    tool_output: Optional[str] = Field(default=None, sa_column_kwargs={"type_": "JSONB"})

    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    created_by_user_id: Optional[int] = Field(default=None, index=True)  # FK -> users.id when sender='user'
    assistant_response_summary: Optional[str] = Field(default=None)

    # Relationships
    conversation: "Conversation" = Relationship(back_populates="messages")

    # Example constraints: ensure one message belongs to a conversation
```

## Field explanations

- Conversation
  - `id`: numeric PK.
  - `owner_id`: the user who owns the conversation (FK -> users.id). Conversations are scoped to a user account by default.
  - `title`: optional friendly title for UI.
  - `is_archived`: soft-flag for hidden conversations; used by retention/archival flows.

- Message
  - `conversation_id`: links to a conversation.
  - `sender`: who wrote the message — values: `user`, `assistant`, `system`, `tool`.
  - `message_type`: `text`, `tool_call`, `tool_response`, `metadata` etc.
  - `content`: free-form assistant/user text. For `tool_call` or `tool_response`, prefer the `tool_input` and `tool_output` JSON fields.
  - `tool_name`: if message corresponds to a tool invocation.
  - `tool_input` / `tool_output`: JSONB fields storing the exact payloads for reproducibility.
  - `assistant_response_summary`: short human-readable summary used for quick context windows (optional, denormalized).

## Indexes & Constraints

- Index on `messages (conversation_id, created_at DESC)` for quick retrieval of recent messages.
- Index on `conversations (owner_id)` for fast listing of user conversations.
- Constraint: `conversation.owner_id` must reference `users.id` (FK in DB).
- Optional constraint on `messages.created_by_user_id` referencing `users.id`.
- For `tool_input` and `tool_output` JSON fields, use PostgreSQL `JSONB` to enable queries on common fields when needed.

## Relationships with `Task` and `User`

- A `Task` (existing table) has `owner_id` which references `users.id`.
- When a tool call modifies a task, the `Message` row that logs the `tool_output` should include the `task_id` in `tool_output` or as part of `content` for easier joins.
- Optionally create a materialized `message_task_links` table to map `message_id` -> `task_id` for efficient historical lookup.

Example mapping strategy:

- When `add_task` returns `{ task: { id: 123, ... } }`, create a `Message` of `message_type: tool_response` with `tool_name: add_task` and `tool_output` containing the task JSON and add a `task_id` column or row in `message_task_links`.

## Retention Policy

- Default retention: keep messages for 365 days.
- Implement soft archive: messages older than retention_threshold are moved to an `archive_messages` table (or exported to cold storage) before permanent deletion.
- Admins with `tasks:admin` scope can run on-demand purges.
- Provide a scheduled migration job to compress or remove large `tool_input` blobs older than retention threshold while preserving minimal metadata.

## Migration Notes

- Add two new tables: `conversations` and `messages`.
- If existing `chat` or logging tables exist, migrate existing chat content into `messages` and link to `conversations` per user.
- For large DBs: perform migration in phases. Use background jobs to backfill `conversation_id` for historical messages and create initial `conversation` rows grouped by user and time windows.

SQL example (Postgres: simplified):

```sql
-- Conversation table
CREATE TABLE conversations (
  id BIGSERIAL PRIMARY KEY,
  owner_id BIGINT NOT NULL REFERENCES users(id),
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_archived BOOLEAN DEFAULT FALSE
);

-- Messages table
CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT NOT NULL REFERENCES conversations(id),
  sender VARCHAR(32) NOT NULL,
  message_type VARCHAR(32) NOT NULL,
  content TEXT,
  tool_name VARCHAR(128),
  tool_input JSONB,
  tool_output JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by_user_id BIGINT REFERENCES users(id)
);

CREATE INDEX idx_messages_conv_created_at ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_conversations_owner ON conversations(owner_id);
```

## Operational Considerations

- When reconstructing context for Agents/ChatKit, load messages in chronological order up to configured window (e.g., last 50 messages) and construct system/user/assistant messages accordingly.
- For very large conversations, prefer summarization: generate a summarized system message that compresses earlier messages. Persist the summary as a `system` message so it can be used deterministically.
- Tool calls must be persisted before returning assistant to the user to avoid mismatch between return and persisted state.

## Audit & Replay

- Because `tool_input` and `tool_output` are stored as JSONB, it is possible to replay an Agent's tool calls for debugging. Ensure replay scripts respect idempotency keys to avoid duplicate mutations.

---

End of Database Schema spec.

# Database Schema (Updated for Phase III)

## 1. Tables

### Users

- `id` (UUID, PK)
- `email` (String, Unique)
- ... (Existing fields)

### Tasks

- `id` (UUID, PK)
- `user_id` (UUID, FK -> Users.id)
- `title` (String)
- ... (Existing fields)

### Conversations (New)

- `id` (UUID, PK): Unique conversation ID.
- `user_id` (UUID, FK -> Users.id): Owner of the history.
- `created_at` (DateTime)
- `updated_at` (DateTime)

### Messages (New)

- `id` (UUID, PK)
- `conversation_id` (UUID, FK -> Conversations.id)
- `role` (String): "system", "user", "assistant", "tool".
- `content` (Text): The message body.
- `tool_calls` (JSON/Text, optional): Stored tool call payload if applicable.
- `created_at` (DateTime)
