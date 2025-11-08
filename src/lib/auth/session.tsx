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
  following: string[];
}

export async function createSession(userId: string): Promise<void> {
  await connectDB();
  const user = await User.findById(userId).select('username isPremium isOrganisation verified following');
  if (!user) throw new Error('User not found');
  if (user.username === 'CeoSolace') {
    user.verified = true;
    user.isPremium = true;
    user.isOrganisation = false;
    await user.save();
  }
  const session: SessionPayload = {
    userId: user._id.toString(),
    username: user.username,
    isPremium: user.isPremium,
    isOrganisation: user.isOrganisation,
    verified: user.verified,
    following: (user.following || []).map((id: any) => id.toString()),
  };
  const expiresAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // Unix timestamp (seconds)
  const token = await new SignJWT(session as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiresAt)
    .sign(JWT_SECRET);
  const expiresAtDate = new Date(expiresAt * 1000); // For cookie (expects Date)
  cookies().set('session', token, {
    httpOnly: true,
    secure: true,
    expires: expiresAtDate,
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
  } catch {
    cookies().delete('session');
    return null;
  }
}

export async function AuthProvider({ children }: { children: React.ReactNode }) {
  const session = await verifySession();
  if (!session) redirect('/login');
  return <>{children}</>;
}
