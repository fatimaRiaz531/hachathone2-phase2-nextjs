'use client';

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import { apiClient } from '../../lib/api';
import { TaskList } from '../../src/components/tasks/TaskList';
import { TaskForm } from '../../src/components/tasks/TaskForm';
import { TaskFilters } from '../../src/components/tasks/TaskFilters';
import { TaskStatsResponse } from '../../src/types';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState<TaskStatsResponse | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);

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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e75480] mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // AuthGuard should handle this
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-black text-white">
        <header className="bg-[#e75480] py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-center">Dashboard</h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-900 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-300">Total Tasks</h3>
                <p className="text-3xl font-bold text-white">{stats.total_tasks}</p>
              </div>
              <div className="bg-gray-900 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-300">Pending</h3>
                <p className="text-3xl font-bold text-yellow-400">{stats.pending_tasks}</p>
              </div>
              <div className="bg-gray-900 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-300">Completed</h3>
                <p className="text-3xl font-bold text-green-400">{stats.completed_tasks}</p>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recent Tasks</h2>
            <button
              onClick={() => setShowTaskForm(true)}
              className="bg-[#e75480] hover:bg-[#d03d6c] text-white px-4 py-2 rounded-md transition-colors"
            >
              Add New Task
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <TaskList tasks={tasks} />
            </div>
            <div>
              <TaskFilters />
            </div>
          </div>

          {showTaskForm && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
              <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">Create New Task</h3>
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