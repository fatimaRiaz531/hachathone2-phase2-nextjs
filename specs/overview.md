# Evolution of Todo: Project Overview and Specifications

## Project Overview

### Project Name
Evolution of Todo

### Project Phases
This project consists of two distinct phases:
1. **Phase I**: Console-based Todo application with in-memory storage
2. **Phase II**: Full-stack web application with authentication and database persistence

### Core Objective
To demonstrate spec-driven development methodology by building a simple console-based todo application that evolves into a full-featured, multi-user web application following clean architecture principles.

## Phase I: Console-Based Todo Application

### Technology Stack
- **Language**: Python 3.13+
- **Storage**: In-memory (no persistent storage)
- **Interface**: Console-based menu system
- **Build Tool**: UV

### Core Features
1. **Add Task**: Create new tasks with title and optional description
2. **View Tasks**: Display all tasks with completion status
3. **Update Task**: Modify existing task title or description
4. **Delete Task**: Remove tasks from the system
5. **Mark Complete/Incomplete**: Toggle task completion status

### Technical Constraints
- Data stored in memory only (lost on application exit)
- Console-based user interface
- No external dependencies beyond Python standard library
- Follows clean architecture principles

### User Interface Flow
- Menu-driven system with numbered options
- Clear prompts for user input
- Input validation and error handling
- Help/usage instructions

## Phase II: Full-Stack Web Application

### Technology Stack
#### Frontend
- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS or equivalent
- **Authentication**: Better Auth integration

#### Backend
- **Framework**: FastAPI
- **ORM**: SQLModel
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT-based with shared secrets

### Core Features
1. **User Authentication**: Registration, login, and logout functionality
2. **Multi-User Support**: Each user sees only their own tasks
3. **Full Task Management**: All Phase I features via REST API
4. **Secure API**: JWT authentication for all endpoints
5. **Responsive UI**: Works across desktop, tablet, and mobile devices

### API Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication
- `POST /auth/logout` - User session termination
- `GET /{user_id}/tasks` - Retrieve user's tasks
- `POST /{user_id}/tasks` - Create new task for user
- `GET /{user_id}/tasks/{id}` - Retrieve specific task
- `PUT /{user_id}/tasks/{id}` - Update task
- `DELETE /{user_id}/tasks/{id}` - Delete task
- `PATCH /{user_id}/tasks/{id}/complete` - Update completion status

### Database Schema
#### Users Table
- id (UUID, Primary Key)
- email (VARCHAR, Unique)
- name (VARCHAR)
- password_hash (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- is_active (BOOLEAN)

#### Tasks Table
- id (INTEGER, Primary Key)
- title (VARCHAR)
- description (TEXT)
- completed (BOOLEAN)
- user_id (UUID, Foreign Key)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### Security Features
- JWT token-based authentication
- User data isolation (each user sees only their own tasks)
- Password hashing with bcrypt
- Input validation and sanitization
- Protection against common vulnerabilities (XSS, CSRF, SQL injection)

## Spec-Driven Development Approach

### Specification Hierarchy
1. **Constitution.md**: Project governance and core principles
2. **specs/overview.md**: This document
3. **specs/features/*.md**: Feature-specific requirements
4. **specs/api/*.md**: API contract definitions
5. **specs/database/schema.md**: Database schema definitions
6. **specs/ui/*.md**: User interface specifications

### Implementation Rules
- All code must be based on approved specifications
- Changes to implementation require spec updates first
- Code must match specifications exactly
- API contracts are binding requirements

## Architecture Principles

### Clean Architecture
- Separation of concerns between business logic, data access, and presentation layers
- Dependency inversion principle
- Business rules independent of frameworks and UI concerns
- Testability of business logic without external dependencies

### Security-First Approach
- Authentication and authorization at every API endpoint
- Input validation and sanitization
- Protection against common vulnerabilities
- Secure session management

### Quality Assurance
- Automated testing at unit, integration, and end-to-end levels
- Code reviews required for all changes
- Continuous integration and deployment practices

## Development Workflow

### Phase I Implementation
1. Create Phase-I feature specifications
2. Implement console-based application
3. Test all core functionality
4. Verify compliance with specifications

### Phase II Implementation
1. Create API, database, and UI specifications
2. Implement backend with FastAPI and SQLModel
3. Implement frontend with Next.js
4. Integrate authentication system
5. Test full application flow
6. Verify compliance with all specifications

## Success Criteria

### Phase I Success Metrics
- All 5 core features implemented and working
- Console interface functional and user-friendly
- Error handling implemented for all scenarios
- Code follows Python best practices

### Phase II Success Metrics
- Full authentication system working
- All API endpoints functional and secured
- Responsive UI working across devices
- Data isolation between users verified
- Performance requirements met
- Security requirements satisfied

## Project Governance

### Change Management
- All changes must start with spec updates
- Breaking changes require explicit approval
- Versioning strategy must be maintained
- Migration paths for data/schema changes

### Quality Standards
- All code must have appropriate documentation
- API documentation must match implementation
- Architecture decisions must be recorded
- User guides and admin documentation required

## Next Steps

1. Review and approve all specifications
2. Begin Phase I implementation following feature specifications
3. Progress to Phase II after Phase I completion
4. Maintain specification-documentation alignment throughout development