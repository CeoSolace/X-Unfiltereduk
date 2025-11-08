// ./src/app/api/feed/for-you.ts

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userId = session.user.id;

  // Fetch user interactions
  const likes = await prisma.like.findMany({
    where: { userId },
    select: { post: { select: { authorId: true } } },
  });

  const reposts = await prisma.repost.findMany({
    where: { userId },
    select: { post: { select: { authorId: true } } },
  });

  const posts = await prisma.post.findMany({
    where: { authorId: userId },
    select: {
      communityId: true,
      hashtags: true,
    },
  });

  const likedAuthors = new Set<string>();
  const repostedAuthors = new Set<string>();
  const activeCommunities = new Set<string>();
  const activeHashtags = new Set<string>();

  for (const like of likes) {
    if (like.post.authorId) {
      likedAuthors.add(like.post.authorId);
    }
  }

  for (const repost of reposts) {
    if (repost.post.authorId) {
      repostedAuthors.add(repost.post.authorId);
    }
  }

  for (const post of posts) {
    if (post.communityId) {
      activeCommunities.add(post.communityId);
    }
    if (post.hashtags) {
      for (const tag of post.hashtags) {
        activeHashtags.add(tag);
      }
    }
  }

  const userBehavior: {
    likedAuthors: string[];
    repostedAuthors: string[];
    activeCommunities: string[];
    activeHashtags: string[];
  } = {
    likedAuthors: Array.from(likedAuthors),
    repostedAuthors: Array.from(repostedAuthors),
    activeCommunities: Array.from(activeCommunities),
    activeHashtags: Array.from(activeHashtags),
  };

  // You can now safely use userBehavior in ranking or filtering logic
  // For now, return it as proof of concept
  return new Response(JSON.stringify({ userBehavior }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
