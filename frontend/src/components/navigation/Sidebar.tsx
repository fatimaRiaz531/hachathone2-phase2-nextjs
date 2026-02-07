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
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-border transition-colors">
      <div className="flex flex-col flex-grow pt-8 pb-4 bg-background overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-6 mb-8">
          <h1 className="text-2xl font-black uppercase tracking-tighter text-foreground">
            Todo<span className="text-primary italic">Pro</span>
          </h1>
        </div>
        <div className="mt-2 flex-1 flex flex-col">
          <nav className="flex-1 px-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`${isActive(link.path)
                    ? 'bg-primary/10 text-primary border-r-4 border-primary'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  } group flex items-center px-4 py-3 text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-300`}
              >
                <span className={`mr-4 text-lg transition-transform group-hover:scale-125 ${isActive(link.path) ? 'scale-110' : ''}`}>{link.icon}</span>
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="p-6 mt-auto border-t border-border">
            {user ? (
              <div className="space-y-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                  Active User
                </div>
                <div className="text-sm font-bold text-foreground truncate">
                  {user.first_name || user.email}
                </div>
                <Button
                  onClick={() => logout()}
                  variant="outline"
                  className="w-full rounded-2xl border-2 font-bold uppercase tracking-widest text-[10px] py-4 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all"
                >
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link href="/login">
                  <Button className="w-full rounded-2xl font-bold uppercase tracking-widest text-[10px] py-4 shadow-lg shadow-primary/20">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" className="w-full rounded-2xl border-2 font-bold uppercase tracking-widest text-[10px] py-4">
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