// src/app/for-you/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { PostCard } from '@/components/feed/PostCard';
import { FeedSwitcher } from '@/components/feed/FeedSwitcher';

export default function ForYouFeed() {
  const { user, loading: userLoading } = useUser();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || userLoading) return;

    const loadForYouFeed = async () => {
      try {
        const res = await fetch('/api/feed/for-you', {
          method: 'POST',
          credentials: 'same-origin',
        });

        if (!res.ok) throw new Error('Failed to load feed');

        const data = await res.json();
        setPosts(data.posts || []);
      } catch (err) {
        console.error('For You feed error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadForYouFeed();
  }, [user, userLoading]);

  if (userLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Loading For You feed…</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <FeedSwitcher current="for-you" />

      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-xl font-bold">For You</h1>
        {user?.isPremium ? (
          <p className="text-sm text-green-600 mt-1">
            ✅ Premium active — no tracking, no ads, pure feed.
          </p>
        ) : (
          <p className="text-sm text-gray-500 mt-1">
            Personalized via on-platform behavior (opt-out with Premium).
          </p>
        )}
      </div>

      {posts.length > 0 ? (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      ) : (
        <p className="text-gray-500 py-10 text-center">
          Not enough activity yet. Post, like, or join a Community!
        </p>
      )}
    </div>
  );
}
