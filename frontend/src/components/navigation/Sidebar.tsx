'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Tasks', path: '/tasks', icon: '✅' },
    { name: 'Calendar', path: '/calendar', icon: '📅' },
    { name: 'Projects', path: '/projects', icon: '📁' },
    { name: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow pt-5 pb-4 bg-gray-800 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-xl font-bold text-white">TodoApp</h1>
        </div>
        <div className="mt-5 flex-1 flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`${
                  isActive(link.path)
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200`}
              >
                <span className="mr-3">{link.icon}</span>
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-700">
            {user ? (
              <div className="space-y-3">
                <div className="text-sm text-gray-300 truncate">
                  Signed in as {user.first_name || user.email}
                </div>
                <Button
                  onClick={() => logout()}
                  variant="outline"
                  className="w-full text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white"
                >
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link href="/login">
                  <Button className="w-full">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export { Sidebar };