# Phase-II Implementation Tasks

## Task 8: Frontend API Client with JWT Attachment

**Specification Reference**: `specs/api/rest-endpoints.md`, `specs/architecture.md`

**Objective**: Create a frontend API client that automatically attaches JWT tokens to authenticated requests

**Steps**:
1. Create API client utility with axios or fetch
2. Implement JWT token retrieval from storage
3. Add JWT token to Authorization header automatically
4. Handle token expiration and refresh
5. Implement proper error handling

**Files to Create**:
- `frontend/lib/api-client.ts` - API client with JWT handling
- `frontend/lib/auth-api.ts` - Authentication API functions
- `frontend/lib/task-api.ts` - Task API functions
- `frontend/hooks/use-api.ts` - API hook for components
- `frontend/middleware.ts` - Next.js middleware for auth

**Requirements**:
- Automatically attach JWT to authenticated requests
- Handle token expiration
- Implement proper error responses
- Follow REST API endpoint specification
- Include request/response interceptors
- Handle loading and error states