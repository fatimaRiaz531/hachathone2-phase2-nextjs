// Simple in-memory storage for todos
// Use different approaches for browser vs Node.js environments to handle hot reloads
let todos: Array<{
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
}>;

let nextId: number;

if (process.env.NODE_ENV === 'production') {
  // In production, use module-level variables
  todos = [
    {
      id: '1',
      title: 'Sample Todo',
      description: 'This is a sample todo item',
      completed: false,
      createdAt: new Date().toISOString()
    }
  ];
  nextId = 2;
} else {
  // In development, handle both browser and Node.js environments to persist data across hot reloads
  if (typeof window !== 'undefined') {
    // Browser environment - use window to persist across hot reloads
    (window as any).__todos = (window as any).__todos || [];
    (window as any).__nextId = (window as any).__nextId || 2;

    todos = (window as any).__todos;
    nextId = (window as any).__nextId;
  } else if (typeof global !== 'undefined') {
    // Node.js environment - use global to persist across hot reloads
    (global as any).__todos = (global as any).__todos || [];
    (global as any).__nextId = (global as any).__nextId || 2;

    todos = (global as any).__todos;
    nextId = (global as any).__nextId;
  } else {
    // Fallback for other environments
    todos = [
      {
        id: '1',
        title: 'Sample Todo',
        description: 'This is a sample todo item',
        completed: false,
        createdAt: new Date().toISOString()
      }
    ];
    nextId = 2;
  }
}

export const todoStore = {
  getAll: () => todos,

  getById: (id: string) => todos.find(todo => todo.id === id),

  create: (title: string, description?: string) => {
    const newTodo = {
      id: nextId.toString(),
      title,
      description,
      completed: false,
      createdAt: new Date().toISOString()
    };
    todos.push(newTodo);
    nextId++;
    if (process.env.NODE_ENV !== 'production') {
      if (typeof window !== 'undefined') {
        // Browser environment
        (window as any).__todos = todos;
        (window as any).__nextId = nextId;
      } else if (typeof global !== 'undefined') {
        // Node.js environment
        (global as any).__todos = todos;
        (global as any).__nextId = nextId;
      }
    }
    return newTodo;
  },

  update: (id: string, updates: Partial<{title: string, description?: string, completed: boolean}>) => {
    const index = todos.findIndex(todo => todo.id === id);
    if (index !== -1) {
      todos[index] = { ...todos[index], ...updates };
      if (process.env.NODE_ENV !== 'production') {
        if (typeof window !== 'undefined') {
          // Browser environment
          (window as any).__todos = todos;
        } else if (typeof global !== 'undefined') {
          // Node.js environment
          (global as any).__todos = todos;
        }
      }
      return todos[index];
    }
    return null;
  },

  delete: (id: string) => {
    const index = todos.findIndex(todo => todo.id === id);
    if (index !== -1) {
      todos.splice(index, 1);
      if (process.env.NODE_ENV !== 'production') {
        if (typeof window !== 'undefined') {
          // Browser environment
          (window as any).__todos = todos;
        } else if (typeof global !== 'undefined') {
          // Node.js environment
          (global as any).__todos = todos;
        }
      }
      return true;
    }
    return false;
  }
};