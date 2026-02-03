'use client';

import React from 'react';
import { TaskCard } from './TaskCard';
import { Task } from '@/lib/types';
import { EmptyState } from '@/components/common/EmptyState';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  loading?: boolean;
}

const TaskList = ({ tasks, onToggleComplete, onEdit, onDelete, loading }: TaskListProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return <EmptyState title="No tasks found" description="Create your first task to get started." />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export { TaskList };