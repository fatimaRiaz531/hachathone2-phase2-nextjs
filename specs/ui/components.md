# UI Components Specification

## Overview
This document defines the reusable UI components for the Task Management Application built with Next.js and Tailwind CSS. All components follow accessibility standards and responsive design principles.

## Component Categories

### 1. Layout Components

#### Header
**Purpose**: Application header with navigation and user profile
**Props**:
- `user`: User object with name and email
- `onLogout`: Callback function for logout
**Features**:
- Logo and application title
- Navigation links
- User profile dropdown
- Mobile menu toggle

#### Sidebar
**Purpose**: Main navigation sidebar
**Props**:
- `currentPath`: Current route for active link highlighting
- `onNavigate`: Callback for navigation
**Features**:
- Navigation menu items
- Active state highlighting
- Collapsible on mobile
- Responsive design

#### MainContainer
**Purpose**: Main content container wrapper
**Props**:
- `children`: Content to be wrapped
- `className`: Additional CSS classes
**Features**:
- Responsive padding
- Max width constraints
- Proper spacing

### 2. Form Components

#### InputField
**Purpose**: Reusable input field component
**Props**:
- `label`: Field label
- `name`: Field name
- `type`: Input type (text, email, password, etc.)
- `value`: Current value
- `onChange`: Change handler
- `error`: Error message
- `required`: Whether field is required
- `placeholder`: Placeholder text
**Features**:
- Label with proper association
- Error message display
- Required field indicator
- Accessible attributes

#### TextArea
**Purpose**: Reusable text area component
**Props**:
- `label`: Field label
- `name`: Field name
- `value`: Current value
- `onChange`: Change handler
- `error`: Error message
- `required`: Whether field is required
- `placeholder`: Placeholder text
- `rows`: Number of rows
**Features**:
- Label with proper association
- Error message display
- Resizable text area
- Character count display (optional)

#### SelectField
**Purpose**: Reusable select dropdown component
**Props**:
- `label`: Field label
- `name`: Field name
- `value`: Current value
- `onChange`: Change handler
- `options`: Array of option objects {value, label}
- `error`: Error message
- `required`: Whether field is required
- `placeholder`: Placeholder option
**Features**:
- Accessible dropdown
- Error message display
- Custom styling
- Searchable option (if needed)

#### Button
**Purpose**: Reusable button component
**Props**:
- `children`: Button content
- `onClick`: Click handler
- `variant`: Button style (primary, secondary, danger, etc.)
- `size`: Button size (sm, md, lg)
- `disabled`: Whether button is disabled
- `type`: Button type (submit, button, reset)
- `fullWidth`: Whether button takes full width
**Features**:
- Multiple style variants
- Loading state
- Disabled state
- Proper focus states

### 3. Authentication Components

#### LoginForm
**Purpose**: Complete login form
**Props**:
- `onLogin`: Login callback function
- `onForgotPassword`: Forgot password callback
- `onNavigateToRegister`: Navigate to register callback
**Features**:
- Email input field
- Password input field
- Submit button
- Form validation
- Error display
- Loading state

#### RegisterForm
**Purpose**: Complete registration form
**Props**:
- `onRegister`: Registration callback function
- `onNavigateToLogin`: Navigate to login callback
**Features**:
- Name input field
- Email input field
- Password input field
- Confirm password field
- Submit button
- Form validation
- Error display
- Loading state

#### AuthCard
**Purpose**: Wrapper for authentication forms
**Props**:
- `title`: Card title
- `subtitle`: Card subtitle
- `children`: Form content
- `footer`: Footer content (links, etc.)
**Features**:
- Centered layout
- Form styling
- Responsive design
- Proper spacing

### 4. Task Management Components

#### TaskCard
**Purpose**: Display individual task information
**Props**:
- `task`: Task object
- `onEdit`: Edit callback
- `onDelete`: Delete callback
- `onToggleStatus`: Status toggle callback
- `isCompact`: Whether to show compact view
**Features**:
- Task title and description
- Status indicator
- Priority indicator
- Due date display
- Action buttons
- Hover effects

#### TaskList
**Purpose**: Display list of tasks
**Props**:
- `tasks`: Array of task objects
- `onEdit`: Edit callback
- `onDelete`: Delete callback
- `onToggleStatus`: Status toggle callback
- `loading`: Whether data is loading
**Features**:
- Task cards in list format
- Loading skeleton
- Empty state
- Pagination controls

