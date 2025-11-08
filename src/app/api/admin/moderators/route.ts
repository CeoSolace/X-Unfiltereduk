// src/app/api/admin/moderators/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminAuthMiddleware } from '@/middleware/adminAuth';
import { connectDB } from '@/lib/api/client';
import { User } from '@/models/User';

export async function GET(req: NextRequest) {
  const authError = adminAuthMiddleware(req);
  if (authError) return authError;

  await connectDB();

  // Only CeoSolace is full admin for now
  const admin = await User.findOne({ username: 'CeoSolace' }).select('username');

  return NextResponse.json({
    moderators: [
      {
        id: admin?._id.toString() || 'unknown',
        username: 'CeoSolace',
        role: 'admin',
      },
      // In future: add delegated moderators from Organisations
    ],
  });
}
