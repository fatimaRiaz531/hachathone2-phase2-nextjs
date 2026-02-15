
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, User as UserIcon, Send, Sparkles, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { betterAuth } from '@/lib/better-auth-client';

export default function ChatPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputValue.trim() || isProcessing) return;

        const userMsg = inputValue.trim();
        setInputValue('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsProcessing(true);

        try {
            const token = betterAuth.getToken();
            const targetUrl = process.env.NEXT_PUBLIC_API_URL
                ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/chat`
                : '/api/v1/chat';

            const response = await fetch(targetUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    user_id: user?.id || 'anonymous',
                    message: userMsg
                })
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();

            if (data.history && Array.isArray(data.history)) {
                // De-duplicate history? Backend returns full history, so we can just set it.
                // Ideally we map it.
                setMessages(data.history.map((m: any) => ({ role: m.role, content: m.content })));
            } else if (data.response) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
            }

        } catch (error: any) {
            console.error('Chat Error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Error: ${error.message}. Please try again.`
            }]);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="bg-primary/5 border-b border-primary/10 p-4 sticky top-0 z-10 backdrop-blur-md">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-primary/10 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-foreground" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/10">
                                <Bot className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="font-bold text-lg text-foreground">Task Assistant</h1>
                                <p className="text-xs text-muted-foreground">Always here to help</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 max-w-4xl mx-auto w-full p-4 overflow-y-auto space-y-6 pb-24">
                {messages.length === 0 && (
                    <div className="mt-20 flex flex-col items-center justify-center text-center space-y-6 opacity-70">
                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                            <Sparkles className="w-12 h-12 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">How can I help you today?</h2>
                            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                                I can help you manage your tasks. Try asking me to add a task, listing your pending items, or checking your progress.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                            {['Add a task to call mom', 'List my pending tasks', 'Mark the gym task as done', 'Delete all completed tasks'].map((suggestion) => (
                                <button
                                    key={suggestion}
                                    onClick={() => {
                                        setInputValue(suggestion);
                                        // Optional: Auto submit
                                    }}
                                    className="p-3 bg-muted/50 border border-border rounded-xl text-sm text-left hover:bg-muted hover:border-primary/50 transition-all"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.role === 'user' ? 'bg-accent/20' : 'bg-primary/20'
                                }`}>
                                {msg.role === 'user' ? <UserIcon className="w-4 h-4 text-accent" /> : <Bot className="w-4 h-4 text-primary" />}
                            </div>
                            <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                                    : 'bg-muted border border-border rounded-tl-none text-foreground'
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    </div>
                ))}

                {isProcessing && (
                    <div className="flex justify-start">
                        <div className="flex gap-3 max-w-[80%]">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                                <Bot className="w-4 h-4 text-primary" />
                            </div>
                            <div className="p-4 rounded-2xl rounded-tl-none bg-muted border border-border">
                                <div className="flex gap-1.5 items-center h-5">
                                    <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border p-4">
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSendMessage} className="flex gap-3">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 bg-muted border border-border rounded-2xl px-6 py-4 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                            disabled={isProcessing}
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim() || isProcessing}
                            className="w-14 h-14 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-lg shadow-primary/20"
                        >
                            <Send className="w-6 h-6" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
