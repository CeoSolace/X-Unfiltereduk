// src/app/api/communities/create.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';
import { connectDB } from '@/lib/api/client';
import { Community } from '@/models/Community';

export async function POST(req: NextRequest) {
  await connectDB();
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, description, rules } = await req.json();

  if (!name || name.length < 3) {
    return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
  }

  const existing = await Community.findOne({ name: new RegExp(`^${name}$`, 'i') });
  if (existing) {
    return NextResponse.json({ error: 'Community already exists' }, { status: 409 });
  }

  const newCommunity = new Community({
    name,
    description,
    rules,
    creator: session.userId,
    status: 'pending', // Requires admin approval
  });

  await newCommunity.save();
  return NextResponse.json({ success: true, id: newCommunity._id }, { status: 201 });
}
