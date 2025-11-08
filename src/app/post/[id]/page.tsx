// src/app/post/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PostCard } from '@/components/feed/PostCard';

export default function SinglePostPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/posts/${id}`)
      .then(res => res.json())
      .then(data => setPost(data.post));
  }, [id]);

  if (!post) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <PostCard post={post} showThread={true} />
    </div>
  );
}
