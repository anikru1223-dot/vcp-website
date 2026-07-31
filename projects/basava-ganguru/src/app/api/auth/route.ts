import { NextRequest, NextResponse } from 'next/server';

interface LoginRequest {
    username: string;
    password: string;
}

// Demo admin credentials (in production, validate against database)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD_HASH = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lm'; // hash of 'admin123'

export async function POST(request: NextRequest) {
    try {
        const body: LoginRequest = await request.json();

        const { username, password } = body;

        // Validate input
        if (!username || !password) {
            return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
        }

        // Simple validation (in production, use bcrypt to compare hashes)
        if (username === ADMIN_USERNAME && password === 'admin123') {
            // Generate a simple JWT token (in production, use proper JWT library)
            const token = Buffer.from(
                JSON.stringify({
                    username: ADMIN_USERNAME,
                    iat: Date.now(),
                    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
                })
            ).toString('base64');

            return NextResponse.json(
                {
                    success: true,
                    token,
                    user: { username: ADMIN_USERNAME },
                },
                { status: 200 }
            );
        }

        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    } catch (error) {
        console.error('Auth error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    // Check if admin is authenticated
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    try {
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString());

        if (decoded.exp < Date.now()) {
            return NextResponse.json({ authenticated: false, error: 'Token expired' }, { status: 401 });
        }

        return NextResponse.json({ authenticated: true, user: { username: decoded.username } });
    } catch (error) {
        return NextResponse.json({ authenticated: false, error: 'Invalid token' }, { status: 401 });
    }
}