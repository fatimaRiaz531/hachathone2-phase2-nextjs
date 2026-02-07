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
      <div className="min-h-screen bg-background text-foreground relative selection:bg-primary/20">
        <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <span className="text-lg font-black text-white">T</span>
                </div>
                <span className="text-xl font-black tracking-tighter">TODO<span className="text-primary">PRO</span></span>
              </div>
              <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-muted-foreground tracking-tight">
                <a href="#" className="text-primary">Overview</a>
                <a href="#" className="hover:text-primary transition-colors">Team</a>
                <a href="#" className="hover:text-primary transition-colors">Integrations</a>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-black">{user.email?.split('@')[0]}</span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Administrator</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-black">
                {user.email?.[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <div className="bg-card p-8 rounded-3xl border-2 border-border shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-3">Total Operations</h3>
                <div className="flex items-center justify-between">
                  <p className="text-5xl font-black tracking-tighter text-foreground">{stats.total_tasks}</p>
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-card p-8 rounded-3xl border-2 border-border shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                <h3 className="text-xs font-black uppercase tracking-widest text-amber-600 mb-3">Pending Action</h3>
                <div className="flex items-center justify-between">
                  <p className="text-5xl font-black tracking-tighter text-amber-600">{stats.pending_tasks}</p>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-card p-8 rounded-3xl border-2 border-border shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                <h3 className="text-xs font-black uppercase tracking-widest text-secondary mb-3">Completed</h3>
                <div className="flex items-center justify-between">
                  <p className="text-5xl font-black tracking-tighter text-secondary">{stats.completed_tasks}</p>
                  <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="space-y-1">
              <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                <div className="w-2 h-8 bg-primary rounded-full" />
                Task Repository
              </h2>
              <p className="text-sm font-medium text-muted-foreground">Manage and track your operational objectives.</p>
            </div>
            <button
              onClick={() => setShowTaskForm(true)}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-primary/20 active:scale-95"
            >
              Initialize New Task
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 bg-card rounded-[2.5rem] border-2 border-border p-8 shadow-sm">
              <TaskList tasks={tasks} />
            </div>
            <div className="space-y-6">
              <div className="bg-card rounded-[2rem] border-2 border-border p-6 shadow-sm">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">Discovery Filters</h4>
                <TaskFilters
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  priorityFilter={priorityFilter}
                  setPriorityFilter={setPriorityFilter}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              </div>
              <div className="bg-primary/5 rounded-[2rem] border-2 border-primary/10 p-6">
                <h4 className="text-sm font-black text-primary mb-2">Pro Tip</h4>
                <p className="text-xs font-medium text-primary/70 leading-relaxed">Use natural language with our AI Chatbot to manage tasks faster.</p>
              </div>
            </div>
          </div>

          {showTaskForm && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
              <div className="bg-card p-10 md:p-14 rounded-[3.5rem] shadow-2xl w-full max-w-xl border-4 border-border animate-in zoom-in-95 duration-300 relative">
                <div className="flex justify-between items-start mb-10">
                  <div className="space-y-1">
                    <h3 className="text-4xl font-black tracking-tighter">NEW TASK</h3>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Task Initialization Module</p>
                  </div>
                  <button onClick={() => setShowTaskForm(false)} className="bg-muted hover:bg-muted/80 p-2 rounded-xl transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <TaskForm
                  onSuccess={(newTask) => {
                    setShowTaskForm(false);
                    fetchRecentTasks();
                    if (stats) fetchStats();
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