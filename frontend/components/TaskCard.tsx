import React from 'react';

interface Task {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    created_at: string;
    updated_at: string;
    due_date?: string | null;
}

interface TaskCardProps {
    task: Task;
    onToggle: (task: Task) => void;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
    isProcessing: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onEdit, onDelete, isProcessing }) => {
    const isCompleted = task.status === 'completed';

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
            });
        } catch (e) {
            return dateString;
        }
    };

    return (
        <div
            className={`group relative overflow-hidden rounded-2xl border transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 ${isCompleted
                ? 'bg-muted/40 border-border/50 opacity-60 backdrop-blur-sm'
                : 'bg-card/60 backdrop-blur-md border-border/50 hover:border-primary/40'
                }`}
        >
            {/* Status Bar Indicator */}
            <div
                className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-300 ${isCompleted ? 'bg-muted-foreground' : 'bg-primary'
                    }`}
            />

            <div className="p-5 pl-7 flex items-start gap-4">
                {/* Toggle Checkbox */}
                <button
                    onClick={() => onToggle(task)}
                    disabled={isProcessing}
                    className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/40 ${isCompleted
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-muted-foreground/40 hover:border-primary text-transparent'
                        }`}
                    aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
                >
                    {isCompleted && (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                        <h4
                            className={`text-lg font-bold leading-tight transition-all truncate pr-2 ${isCompleted ? 'text-muted-foreground line-through decoration-2' : 'text-card-foreground'
                                }`}
                        >
                            {task.title}
                        </h4>
                        <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${task.priority === 'high'
                                ? 'bg-destructive/10 text-destructive border-destructive/20'
                                : task.priority === 'medium'
                                    ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                                    : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                }`}
                        >
                            {task.priority}
                        </span>
                    </div>

                    {task.description && (
                        <p
                            className={`text-sm leading-relaxed transition-all line-clamp-2 ${isCompleted ? 'text-muted-foreground/60 line-through' : 'text-muted-foreground'
                                }`}
                        >
                            {task.description}
                        </p>
                    )}

                    <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {formatDate(task.created_at)}
                        </span>

                        {/* Actions (Visible on Hover/Focus) */}
                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                            <button
                                onClick={() => onEdit(task)}
                                className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
                                aria-label="Edit task"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                            </button>
                            <button
                                onClick={() => onDelete(task.id)}
                                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-destructive/40"
                                aria-label="Delete task"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
