// src/app/api/hashtags/search.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/api/client';
import { Post } from '@/models/Post';

export async function GET(req: NextRequest) {
  await connectDB();
  const url = new URL(req.url);
  const q = url.searchParams.get('q');

  if (!q) {
    return NextResponse.json({ hashtags: [] });
  }

  const posts = await Post.find({
    hashtags: { $regex: q, $options: 'i' }
  })
    .limit(50)
    .lean();

  const hashtagSet = new Set<string>();
  posts.forEach(post => {
    post.hashtags?.forEach(tag => {
      if (tag.toLowerCase().startsWith(q.toLowerCase())) {
        hashtagSet.add(tag);
      }
    });
  });

  const hashtags = Array.from(hashtagSet).slice(0, 10);
  return NextResponse.json({ hashtags });
}
