// src/app/api/admin/communities/pending/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminAuthMiddleware } from '@/middleware/adminAuth';
import { connectDB } from '@/lib/api/client';
import { Community } from '@/models/Community';
import { Document } from 'mongoose';

// Helper type: Lean Community with populated creator
interface LeanCommunity {
  _id: string;
  name: string;
  rules: string;
  status: string;
  creator: {
    username: string;
  };
}

export async function GET(req: NextRequest) {
  const authError = adminAuthMiddleware(req);
  if (authError) return authError;

  await connectDB();

  // Cast the result to LeanCommunity[]
  const communities = (await Community.find({ status: 'pending' })
    .populate('creator', 'username')
    .sort({ createdAt: -1 })
    .lean()) as LeanCommunity[];

  return NextResponse.json({
    communities: communities.map(c => ({
      id: c._id.toString(), // ✅ Now typed as string
      name: c.name,
      creator: c.creator.username,
      rules: c.rules,
      status: c.status,
    })),
  });
}
