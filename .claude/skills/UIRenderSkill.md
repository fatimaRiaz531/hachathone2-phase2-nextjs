# UI Render Skill

Generate React/TSX components with Tailwind CSS from UI descriptions.

## Input
$ARGUMENTS - UI description (e.g., "Task card with title, status toggle", "Login form with email and password")

## Instructions

Based on the provided UI description: **$ARGUMENTS**

### 1. Parse UI Requirements

Extract from description:
- **Component type**: Card, Form, List, Modal, Button, etc.
- **Elements**: Inputs, buttons, toggles, text, icons
- **Interactions**: Click handlers, state changes, form submission
- **Layout**: Flex, grid, spacing requirements

### 2. Component Structure

```tsx
// =============================================================================
// [Task]: T-XXX
// [From]: @specs/ui/components.md#<component-name>
// [Description]: <brief description>
// =============================================================================

import React from 'react';

interface ComponentNameProps {
  // Props with JSDoc comments
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  // Destructured props
}) => {
  return (
    // JSX with Tailwind classes
  );
};

export default ComponentName;
```

### 3. Tailwind CSS Standards

#### Spacing Scale
| Size | Class | Use Case |
|------|-------|----------|
| 4px | `p-1`, `m-1` | Tight spacing |
| 8px | `p-2`, `m-2` | Default spacing |
| 16px | `p-4`, `m-4` | Section spacing |
| 24px | `p-6`, `m-6` | Card padding |

#### Color Palette (Dark Mode Compatible)
```
Background:  bg-white dark:bg-gray-800
Card:        bg-gray-50 dark:bg-gray-700
Primary:     bg-blue-600 hover:bg-blue-700
Success:     bg-green-600 hover:bg-green-700
Danger:      bg-red-600 hover:bg-red-700
Text:        text-gray-900 dark:text-white
Muted:       text-gray-500 dark:text-gray-400
Border:      border-gray-200 dark:border-gray-600
```

#### Typography
```
Heading 1:   text-2xl font-bold
Heading 2:   text-xl font-semibold
Body:        text-base
Small:       text-sm
Caption:     text-xs text-gray-500
```

### 4. Component Templates

#### Task Card
```tsx
// =============================================================================
// [Task]: T-UI-001
// [From]: @specs/ui/components.md#task-card
// [Description]: Task card with title, status toggle, and actions
// =============================================================================

import React from 'react';

interface TaskCardProps {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  id,
  title,
  description,
  completed,
  onToggle,
  onDelete,
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        {/* Status Toggle */}
        <button
          onClick={() => onToggle(id)}
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            completed
              ? 'bg-green-600 border-green-600 text-white'
              : 'border-gray-300 dark:border-gray-500 hover:border-green-500'
          }`}
          aria-label={completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {completed && (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>

        {/* Task Content */}
        <div>
          <h3
            className={`font-medium ${
              completed
                ? 'text-gray-400 line-through'
                : 'text-gray-900 dark:text-white'
            }`}
          >
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Delete Button */}
      <button
        onClick={() => onDelete(id)}
        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        aria-label="Delete task"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>
  );
};

export default TaskCard;
```

#### Form Input
```tsx
// =============================================================================
// [Task]: T-UI-002
// [From]: @specs/ui/components.md#form-input
// [Description]: Reusable form input with label and error state
// =============================================================================

import React from 'react';

interface FormInputProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
}) => {
  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error
            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
        } text-gray-900 dark:text-white placeholder-gray-400`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormInput;
```

#### Button
```tsx
// =============================================================================
// [Task]: T-UI-003
// [From]: @specs/ui/components.md#button
// [Description]: Reusable button with variants
// =============================================================================

import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const variantClasses = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
```

### 5. Rules

**DO:**
- Use Tailwind utility classes exclusively
- Support dark mode with `dark:` prefix
- Include proper TypeScript interfaces
- Add aria labels for accessibility
- Use semantic HTML elements
- Include hover/focus states

**DON'T:**
- Use inline styles (`style={{}}`)
- Use CSS modules or external stylesheets
- Hardcode colors (use Tailwind palette)
- Skip TypeScript types
- Forget responsive breakpoints where needed

### 6. Output Format

```
## Generated Component

**Description:** [component description]
**File:** `src/components/[ComponentName].tsx`

### Component Code

\`\`\`tsx
[generated TSX code]
\`\`\`

### Usage Example

\`\`\`tsx
import { ComponentName } from '@/components/ComponentName';

<ComponentName prop1="value" prop2={handler} />
\`\`\`

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| ... | ... | ... | ... | ... |
```

## Example Usage

```
/UIRenderSkill Task card with title, status toggle
```

```
/UIRenderSkill Login form with email, password, and submit button
```

```
/UIRenderSkill Modal dialog with header, content, and action buttons
```

## Output Location

Components saved to: `src/components/`
