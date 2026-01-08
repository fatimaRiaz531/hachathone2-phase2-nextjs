// Simple in-memory storage for todos
// Use global to prevent data loss during hot reloads in development
declare global {
  var __todos: Array<{
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    createdAt: string;
  }>;
  var __nextId: number;
}

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
  // In development, use global to persist data across hot reloads
  if (!global.__todos) {
    global.__todos = [
      {
        id: '1',
        title: 'Sample Todo',
        description: 'This is a sample todo item',
        completed: false,
        createdAt: new Date().toISOString()
      }
    ];
  }
  if (global.__nextId === undefined) {
    global.__nextId = 2;
  }
  todos = global.__todos;
  nextId = global.__nextId;
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
      global.__todos = todos;
      global.__nextId = nextId;
    }
    return newTodo;
  },

  update: (id: string, updates: Partial<{title: string, description?: string, completed: boolean}>) => {
    const index = todos.findIndex(todo => todo.id === id);
    if (index !== -1) {
      todos[index] = { ...todos[index], ...updates };
      if (process.env.NODE_ENV !== 'production') {
        global.__todos = todos;
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
        global.__todos = todos;
      }
      return true;
    }
    return false;
  }
};