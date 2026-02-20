import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Simulate API call to backend to verify token and get user data
    const response = await fetch('http://localhost:8000/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return Response.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userData = await response.json();

    return Response.json({
      id: userData.id,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      created_at: userData.created_at,
      updated_at: userData.updated_at
    });
  } catch (error) {
    console.error('Get user error:', error);
    return Response.json(
      { message: 'An error occurred while fetching user data' },
      { status: 500 }
    );
  }
}