'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Task } from '@/lib/types';
import { tasksApi } from '@/lib/api/tasks';

const TaskDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load task details
  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        const taskId = Array.isArray(id) ? parseInt(id[0], 10) : parseInt(id, 10);

        if (isNaN(taskId)) {
          setError('Invalid task ID');
          setLoading(false);
          return;
        }

        const taskData = await tasksApi.getTaskById(taskId);
        setTask(taskData);
      } catch (err) {
        console.error('Error fetching task:', err);
        setError('Failed to load task details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTask();
    }
  }, [id]);

  const handleToggleComplete = async () => {
    if (!task) return;

    try {
      const updatedTask = await tasksApi.patchTask(task.id, { completed: !task.completed });
      setTask(updatedTask);
    } catch (error) {
      console.error('Error updating task completion:', error);
    }
  };

  const handleUpdateTask = async (taskData: Partial<Task>) => {
    if (!task) return;

    try {
      const updatedTask = await tasksApi.updateTask(task.id, taskData);
      setTask(updatedTask);
      setShowEditForm(false);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async () => {
    if (!task) return;

    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await tasksApi.deleteTask(task.id);
        router.push('/tasks'); // Redirect to tasks list after deletion
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (error) {
    return (
      <AuthGuard>
        <div className="container mx-auto py-8 px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!task) {
    return (
      <AuthGuard>
        <div className="container mx-auto py-8 px-4">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Not Found! </strong>
            <span className="block sm:inline">The requested task does not exist.</span>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AuthGuard>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Task Details</h1>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => router.back()}>
              Back
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-2xl">
                {task.title}
              </CardTitle>
              <Badge className={getStatusColor(task.status)}>
                {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {task.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                  <p className="text-gray-900">{task.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                  <p className="capitalize text-gray-900">{task.status}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Completed</h3>
                  <p className="text-gray-900">{task.completed ? 'Yes' : 'No'}</p>
                </div>

                {task.due_date && (
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Due Date</h3>
                      <p className="text-gray-900">{formatDate(task.due_date)}</p>
                    </div>
                  </>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Created At</h3>
                  <p className="text-gray-900">{formatDate(task.created_at)}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Updated At</h3>
                  <p className="text-gray-900">{formatDate(task.updated_at)}</p>
                </div>
              </div>

              {task.tags && task.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                onClick={handleToggleComplete}
                variant={task.completed ? 'outline' : 'default'}
              >
                {task.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
              </Button>
              <Button onClick={() => setShowEditForm(true)}>
                Edit Task
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteTask}
              >
                Delete Task
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Edit Task Modal */}
        <Modal
          isOpen={showEditForm}
          onClose={() => setShowEditForm(false)}
          title="Edit Task"
        >
          <TaskForm
            task={task}
            onSubmit={handleUpdateTask}
            onCancel={() => setShowEditForm(false)}
          />
        </Modal>
      </div>
    </AuthGuard>
  );
};

export default TaskDetailPage;