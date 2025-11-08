// src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { PostCard } from '@/components/feed/PostCard';
import { PostComposer } from '@/components/feed/PostComposer';
import { FeedSwitcher } from '@/components/feed/FeedSwitcher';

export default function FollowingFeed() {
  const { user, loading: userLoading } = useUser();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || userLoading) return;

    const loadFollowingFeed = async () => {
      try {
        const res = await fetch('/api/feed/following');
        const data = await res.json();
        setPosts(data.posts || []);
      } catch (err) {
        console.error('Failed to load Following feed');
      } finally {
        setLoading(false);
      }
    };

    loadFollowingFeed();
  }, [user, userLoading]);

  if (userLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Loading Following feed…</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <FeedSwitcher current="following" />
      <PostComposer />
      {posts.length > 0 ? (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      ) : (
        <p className="text-gray-500 py-10 text-center">
          You aren’t following anyone yet. Visit profiles to follow users.
        </p>
      )}
    </div>
  );
}
