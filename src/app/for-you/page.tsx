// src/app/for-you/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { PostCard } from '@/components/feed/PostCard';
import { FeedSwitcher } from '@/components/feed/FeedSwitcher';
import { trackEvent } from '@/lib/utils/trackEvent';

export default function ForYouFeed() {
  const { user, loading: userLoading } = useUser();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || userLoading) return;

    const loadFeed = async () => {
      try {
        // Fetch For You feed from API
        const res = await fetch('/api/feed/for-you');
        const data = await res.json();
        setPosts(data.posts || []);
      } catch (error) {
        console.error('Failed to load For You feed');
      } finally {
        setLoading(false);
      }

      // Track only if user is NOT Premium
      if (!user.isPremium) {
        // This call is safe — server-side `trackEvent` auto-skips Premium
        trackEvent(user.userId, 'view_feed', { feed: 'for_you' });
      }
    };

    loadFeed();
  }, [user, userLoading]);

  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading your For You feed...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <FeedSwitcher current="for-you" />
      
      <div className="border-b border-gray-200 mb-4 pb-2">
        <h1 className="text-xl font-bold">For You</h1>
        {user?.isPremium && (
          <p className="text-sm text-green-600 mt-1">
            ✅ Premium: No tracking, no algorithmic bias — just relevance.
          </p>
        )}
        {!user?.isPremium && (
          <p className="text-sm text-gray-500 mt-1">
            Personalized using on-platform behavior.
          </p>
        )}
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-500 text-center py-10">
          Nothing to show yet. Follow more people or join Communities!
        </p>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
}
