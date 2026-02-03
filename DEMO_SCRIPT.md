# 60-Second Demo Script for Todo Web App

## Introduction (0-5 seconds)
"Hi everyone! I'm excited to show you our full-stack Todo Web App with authentication. This demo will showcase user management, task tracking, and our responsive UI."

## Demo Flow (5-55 seconds)

### 1. User Registration & Login (5-15 seconds)
- Navigate to `/register`
- Fill in email, password, and name
- Click "Create Account"
- Show successful registration and automatic login
- Highlight the JWT token being stored securely

### 2. Dashboard Overview (15-25 seconds)
- Show the dashboard with task statistics
- Point out the "Total Tasks", "Completed", "Pending", and "In Progress" cards
- Mention how each metric is calculated in real-time

### 3. Task Management (25-45 seconds)
- Create a new task using the "Create Task" button
- Fill in title, description, set status to "In Progress"
- Show the task appearing in the list
- Demonstrate marking a task as complete
- Filter tasks by status to show user isolation

### 4. Task Editing & Deletion (45-55 seconds)
- Click "Edit" on an existing task
- Modify the title and description
- Save changes and show the update
- Demonstrate deleting a task

## Closing (55-60 seconds)
"That's our Todo Web App! It features secure JWT authentication, user isolation, responsive design, and full CRUD operations. Built with FastAPI and Next.js!"

## Technical Highlights to Mention During Demo
- JWT stateless authentication
- User data isolation (each user sees only their tasks)
- Responsive design working on mobile/desktop
- Real-time statistics updates
- Clean API architecture with proper error handling
- Type-safe frontend with TypeScript
- Async database operations

## Backup Demo Points (if extra time)
- Show the API documentation at `/api/v1/docs`
- Demonstrate the filtering and sorting capabilities
- Show how the app handles validation errors
- Highlight the security features (password hashing, input validation)

## Notes for Presenter
- Practice the flow to ensure smooth transitions
- Have sample data ready if needed
- Know how to quickly reset the demo if something goes wrong
- Be prepared to answer questions about the architecture
- Mention that the app scales to enterprise-level requirements