// src/app/api/auth/login.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { User } from '@/models/User';
import { connectDB } from '@/lib/api/client';
import { createSession } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Auto-verify CeoSolace on login (belt-and-suspenders)
    if (user.username === 'CeoSolace') {
      user.verified = true;
      user.isPremium = true;
      await user.save();
    }

    await createSession(user._id.toString());

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id,
          username: user.username,
          verified: user.verified,
          isPremium: user.isPremium,
          isOrganisation: user.isOrganisation,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}
