// src/app/api/admin/communities/pending/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminAuthMiddleware } from '@/middleware/adminAuth';
import { connectDB } from '@/lib/api/client';
import { Community } from '@/models/Community';

export async function GET(req: NextRequest) {
  const authError = adminAuthMiddleware(req);
  if (authError) return authError;

  await connectDB();

  const communities = await Community.find({ status: 'pending' })
    .populate('creator', 'username')
    .sort({ createdAt: -1 })
    .lean();

  const result = communities.map(c => ({
    id: String(c._id),
    name: String(c.name || ''),
    rules: String(c.rules || ''),
    status: String(c.status || ''),
    creator: c.creator?.username ? String(c.creator.username) : 'Unknown',
  }));

  return NextResponse.json({ communities: result });
}
