// src/middleware/adminAuth.ts
import { NextRequest, NextResponse } from 'next/server';

export function authenticateAdmin(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Basic ')) return false;

  try {
    const base64 = authHeader.slice(6);
    const creds = Buffer.from(base64, 'base64').toString('utf-8');
    const [user, pass] = creds.split(':');

    return (
      user === process.env.OWNER_USER &&
      pass === process.env.OWNER_PASS
    );
  } catch {
    return false;
  }
}

export function adminAuthMiddleware(req: NextRequest): NextResponse | null {
  if (!authenticateAdmin(req)) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Admin Access Required"' },
    });
  }
  return null;
}
