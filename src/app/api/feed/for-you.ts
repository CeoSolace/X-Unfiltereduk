// src/app/api/feed/for-you.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';
import { connectDB } from '@/lib/api/client';
import { Post } from '@/models/Post';
import { User } from '@/models/User';
import { trackEvent } from '@/lib/utils/trackEvent';

interface LeanPost {
  _id: string;
  author: {
    _id: string;
    username: string;
    verified: boolean;
    isPremium: boolean;
  };
  content: string;
  media: Array<{ url: string; type: string }>;
  mentions: string[];
  hashtags: string[];
  visibility: string;
  community?: string;
  likes?: string[];
  reposts?: string[];
  createdAt: Date;
}

function scorePost(
  post: LeanPost,
  userBehavior: Record<string, any>,
  currentTime: number
) {
  const ageHours = (currentTime - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
  if (ageHours > 48) return 0;

  let score = 0;
  const engagement = (post.likes?.length || 0) + (post.reposts?.length || 0);
  score += Math.log1p(engagement) * 10;
  score += Math.max(0, 50 - ageHours * 2);

  if (userBehavior.likedAuthors?.includes(post.author._id)) score += 15;
  if (userBehavior.repostedAuthors?.includes(post.author._id)) score += 20;
  if (post.community && userBehavior.activeCommunities?.includes(post.community)) score += 25;
  const commonTags = post.hashtags?.filter((tag: string) => userBehavior.activeHashtags?.includes(tag)) || [];
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

  await trackEvent(userId, 'feed_view', { feed_type: 'for_you' });

  const user = await User.findById(userId).select('isPremium');
  let userBehavior = { likedAuthors: [], repostedAuthors: [], activeCommunities: [], activeHashtags: [] };

  if (!user?.isPremium) {
    const recentLikes = await Post.find({ likes: userId }).limit(100).select('author hashtags community');
    const recentReposts = await Post.find({ reposts: userId }).limit(100).select('author hashtags community');

    const likedAuthors = new Set<string>();
    const repostedAuthors = new Set<string>();
    const activeCommunities = new Set<string>();
    const activeHashtags = new Set<string>();

    [...recentLikes, ...recentReposts].forEach(p => {
      if (p.author) likedAuthors.add(p.author.toString());
      if (p.community) activeCommunities.add(p.community.toString());
      (p.hashtags || []).forEach((tag: string) => activeHashtags.add(tag));
    });
    recentReposts.forEach(p => {
      if (p.author) repostedAuthors.add(p.author.toString());
    });

    userBehavior = {
      likedAuthors: Array.from(likedAuthors),
      repostedAuthors: Array.from(repostedAuthors),
      activeCommunities: Array.from(activeCommunities),
      activeHashtags: Array.from(activeHashtags),
    };
  }

  const followedUsers = await User.findById(userId).distinct('following');
  const candidatePosts = await Post.find({
    $or: [
      { author: { $in: [userId, ...followedUsers] } },
      { visibility: 'public' }
    ],
    createdAt: { $gte: new Date(Date.now() - 48 * 60 * 60 * 1000) }
  })
    .sort({ createdAt: -1 })
    .limit(200)
    .populate('author', 'username verified isPremium')
    .lean();

  const scoredPosts = (candidatePosts as unknown as LeanPost[])
    .map(post => ({
      ...post,
      __score: scorePost(post, userBehavior, currentTime)
    }))
    .filter(p => p.__score > 0)
    .sort((a, b) => b.__score - a.__score)
    .slice(0, 20);

  return NextResponse.json({ posts: scoredPosts }, { status: 200 });
}
