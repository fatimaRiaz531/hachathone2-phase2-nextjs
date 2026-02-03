# Constitution for Evolution of Todo Project

## Core Principles

### 1. Spec-Driven Development Mandate
- All code implementations MUST be based on approved markdown specifications
- No code shall be written without a corresponding spec document
- Specifications must be comprehensive and unambiguous
- Changes to implementation require spec updates first

### 2. Clean Architecture Standards
- Separation of concerns between business logic, data access, and presentation layers
- Dependency inversion principle: high-level modules should not depend on low-level modules
- Business rules must be independent of frameworks and UI concerns
- Testability of all business logic without external dependencies

### 3. Security-First Approach
- Authentication and authorization at every API endpoint
- Input validation and sanitization
- Protection against common vulnerabilities (XSS, CSRF, SQL injection)
- Secure session management
- Proper error handling without information leakage

### 4. Quality Assurance
- All code must be tested before acceptance
- Automated testing at unit, integration, and end-to-end levels
- Code reviews required for all changes
- Continuous integration and deployment practices

## Project Governance

### 5. Specification Hierarchy
- Constitution.md: Highest authority, defines governance rules
- specs/overview.md: Project overview and requirements
- specs/features/*.md: Feature-specific requirements
- specs/api/*.md: API contract definitions
- specs/database/schema.md: Database schema definitions
- specs/ui/*.md: User interface specifications

### 6. Implementation Constraints
- Follow the API contracts defined in specs exactly
- Maintain backward compatibility when possible
- Use only approved technologies and libraries
- Adhere to coding standards and best practices
- Ensure all implementations match spec requirements exactly

### 7. Technology Stack Compliance
- Frontend: Next.js 16+ with TypeScript
- Backend: FastAPI with SQLModel
- Database: PostgreSQL (Neon)
- Authentication: Better Auth with JWT
- Build Tools: UV for Python, npm for JavaScript

### 8. Phase Requirements
**Phase I (Console App):**
- Python 3.13+ implementation
- In-memory storage only
- Console-based user interface
- Basic CRUD operations for tasks

**Phase II (Web App):**
- Full-stack implementation with authentication
- Multi-user support with data isolation
- REST API with JWT authentication
- Modern web UI with responsive design

### 9. Change Management
- All changes must start with spec updates
- Breaking changes require explicit approval
- Versioning strategy must be maintained
- Migration paths for data/schema changes

### 10. Documentation Standards
- All code must have appropriate documentation
- API documentation must match implementation
- Architecture decisions must be recorded
- User guides and admin documentation required

## Enforcement

Violations of these constitutional rules result in:
1. Rejection of non-compliant code
2. Mandatory rework to meet spec requirements
3. Process review to prevent future violations
4. Potential project reset if violations are systemic

This Constitution is effective immediately and governs all aspects of the Evolution of Todo project.