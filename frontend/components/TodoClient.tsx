'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import { TaskCard } from './TaskCard';
import { useAuth } from '@/contexts/AuthContext';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  due_date?: string | null;
}

export function TodoClient() {
  const { isLoaded, userId, getToken } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  // ... (rest of state stays same)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingTasks, setProcessingTasks] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isLoaded) {
      fetchTasks();
    }
  }, [isLoaded, userId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      apiClient.setToken(token);

      const data = await apiClient.get('/tasks');
      setTasks(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setLoading(true);
      const token = await getToken();
      apiClient.setToken(token);

      const newTask = await apiClient.post('/tasks', {
        title,
        description: description || '',
        status: 'pending',
        priority: 'medium',
      });
      setTasks(prev => [newTask, ...prev]);
      setTitle('');
      setDescription('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (processingTasks.has(id)) return;
    try {
      setProcessingTasks(prev => new Set(prev).add(id));
      const token = await getToken();
      apiClient.setToken(token);

      await apiClient.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      if (err.message !== 'Task not found') {
        setError(err.message);
      } else {
        setTasks(prev => prev.filter(t => t.id !== id));
      }
    } finally {
      setProcessingTasks(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleToggle = async (task: Task) => {
    if (processingTasks.has(task.id)) return;
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      setProcessingTasks(prev => new Set(prev).add(task.id));
      const token = await getToken();
      apiClient.setToken(token);

      const updatedTask = await apiClient.patch(`/tasks/${task.id}`, {
        status: newStatus
      });
      setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessingTasks(prev => {
        const next = new Set(prev);
        next.delete(task.id);
        return next;
      });
    }
  };

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
  };

  const handleUpdate = async () => {
    if (!editingId || !editTitle.trim()) return;
    try {
      setLoading(true);
      const token = await getToken();
      apiClient.setToken(token);

      const updatedTask = await apiClient.put(`/tasks/${editingId}`, {
        title: editTitle,
        description: editDescription,
        status: tasks.find(t => t.id === editingId)?.status || 'pending',
        priority: tasks.find(t => t.id === editingId)?.priority || 'medium',
      });
      setTasks(prev => prev.map(t => t.id === editingId ? updatedTask : t));
      setEditingId(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const activeTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-32">

      {error && (
        <div className="fixed top-24 right-4 z-50 bg-destructive/90 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-4 animate-in slide-in-from-right-10">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <span className="font-medium">{error}</span>
          <button onClick={() => setError(null)} className="ml-2 hover:opacity-75">✕</button>
        </div>
      )}

      {/* Input Section */}
      <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <form onSubmit={handleAdd} className="space-y-5">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-secondary/50 border border-input rounded-xl px-5 py-4 text-lg font-semibold placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            <textarea
              placeholder="Add details (optional)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-secondary/50 border border-input rounded-xl px-5 py-4 text-base placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all h-24 resize-none"
            />
          </div>
          <div className="flex justify-between items-center pt-2">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex gap-2">
              <span className="px-2 py-1 bg-secondary rounded border border-border">Phase III</span>
              <span className="px-2 py-1 bg-primary/10 text-primary rounded border border-primary/20">Ready</span>
            </div>
            <button
              disabled={loading || !title.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 active:scale-95"
            >
              {loading ? 'Adding...' : 'Add Task'}
            </button>
          </div>
        </form>
      </section>

      {/* Edit Modal (Inline Overlay) */}
      {editingId && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-3xl shadow-2xl border border-border p-6 md:p-8 space-y-6 animate-in zoom-in-95">
            <h3 className="text-2xl font-bold">Edit Task</h3>
            <div className="space-y-4">
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-secondary/30 border border-input rounded-xl px-4 py-3 text-lg font-bold focus:ring-2 focus:ring-primary/50 focus:outline-none"
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full bg-secondary/30 border border-input rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 focus:outline-none h-32 resize-none"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditingId(null)}
                className="px-6 py-2.5 text-muted-foreground hover:bg-secondary rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-8 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Pending Tasks */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-3 text-foreground/80">
            <span className="w-2 h-8 bg-primary rounded-full" />
            In Progress
            <span className="bg-secondary text-secondary-foreground text-xs px-2.5 py-1 rounded-full">{activeTasks.length}</span>
          </h3>
          <div className="grid gap-3">
            {activeTasks.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl text-muted-foreground">
                <p>No active tasks</p>
              </div>
            ) : (
              activeTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={handleToggle}
                  onEdit={startEditing}
                  onDelete={handleDelete}
                  isProcessing={processingTasks.has(task.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-3 text-muted-foreground">
            <span className="w-2 h-8 bg-muted rounded-full" />
            Completed
            <span className="bg-muted text-muted-foreground text-xs px-2.5 py-1 rounded-full">{completedTasks.length}</span>
          </h3>
          <div className="grid gap-3">
            {completedTasks.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl text-muted-foreground opacity-50">
                <p>No completed tasks</p>
              </div>
            ) : (
              completedTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={handleToggle}
                  onEdit={startEditing}
                  onDelete={handleDelete}
                  isProcessing={processingTasks.has(task.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}