'use client';

import React from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const calculateStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { level: 'weak', color: 'bg-red-500', width: '25%' };
    if (score <= 3) return { level: 'fair', color: 'bg-orange-500', width: '50%' };
    if (score <= 4) return { level: 'good', color: 'bg-yellow-500', width: '75%' };
    return { level: 'strong', color: 'bg-green-500', width: '100%' };
  };

  const strength = calculateStrength(password);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Password Strength:</span>
        <span className={`font-medium ${strength.color.replace('bg-', 'text-')}`}>
          {strength.level}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full ${strength.color}`}
          style={{ width: strength.width }}
        ></div>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {strength.level === 'weak' && 'Include uppercase, lowercase, number, and symbol'}
        {strength.level === 'fair' && 'Add more variety to your password'}
        {strength.level === 'good' && 'Almost there! Just a bit more complexity'}
        {strength.level === 'strong' && 'Great password!'}
      </p>
    </div>
  );
};

export { PasswordStrengthIndicator };