// src/app/api/users/search.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/api/client';
import { User } from '@/models/User';

export async function GET(req: NextRequest) {
  await connectDB();
  const url = new URL(req.url);
  const q = url.searchParams.get('q');

  if (!q) {
    return NextResponse.json({ users: [] });
  }

  const users = await User.find({
    username: { $regex: q, $options: 'i' },
    verified: true
  })
    .select('username avatar verified')
    .limit(10)
    .lean();

  return NextResponse.json({ users });
}
