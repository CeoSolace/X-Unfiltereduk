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
    bio: { type: String, default: '' },
    location: { type: String, default: '' },
    avatar: { type: String, default: '/assets/placeholder-avatar.jpg' },
    header: { type: String, default: '/assets/placeholder-header.jpg' },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Auto-verify CeoSolace on save
UserSchema.pre('save', async function (next) {
  if (this.username === 'CeoSolace') {
    this.verified = true;
    this.isPremium = true;
    this.isOrganisation = false;
  }
  next();
});

export const User = models.User || model('User', UserSchema);
