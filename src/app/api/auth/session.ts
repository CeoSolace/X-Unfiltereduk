// src/app/api/auth/session.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';

export async function GET() {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json(
    {
      authenticated: true,
      user: {
        userId: session.userId,
        username: session.username,
        verified: session.verified,
        isPremium: session.isPremium,
        isOrganisation: session.isOrganisation,
      },
    },
    { status: 200 }
  );
}
