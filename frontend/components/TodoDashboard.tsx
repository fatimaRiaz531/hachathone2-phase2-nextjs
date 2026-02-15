'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  ListTodo,
  AlertCircle,
  Loader2,
  RefreshCw,
  Edit2,
  X,
  Save,
} from 'lucide-react';
import { apiClient } from '../lib/api';
import { useAuth, useUser } from '@clerk/nextjs';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  completed?: boolean;
  createdAt?: string;
  priority?: string;
  due_date?: string;
}

export function TodoDashboard() {
  const { isLoaded, userId, getToken } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Edit Mode State
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Initial load
  useEffect(() => {
    if (isLoaded) {
      fetchTasks();
    }
  }, [isLoaded, userId]);

  const fetchTasks = async () => {
    try {
      setIsSyncing(true);
      setError(null);

      const token = await getToken();
      apiClient.setToken(token);

      const currentUserId = userId || 'demo';

      const tasksList = (await apiClient.getTasks(currentUserId)) || [];
      setTasks(Array.isArray(tasksList) ? tasksList : []);
    } catch (err: any) {
      console.error('Failed to fetch tasks:', err);
      if (!err.message.includes('Session expired')) {
        setError(err.message || 'Failed to sync with task repository');
      }
    } finally {
      setIsInitialLoading(false);
      setIsSyncing(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsLoading(true);
      setError(null);

      const token = await getToken();
      apiClient.setToken(token);
      const currentUserId = userId || 'demo';

      const created = await apiClient.createTask(currentUserId, {
        title: title.trim(),
        description: description.trim(),
        status: 'pending',
        priority: 'medium',
      });

      setTasks((prev) => [created, ...prev]);
      setTitle('');
      setDescription('');
    } catch (err: any) {
      setError(err.message || 'Failed to initialize task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editingTask.title.trim()) return;

    try {
      setIsSyncing(true);
      setError(null);

      const token = await getToken();
      apiClient.setToken(token);
      const currentUserId = userId || 'demo';

      const updated = await apiClient.updateTask(currentUserId, editingTask.id, {
        title: editingTask.title.trim(),
        description: editingTask.description?.trim(),
        status: editingTask.status,
        priority: editingTask.priority
      });

      setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? updated : t)));
      setEditingTask(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleTask = async (task: Task) => {
    try {
      setError(null);
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';

      // Optimistic update
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)));

      const token = await getToken();
      apiClient.setToken(token);
      const currentUserId = userId || 'demo';

      const updatedTask = await apiClient.completeTask(
        currentUserId,
        task.id,
        newStatus === 'completed',
      );

      // Confirm update from server
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)));
    } catch (err: any) {
      setError('Failed to update task status');
      // Revert optimistic update
      fetchTasks();
    }
  };

  const deleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      setError(null);

      setTasks((prev) => prev.filter((task) => task.id !== id));

      const token = await getToken();
      apiClient.setToken(token);
      const currentUserId = userId || 'demo';

      await apiClient.deleteTaskById(currentUserId, id);
    } catch (err: any) {
      setError('Failed to decommission task');
      fetchTasks();
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="animate-spin h-12 w-12 text-primary stroke-[3]" />
        <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
          Syncing Repository
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700 slide-in-from-bottom-4 px-4 sm:px-6 mb-20">
      {error && (
        <div className="fixed top-24 right-4 z-50 bg-destructive text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-10">
          <AlertCircle className="w-5 h-5" />
          <span className="font-bold text-sm uppercase tracking-tight">
            {error}
          </span>
          <button
            onClick={() => setError(null)}
            className="ml-2 hover:opacity-75 transition-opacity"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input Section - Centered & Max-Width */}
      <section className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm border-2 border-primary/20 rounded-[2.5rem] p-8 shadow-xl shadow-primary/5 transition-all hover:shadow-2xl hover:shadow-primary/10 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-secondary/[0.03] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="flex items-center gap-4 mb-8 relative">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
            <Plus className="w-6 h-6 stroke-[3]" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-secondary">
              New Function
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Initialize operational task
            </p>
          </div>
        </div>

        <form onSubmit={handleAddTask} className="space-y-6 relative">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Task Title</label>
              <input
                type="text"
                placeholder="e.g. Deploy to Production"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border-2 border-primary/10 rounded-2xl px-6 py-4 text-lg font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Properties</label>
              <textarea
                placeholder="Description, requirements, or notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border-2 border-primary/10 rounded-2xl px-6 py-4 text-base font-medium text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all h-32 resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="bg-primary text-primary-foreground hover:bg-blue-600 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50 disabled:grayscale shadow-xl shadow-blue-500/25 active:scale-95 flex items-center gap-3"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Processing...' : 'Add to Repository'}
            </button>
          </div>
        </form>
      </section>

      {/* List Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <h3 className="text-xl font-black tracking-tight flex items-center gap-3 text-secondary">
            <ListTodo className="w-6 h-6 text-secondary" />
            Active Repository
            <span className="bg-secondary/10 text-secondary text-[10px] px-2.5 py-1 rounded-full border border-secondary/20 font-bold">
              {tasks.length} {tasks.length === 1 ? 'TASK' : 'TASKS'}
            </span>
          </h3>
          <button
            onClick={fetchTasks}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors flex items-center gap-2 group"
            disabled={isSyncing}
            aria-label={isSyncing ? 'Syncing tasks' : 'Refresh tasks'}
          >
            {isSyncing ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Syncing...
              </span>
            ) : (
              <>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                  Push Sync
                </span>
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.length === 0 ? (
            <div className="col-span-full bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[2.5rem] py-24 text-center space-y-4 animate-in fade-in duration-1000">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Circle className="w-8 h-8 text-slate-300" />
              </div>
              <div className="space-y-1">
                <p className="font-black text-slate-400 uppercase tracking-widest text-xs">
                  Repository Empty
                </p>
                <p className="text-sm font-medium text-slate-400/80">
                  No tasks currently initialized.
                </p>
              </div>
            </div>
          ) : (
            tasks.map((task) => (
              editingTask?.id === task.id ? (
                // Edit Mode Card
                <div key={task.id} className="bg-white border-2 border-primary rounded-[2rem] p-6 shadow-xl animate-in scale-95 duration-200">
                  <form onSubmit={handleUpdateTask} className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-primary uppercase tracking-widest">Editing Task</span>
                      <button type="button" onClick={() => setEditingTask(null)} className="text-slate-400 hover:text-destructive transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <input
                      value={editingTask.title}
                      onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                      className="w-full bg-slate-50 border border-blue-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      autoFocus
                    />
                    <textarea
                      value={editingTask.description}
                      onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                      className="w-full bg-slate-50 border border-blue-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none h-24"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingTask(null)}
                        className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-100 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-blue-600 transition-colors flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" /> Save
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                // View Mode Card
                <div
                  key={task.id}
                  className={`group bg-white border-2 transition-all duration-300 rounded-[2rem] p-6 flex items-start gap-4 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden ${task.status === 'completed'
                      ? 'border-green-100 bg-green-50/30'
                      : 'border-slate-100 hover:border-blue-200'
                    }`}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors ${task.status === 'completed' ? 'bg-accent' : 'bg-primary md:bg-transparent md:group-hover:bg-primary'
                    }`} />

                  <button
                    onClick={() => toggleTask(task)}
                    className={`mt-1 transition-all hover:scale-110 active:scale-90 ${task.status === 'completed'
                        ? 'text-accent'
                        : 'text-slate-300 hover:text-primary'
                      }`}
                  >
                    {task.status === 'completed' ? (
                      <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
                    ) : (
                      <Circle className="w-7 h-7 stroke-[2.5]" />
                    )}
                  </button>

                  <div className="flex-1 space-y-1.5 cursor-pointer min-w-0" onClick={() => setEditingTask(task)}>
                    <h4
                      className={`text-lg font-black tracking-tight transition-all truncate pr-2 ${task.status === 'completed'
                          ? 'line-through text-slate-400 decoration-green-500/30 decoration-2'
                          : 'text-slate-700'
                        }`}
                    >
                      {task.title}
                    </h4>
                    {task.description && (
                      <p
                        className={`text-sm font-medium leading-relaxed line-clamp-2 transition-all ${task.status === 'completed'
                            ? 'text-slate-400/60'
                            : 'text-slate-400'
                          }`}
                      >
                        {task.description}
                      </p>
                    )}
                    {task.due_date && (
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                    <button
                      onClick={() => setEditingTask(task)}
                      className="p-2 rounded-xl text-slate-400 hover:text-primary hover:bg-blue-50 transition-all hover:scale-105"
                      title="Edit Task"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-destructive hover:bg-red-50 transition-all hover:scale-105"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            ))
          )}
        </div>
      </section>
    </div>
  );
}
