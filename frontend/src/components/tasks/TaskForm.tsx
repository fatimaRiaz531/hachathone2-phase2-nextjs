'use client';

import React, { useState, useEffect } from 'react';
import { InputField } from '../auth/InputField';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Task } from '../../../src/types';
import { apiClient } from '../../../lib/api';

interface TaskFormProps {
  task?: Task;
  onSuccess: (task: Task) => void;
  onCancel: () => void;
}

const TaskForm = ({ task, onSuccess, onCancel }: TaskFormProps) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'pending',
    due_date: task?.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
    priority: task?.priority || 'medium',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'pending',
        due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
        priority: task.priority || 'medium',
      });
    }
  }, [task]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    // Clear error when user starts typing
    if (errors[id]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      status: value as 'pending' | 'in_progress' | 'completed',
    }));
  };

  const handlePriorityChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      priority: value as 'low' | 'medium' | 'high',
    }));
  };


  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 1 || formData.title.length > 200) {
      newErrors.title = 'Title must be between 1 and 200 characters';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    if (formData.due_date) {
      const date = new Date(formData.due_date);
      if (isNaN(date.getTime())) {
        newErrors.due_date = 'Invalid date format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const taskData = {
        title: formData.title,
        description: formData.description,
        status: formData.status as 'pending' | 'in_progress' | 'completed',
        due_date: formData.due_date || null,
        priority: formData.priority as 'low' | 'medium' | 'high',
      };

      let result;
      if (task) {
        // Update existing task
        result = await apiClient.put(`/tasks/${task.id}`, taskData);
      } else {
        // Create new task
        result = await apiClient.post('/tasks', taskData);
      }

      onSuccess(result);
    } catch (error: any) {
      console.error('Error submitting task:', error);
      setErrors({ submit: error.message || 'An error occurred while saving the task' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <InputField
        label="Title"
        id="title"
        type="text"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        required
        placeholder="Task title"
      />

      <Textarea
        label="Description"
        id="description"
        value={formData.description}
        onChange={handleChange}
        error={errors.description}
        placeholder="Task description (optional)"
        rows={3}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="status" className="block text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
            Task Status
          </label>
          <Select value={formData.status} onValueChange={handleSelectChange}>
            <SelectTrigger className="focus:ring-primary/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="priority" className="block text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
            Task Priority
          </label>
          <Select value={formData.priority} onValueChange={handlePriorityChange}>
            <SelectTrigger className="focus:ring-primary/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

      </div>

      <InputField
        label="Due Date"
        id="due_date"
        type="date"
        value={formData.due_date}
        onChange={handleChange}
        error={errors.due_date}
        placeholder="Due date"
      />

      {errors.submit && (
        <div className="text-red-500 text-sm">{errors.submit}</div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : (task ? 'Update Task' : 'Create Task')}
        </Button>
      </div>
    </form>
  );
};

export { TaskForm };