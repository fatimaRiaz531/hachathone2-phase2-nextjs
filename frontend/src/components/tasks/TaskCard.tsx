'use client';

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Checkbox } from '../ui/Checkbox';
import { Task } from '../../../src/types';
import { useClerkApi } from '../../lib/api/clerk-client';

interface TaskCardProps {
  task: Task;
  onToggleComplete?: (id: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onRefresh?: () => void;
}

const TaskCard = ({ task, onToggleComplete, onEdit, onDelete, onRefresh }: TaskCardProps) => {
  const apiClient = useClerkApi();

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
        return 'bg-pink-100 text-pink-700 dark:bg-pink-950/30 dark:text-pink-400';
      case 'in_progress':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400';
      case 'pending':
        return 'bg-stone-100 text-stone-700 dark:bg-stone-900 dark:text-stone-400';
      default:
        return 'bg-stone-100 text-stone-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-pink-200 text-pink-900 dark:bg-pink-900/50 dark:text-pink-100';
      case 'medium':
        return 'bg-amber-200 text-amber-900 dark:bg-amber-900/50 dark:text-amber-100';
      case 'low':
        return 'bg-stone-200 text-stone-900 dark:bg-stone-800 dark:text-stone-200';
      default:
        return 'bg-stone-100 text-stone-600';
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
    <Card className="overflow-hidden transition-all hover:shadow-lg border-border bg-card group">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Checkbox
              checked={task.status === 'completed'}
              onCheckedChange={handleToggleComplete}
              className="border-primary data-[state=checked]:bg-primary"
              aria-label={`Mark task ${task.title} as ${task.status === 'completed' ? 'incomplete' : 'complete'}`}
            />
            <div>
              <h3
                className={`text-lg font-black tracking-tight transition-colors ${task.status === 'completed' ? 'line-through text-muted-foreground/50' : 'text-foreground'
                  }`}
              >
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{task.description}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
            <Badge className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border-none shadow-none ${getStatusColor(task.status)}`}>
              {task.status.replace('_', ' ')}
            </Badge>
            <Badge className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border-none shadow-none ${getPriorityColor(task.priority)}`}>
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