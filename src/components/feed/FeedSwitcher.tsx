// src/components/feed/FeedSwitcher.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function FeedSwitcher({ current }: { current: 'following' | 'for-you' }) {
  const pathname = usePathname();

  return (
    <div className="flex border-b border-gray-200 mb-4">
      <Link
        href="/"
        className={`px-4 py-2 font-medium text-sm ${
          current === 'following'
            ? 'text-black border-b-2 border-black'
            : 'text-gray-500 hover:text-gray-800'
        }`}
      >
        Following
      </Link>
      <Link
        href="/for-you"
        className={`px-4 py-2 font-medium text-sm ${
          current === 'for-you'
            ? 'text-black border-b-2 border-black'
            : 'text-gray-500 hover:text-gray-800'
        }`}
      >
        For You
      </Link>
    </div>
  );
}
