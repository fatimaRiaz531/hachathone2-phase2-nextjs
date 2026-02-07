import { TodoClient } from '../components/TodoClient';
import { ChatBot } from '../src/components/chat/ChatBot';
import { Button } from '@/components/ui/Button';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-x-hidden font-sans selection:bg-primary/20">

      {/* Background Decor - Subtle Professional Accents */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 blur-[120px] rounded-full" />
      </div>

      <header className="sticky top-0 inset-x-0 z-40 h-20 flex items-center justify-center border-b border-border bg-background/80 backdrop-blur-md">
        <div className="w-full max-w-7xl px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-all duration-300">
              <span className="text-xl font-black text-white">T</span>
            </div>
            <span className="text-2xl font-black tracking-tighter text-foreground">
              TODO<span className="text-primary">PRO</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-10 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            <a href="/dashboard" className="hover:text-primary transition-colors">Dashboard</a>
            <a href="#" className="hover:text-primary transition-colors">Performance</a>
            <a href="#" className="hover:text-primary transition-colors">Enterprise</a>
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="hidden sm:flex">Documentation</Button>
            <Button size="sm">Get Started</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 pt-24 pb-32 relative">
        <div className="text-center space-y-8 mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold uppercase tracking-widest animate-in fade-in slide-in-from-bottom-2">
            ✨ Phase II is live
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-foreground leading-[0.95] max-w-4xl mx-auto">
            Design your <span className="text-primary">Workflow.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
            The intelligent, high-performance command center for professional developers managing complex task ecosystems.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button size="lg" className="shadow-xl shadow-primary/20">Go to Dashboard</Button>
            <Button variant="outline" size="lg">View Demo</Button>
          </div>
        </div>

        <div className="relative bg-card rounded-[3rem] p-4 md:p-8 max-w-6xl mx-auto border-2 border-border shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 -z-10" />
          <div className="bg-background rounded-[2.5rem] p-8 min-h-[500px] border border-border shadow-inner">
            <TodoClient />
          </div>
        </div>
      </div>

      <ChatBot />
    </main>
  );
}
