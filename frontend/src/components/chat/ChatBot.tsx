'use client';

import React, { useState, useEffect } from 'react';
import { ChatKit, useChatKit } from '@openai/chatkit-react';
import { useTheme } from 'next-themes';
import { Bot, MessageCircle, X, Sparkles } from 'lucide-react';

export const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    const chatKit = useChatKit({
        api: {
            url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/chat`,
            domainKey: process.env.NEXT_PUBLIC_OPENAI_DOMAIN_KEY || '',
            fetch: async (url, options) => {
                setIsProcessing(true);
                try {
                    const body = JSON.parse(options?.body as string);
                    const mappedBody = {
                        user_id: 'demo-user',
                        message: body.message?.text || body.text || ''
                    };

                    const response = await fetch(url, {
                        ...options,
                        body: JSON.stringify(mappedBody)
                    });

                    if (!response.ok) throw new Error('Failed to fetch response');

                    const data = await response.json();
                    const chatKitResult = {
                        object: 'chat.completion',
                        choices: [{
                            message: {
                                role: 'assistant',
                                content: data.response
                            },
                            finish_reason: 'stop'
                        }]
                    };

                    return new Response(JSON.stringify(chatKitResult), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    });
                } finally {
                    setIsProcessing(false);
                }
            }
        },
        theme: {
            colorScheme: (resolvedTheme === 'dark' ? 'dark' : 'light') as 'dark' | 'light',
            radius: 'round',
            density: 'normal',
            color: {
                accent: {
                    primary: resolvedTheme === 'dark' ? '#06b6d4' : '#0d9488',
                    level: 2
                },
                surface: {
                    background: resolvedTheme === 'dark' ? '#1f2937' : '#ffffff',
                    foreground: resolvedTheme === 'dark' ? '#f3f4f6' : '#111827'
                }
            }
        }
    });

    if (!mounted) return null;

    return (
        <div className={`fixed z-[60] flex flex-col items-end transition-all duration-300 ${isOpen ? 'bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-auto h-full sm:h-auto' : 'bottom-6 right-6'
            }`}>
            {isOpen ? (
                <div
                    className="w-full h-full sm:w-[400px] sm:h-[600px] flex flex-col shadow-2xl sm:border border-primary/20 sm:rounded-[2rem] overflow-hidden bg-background/95 backdrop-blur-xl animate-in slide-in-from-bottom-10 fade-in duration-300"
                >
                    {/* Header: Warm Earthy Gradient */}
                    <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-4 sm:p-5 flex flex-row items-center justify-between shadow-lg shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-inner">
                                <Bot className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-wider text-white">AI Assistant</h3>
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${isProcessing ? 'bg-white animate-pulse' : 'bg-emerald-300'}`} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/90">
                                        {isProcessing ? 'Thinking...' : 'Online'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="bg-white/10 hover:bg-white/20 rounded-full h-9 w-9 flex items-center justify-center transition-all duration-200 hover:rotate-90 text-white border border-white/10"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>


                    {/* Chat Area - Spacious & Clean */}
                    <div className="flex-1 overflow-hidden relative group/chat bg-background/50 flex flex-col">
                        <style jsx global>{`
                            .chatkit-container {
                                height: 100% !important;
                                display: flex !important;
                                flex-direction: column !important;
                            }
                            .chatkit-messages-list {
                                flex: 1 !important;
                                overflow-y: auto !important;
                            }
                            .chatkit-input-container {
                                padding: 1rem !important;
                                background: hsl(var(--card)) !important;
                                border-top: 1px solid hsl(var(--border)) !important;
                            }
                            .chatkit-input {
                                background: hsl(var(--background)) !important;
                                color: hsl(var(--foreground)) !important;
                                border: 1px solid hsl(var(--input)) !important;
                                border-radius: 0.75rem !important;
                                padding: 0.75rem 1rem !important;
                            }
                        `}</style>
                        <ChatKit
                            control={chatKit.control}
                            className="flex-1"
                        />
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-3 bg-muted/30 border-t border-border flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Powered by Phase III</span>
                        </div>
                    </div>
                </div>
            ) : (
                <button
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-xl hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all duration-300 bg-primary flex items-center justify-center group relative overflow-hidden ring-4 ring-primary/20"
                    onClick={() => setIsOpen(true)}
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 text-primary-foreground group-hover:rotate-12 transition-transform duration-300 z-10" />
                </button>
            )}
        </div>
    );
};
