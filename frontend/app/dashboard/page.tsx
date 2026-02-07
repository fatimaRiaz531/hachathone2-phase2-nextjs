'use client';

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import { apiClient } from '../../lib/api';
import { TaskList } from '../../src/components/tasks/TaskList';
import { TaskForm } from '../../src/components/tasks/TaskForm';
import { TaskFilters } from '../../src/components/tasks/TaskFilters';
import { TaskStatsResponse, Task } from '@/types';
import { AuthGuard } from '@/components/guards/AuthGuard';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState<TaskStatsResponse | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isLoading && user) {
      fetchStats();
      fetchRecentTasks();
    }
  }, [isLoading, user]);

  const fetchStats = async () => {
    try {
      const data = await apiClient.get('/users/me/tasks/stats');
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentTasks = async () => {
    try {
      const data = await apiClient.get('/tasks?limit=5&sort=created_at&order=desc');
      setTasks(data.data);
    } catch (error) {
      console.error('Error fetching recent tasks:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // AuthGuard should handle this
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent pointer-events-none" />

        <header className="relative z-10 py-10 overflow-hidden">
          <div className="absolute inset-0 bg-primary opacity-90 -z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,hsl(var(--accent)),transparent)] opacity-40 -z-10" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white drop-shadow-lg animate-in slide-in-from-top-4 duration-500">
              Command <span className="text-secondary italic">Center</span>
            </h1>
            <p className="mt-2 text-primary-foreground/80 font-bold uppercase tracking-[0.2em] text-sm">Dashboard Overview</p>
          </div>
        </header>

        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <div className="relative group overflow-hidden bg-white dark:bg-card p-1 rounded-3xl shadow-xl transition-all hover:scale-105 active:scale-95">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-10 group-hover:opacity-20 transition-opacity" />
                <div className="relative bg-white dark:bg-card p-8 rounded-[1.4rem] border border-primary/10">
                  <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-2">Total Tasks</h3>
                  <div className="flex items-baseline gap-2">
                    <p className="text-5xl font-black text-foreground">{stats.total_tasks}</p>
                    <div className="h-2 w-12 bg-primary/20 rounded-full" />
                  </div>
                </div>
              </div>

              <div className="relative group overflow-hidden bg-white dark:bg-card p-1 rounded-3xl shadow-xl transition-all hover:scale-105 active:scale-95">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-600 opacity-10 group-hover:opacity-20 transition-opacity" />
                <div className="relative bg-white dark:bg-card p-8 rounded-[1.4rem] border border-orange-500/10">
                  <h3 className="text-xs font-black uppercase tracking-widest text-orange-500 mb-2">Pending</h3>
                  <p className="text-5xl font-black text-orange-500">{stats.pending_tasks}</p>
                </div>
              </div>

              <div className="relative group overflow-hidden bg-white dark:bg-card p-1 rounded-3xl shadow-xl transition-all hover:scale-105 active:scale-95">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary to-blue-500 opacity-10 group-hover:opacity-20 transition-opacity" />
                <div className="relative bg-white dark:bg-card p-8 rounded-[1.4rem] border border-secondary/10">
                  <h3 className="text-xs font-black uppercase tracking-widest text-secondary mb-2">Completed</h3>
                  <p className="text-5xl font-black text-secondary">{stats.completed_tasks}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground flex items-center gap-3">
              <div className="w-2 h-8 bg-primary rounded-full" />
              Recent Tasks
            </h2>
            <button
              onClick={() => setShowTaskForm(true)}
              className="vibrant-gradient px-8 py-3.5 rounded-2xl font-black uppercase tracking-wider text-sm transition-all shadow-[0_10px_20px_-5px_rgba(236,72,153,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(236,72,153,0.6)] hover:-translate-y-1 active:scale-95"
            >
              Add New Task
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 glass-card rounded-[2.5rem] p-6">
              <TaskList tasks={tasks} />
            </div>
            <div className="glass-card rounded-[2.5rem] p-6">
              <TaskFilters
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                priorityFilter={priorityFilter}
                setPriorityFilter={setPriorityFilter}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </div>
          </div>

          {showTaskForm && (
            <div className="fixed inset-0 bg-primary/20 backdrop-blur-xl flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-card p-8 md:p-12 rounded-[3rem] shadow-2xl w-full max-w-lg border border-white/20 animate-in zoom-in-95 fade-in duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -z-10" />
                <h3 className="text-3xl font-black uppercase tracking-tighter mb-8 text-vibrant">Create New Task</h3>
                <TaskForm
                  onSuccess={(newTask) => {
                    setShowTaskForm(false);
                    fetchRecentTasks(); // Refresh recent tasks
                    if (stats) fetchStats(); // Refresh stats
                  }}
                  onCancel={() => setShowTaskForm(false)}
                />
              </div>
            </div>
          )}
        </main>
      </div>

    </AuthGuard>
  );
}