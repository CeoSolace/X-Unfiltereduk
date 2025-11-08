// src/components/feed/PostCard.tsx
'use client';

import { VerifiedBadge } from '../profile/VerifiedBadge';

export function PostCard({ post, showThread = false }: { post: any; showThread?: boolean }) {
  if (!post) return null;

  return (
    <div className="border-b border-gray-200 p-4 hover:bg-gray-50">
      <div className="flex items-start">
        <img
          src={post.author?.avatar || '/assets/placeholder-avatar.jpg'}
          alt=""
          className="w-10 h-10 rounded-full mr-3"
        />
        <div className="flex-1">
          <div className="flex items-center">
            <span className="font-bold">@{post.author?.username}</span>
            <VerifiedBadge
              verified={post.author?.verified || false}
              isOrganisation={post.author?.isOrganisation || false}
            />
            <span className="text-gray-500 ml-2 text-sm">
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="mt-1">{post.content}</p>
          {post.media && post.media.length > 0 && (
            <div className="mt-2">
              {post.media.map((m: any, i: number) => (
                <img
                  key={i}
                  src={m.url}
                  alt=""
                  className="rounded max-h-96 object-cover"
                />
              ))}
            </div>
          )}
          {!showThread && (
            <div className="flex space-x-4 mt-2 text-sm text-gray-500">
              <button>💬 Reply</button>
              <button>🔁 Repost</button>
              <button>❤️ Like</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
