// src/app/api/moderation/posts.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/api/client';
import { Post } from '@/models/Post';
import { User } from '@/models/User';

// Basic Auth middleware using OWNER_USER / OWNER_PASS
function authenticateAdmin(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false;
  }

  try {
    const base64Credentials = authHeader.slice(6);
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');

    return (
      username === process.env.OWNER_USER &&
      password === process.env.OWNER_PASS
    );
  } catch (e) {
    return false;
  }
}

export async function DELETE(req: NextRequest) {
  // 🔒 Enforce basic auth
  if (!authenticateAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  try {
    const url = new URL(req.url);
    const postId = url.searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ error: 'Missing postId' }, { status: 400 });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Optional: notify author (not implemented for simplicity)
    await Post.findByIdAndDelete(postId);

    // Log moderation action (in production, write to audit log collection)
    console.log(`🚨 MODERATION: Post ${postId} deleted by admin (${process.env.OWNER_USER})`);

    return NextResponse.json({ success: true, message: 'Post removed' }, { status: 200 });
  } catch (error: any) {
    console.error('Moderation error:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
