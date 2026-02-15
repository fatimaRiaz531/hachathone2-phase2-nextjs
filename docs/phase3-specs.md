# `/sp` — Phase III Todo AI Chatbot (Agentic Dev Stack)

---

## `/sp.constitution`

### Objective

Build an AI-powered Todo chatbot that allows authenticated users to manage tasks using **natural language only**, executed via an **agentic workflow** (spec → plan → tasks → implementation).
All state is persisted in **Neon PostgreSQL**. All APIs and MCP tools are **stateless**.

### Non-Negotiable Rules

* ❌ No manual coding — **Claude Code only**
* ❌ No direct DB access from agent — **MCP tools only**
* ❌ No server memory — **stateless per request**
* ✅ OpenAI Agents SDK for AI logic
* ✅ Official MCP SDK for tools
* ✅ Better Auth for authentication
* ✅ Full auditability (prompts, plans, tasks)

### Success Criteria

* Natural language CRUD works end-to-end
* Every intent maps to **exactly one MCP tool**
* Conversation history persists
* Tool calls are visible in API responses

---

## `/sp.spec`

### Architecture

**Frontend:** OpenAI ChatKit
**Backend:** FastAPI (Python)
**Agent:** OpenAI Agents SDK
**Tools:** MCP Server (Official SDK)
**DB:** Neon PostgreSQL + SQLModel

### Stateless Request Flow

1. Receive user message
2. Load conversation history from DB
3. Persist user message
4. Run agent with MCP tools
5. MCP tool mutates DB
6. Persist assistant response
7. Return response + tool calls
8. Discard all memory

---

## `/sp.specs`

### Data Models (SQLModel)

**Task**

* id, user_id, title, description?
* completed
* created_at, updated_at

**Conversation**

* id, user_id
* created_at, updated_at

**Message**

* id, conversation_id, user_id
* role (user | assistant)
* content, created_at

---

### MCP Tool Contracts (Authoritative)

**add_task** → create task
**list_tasks** → fetch tasks
**complete_task** → mark done
**delete_task** → remove task
**update_task** → edit task

Rules:

* Stateless
* DB-backed
* JSON only
* Ownership enforced via `user_id`

---

### Agent Behavior Rules

* Infer intent before acting
* Use MCP tools exclusively
* Ask clarifying questions if needed
* Confirm every action
* Gracefully handle errors

---

## `/sp.plan`

### Phase A — Foundation

* FastAPI + Better Auth
* Neon DB + SQLModel

### Phase B — MCP Server

* Initialize MCP server
* Register task tools

### Phase C — Agent

* Configure OpenAI Agent
* Register MCP tools

### Phase D — Chat API

* `/api/{user_id}/chat`
* Stateless execution

### Phase E — Frontend

* ChatKit UI integration
* Tool call transparency

---

## `/sp.tasks`

1. Define DB models
2. Create migrations
3. Bootstrap MCP server
4. Implement `add_task`
5. Implement `list_tasks`
6. Implement `complete_task`
7. Implement `delete_task`
8. Implement `update_task`
9. Configure OpenAI Agent
10. Implement chat endpoint
11. Integrate ChatKit
12. Run acceptance tests

---

## `/sp.implement`

### Master System Prompt (MANDATORY)

> Enforces agentic discipline, no manual coding, MCP-only mutations, statelessness.

### Implementation Prompts

* DB Models
* MCP Server Bootstrap
* MCP Tool (one per run)
* Agent Configuration
* Chat Endpoint
* ChatKit Integration
* ChatKit Hosted Deployment

Each prompt:

* Executes **one task only**
* References exact spec section
* Produces production-ready output

---

## `/sp.acceptance`

### Acceptance Criteria (WHAT)

* Natural language CRUD works
* Correct MCP tool per intent
* Ambiguous refs resolved via `list_tasks`
* Stateless API + tools
* Conversation persistence
* Tool calls returned
* Auth enforced
* No manual code

### Acceptance Execution Prompt (HOW)

* Validate each criterion
* PASS / FAIL
* Spec section referenced
* No code changes allowed

### Final Validation Prompt

* Judge-style audit
* End-to-end conversation simulation
* Statelessness verification

---

## `/sp.remediate`

### Error Classification

* Spec Error
* Plan Error
* Task Error
* Implementation Error
* Acceptance Error

### Mandatory Protocol

1. Stop
2. Classify
3. Trace spec section
4. Run remediation prompt
5. Commit with reference

### Remediation Prompts

* Spec clarification
* Plan correction
* Task repair
* Implementation fix
* Acceptance failure resolution

### Evidence Log (Required)

* Error type
* Spec reference
* Prompt used
* Files regenerated
* Commit hash

---

## `/sp.deployment` (ChatKit Hosted)

* Frontend deployed (Vercel / GitHub Pages / Custom)
* Domain allowlisted in OpenAI Security
* ChatKit Domain Key issued
* `NEXT_PUBLIC_OPENAI_DOMAIN_KEY` set
* Hosted ChatKit validated

---

## Final Statement

This `/sp` document is the **single source of truth**.
Any deviation from this flow invalidates the submission.
