'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../lib/auth'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const { signup, isLoading: authIsLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await signup(email, password, firstName, lastName)
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500 text-white p-3 rounded">
              {error}
            </div>
          )}
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="space-y-4">
            <div>
              <label htmlFor="first-name" className="sr-only">
                First Name
              </label>
              <input
                id="first-name"
                name="first-name"
                type="text"
                required
                className="w-full bg-[#1a1a1a] text-white border border-gray-600 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#e75480] focus:border-transparent"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="last-name" className="sr-only">
                Last Name
              </label>
              <input
                id="last-name"
                name="last-name"
                type="text"
                className="w-full bg-[#1a1a1a] text-white border border-gray-600 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#e75480] focus:border-transparent"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full bg-[#1a1a1a] text-white border border-gray-600 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#e75480] focus:border-transparent"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full bg-[#1a1a1a] text-white border border-gray-600 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#e75480] focus:border-transparent"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={authIsLoading}
              className="w-full py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#e75480] hover:bg-[#d03d6c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e75480]"
            >
              {authIsLoading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
        </form>
        <div className="text-center">
          <p className="text-sm text-gray-300">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-[#e75480] hover:text-[#d03d6c]">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}