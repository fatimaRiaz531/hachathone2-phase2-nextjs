import { TodoClient } from '../components/TodoClient';
import { ChatBot } from '../src/components/chat/ChatBot';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-x-hidden font-sans selection:bg-primary/20">

      {/* Background Decor - Vibrant Glowing Orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-accent/20 blur-[100px] rounded-full" />
      </div>

      <header className="sticky top-0 inset-x-0 z-40 h-16 flex items-center justify-center border-b border-white/10 bg-background/60 backdrop-blur-md">
        <div className="w-full max-w-7xl px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 vibrant-gradient rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <span className="text-xl font-black">T</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Todo<span className="text-primary font-black italic">Pro</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors hover:scale-105">Dashboard</a>
            <a href="#" className="hover:text-primary transition-colors hover:scale-105">Analytics</a>
            <a href="#" className="hover:text-primary transition-colors hover:scale-105">Settings</a>
          </nav>

          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full border-2 border-primary/30 p-0.5 animate-in zoom-in-50">
              <div className="h-full w-full rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center">
                <span className="text-[10px] font-black text-white">LOGO</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 pt-12 pb-24 relative">
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-6xl md:text-8xl font-black tracking-tight text-foreground leading-[1.1]">
            Execute <span className="text-vibrant">Better.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            The most <span className="text-primary font-bold">colorful</span> and intelligent command center for tasks.
          </p>
        </div>

        <div className="relative glass-card rounded-[3rem] p-8 md:p-12 max-w-5xl mx-auto border-white/20 shadow-[0_0_50px_-12px_rgba(236,72,153,0.3)]">
          <TodoClient />
        </div>
      </div>

      <ChatBot />
    </main>
  );
}