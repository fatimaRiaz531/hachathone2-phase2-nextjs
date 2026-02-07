import Link from "next/link";
import { Bot, Sparkles, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/30">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-[0.25em] mb-8 border border-primary/20">
            <Sparkles className="w-4 h-4" />
            New Premium Experience
          </div>

          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-foreground leading-[0.9] mb-8">
            Manage Tasks <br />
            <span className="text-primary italic">With Intelligence.</span>
          </h1>

          <p className="max-w-xl mx-auto text-lg md:text-xl text-muted-foreground font-medium mb-12 leading-relaxed">
            Experience the future of productivity with our AI-powered Todo Assistant.
            Wrapped in a sophisticated Chocolate & Rose aesthetic.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/dashboard"
              className="group relative px-10 py-5 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              Get Started Now
            </Link>
            <Link
              href="/login"
              className="px-10 py-5 bg-card border-2 border-border text-foreground rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-muted transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-32 max-w-5xl mx-auto w-full">
          {[
            { icon: <Bot />, title: "AI Powered", desc: "Intelligent task sorting and management with natural language." },
            { icon: <CheckCircle2 />, title: "Precision", desc: "Track your progress with pixel-perfect clarity and status codes." },
            { icon: <Sparkles />, title: "Premium UI", desc: "A warm, high-contrast aesthetic designed for focus and beauty." }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 bg-card border-2 border-border rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all shadow-lg">
                {item.icon}
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground mb-3">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer Strip */}
      <footer className="py-8 border-t border-border/50 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/40">
          Todo Pro &copy; 2026 &bull; Crafted with Rose & Chocolate
        </p>
      </footer>
    </div>
  );
}

