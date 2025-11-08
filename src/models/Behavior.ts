// src/models/Behavior.ts
import { Schema, model, models } from 'mongoose';

const BehaviorSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    event: { type: String, required: true, index: true },
    metadata: { type: Schema.Types.Mixed, required: false },
    hashedIp: { type: String, required: true, index: true },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  {
    collection: 'userBehaviors',
    timestamps: false,
  }
);

// Compound index for analytics queries
BehaviorSchema.index({ userId: 1, event: 1, timestamp: -1 });
BehaviorSchema.index({ hashedIp: 1, timestamp: -1 });

export const Behavior = models.Behavior || model('Behavior', BehaviorSchema);
