// src/app/api/auth/signup.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { User } from '@/models/User';
import { connectDB } from '@/lib/api/client';
import { createSession } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    // CeoSolace auto-verified
    if (username === 'CeoSolace') {
      newUser.verified = true;
      newUser.isPremium = true;
    }

    await newUser.save();

    await createSession(newUser._id.toString());

    return NextResponse.json(
      {
        success: true,
        user: {
          id: newUser._id,
          username: newUser.username,
          verified: newUser.verified,
          isPremium: newUser.isPremium,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Signup failed' },
      { status: 500 }
    );
  }
}
