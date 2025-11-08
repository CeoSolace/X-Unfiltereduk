// src/app/notifications/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/hooks/useUser';

type Notification = {
  id: string;
  type: 'like' | 'repost' | 'follow' | 'mention';
  actor: { username: string; avatar: string };
  postId?: string;
  read: boolean;
  createdAt: string;
};

export default function NotificationsPage() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => setNotifications(data.notifications || []));
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Notifications</h1>
      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications yet.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map(note => (
            <li key={note.id} className="flex items-start">
              <img
                src={note.actor.avatar}
                alt=""
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <p>
                  <span className="font-bold">@{note.actor.username}</span>{' '}
                  {note.type === 'like' && 'liked your post'}
                  {note.type === 'repost' && 'reposted your post'}
                  {note.type === 'follow' && 'followed you'}
                  {note.type === 'mention' && 'mentioned you'}
                </p>
                <p className="text-xs text-gray-500">{new Date(note.createdAt).toLocaleString()}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
