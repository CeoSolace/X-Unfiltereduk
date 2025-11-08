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

  return NextResponse.json({
    communities: communities.map(c => ({
      id: c._id.toString(),
      name: c.name,
      creator: c.creator.username,
      rules: c.rules,
      status: c.status,
    })),
  });
}
