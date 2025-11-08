// src/components/feed/PostComposer.tsx
'use client';

import { useState, useRef } from 'react';
import { useUser } from '@/hooks/useUser';

export function PostComposer() {
  const { user } = useUser();
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      if (media.length + files.length > 4) {
        alert('Max 4 media items allowed');
        return;
      }
      setMedia((prev) => [...prev, ...files.slice(0, 4 - prev.length)]);
    }
  };

  const removeMedia = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setIsPosting(true);

    const formData = new FormData();
    formData.append('content', content);
    media.forEach((file) => formData.append('media', file));

    try {
      const res = await fetch('/api/posts/create', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setContent('');
        setMedia([]);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to post');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-b border-gray-200 pb-4 mb-4">
      <div className="flex">
        <img
          src={user?.avatar || '/assets/placeholder-avatar.jpg'}
          alt="Avatar"
          className="w-10 h-10 rounded-full mr-3"
        />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What’s happening?"
            className="w-full p-2 text-lg border-none focus:outline-none resize-none"
            rows={2}
            maxLength={280}
            disabled={isPosting}
          />
          {media.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {media.map((file, i) => (
                <div key={i} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeMedia(i)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between items-center mt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-500 hover:underline text-sm"
            >
              Add image/video
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleMediaChange}
              accept="image/*,video/*"
              multiple
              className="hidden"
            />
            <button
              type="submit"
              disabled={!content.trim() || isPosting}
              className="bg-black text-white px-4 py-1.5 rounded-full text-sm font-medium disabled:opacity-50"
            >
              {isPosting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
