import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  try {
    // Get token from cookie
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token');

    if (!token) {
      return NextResponse.json({ 
        authenticated: false 
      }, { status: 401 });
    }

    // Verify token
    const decoded = verify(
      token.value, 
      process.env.JWT_SECRET || 'fallback-secret'
    ) as { userId: string; email: string; username?: string };

    // Return user info (no sensitive data)
    return NextResponse.json({
      authenticated: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        username: decoded.username,
      },
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ 
      authenticated: false 
    }, { status: 401 });
  }
}
