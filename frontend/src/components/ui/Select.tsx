'use client';

import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';

interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = createContext<SelectContextType | undefined>(undefined);

const SelectProvider = SelectContext.Provider;

const useSelect = () => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('useSelect must be used within a SelectProvider');
  }
  return context;
};

interface SelectProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
}

const Select = ({ children, value, onValueChange, defaultValue = '' }: SelectProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);

  const selectedValue = value !== undefined ? value : internalValue;

  const handleChange = (val: string) => {
    if (onValueChange) {
      onValueChange(val);
    } else {
      setInternalValue(val);
    }
    setOpen(false); // Close on selection
  };

  return (
    <SelectProvider value={{ value: selectedValue, onValueChange: handleChange, open, setOpen }}>
      <div className={cn("relative", open ? "z-[100]" : "z-10")}>
        {children}
      </div>
    </SelectProvider>
  );
};

interface SelectTriggerProps extends React.ComponentProps<'div'> { }

const SelectTrigger = React.forwardRef<HTMLDivElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen } = useSelect();

    return (
      <div
        ref={ref}
        onClick={() => setOpen(!open)}
        className={cn(
          'flex h-12 w-full items-center justify-between rounded-xl border-2 bg-card px-4 py-2 text-sm font-semibold text-foreground cursor-pointer transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/10 shadow-sm',
          open ? 'border-primary ring-4 ring-primary/10' : 'border-input hover:border-primary hover:shadow-md',
          className
        )}
        {...props}
      >
        <div className="truncate flex-1 text-left">
          {children}
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={cn("h-4 w-4 opacity-50 ml-2 flex-shrink-0 transition-transform duration-200", open ? "rotate-180" : "")}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  }
);
SelectTrigger.displayName = 'SelectTrigger';

interface SelectContentProps extends React.ComponentProps<'div'> { }

const SelectContent = ({ className, children, ...props }: SelectContentProps) => {
  const { open } = useSelect();

  if (!open) return null;

  return (
    <div
      className={cn(
        'absolute z-[100] mt-2 max-h-60 w-full overflow-auto rounded-xl border-2 border-primary/10 bg-card/95 p-1 text-popover-foreground shadow-2xl animate-in fade-in-0 zoom-in-95 backdrop-blur-3xl',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface SelectItemProps extends React.ComponentProps<'div'> {
  value: string;
}

const SelectItem = ({ className, children, value, ...props }: SelectItemProps) => {
  const { value: selectedValue, onValueChange } = useSelect();

  const isSelected = selectedValue === value;

  return (
    <div
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        isSelected ? 'bg-accent' : '',
        className
      )}
      onClick={() => onValueChange(value)}
      {...props}
    >
      <span className={cn('absolute left-2 flex h-3.5 w-3.5 items-center justify-center', isSelected ? 'opacity-100' : 'opacity-0')}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </span>
      {children}
    </div>
  );
};

interface SelectValueProps extends React.ComponentProps<'span'> {
  placeholder?: string;
}

const SelectValue = ({ className, placeholder, ...props }: SelectValueProps) => {
  const { value } = useSelect();

  // Format the value for display (e.g., "in_progress" -> "In Progress")
  const displayValue = value ? value.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : null;

  return (
    <span className={cn("block truncate", className)} {...props}>
      {displayValue || (
        <span className="text-muted-foreground font-medium opacity-50 italic">
          {placeholder || "Select an option..."}
        </span>
      )}
    </span>
  );
};

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };