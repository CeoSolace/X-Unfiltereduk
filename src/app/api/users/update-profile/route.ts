// src/app/api/users/update-profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';
import { connectDB } from '@/lib/api/client';
import { User } from '@/models/User';
import { cloudinary } from '@/lib/cloudinary';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const formData = await req.formData();
  const bio = formData.get('bio') as string;
  const location = formData.get('location') as string;
  const avatarFile = formData.get('avatar') as File | null;
  const headerFile = formData.get('header') as File | null;

  const updates: any = { bio, location };

  if (avatarFile && avatarFile.size > 0) {
    const buffer = Buffer.from(await avatarFile.arrayBuffer());
    const res: any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: 'avatars', public_id: `avatar_${uuidv4()}` },
          (err, result) => (err ? reject(err) : resolve(result))
        )
        .end(buffer);
    });
    updates.avatar = res.secure_url;
  }

  if (headerFile && headerFile.size > 0) {
    const buffer = Buffer.from(await headerFile.arrayBuffer());
    const res: any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: 'headers', public_id: `header_${uuidv4()}` },
          (err, result) => (err ? reject(err) : resolve(result))
        )
        .end(buffer);
    });
    updates.header = res.secure_url;
  }

  await User.findByIdAndUpdate(session.userId, updates);
  return NextResponse.json({ success: true });
}
