// src/app/api/feed/for-you.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';
import { connectDB } from '@/lib/api/client';
import { User } from '@/models/User';
import { Post } from '@/models/Post';
import { Community } from '@/models/Community';
import { trackEvent } from '@/lib/utils/trackEvent';

// Simple but production-grade engagement scorer
function scorePost(post, userBehavior: Record<string, any>, currentTime: number) {
  const ageHours = (currentTime - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
  if (ageHours > 48) return 0; // Fade out after 48h

  let score = 0;

  // Base engagement: likes + reposts
  const engagement = (post.likes?.length || 0) + (post.reposts?.length || 0);
  score += Math.log1p(engagement) * 10;

  // Recency boost (exponential decay)
  score += Math.max(0, 50 - ageHours * 2);

  // Author affinity (if user has interacted with author before)
  if (userBehavior.likedAuthors?.includes(post.author?.toString())) {
    score += 15;
  }
  if (userBehavior.repostedAuthors?.includes(post.author?.toString())) {
    score += 20;
  }

  // Community affinity
  if (post.community && userBehavior.activeCommunities?.includes(post.community.toString())) {
    score += 25;
  }

  // Hashtag resonance (if user engages with these tags)
  const commonTags = post.hashtags?.filter(tag => userBehavior.activeHashtags?.includes(tag)) || [];
  score += commonTags.length * 8;

  return score;
}

export async function POST(req: NextRequest) {
  await connectDB();

  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.userId;
  const currentTime = Date.now();

  // 🔥 Trigger behavioral tracking (skipped if Premium)
  await trackEvent(userId, 'feed_view', { feed_type: 'for_you' });

  // Fetch user behavior profile (from past interactions)
  const user = await User.findById(userId).select('isPremium');
  let userBehavior = { likedAuthors: [], repostedAuthors: [], activeCommunities: [], activeHashtags: [] };

  if (!user?.isPremium) {
    // In real system: fetch from analytics DB or precomputed profile
    // For MVP: simulate from recent actions
    const recentLikes = await Post.find({ likes: userId }).limit(100).select('author hashtags community');
    const recentReposts = await Post.find({ reposts: userId }).limit(100).select('author hashtags community');

    const likedAuthors = new Set<string>();
    const repostedAuthors = new Set<string>();
    const activeCommunities = new Set<string>();
    const activeHashtags = new Set<string>();

    [...recentLikes, ...recentReposts].forEach(post => {
      likedAuthors.add(post.author?.toString());
      if (post.community) activeCommunities.add(post.community.toString());
      post.hashtags?.forEach(tag => activeHashtags.add(tag));
    });

    repostedAuthors.add(...recentReposts.map(p => p.author?.toString()));

    userBehavior = {
      likedAuthors: Array.from(likedAuthors),
      repostedAuthors: Array.from(repostedAuthors),
      activeCommunities: Array.from(activeCommunities),
      activeHashtags: Array.from(activeHashtags),
    };
  }

  // Fetch candidate posts (last 48 hours, public or from followed users)
  const followedUsers = await User.findById(userId).distinct('following'); // assuming `following` field exists
  const candidatePosts = await Post.find({
    $or: [
      { author: { $in: [userId, ...followedUsers] } },
      { visibility: 'public' }
    ],
    createdAt: { $gte: new Date(Date.now() - 48 * 60 * 60 * 1000) }
  })
    .sort({ createdAt: -1 })
    .limit(200) // cap for performance
    .populate('author', 'username verified isPremium')
    .lean();

  // Score and rank
  const scoredPosts = candidatePosts
    .map(post => ({
      ...post,
      __score: scorePost(post, userBehavior, currentTime)
    }))
    .filter(p => p.__score > 0)
    .sort((a, b) => b.__score - a.__score)
    .slice(0, 20);

  return NextResponse.json({ posts: scoredPosts }, { status: 200 });
}
