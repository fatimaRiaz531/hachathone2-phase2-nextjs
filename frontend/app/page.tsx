'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import { todoStore } from '../lib/todo-store';

interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState({ title: '', description: '' });
  const [editingTodo, setEditingTodo] = useState<{ id: string; title: string; description?: string } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const data = await apiClient.get('/todos');
      setTodos(data);
    } catch (err: any) {
      // If API fails, fall back to in-memory storage
      if (err.message && err.message.includes('Unable to connect to the API server')) {
        console.warn('Backend unavailable, using in-memory storage');
        setTodos(todoStore.getAll());
      } else {
        setError(err.message || 'Error fetching todos');
        console.error('Error fetching todos:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const createdTodo = await apiClient.post('/todos', {
        title: newTodo.title,
        description: newTodo.description,
      });
      setTodos([createdTodo, ...todos]);
      setNewTodo({ title: '', description: '' });
      setError('');
    } catch (err: any) {
      // If API fails, fall back to in-memory storage
      if (err.message && err.message.includes('Unable to connect to the API server')) {
        console.warn('Backend unavailable, saving to in-memory storage');
        const createdTodo = todoStore.create(newTodo.title, newTodo.description);
        setTodos([createdTodo, ...todos]);
        setNewTodo({ title: '', description: '' });
        setError('');
      } else {
        setError(err.message || 'Error adding todo');
        console.error('Error adding todo:', err);
      }
    }
  };

  const toggleTodoCompletion = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
      const updatedTodo = await apiClient.put(`/todos/${id}`, {
        title: todo.title,
        description: todo.description,
        completed: !todo.completed,
      });
      setTodos(todos.map(t => (t.id === id ? updatedTodo : t)));
    } catch (err: any) {
      // If API fails, fall back to in-memory storage
      if (err.message && err.message.includes('Unable to connect to the API server')) {
        console.warn('Backend unavailable, updating in-memory storage');
        const updatedTodo = todoStore.update(id, { completed: !todo.completed });
        if (updatedTodo) {
          setTodos(todos.map(t => (t.id === id ? updatedTodo : t)));
        }
      } else {
        setError(err.message || 'Error updating todo');
        console.error('Error updating todo:', err);
      }
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await apiClient.delete(`/todos/${id}`);
      setTodos(todos.filter(t => t.id !== id));
    } catch (err: any) {
      // If API fails, fall back to in-memory storage
      if (err.message && err.message.includes('Unable to connect to the API server')) {
        console.warn('Backend unavailable, removing from in-memory storage');
        todoStore.delete(id);
        setTodos(todos.filter(t => t.id !== id));
      } else {
        setError(err.message || 'Error deleting todo');
        console.error('Error deleting todo:', err);
      }
    }
  };

  const startEditing = (todo: Todo) => {
    setEditingTodo({
      id: todo.id,
      title: todo.title,
      description: todo.description || ''
    });
  };

  const cancelEditing = () => {
    setEditingTodo(null);
  };

  const saveEdit = async (id: string) => {
    if (!editingTodo) return;

    try {
      const updatedTodo = await apiClient.put(`/todos/${id}`, {
        title: editingTodo.title,
        description: editingTodo.description,
        completed: todos.find(t => t.id === id)?.completed || false,
      });
      setTodos(todos.map(t => (t.id === id ? updatedTodo : t)));
      setEditingTodo(null);
    } catch (err: any) {
      // If API fails, fall back to in-memory storage
      if (err.message && err.message.includes('Unable to connect to the API server')) {
        console.warn('Backend unavailable, updating in-memory storage');
        const updatedTodo = todoStore.update(id, {
          title: editingTodo.title,
          description: editingTodo.description,
        });
        if (updatedTodo) {
          setTodos(todos.map(t => (t.id === id ? updatedTodo : t)));
        }
        setEditingTodo(null);
      } else {
        setError(err.message || 'Error updating todo');
        console.error('Error updating todo:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e75480] mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-[#e75480] py-6">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center">Todo App</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-600 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-gray-900 p-6 rounded-lg mb-8">
          <form onSubmit={handleAddTodo} className="flex flex-col space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Todo Title
              </label>
              <input
                type="text"
                id="title"
                required
                className="w-full bg-gray-800 text-white border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#e75480] focus:border-transparent"
                value={newTodo.title}
                onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                placeholder="Enter todo title"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description (Optional)
              </label>
              <textarea
                id="description"
                rows={3}
                className="w-full bg-gray-800 text-white border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#e75480] focus:border-transparent"
                value={newTodo.description}
                onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                placeholder="Enter todo description"
              />
            </div>
            <button
              type="submit"
              className="bg-[#e75480] hover:bg-[#d03d6c] text-white px-4 py-2 rounded-md self-start transition-colors"
            >
              Add Todo
            </button>
          </form>
        </div>

        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-700">
            {todos.length === 0 ? (
              <li className="px-6 py-8 text-center">
                <p className="text-gray-400">No todos yet. Add one above!</p>
              </li>
            ) : (
              todos.map((todo) => (
                <li key={todo.id} className="px-6 py-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodoCompletion(todo.id)}
                        className="mt-1 h-4 w-4 text-[#e75480] border-gray-600 rounded focus:ring-[#e75480] focus:ring-2"
                      />
                      <div className="ml-3 flex-1">
                        {editingTodo && editingTodo.id === todo.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editingTodo.title}
                              onChange={(e) => setEditingTodo({ ...editingTodo, title: e.target.value })}
                              className="w-full bg-gray-800 text-white border border-gray-600 rounded-md py-1 px-2 text-sm mb-2"
                              autoFocus
                            />
                            <textarea
                              value={editingTodo.description}
                              onChange={(e) => setEditingTodo({ ...editingTodo, description: e.target.value })}
                              className="w-full bg-gray-800 text-white border border-gray-600 rounded-md py-1 px-2 text-sm"
                              rows={2}
                            />
                            <div className="flex space-x-2 mt-2">
                              <button
                                onClick={() => saveEdit(todo.id)}
                                className="text-xs bg-[#e75480] hover:bg-[#d03d6c] text-white px-3 py-1 rounded"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="text-xs bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className={`${todo.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                              {todo.title}
                            </div>
                            {todo.description && (
                              <div className="text-gray-300 mt-1 text-sm">{todo.description}</div>
                            )}
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(todo.createdAt).toLocaleString()}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      {editingTodo && editingTodo.id === todo.id ? null : (
                        <button
                          onClick={() => startEditing(todo)}
                          className="text-sm text-gray-300 hover:text-white"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="text-sm text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </main>
    </div>
  );
}