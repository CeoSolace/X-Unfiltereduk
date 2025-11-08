// src/lib/utils/trackEvent.ts
'use server';

import { headers } from 'next/headers';
import { connectDB } from '@/lib/api/client';
import { User } from '@/models/User';
import { Behavior } from '@/models/Behavior';
import { hashIp } from './hashIp';
import { v4 as uuidv4 } from 'uuid';

export async function trackEvent(
  userId: string,
  event: string,
  metadata: Record<string, any> = {}
) {
  await connectDB();
  const user = await User.findById(userId).select('isPremium');
  if (!user || user.isPremium) return;

  const hdrs = headers();
  const ip =
    hdrs.get('x-real-ip') ||
    hdrs.get('x-forwarded-for')?.split(',')[0] ||
    '127.0.0.1';

  const hashedIp = hashIp(ip);
  const sessionId = uuidv4();

  await Behavior.create({
    userId,
    sessionId,
    event,
    metadata,
    hashedIp,
  }).catch(err => {
    console.error('Tracking write failed:', err);
  });
}
