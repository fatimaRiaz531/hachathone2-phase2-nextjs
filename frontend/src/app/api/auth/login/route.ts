import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // In a real implementation, this would connect to your backend API
    // For now, we'll simulate the authentication

    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return Response.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Simulate API call to backend authentication service
    // In a real app, you would call your backend API here
    const response = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return Response.json(
        { message: errorData.detail || 'Invalid credentials' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return Response.json({
      token: data.access_token || data.token,
      user: {
        id: data.user?.id || 'mock-user-id',
        email: data.user?.email || email,
        first_name: data.user?.first_name || '',
        last_name: data.user?.last_name || '',
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { message: 'An error occurred during login' },
      { status: 500 }
    );
  }
}