'use client';

import React from 'react';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface InputFieldProps {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

const InputField = ({
  label,
  id,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  placeholder,
  className,
}: InputFieldProps) => {
  return (
    <div className={cn('space-y-2', className)}>
      <label htmlFor={id} className="block text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(
          "transition-all duration-300",
          error ? 'border-primary ring-2 ring-primary/20' : 'border-border focus:border-primary focus:ring-4 focus:ring-primary/10'
        )}
        required={required}
      />
      {error && <p className="text-xs font-bold text-primary italic mt-1 ml-1">{error}</p>}

    </div>
  );
};

export { InputField };