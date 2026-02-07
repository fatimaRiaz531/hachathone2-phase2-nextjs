'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

const MainNavigation = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Tasks', path: '/tasks' },
    { name: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="bg-card border-b border-border shadow-sm transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/dashboard" className="text-2xl font-black uppercase tracking-tighter text-primary">
                Todo<span className="text-foreground">App</span>
              </Link>
            </div>
            <div className="hidden sm:-my-px sm:ml-10 sm:flex sm:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`${isActive(link.path)
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                    } inline-flex items-center border-b-2 px-1 pt-1 text-sm font-bold uppercase tracking-widest transition-all`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-6">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hidden md:block border border-border px-3 py-1.5 rounded-full">
                  User: {user.first_name || user.email}
                </span>
                <Button
                  onClick={() => {
                    logout();
                  }}
                  variant="outline"
                  size="sm"
                  className="rounded-full font-bold uppercase tracking-widest px-6"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link href="/login">
                  <Button variant="ghost" className="font-bold uppercase tracking-widest text-muted-foreground hover:text-primary">Login</Button>
                </Link>
                <Link href="/register">
                  <Button className="rounded-full px-6 font-bold uppercase tracking-widest shadow-lg shadow-primary/20">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>

  );
};

export { MainNavigation };