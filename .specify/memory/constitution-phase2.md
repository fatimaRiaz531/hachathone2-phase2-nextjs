# Phase 2 Constitution: Todo Web App with Authentication

## Core Principles

### 1. JWT Stateless Authentication
- All API endpoints require JWT tokens in Authorization header (Bearer scheme)
- Tokens must be validated for signature, expiration, and required claims
- Stateless design: no server-side session storage
- User identity extracted from JWT claims (user_id, sub)
- Proper error responses: 401 for invalid/expired tokens, 403 for insufficient permissions

### 2. User Isolation & Data Privacy
- Every database query must filter by authenticated user's ID
- Path parameters (e.g., `{user_id}`) must match JWT claims
- Users cannot access, modify, or view other users' data
- Resource-level authorization enforced at database layer
- Multi-tenant data model with user_id foreign keys

### 3. Clean Code & Architecture
- Follow SOLID principles with clear separation of concerns
- Single responsibility for all functions and components
- Proper error handling with graceful degradation
- Consistent naming conventions (snake_case for Python, camelCase for TypeScript)
- Comprehensive type annotations and documentation
- DRY principle with reusable components and services

### 4. Async Patterns in FastAPI Backend
- All route handlers use async/await patterns
- Database operations use async SQLAlchemy/SQLModel
- Non-blocking I/O operations throughout
- Connection pooling and proper resource management
- Background tasks for non-critical operations

### 5. Server Components in Next.js Frontend
- Default to React Server Components unless client interaction required
- Use 'use client' directive only when necessary (events, hooks, browser APIs)
- Leverage Next.js App Router for layout and data fetching
- Server-side rendering for SEO and performance
- Client components kept minimal and focused

### 6. No Manual Coding - Spec-Driven Development
- All code generated from specifications using CodeGenSkill
- Specifications must precede implementation
- Template-based development following established patterns
- Automated validation against architectural requirements
- Traceability from specs to code via task comments

## Required Features

### 1. Authentication System
- User registration with email/password
- Secure login with JWT token issuance
- Token refresh mechanism
- Protected routes requiring authentication
- Password hashing and secure storage

### 2. Task Management API
- CRUD operations for user tasks
- Filtering, sorting, and pagination
- Status updates (pending, in-progress, completed)
- Due date management
- Task categorization/tags

### 3. Web Interface
- Responsive design with Tailwind CSS
- Task dashboard with overview
- Form components for task creation/editing
- Real-time updates and notifications
- Mobile-first responsive layout

### 4. Data Management
- PostgreSQL database with Neon DB
- SQLModel for ORM operations
- Proper indexing for performance
- Data validation at all layers
- Audit trails for critical operations

## Tech Stack

### Backend
- **Framework**: FastAPI 0.104+
- **ORM**: SQLModel (Pydantic + SQLAlchemy hybrid)
- **Database**: Neon DB (PostgreSQL-compatible serverless)
- **Authentication**: JWT with python-jose/cryptography
- **Validation**: Pydantic v2
- **Async**: asyncio, asyncpg for database connections
- **Testing**: pytest, httpx for API testing

### Frontend
- **Framework**: Next.js 16+ with App Router
- **Language**: TypeScript strict mode
- **Styling**: Tailwind CSS with responsive-first design
- **State Management**: React hooks, SWR/react-query for data fetching
- **Authentication**: JWT token management in HTTP-only cookies
- **Components**: Reusable, typed React components
- **Testing**: Jest, React Testing Library

### Infrastructure
- **Environment**: Docker containers for consistency
- **Configuration**: Environment variables via .env files
- **Secrets**: Secure management via environment or vault
- **Logging**: Structured logging with correlation IDs
- **Monitoring**: Health checks and performance metrics

## Project Structure

