// src/lib/utils/trackEvent.ts
'use server';

import { connectDB } from '@/lib/api/client';
import { User } from '@/models/User';
import { hashIp } from './hashIp';
import { v4 as uuidv4 } from 'uuid';

// Create a lean tracking model — never store PII
const { Schema, model, models } = require('mongoose');

const BehaviorSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true },
    event: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    hashedIp: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { collection: 'userBehaviors' }
);

const Behavior = models.Behavior || model('Behavior', BehaviorSchema);

export async function trackEvent(
  userId: string,
  event: string,
  metadata: Record<string, any> = {},
  ip?: string
) {
  // 🔐 First: verify user exists and is NOT Premium
  await connectDB();
  const user = await User.findById(userId).select('isPremium');
  if (!user || user.isPremium) {
    // Premium users (including CeoSolace) are **excluded by design**
    return;
  }

  // Hash IP with pepper from .env — GDPR-compliant anonymization
  const hashedIp = ip ? hashIp(ip) : 'unknown';

  // Generate ephemeral session ID (for cohort analysis without cookies)
  const sessionId = uuidv4();

  // Write to dedicated analytics collection
  try {
    await Behavior.create({
      userId,
      sessionId,
      event,
      metadata,
      hashedIp,
    });
  } catch (err) {
    // Fail silently — tracking must never break core UX
    console.error('Tracking write failed (non-critical):', err);
  }
}
