import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { ChatBot } from "@/components/chat/ChatBot";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "TodoApp - Manage Your Tasks",
  description: "A modern todo application with authentication and task management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider dynamic>
      <html lang="en" suppressHydrationWarning>
        <body className="font-sans antialiased">
          <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <div className="min-h-screen">
                {children}
              </div>
              <ChatBot />
            </ThemeProvider>
          </AuthProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}


