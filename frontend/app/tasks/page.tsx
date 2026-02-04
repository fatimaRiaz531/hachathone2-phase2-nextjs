'use client';

'use client';

import { useState, useEffect } from 'react';
import { TaskList } from '../../src/components/tasks/TaskList';
import { TaskForm } from '../../src/components/tasks/TaskForm';
import { TaskFilters } from '../../src/components/tasks/TaskFilters';
import { TaskSortControls } from '../../src/components/tasks/TaskSortControls';
import { Pagination } from '../../src/components/common/Pagination';
import { apiClient } from '../../lib/api';
import { Task } from '../../src/types';
import { AuthGuard } from '../../src/components/guards/AuthGuard';

export default function TasksPage() {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);

  useEffect(() => {
    fetchTasks();
  }, [currentPage]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get(`/tasks?page=${currentPage}&limit=10`);
      setTasks(data.data);
      setTotalPages(Math.ceil(data.meta.total / 10));
      setTotalTasks(data.meta.total);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // No need for handleTaskCreated function since we can handle it inline

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e75480] mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-black text-white">
        <header className="bg-[#e75480] py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-center">My Tasks</h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">All Tasks ({totalTasks})</h2>
            <button
              onClick={() => setShowTaskForm(true)}
              className="bg-[#e75480] hover:bg-[#d03d6c] text-white px-4 py-2 rounded-md transition-colors"
            >
              Create Task
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="mb-4">
                <TaskSortControls />
              </div>
              <TaskList tasks={tasks} onRefresh={fetchTasks} />
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
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
                    fetchTasks(); // Refresh the list
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