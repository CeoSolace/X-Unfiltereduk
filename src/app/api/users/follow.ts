// src/app/api/users/follow.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';
import { connectDB } from '@/lib/api/client';
import { User } from '@/models/User';

export async function POST(req: NextRequest) {
  await connectDB();

  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { targetUserId } = await req.json();

    if (!targetUserId || targetUserId === session.userId) {
      return NextResponse.json({ error: 'Invalid target user' }, { status: 400 });
    }

    // Follow
    await User.findByIdAndUpdate(session.userId, {
      $addToSet: { following: targetUserId }
    });

    // Optional: notify target (not implemented here for simplicity)

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to follow' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  await connectDB();

  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const targetUserId = url.searchParams.get('targetUserId');

    if (!targetUserId) {
      return NextResponse.json({ error: 'Missing targetUserId' }, { status: 400 });
    }

    await User.findByIdAndUpdate(session.userId, {
      $pull: { following: targetUserId }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to unfollow' }, { status: 500 });
  }
}
