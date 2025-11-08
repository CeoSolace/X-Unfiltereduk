// src/app/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';
import { connectDB } from '@/lib/api/client';
import { User } from '@/models/User';

// Mock notification model — replace with real one in production
type NotificationDoc = {
  userId: string;
  type: string;
  actorId: string;
  postId?: string;
  read: boolean;
  createdAt: Date;
};

// In real app: use a Notification model
const mockNotifications: NotificationDoc[] = [
  {
    userId: 'user123',
    type: 'follow',
    actorId: 'actor456',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
  },
];

export async function GET(req: NextRequest) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const actor = await User.findById('actor456').select('username avatar');

  // Simulate real notifications
  const notifications = mockNotifications
    .filter(n => n.userId === session.userId)
    .map(n => ({
      id: n.userId + '-' + n.createdAt.getTime(),
      type: n.type,
      actor: {
        username: actor?.username || 'user',
        avatar: actor?.avatar || '/assets/placeholder-avatar.jpg',
      },
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    }));

  return NextResponse.json({ notifications });
}
