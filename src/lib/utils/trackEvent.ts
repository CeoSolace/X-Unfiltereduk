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
  metadata Record<string, any> = {}
) {
  await connectDB();

  // 1. Check if user is Premium (includes CeoSolace)
  const user = await User.findById(userId).select('isPremium');
  if (!user || user.isPremium) {
    return; // Premium = no tracking. Period.
  }

  // 2. Get real IP from headers (Render.com compatible)
  const hdrs = headers();
  const ip =
    hdrs.get('x-real-ip') ||
    hdrs.get('x-forwarded-for')?.split(',')[0] ||
    '127.0.0.1';

  // 3. Hash IP with your pepper
  const hashedIp = hashIp(ip);

  // 4. Generate session ID (for funnel analysis)
  const sessionId = uuidv4();

  // 5. Write to DB — fire-and-forget, non-blocking
  await Behavior.create({
    userId,
    sessionId,
    event,
    metadata,
    hashedIp,
  }).catch((err) => {
    // Log silently — never break UX for tracking failure
    console.error('Behavior write failed:', err);
  });
}
