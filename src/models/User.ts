// src/models/User.ts
import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-zA-Z0-9_]{3,30}$/, 'Invalid username'],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    isOrganisation: {
      type: Boolean,
      default: false,
    },
    organisationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organisation',
      default: null,
    },
    following: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: [],
    }],
    bio: { type: String, default: '' },
    location: { type: String, default: '' },
    avatar: { type: String, default: '/assets/placeholder-avatar.jpg' },
    header: { type: String, default: '/assets/placeholder-header.jpg' },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// 🔑 CeoSolace: auto-verified + Premium — no email override
UserSchema.pre('save', async function (next) {
  if (this.username === 'CeoSolace') {
    this.verified = true;
    this.isPremium = true;
    this.isOrganisation = false;
    // Do NOT touch email — any domain allowed
  }
  next();
});

UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ verified: 1 });
UserSchema.index({ isPremium: 1 });
UserSchema.index({ following: 1 });

export const User = models.User || model('User', UserSchema);
