# Phase-II Constitution: Full-Stack Todo Web Application

## Technology Stack

- **Frontend**: Next.js App Router
- **Backend**: FastAPI + SQLModel
- **Database**: Neon PostgreSQL
- **Authentication**: Better Auth + JWT
- **System Type**: Multi-user system

## Core Rules

1. **No Manual Coding Allowed**: All development must follow automated/structured approaches where possible.

2. **User-Scoped Data Access**: All data access must be scoped to the authenticated user. No user should be able to access another user's data.

3. **Frontend-Backend Communication**: The frontend must never communicate directly with the database. All data access must go through backend APIs.

4. **JWT Verification**: The backend must verify JWT tokens on every authenticated request to ensure proper authorization.

5. **Clean Layered Architecture**: Follow a clean, layered architectural pattern with clear separation of concerns between presentation, business logic, and data layers.

## Implementation Guidelines

- All API endpoints must validate user authentication using JWT tokens
- Database queries must include user filters to ensure data isolation
- Frontend components must handle authentication state properly
- Error handling must be consistent across frontend and backend
- Input validation must occur at both frontend and backend layers
- Follow security best practices for storing and transmitting sensitive data