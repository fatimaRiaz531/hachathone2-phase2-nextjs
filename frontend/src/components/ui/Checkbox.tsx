'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onCheckedChange) {
        onCheckedChange(e.target.checked);
      }
      if (props.onChange) {
        props.onChange(e);
      }
    };

    return (
      <input
        type="checkbox"
        className={cn(
          'h-5 w-5 rounded-lg border-2 border-border bg-background text-primary focus:ring-primary focus:ring-offset-0 transition-all cursor-pointer checked:bg-primary checked:border-primary',
          className
        )}

        ref={ref}
        onChange={handleChange}
        {...props}
      />
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };