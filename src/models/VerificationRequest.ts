// src/models/VerificationRequest.ts
import { Schema, model, models } from 'mongoose';

const VerificationRequestSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    organisationName: { type: String, default: null },
    evidenceUrl: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: false }
);

VerificationRequestSchema.index({ userId: 1 });
VerificationRequestSchema.index({ status: 1 });

export const VerificationRequest = models.VerificationRequest || model('VerificationRequest', VerificationRequestSchema);
