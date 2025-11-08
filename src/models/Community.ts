// src/models/Community.ts
import { Schema, model, models } from 'mongoose';

const CommunitySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: { type: String, default: '' },
    rules: { type: String, default: '' },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: [],
    }],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

CommunitySchema.index({ name: 1 });
CommunitySchema.index({ creator: 1 });
CommunitySchema.index({ status: 1 });

export const Community = models.Community || model('Community', CommunitySchema);
