'use client';

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Checkbox } from '../ui/Checkbox';
import { Task } from '../../../src/types';
import { apiClient } from '../../../lib/api';

interface TaskCardProps {
  task: Task;
  onToggleComplete?: (id: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onRefresh?: () => void;
}

const TaskCard = ({ task, onToggleComplete, onEdit, onDelete, onRefresh }: TaskCardProps) => {
  const handleToggleComplete = async () => {
    try {
      await apiClient.patch(`/tasks/${task.id}`, {
        status: task.status === 'completed' ? 'pending' : 'completed'
      });

      if (onToggleComplete) {
        onToggleComplete(task.id);
      } else if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await apiClient.delete(`/tasks/${task.id}`);

        if (onDelete) {
          onDelete(task.id);
        } else if (onRefresh) {
          onRefresh();
        }
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Checkbox
              checked={task.status === 'completed'}
              onCheckedChange={handleToggleComplete}
              aria-label={`Mark task ${task.title} as ${task.status === 'completed' ? 'incomplete' : 'complete'}`}
            />
            <div>
              <h3
                className={`text-lg font-semibold ${
                  task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                }`}
              >
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
              )}
            </div>
          </div>
          <div className="flex space-x-1">
            <Badge className={getStatusColor(task.status)}>
              {task.status.replace('_', ' ')}
            </Badge>
            <Badge className={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        {task.due_date && (
          <div className="flex items-center text-sm text-gray-500 mt-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Due: {formatDate(task.due_date)}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between pt-2 border-t">
        <Button variant="outline" size="sm" onClick={() => onEdit && onEdit(task)}>
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export { TaskCard };