```
todo-web-app/
├── backend/                    # FastAPI backend
│   ├── main.py                # Application entry point
│   ├── models.py              # SQLModel database models
│   ├── schemas.py             # Pydantic request/response schemas
│   ├── database.py            # DB connection/session management
│   ├── dependencies.py        # FastAPI dependency injection
│   ├── middleware/            # Authentication, logging, etc.
│   │   ├── auth.py            # JWT authentication
│   │   └── logging.py         # Request logging
│   └── routes/                # API route handlers
│       ├── auth.py            # Authentication endpoints
│       ├── tasks.py           # Task management endpoints
│       └── users.py           # User management endpoints
├── frontend/                   # Next.js frontend
│   ├── app/                   # App Router pages
│   │   ├── login/page.tsx     # Login page
│   │   ├── register/page.tsx  # Registration page
│   │   ├── dashboard/page.tsx # Dashboard page
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Reusable React components
│   │   ├── TaskCard.tsx       # Task display component
│   │   ├── TaskForm.tsx       # Task creation/editing form
│   │   └── AuthGuard.tsx      # Authentication wrapper
│   ├── lib/                   # Utility functions
│   │   ├── api/               # API client and requests
│   │   │   ├── client.ts      # Centralized API client
│   │   │   └── auth.ts        # Authentication API calls
│   │   ├── types.ts           # TypeScript type definitions
│   │   └── utils.ts           # Helper functions
│   ├── public/                # Static assets
│   └── next.config.js         # Next.js configuration
├── specs/                      # Specification files
│   ├── auth/                  # Authentication specs
│   ├── api/                   # API endpoint specs
│   ├── ui/                    # User interface specs
│   └── features/              # Feature specifications
├── .env.example               # Environment variables template
├── docker-compose.yml         # Container orchestration
├── requirements.txt           # Python dependencies
├── package.json               # Node.js dependencies
└── README.md                  # Project documentation
```

## Security Requirements

### 1. Authentication & Authorization
- JWT tokens with strong secret keys (32+ character random strings)
- Short-lived access tokens (15-30 minutes) with refresh tokens
- Secure token storage (HTTP-only cookies preferred)
- Proper CORS configuration limiting origins
- Rate limiting for authentication endpoints

### 2. Input Validation
- Server-side validation for all inputs
- SQL injection prevention via ORM parameterization
- XSS prevention via proper escaping
- Content security policy headers
- File upload validation if implemented

### 3. Data Protection
- HTTPS enforcement in production
- Database encryption at rest
- Audit logging for sensitive operations
- Proper error message sanitization
- Session management best practices

## Performance Standards

### 1. Backend Performance
- API response times under 200ms for simple operations
- Database query optimization with proper indexing
- Connection pooling for database operations
- Caching strategies for frequently accessed data
- Efficient pagination for large datasets

### 2. Frontend Performance
- Initial page load under 3 seconds
- Subsequent navigation under 500ms
- Image optimization and lazy loading
- Bundle size optimization
- Progressive web app capabilities

## Quality Assurance

### 1. Testing Requirements
- Unit tests for all business logic functions
- Integration tests for API endpoints
- End-to-end tests for critical user flows
- Security testing for authentication flows
- Performance testing under load

### 2. Code Quality
- 80%+ test coverage minimum
- Static analysis with linters/formatters
- Type checking with strict TypeScript settings
- Code review requirements before merging
- Automated security scanning

### 3. Documentation
- API documentation with OpenAPI/Swagger
- Component documentation with Storybook
- Architecture decision records (ADRs)
- Deployment and operational guides
- Security and privacy documentation

## Deployment & Operations

### 1. Environment Management
- Separate environments: development, staging, production
- Environment-specific configurations
- Database migration strategies
- Backup and recovery procedures
- Monitoring and alerting setup

### 2. CI/CD Pipeline
- Automated testing on all commits
- Security scanning integrated
- Staging deployment before production
- Rollback capabilities
- Zero-downtime deployment strategies

## Compliance & Standards

### 1. Development Standards
- Follow PSR/PEP coding standards
- Consistent code formatting (black, prettier)
- Semantic versioning for releases
- Git workflow with feature branches
- Comprehensive commit messages

### 2. Security Compliance
- OWASP Top 10 considerations
- GDPR compliance for user data
- Privacy by design principles
- Regular security audits
- Incident response procedures

## Evolution & Maintenance

### 1. Backward Compatibility
- API versioning strategy
- Database migration plans
- Deprecation notices for breaking changes
- Feature flagging for gradual rollouts
- Rollback procedures

### 2. Monitoring & Observability
- Application performance monitoring
- Error tracking and reporting
- User behavior analytics
- Infrastructure monitoring
- Log aggregation and analysis

---

**Document Version**: 1.0
**Effective Date**: February 2, 2026
**Review Cycle**: Quarterly or upon major architectural changes