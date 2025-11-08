// src/app/[username]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { VerifiedBadge } from '@/components/profile/VerifiedBadge';
import { PostCard } from '@/components/feed/PostCard';

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useUser();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!username) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/users/profile?username=${encodeURIComponent(username)}`);
        if (!res.ok) {
          router.push('/404');
          return;
        }
        const data = await res.json();
        setProfile(data.profile);
        setPosts(data.posts || []);

        // ✅ Now safe: currentUser.following exists
        const following = currentUser?.following?.includes(data.profile.id) || false;
        setIsFollowing(following);
      } catch (err) {
        console.error('Profile fetch error:', err);
        router.push('/404');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, currentUser, router]);

  const handleFollow = async () => {
    if (!currentUser || !profile) return;

    const url = '/api/users/follow';
    const method = isFollowing ? 'DELETE' : 'POST';
    const body = isFollowing
      ? null
      : JSON.stringify({ targetUserId: profile.id });

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (res.ok) {
      setIsFollowing(!isFollowing);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative h-48 bg-gray-200">
        <img src={profile.header} alt="Header" className="w-full h-full object-cover" />
      </div>
      <div className="px-4">
        <div className="relative -mt-16 mb-4">
          <img src={profile.avatar} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-white" />
        </div>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold">
              {profile.username}
              <VerifiedBadge verified={profile.verified} isOrganisation={profile.isOrganisation} />
            </h1>
            <p className="text-gray-600">@{profile.username}</p>
            <p className="mt-2">{profile.bio || 'No bio yet.'}</p>
            {profile.location && <p className="text-gray-500 mt-1">📍 {profile.location}</p>}
          </div>
          {currentUser && profile.id !== currentUser.userId && (
            <button
              onClick={handleFollow}
              className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                isFollowing
                  ? 'bg-white text-black border border-gray-300 hover:bg-gray-50'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
      </div>

      <div className="border-b border-gray-200 my-4"></div>

      <div>
        {posts.length === 0 ? (
          <p className="text-gray-500 py-4 text-center">No posts yet.</p>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}
