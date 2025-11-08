// src/app/api/posts/delete.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';
import { connectDB } from '@/lib/api/client';
import { Post } from '@/models/Post';

export async function DELETE(req: NextRequest) {
  await connectDB();
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const postId = url.searchParams.get('postId');

  if (!postId) {
    return NextResponse.json({ error: 'Missing postId' }, { status: 400 });
  }

  const post = await Post.findById(postId);
  if (!post || post.author.toString() !== session.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await Post.findByIdAndDelete(postId);
  return NextResponse.json({ success: true });
}
