// src/app/api/admin/verification/queue/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminAuthMiddleware } from '@/middleware/adminAuth';
import { connectDB } from '@/lib/api/client';
import { VerificationRequest } from '@/models/VerificationRequest';

export async function GET(req: NextRequest) {
  const authError = adminAuthMiddleware(req);
  if (authError) return authError;

  await connectDB();

  const requests = await VerificationRequest.find({ status: 'pending' })
    .sort({ submittedAt: -1 })
    .lean();

  return NextResponse.json({ requests });
}
