// In-memory storage for todos when API is unavailable
let todos: any[] = [];

export const todoStore = {
  getAll: () => {
    return [...todos];
  },

  getById: (id: string) => {
    return todos.find(todo => todo.id === id);
  },

  create: (title: string, description?: string) => {
    const newTodo = {
      id: Date.now().toString(),
      title,
      description: description || '',
      status: 'pending',
      priority: 'medium',
      user_id: 'anonymous', // Placeholder for demo purposes
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      due_date: null,
    };
    todos.push(newTodo);
    return newTodo;
  },

  update: (id: string, updates: Partial<any>) => {
    const index = todos.findIndex(todo => todo.id === id);
    if (index !== -1) {
      todos[index] = { ...todos[index], ...updates, updated_at: new Date().toISOString() };
      return todos[index];
    }
    return null;
  },

  delete: (id: string) => {
    const index = todos.findIndex(todo => todo.id === id);
    if (index !== -1) {
      todos.splice(index, 1);
      return true;
    }
    return false;
  },
};