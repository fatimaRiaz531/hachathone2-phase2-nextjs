'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '../../lib/api';
import { TaskForm } from '../../src/components/tasks/TaskForm';

export default function TaskDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchTask();
    }
  }, [id]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get(`/tasks/${id}`);
      setTask(data);
    } catch (error: any) {
      setError(error.message || 'Error fetching task');
      console.error('Error fetching task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await apiClient.delete(`/tasks/${id}`);
        router.push('/tasks');
      } catch (error: any) {
        setError(error.message || 'Error deleting task');
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleToggleComplete = async () => {
    try {
      const updatedTask = await apiClient.patch(`/tasks/${id}`, {
        status: task.status === 'completed' ? 'pending' : 'completed'
      });
      setTask(updatedTask);
    } catch (error: any) {
      setError(error.message || 'Error updating task');
      console.error('Error updating task:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e75480] mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading task...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-[#e75480] hover:bg-[#d03d6c] text-white px-4 py-2 rounded-md"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300 mb-4">Task not found</p>
          <button
            onClick={() => router.back()}
            className="bg-[#e75480] hover:bg-[#d03d6c] text-white px-4 py-2 rounded-md"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-[#e75480] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-center">Task Details</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {editing ? (
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Edit Task</h2>
            <TaskForm
              task={task}
              onSuccess={(updatedTask) => {
                setTask(updatedTask);
                setEditing(false);
              }}
              onCancel={() => setEditing(false)}
            />
          </div>
        ) : (
          <div className="bg-gray-900 p-6 rounded-lg">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold">{task.title}</h2>
                <div className="mt-2 flex items-center space-x-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    task.status === 'completed' ? 'bg-green-600' :
                    task.status === 'in_progress' ? 'bg-yellow-600' : 'bg-blue-600'
                  }`}>
                    {task.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    task.priority === 'high' ? 'bg-red-600' :
                    task.priority === 'medium' ? 'bg-yellow-600' : 'bg-gray-600'
                  }`}>
                    {task.priority.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleToggleComplete}
                  className={`px-3 py-1 rounded ${
                    task.status === 'completed'
                      ? 'bg-gray-600 hover:bg-gray-700'
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white text-sm`}
                >
                  {task.status === 'completed' ? 'Mark Incomplete' : 'Mark Complete'}
                </button>
                <button
                  onClick={() => setEditing(true)}
                  className="px-3 py-1 rounded bg-[#e75480] hover:bg-[#d03d6c] text-white text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-sm"
                >
                  Delete
                </button>
              </div>
            </div>

            {task.description && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-300 mb-2">Description</h3>
                <p className="text-gray-200">{task.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
              <div>
                <strong>Created:</strong><br />
                {new Date(task.created_at).toLocaleString()}
              </div>
              <div>
                <strong>Last Updated:</strong><br />
                {new Date(task.updated_at).toLocaleString()}
              </div>
              {task.due_date && (
                <>
                  <div>
                    <strong>Due Date:</strong><br />
                    {new Date(task.due_date).toLocaleDateString()}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white"
          >
            Back to Tasks
          </button>
        </div>
      </main>
    </div>
  );
}