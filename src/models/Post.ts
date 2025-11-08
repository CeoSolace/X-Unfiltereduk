// src/models/Post.ts
import { Schema, model, models } from 'mongoose';

const PostSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 280,
    },
    media: [{
      url: { type: String },
      type: { type: String, enum: ['image', 'video'] },
    }],
    mentions: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    hashtags: [{ type: String }],
    visibility: {
      type: String,
      enum: ['public', 'unlisted', 'community'],
      default: 'public',
    },
    community: {
      type: Schema.Types.ObjectId,
      ref: 'Community',
      default: null,
    },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    reposts: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ visibility: 1, createdAt: -1 });
PostSchema.index({ community: 1, createdAt: -1 });

export const Post = models.Post || model('Post', PostSchema);
