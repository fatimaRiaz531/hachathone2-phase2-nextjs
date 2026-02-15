'use client';

import React, { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { TaskSortControls } from '@/components/tasks/TaskSortControls';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Pagination } from '@/components/common/Pagination';
import { Task } from '@/lib/types';
import { tasksApi } from '@/lib/api/tasks';
import { useAuth } from '@clerk/nextjs';

const TasksPage = () => {
  const { isLoaded, getToken } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
  });
  const [sort, setSort] = useState({
    sortBy: 'created_at',
    sortOrder: 'desc' as 'asc' | 'desc',
  });

  // Load tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);

        const token = await getToken();
        tasksApi.setToken(token);

        const params = {
          page: currentPage,
          size: 10, // 10 tasks per page
          status: filters.status || undefined,
          search: filters.search || undefined,
          sortBy: sort.sortBy,
          sortOrder: sort.sortOrder,
        };

        const response = await tasksApi.getAllTasks(params);

        setTasks(response.data);
        setTotalPages(response.total_pages);
        setTotalTasks(response.total);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded) {
      fetchTasks();
    }
  }, [isLoaded, currentPage, filters, sort]);

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    try {
      const token = await getToken();
      tasksApi.setToken(token);

      const newTask = await tasksApi.createTask(taskData);
      setTasks([newTask, ...tasks]);
      setShowTaskForm(false);

      // Update total count
      setTotalTasks(prev => prev + 1);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async (taskData: Partial<Task> & { id: string }) => {
    try {
      const token = await getToken();
      tasksApi.setToken(token);

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

      const token = await getToken();
      tasksApi.setToken(token);

      const updatedTask = await tasksApi.patchTask(id, { completed: !taskToToggle.completed });
      setTasks(tasks.map(t => t.id === id ? updatedTask : t));
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
        const token = await getToken();
        tasksApi.setToken(token);

        await tasksApi.deleteTask(id);
        setTasks(tasks.filter(t => t.id !== id));

        // Update total count
        setTotalTasks(prev => prev - 1);
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
          <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-600">Manage all your tasks in one place</p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Tasks ({totalTasks})
            </h2>
            <Button onClick={openCreateTaskForm}>Create Task</Button>
          </div>

          <TaskFilters
            statusFilter={filters.status}
            setStatusFilter={(status) => {
              setFilters({ ...filters, status });
              setCurrentPage(1); // Reset to first page when filters change
            }}
            priorityFilter={filters.priority}
            setPriorityFilter={(priority) => {
              setFilters({ ...filters, priority });
              setCurrentPage(1); // Reset to first page when filters change
            }}
            searchQuery={filters.search}
            setSearchQuery={(search) => {
              setFilters({ ...filters, search });
              setCurrentPage(1); // Reset to first page when search changes
            }}
          />

          <TaskSortControls
            sortBy={sort.sortBy}
            setSortBy={(sortBy) => {
              setSort({ ...sort, sortBy });
              setCurrentPage(1); // Reset to first page when sorting changes
            }}
            sortOrder={sort.sortOrder}
            setSortOrder={(sortOrder) => {
              setSort({ ...sort, sortOrder });
              setCurrentPage(1); // Reset to first page when sorting changes
            }}
          />
        </div>

        <TaskList
          tasks={tasks}
          onToggleComplete={handleToggleComplete}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          loading={loading}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

        {/* Task Creation/Editing Modal */}
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
            onSuccess={editingTask ? handleUpdateTask : handleCreateTask}
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

export default TasksPage;