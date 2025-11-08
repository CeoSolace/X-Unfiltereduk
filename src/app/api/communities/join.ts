// src/app/api/communities/join.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';
import { connectDB } from '@/lib/api/client';
import { Community } from '@/models/Community';

export async function POST(req: NextRequest) {
  await connectDB();
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { communityId } = await req.json();
  if (!communityId) {
    return NextResponse.json({ error: 'Missing communityId' }, { status: 400 });
  }

  await Community.findByIdAndUpdate(communityId, {
    $addToSet: { members: session.userId }
  });

  return NextResponse.json({ success: true });
}
