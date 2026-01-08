# Backend CLAUDE Implementation Guide

## Technology Stack
- FastAPI
- Python 3.9+
- SQLModel
- PostgreSQL (Neon)
- JWT for authentication

## Project Structure
- `/app` - Main application with routing
- `/models` - SQLModel database models
- `/schemas` - Pydantic request/response schemas
- `/services` - Business logic
- `/repositories` - Data access layer
- `/core` - Core utilities (auth, config, etc.)
- `/routes` - API route definitions

## Key Features
- JWT-based authentication
- User-scoped data access
- RESTful API design
- Database integration with SQLModel
- Proper error handling and validation

## Security Measures
- JWT token verification on all protected endpoints
- User data isolation
- Input validation
- SQL injection prevention
- Proper error responses without information leakage

## API Design Principles
- RESTful endpoints
- Consistent response format
- Proper HTTP status codes
- Comprehensive error handling
- Documentation with Swagger/OpenAPI