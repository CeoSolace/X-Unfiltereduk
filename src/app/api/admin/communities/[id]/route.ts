// src/app/api/admin/communities/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminAuthMiddleware } from '@/middleware/adminAuth';
import { connectDB } from '@/lib/api/client';
import { Community } from '@/models/Community';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = adminAuthMiddleware(req);
  if (authError) return authError;

  await connectDB();

  const { action } = await req.json();
  const communityId = params.id;

  const community = await Community.findById(communityId);
  if (!community) {
    return NextResponse.json({ error: 'Community not found' }, { status: 404 });
  }

  if (action === 'approve') {
    community.status = 'approved';
  } else if (action === 'reject') {
    community.status = 'rejected';
  } else {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  await community.save();
  return NextResponse.json({ success: true });
}
