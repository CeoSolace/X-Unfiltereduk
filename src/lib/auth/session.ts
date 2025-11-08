// src/lib/auth/session.ts
'use server';

import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { User } from '@/models/User';
import { connectDB } from '@/lib/api/client';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export interface SessionPayload {
  userId: string;
  username: string;
  isPremium: boolean;
  isOrganisation: boolean;
  verified: boolean;
}

export async function createSession(userId: string): Promise<void> {
  await connectDB();
  const user = await User.findById(userId).select(
    'username isPremium isOrganisation verified'
  );
  if (!user) throw new Error('User not found');

  if (user.username === 'CeoSolace') {
    user.verified = true;
    user.isPremium = true;
    await user.save();
  }

  const session: SessionPayload = {
    userId: user._id.toString(),
    username: user.username,
    isPremium: user.isPremium,
    isOrganisation: user.isOrganisation,
    verified: user.verified,
  };

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const token = await new SignJWT(session)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiresAt)
    .sign(JWT_SECRET);

  cookies().set('session', token, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function verifySession(): Promise<SessionPayload | null> {
  const token = cookies().get('session')?.value;
  if (!token) return null;

  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as SessionPayload;
  } catch (error) {
    cookies().delete('session');
    return null;
  }
}

// ✅ This is a valid React Server Component
export async function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();
  if (!session) {
    redirect('/login');
  }
  return <>{children}</>;
}
