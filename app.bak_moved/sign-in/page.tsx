'use client';

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-pink-50 to-purple-100 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="mt-2 text-gray-600">
            Sign in to manage your tasks
          </p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-2 border border-pink-100">
          <SignIn
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up"
            appearance={{
              elements: {
                formButtonPrimary: 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold shadow-lg shadow-pink-500/25',
                card: 'shadow-none bg-transparent',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton: 'border-2 border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-all',
                formFieldInput: 'border-2 border-gray-200 focus:border-pink-400 focus:ring-pink-400',
                footerActionLink: 'text-pink-600 hover:text-pink-700 font-semibold',
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
