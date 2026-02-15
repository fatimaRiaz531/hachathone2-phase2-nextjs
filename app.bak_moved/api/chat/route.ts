import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const authHeader = req.headers.get('Authorization');

        // Use the backend URL from environment or fallback to local
        const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/v1/chat`;

        console.log('API Proxy: Forwarding request to:', backendUrl);

        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(authHeader ? { 'Authorization': authHeader } : {}),
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('API Proxy: Backend returned error:', response.status, data);
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('API Proxy Critical Error:', error);
        return NextResponse.json(
            { detail: 'Internal Server Error in Chat Proxy: ' + error.message },
            { status: 500 }
        );
    }
}
