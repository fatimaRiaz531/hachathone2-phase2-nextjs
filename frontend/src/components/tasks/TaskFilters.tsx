'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';

interface TaskFiltersProps {
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  priorityFilter: string;
  setPriorityFilter: (priority: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const TaskFilters = ({
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  searchQuery,
  setSearchQuery,
}: TaskFiltersProps) => {
  return (
    <div className="flex flex-col gap-5 group/filters">
      <div className="space-y-2">
        <label htmlFor="search" className="block text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
          Search Tasks
        </label>
        <div className="relative">
          <input
            type="text"
            id="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title..."
            className="w-full pl-4 pr-10 py-3 bg-card border-2 border-border rounded-xl text-sm font-bold text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
            🔍
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="status" className="block text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
          Status
        </label>
        <Select value={statusFilter} onValueChange={setStatusFilter} defaultValue="">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="priority" className="block text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
          Priority
        </label>
        <Select value={priorityFilter} onValueChange={setPriorityFilter} defaultValue="">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

  );
};

export { TaskFilters };