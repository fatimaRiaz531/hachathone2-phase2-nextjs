import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // In a real implementation, this would call your backend logout endpoint
    // For now, we just return success

    // Optionally call backend logout API
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (token) {
      await fetch('http://localhost:8000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }).catch(() => {}); // Ignore errors during logout
    }

    return Response.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return Response.json(
      { message: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}