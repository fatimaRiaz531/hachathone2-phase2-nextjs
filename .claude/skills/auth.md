# Auth Specification Generator

Generate authentication specifications for the Todo App based on hackathon requirements.

## Input
$ARGUMENTS - Authentication requirement (e.g., "JWT auth for tasks", "user login", "session management")

## Instructions

Based on the provided requirement: **$ARGUMENTS**

Generate a comprehensive authentication specification with the following structure:

### 1. User Stories

Create user stories in the format:
```
As a [role], I want to [action] so that [benefit].
```

Include stories for:
- User registration/signup
- User login/authentication
- Token management (if JWT-based)
- Session handling
- Logout functionality
- Password management (if applicable)

### 2. Acceptance Criteria

For each user story, define GIVEN-WHEN-THEN acceptance criteria:

```
GIVEN [precondition]
WHEN [action]
THEN [expected result]
```

Cover:
- Happy path scenarios
- Authentication success/failure
- Token expiration handling
- Invalid credentials handling
- Rate limiting (if applicable)

### 3. Edge Cases

Document edge cases including:
- Expired tokens
- Invalid/malformed tokens
- Concurrent sessions
- Network failures during auth
- Replay attacks
- Token refresh scenarios
- Missing/empty credentials

### 4. Security Requirements

- Password hashing algorithm (if storing passwords)
- Token signing algorithm (e.g., HS256, RS256)
- Token expiration times
- Refresh token strategy
- HTTPS enforcement
- CORS configuration

### 5. API Contracts

Define endpoints:
```
POST /auth/register - User registration
POST /auth/login - User authentication
POST /auth/logout - Session termination
POST /auth/refresh - Token refresh (if applicable)
GET /auth/me - Current user info
```

### 6. Hackathon Requirements Link

Reference the hackathon phase requirements:
- Phase 1: In-memory console app (no auth needed)
- Phase 2: Web app with user authentication
- Ensure alignment with `.specify/memory/constitution.md`

## Output Location

Save the generated spec to: `specs/auth/spec.md`

## Example Usage

```
/auth JWT authentication for task management
```

This will generate a complete JWT-based authentication specification for protecting task endpoints.
