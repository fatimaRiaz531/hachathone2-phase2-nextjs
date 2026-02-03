'use client';

import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';

interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
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
}

const Select = ({ children, value, onValueChange }: SelectProps) => {
  const [internalValue, setInternalValue] = useState('');

  const selectedValue = value !== undefined ? value : internalValue;
  const handleChange = (val: string) => {
    if (onValueChange) {
      onValueChange(val);
    } else {
      setInternalValue(val);
    }
  };

  return (
    <SelectProvider value={{ value: selectedValue, onValueChange: handleChange }}>
      {children}
    </SelectProvider>
  );
};

interface SelectTriggerProps extends React.ComponentProps<'div'> {}

const SelectTrigger = React.forwardRef<HTMLDivElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      >
        {children || <span className="text-muted-foreground">Select an option...</span>}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 opacity-50"
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

interface SelectContentProps extends React.ComponentProps<'div'> {}

const SelectContent = ({ className, children, ...props }: SelectContentProps) => {
  return (
    <div
      className={cn(
        'absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
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

interface SelectValueProps extends React.ComponentProps<'span'> {}

const SelectValue = ({ className, ...props }: SelectValueProps) => {
  const { value } = useSelect();
  return (
    <span className={className} {...props}>
      {value || <span className="text-muted-foreground">Select an option...</span>}
    </span>
  );
};

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };