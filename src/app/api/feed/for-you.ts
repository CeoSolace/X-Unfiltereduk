// src/app/api/feed/for-you.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';
import { trackEvent } from '@/lib/utils/trackEvent';
import { connectDB } from '@/lib/api/client';
import { Post } from '@/models/Post';

export async function POST(req: NextRequest) {
  await connectDB();

  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 🔥 Trigger behavioral tracking (auto-skipped if Premium)
  await trackEvent(session.userId, 'feed_view', { feed_type: 'for_you' });

  // TODO: Replace with real collaborative filtering / embeddings
  // For now: return recent public posts (non-chronological stub)
  const posts = await Post.find({
    $or: [
      { author: session.userId },
      { visibility: 'public' }
    ]
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('author', 'username verified isPremium')
    .lean();

  return NextResponse.json({ posts }, { status: 200 });
}