#### TaskForm
**Purpose**: Task creation/editing form
**Props**:
- `task`: Task object (for editing, optional for creation)
- `onSubmit`: Submit callback
- `onCancel`: Cancel callback
- `loading`: Whether form is in loading state
**Features**:
- Title input
- Description textarea
- Priority selection
- Due date picker
- Status selection
- Form validation
- Loading state

#### TaskFilterBar
**Purpose**: Task filtering controls
**Props**:
- `filters`: Current filter values
- `onFilterChange`: Filter change callback
- `onClearFilters`: Clear filters callback
**Features**:
- Status filter dropdown
- Priority filter dropdown
- Date range picker
- Clear filters button
- Active filter indicators

#### TaskStatsCard
**Purpose**: Display task statistics
**Props**:
- `stats`: Statistics object with counts
**Features**:
- Total tasks count
- Completed tasks count
- Pending tasks count
- Upcoming deadlines
- Visual indicators

### 5. Navigation Components

#### Breadcrumb
**Purpose**: Breadcrumb navigation
**Props**:
- `items`: Array of breadcrumb items {label, href}
- `current`: Current page label
**Features**:
- Accessible navigation
- Current page indicator
- Responsive design

#### Pagination
**Purpose**: Pagination controls
**Props**:
- `currentPage`: Current page number
- `totalPages`: Total number of pages
- `onPageChange`: Page change callback
- `totalItems`: Total number of items
- `itemsPerPage`: Number of items per page
**Features**:
- Previous/next buttons
- Page number links
- Current page indicator
- Mobile-friendly design

### 6. Feedback Components

#### Alert
**Purpose**: Display alert messages
**Props**:
- `type`: Alert type (success, error, warning, info)
- `message`: Alert message
- `onClose`: Close callback (optional)
**Features**:
- Different color schemes for types
- Dismissible option
- Proper icon display
- Auto-dismiss (optional)

#### LoadingSpinner
**Purpose**: Display loading state
**Props**:
- `size`: Spinner size (sm, md, lg)
- `label`: Accessible label
**Features**:
- Accessible loading indicator
- Multiple sizes
- Proper ARIA attributes

#### Modal
**Purpose**: Modal dialog component
**Props**:
- `isOpen`: Whether modal is open
- `onClose`: Close callback
- `title`: Modal title
- `children`: Modal content
- `size`: Modal size (sm, md, lg, xl)
**Features**:
- Overlay backdrop
- Close button
- Proper focus management
- Responsive sizing

### 7. Data Display Components

#### DataTable
**Purpose**: Display tabular data
**Props**:
- `columns`: Array of column definitions
- `data`: Array of data objects
- `onRowClick`: Row click callback (optional)
- `loading`: Whether data is loading
**Features**:
- Sortable columns
- Responsive design
- Loading skeleton
- Empty state

#### EmptyState
**Purpose**: Display when no data is available
**Props**:
- `icon`: Icon to display
- `title`: Title message
- `description`: Description message
- `action`: Action button (optional)
**Features**:
- Visual representation
- Clear messaging
- Action button
- Responsive design

### 8. Utility Components

#### ProtectedRoute
**Purpose**: Wrapper for protected routes
**Props**:
- `children`: Content to protect
- `fallback`: Fallback component when not authenticated
**Features**:
- Authentication check
- Redirect handling
- Loading state

#### ThemeProvider
**Purpose**: Application theme provider
**Props**:
- `children`: Child components
- `initialTheme`: Initial theme
**Features**:
- Theme switching
- Local storage persistence
- System preference detection

## Component Styling Guidelines

### Tailwind CSS Classes
- Use consistent class names following BEM methodology
- Create reusable utility classes
- Maintain consistent spacing system
- Use consistent color palette

### Responsive Design
- Mobile-first approach
- Consistent breakpoints
- Proper touch targets (44px minimum)
- Adaptive layouts

### Accessibility
- Proper ARIA attributes
- Semantic HTML elements
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Color contrast compliance

## Component Reusability
- Components should be self-contained
- Props should be well-defined and documented
- Components should handle their own loading/error states
- Components should be tested independently