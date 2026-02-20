import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName } = body;

    // Validate input
    if (!email || !password) {
      return Response.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Simulate API call to backend registration service
    const response = await fetch('http://localhost:8000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        first_name: firstName,
        last_name: lastName
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return Response.json(
        { message: errorData.detail || 'Registration failed' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return Response.json({
      token: data.access_token || data.token,
      user: {
        id: data.user?.id || 'mock-user-id',
        email: data.user?.email || email,
        first_name: data.user?.first_name || firstName || '',
        last_name: data.user?.last_name || lastName || '',
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return Response.json(
      { message: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}