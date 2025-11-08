// src/app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/api/client';
import { Post } from '@/models/Post';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const post = await Post.findById(params.id)
    .populate('author', 'username verified isPremium avatar')
    .lean();

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  return NextResponse.json({ post });
}
