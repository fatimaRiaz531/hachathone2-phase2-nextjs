'use client';

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Bot, Sparkles, CheckCircle2, ArrowRight, LayoutDashboard, Zap, Shield, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 selection:text-primary">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-black uppercase tracking-tighter">
            Todo<span className="text-primary italic">Pro</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" className="text-sm font-bold uppercase tracking-widest hover:bg-white/5">
                Log In
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button className="text-sm font-bold uppercase tracking-widest px-6 shadow-xl shadow-primary/20">
                Get Started
              </Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <div className="flex items-center gap-4">
              <UserButton afterSignOutUrl="/" />
              <Link href="/dashboard">
                <Button className="gap-2 text-sm font-bold uppercase tracking-widest px-6">
                  Dashboard <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </SignedIn>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-20 pb-32 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-primary/80">Next-Gen Task Management</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-8 leading-[0.9]">
          Organize <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-primary bg-[length:200%_auto] animate-gradient">Everything</span>
        </h1>

        <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl font-medium mb-12 leading-relaxed">
          The ultimate todo application powered by AI. Seamlessly track, prioritize, and complete your tasks with a professional suite of tools designed for peak productivity.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <SignedOut>
            <SignUpButton mode="modal">
              <Button size="lg" className="h-16 px-10 text-base font-black uppercase tracking-widest shadow-2xl shadow-primary/40 group">
                Try for Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </SignUpButton>
            <Button variant="outline" size="lg" className="h-16 px-10 text-base font-black uppercase tracking-widest border-2 border-white/10 hover:bg-white/5">
              Watch Demo
            </Button>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <Button size="lg" className="h-16 px-10 text-base font-black uppercase tracking-widest shadow-2xl shadow-primary/40 group">
                Go to Dashboard
                <LayoutDashboard className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
              </Button>
            </Link>
          </SignedIn>
        </div>

        {/* Features Grid */}
        <section className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all duration-500 group">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-4">Ultra Fast</h3>
            <p className="text-gray-500 font-medium leading-relaxed">
              Experience zero lag with our high-performance architecture. Manage tasks in real-time.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-blue-400/20 transition-all duration-500 group">
            <div className="w-12 h-12 bg-blue-400/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-4">AI Assistant</h3>
            <p className="text-gray-500 font-medium leading-relaxed">
              Let our AI help you prioritize, break down complex projects, and stay on track.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-purple-400/20 transition-all duration-500 group">
            <div className="w-12 h-12 bg-purple-400/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-4">Secure</h3>
            <p className="text-gray-500 font-medium leading-relaxed">
              Your data is encrypted and protected with industry-standard security protocols.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-gray-500 text-sm font-bold uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>© 2026 TodoPro. All Rights Reserved.</span>
          </div>
          <div className="flex items-center gap-8">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
