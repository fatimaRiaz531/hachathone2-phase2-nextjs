# CLAUDE Implementation Guide for Evolution of Todo Project

## Project Overview
This project implements the "Evolution of Todo" application, following spec-driven development methodology. The project consists of two phases:
- Phase I: Console-based Todo application with in-memory storage
- Phase II: Full-stack web application with authentication and database persistence

## Project Structure
This project follows a monorepo structure with separate frontend and backend applications.

## Directories
- `/frontend` - Next.js application
- `/backend` - FastAPI application
- `/specs` - Specification files
- `/specs-history` - Specification iteration history

## Implementation Approach
1. Spec-driven development (MANDATORY: no code without specs)
2. Clean architecture principles
3. Security-first approach
4. Test-driven development

## Key Technologies
### Phase I (Console App):
- Python 3.13+
- UV package manager
- In-memory storage

### Phase II (Web App):
- Frontend: Next.js 16+, React, TypeScript, Tailwind CSS
- Backend: FastAPI, Python, SQLModel
- Database: PostgreSQL (Neon)
- Authentication: Better Auth, JWT

## Development Workflow
1. Write specifications before implementation (Constitution.md mandate)
2. Follow the API contract defined in specs/api/api-spec.md
3. Implement database models following specs/database/schema-spec.md
4. Create feature implementations based on specs/features/*.md
5. Maintain consistency with Constitution.md governance rules
6. All changes must start with spec updates

## Phase Requirements

### Phase I Requirements:
- Create a Constitution markdown file
- Create feature specs in markdown
- Use Spec-Kit structure
- Generate clean Python project structure
- No external database (in-memory storage only)
- Console-based user interface

### Phase II Requirements:
- Monorepo structure: frontend/, backend/, specs/
- SQLModel database schema spec
- API spec markdown
- UI spec markdown
- JWT verification in FastAPI
- JWT attached to all frontend API requests
- Multi-user support with data isolation

## Critical Rules (From Constitution.md)
- All code implementations MUST be based on approved markdown specifications
- No code shall be written without a corresponding spec document
- Specifications must be comprehensive and unambiguous
- Changes to implementation require spec updates first
- Follow the API contracts defined in specs exactly