// src/app/api/admin/verification/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminAuthMiddleware } from '@/middleware/adminAuth';
import { connectDB } from '@/lib/api/client';
import { VerificationRequest } from '@/models/VerificationRequest';
import { User } from '@/models/User';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = adminAuthMiddleware(req);
  if (authError) return authError;

  await connectDB();

  const { action } = await req.json();
  const requestId = params.id;

  const verifReq = await VerificationRequest.findById(requestId);
  if (!verifReq || verifReq.status !== 'pending') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 404 });
  }

  if (action === 'approve') {
    await User.findByIdAndUpdate(verifReq.userId, {
      verified: true,
      ...(verifReq.organisationName && { isOrganisation: true })
    });

    await VerificationRequest.findByIdAndUpdate(requestId, {
      status: 'approved',
      reviewedAt: new Date(),
    });
  } else if (action === 'reject') {
    await VerificationRequest.findByIdAndUpdate(requestId, {
      status: 'rejected',
      reviewedAt: new Date(),
    });
  } else {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
