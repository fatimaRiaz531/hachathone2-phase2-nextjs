'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={id} className="block text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
            {label}
          </label>
        )}
        <textarea
          id={id}
          className={cn(
            'flex min-h-24 w-full rounded-xl border-2 bg-card px-4 py-3 text-sm font-medium ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none transition-all duration-300',
            error
              ? 'border-primary ring-2 ring-primary/20'
              : 'border-border focus:border-primary focus:ring-4 focus:ring-primary/10',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs font-bold text-primary italic mt-1 ml-1">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };