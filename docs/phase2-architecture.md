# Phase II Architecture & Compliance

## 1. Monorepo Structure

A single repository with clear frontend/backend isolation.

```text
evolution-of-todo/
│
├── README.md
├── .gitignore
├── .env.example
│
├── backend/
│   ├── app/
│   │   ├── main.py                 # Application entry point
│   │   ├── core/
│   │   │   ├── config.py           # Environment & settings
│   │   │   ├── database.py         # Neon PostgreSQL connection
│   │   │   └── security.py         # Auth verification helpers
│   │   │
│   │   ├── models/
│   │   │   ├── user.py             # User SQLModel
│   │   │   └── todo.py             # Todo SQLModel
│   │   │
│   │   ├── schemas/
│   │   │   ├── user.py             # Request/response schemas
│   │   │   └── todo.py
│   │   │
│   │   ├── api/
│   │   │   ├── auth.py             # Signup / signin endpoints
│   │   │   └── todos.py            # Todo CRUD endpoints
│   │   │
│   │   ├── dependencies/
│   │   │   └── auth.py             # Auth dependency (current user)
│   │   │
│   │   └── migrations/             # DB schema management
│   │
│   ├── requirements.txt
│   └── alembic.ini (optional)
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                # Landing / redirect
│   │   │
│   │   ├── auth/
│   │   │   ├── signup/page.tsx
│   │   │   └── signin/page.tsx
│   │   │
│   │   ├── todos/
│   │   │   └── page.tsx             # Todo dashboard
│   │   │
│   │   └── api/
│   │       └── client.ts            # REST API wrapper
│   │
│   ├── components/
│   │   ├── TodoItem.tsx
│   │   ├── TodoForm.tsx
│   │   └── ProtectedRoute.tsx
│   │
│   ├── lib/
│   │   └── auth.ts                  # Clerk Auth Context
│   │
│   ├── styles/
│   ├── next.config.js
│   └── tsconfig.json
│
└── docs/
    ├── constitution.md
    ├── specification.md
    ├── plan.md
    └── tasks.md
```

### Why this structure is correct
- Explicit backend/frontend separation
- Matches REST + Next.js architecture
- Reviewers can audit Phase II compliance instantly
- No agentic or AI folders
- Clear ownership boundaries

## 2. Authentication Model (Clerk Integration)

**Allowed in Phase II:**
- Signup
- Signin
- Authenticated session/token
- User isolation

**Explicitly NOT allowed:**
- Roles (complex RBAC)
- Permissions
- Password recovery (Custom implementation)
- MFA (Custom implementation)

### Backend Auth Flow (Authoritative)
**Signup/Signin**
-   Handled entirely by Frontend using Clerk Components (`<SignIn />`, `<SignUp />`).

**Authenticated Requests**
1.  Frontend attaches Clerk Token (`Authorization: Bearer <token>`).
2.  Backend middleware (`jwt_auth_middleware`) verifies token using `CLERK_SECRET_KEY` (HS256) or JWKS (RS256).
3.  Backend extracts `user_id` (sub) from token.
4.  **Auto-Provisioning**: If user does not exist in local Postgres `users` table, Backend creates it immediately using claims from the token (email, name).
5.  User context injected into request via `get_current_user`.
6.  Todo access filtered by `user_id`.

### User ↔ Todo Ownership
-   Database Rule: `todos.user_id → users.id` (foreign key)
    -   `users.id` matches Clerk User ID (String).
-   API Rule: All todo queries filtered by authenticated user
-   No endpoint accepts `user_id` from client

## 3. Reviewer Checks Checklist

-   [ ] Auth added only in Phase II
-   [ ] Neon PostgreSQL used
-   [ ] REST APIs only
-   [ ] User data isolation
-   [ ] No AI / agents
-   [ ] Frontend responsive
-   [ ] Clear repo structure
