// src/app/api/posts/like.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';
import { connectDB } from '@/lib/api/client';
import { Post } from '@/models/Post';

export async function POST(req: NextRequest) {
  await connectDB();
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { postId } = await req.json();
  if (!postId) {
    return NextResponse.json({ error: 'Missing postId' }, { status: 400 });
  }

  await Post.findByIdAndUpdate(postId, {
    $addToSet: { likes: session.userId }
  });

  return NextResponse.json({ success: true });
}
