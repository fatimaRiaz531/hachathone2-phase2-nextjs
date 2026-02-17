'use client';

import React, { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { TaskList } from '@/components/tasks/TaskList';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Task } from '@/lib/types';
import { tasksApi } from '@/lib/api/tasks';
import { useClerkApi } from '@/lib/api/clerk-client';


const DashboardPage = () => {
  useClerkApi(); // This hook sets the token provider for the singleton client
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [stats, setStats] = useState({
    total_tasks: 0,
    completed_tasks: 0,
    pending_tasks: 0,
    in_progress_tasks: 0,
  });

  // Load tasks and stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch tasks
        const tasksResponse = await tasksApi.getAllTasks({ page: 1, size: 5 });
        setTasks(tasksResponse.data);

        // Fetch stats
        const statsResponse = await tasksApi.getTaskStats();
        setStats(statsResponse);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    try {
      const newTask = await tasksApi.createTask(taskData);
      setTasks([newTask, ...tasks]);
      setShowTaskForm(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async (taskData: Partial<Task> & { id: string }) => {
    try {
      const updatedTask = await tasksApi.updateTask(taskData.id, taskData);
      setTasks(tasks.map(t => t.id === taskData.id ? updatedTask : t));
      setShowTaskForm(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleToggleComplete = async (id: string) => {
    try {
      const taskToToggle = tasks.find(t => t.id === id);
      if (!taskToToggle) return;

      const updatedTask = await tasksApi.patchTask(id, { status: taskToToggle.status === 'completed' ? 'pending' : 'completed' });
      setTasks(tasks.map(t => t.id === id ? updatedTask : t));

      // Update stats
      if (taskToToggle.status === 'completed') {
        setStats(prev => ({
          ...prev,
          completed_tasks: prev.completed_tasks - 1,
          pending_tasks: prev.pending_tasks + 1
        }));
      } else {
        setStats(prev => ({
          ...prev,
          completed_tasks: prev.completed_tasks + 1,
          pending_tasks: prev.pending_tasks - 1
        }));
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await tasksApi.deleteTask(id);
        setTasks(tasks.filter(t => t.id !== id));

        // Update stats
        setStats(prev => ({
          ...prev,
          total_tasks: prev.total_tasks - 1
        }));
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const openCreateTaskForm = () => {
    setEditingTask(null);
    setShowTaskForm(true);
  };

  return (
    <AuthGuard>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what you need to know.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_tasks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed_tasks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending_tasks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.in_progress_tasks}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tasks */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Tasks</h2>
            <Button onClick={openCreateTaskForm}>Create Task</Button>
          </div>

          <TaskList
            tasks={tasks}
            onToggleComplete={handleToggleComplete}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            loading={loading}
          />
        </div>

        {/* Task Creation Modal */}
        <Modal
          isOpen={showTaskForm}
          onClose={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
          title={editingTask ? 'Edit Task' : 'Create New Task'}
        >
          <TaskForm
            task={editingTask || undefined}
            onSuccess={(task) => {
              if (editingTask) {
                setTasks(tasks.map(t => t.id === task.id ? task : t));
              } else {
                setTasks([task, ...tasks]);
              }
              setShowTaskForm(false);
              setEditingTask(null);
            }}
            onCancel={() => {
              setShowTaskForm(false);
              setEditingTask(null);
            }}
          />
        </Modal>
      </div>
    </AuthGuard>
  );
};


export default DashboardPage;