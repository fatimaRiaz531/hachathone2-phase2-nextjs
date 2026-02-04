'use client';

import React from 'react';

interface LoadingSkeletonProps {
  type?: 'card' | 'text' | 'avatar' | 'image' | 'list';
  className?: string;
}

const LoadingSkeleton = ({ type = 'card', className = '' }: LoadingSkeletonProps) => {
  const baseClasses = 'animate-pulse bg-gray-700';

  const typeClasses = {
    card: 'h-48 rounded-xl',
    text: 'h-4 rounded-md',
    avatar: 'h-10 w-10 rounded-full',
    image: 'h-48 rounded-lg',
    list: 'h-16 rounded-md'
  };

  const classes = `${baseClasses} ${typeClasses[type]} ${className}`;

  return <div className={classes} />;
};

export { LoadingSkeleton };