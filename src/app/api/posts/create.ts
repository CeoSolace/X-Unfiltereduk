// src/app/api/posts/create.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/api/client';
import { Post } from '@/models/Post';
import { User } from '@/models/User';
import { cloudinary } from '@/lib/cloudinary';
import { parseMentions } from '@/lib/utils/parseMentions';
import { parseHashtags } from '@/lib/utils/parseHashtags';
import { verifySession } from '@/lib/auth/session';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  await connectDB();

  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const content = formData.get('content') as string;
    const visibility = (formData.get('visibility') as string) || 'public';
    const communityId = formData.get('community') as string | null;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    if (content.length > 280) {
      return NextResponse.json({ error: 'Post exceeds 280 characters' }, { status: 400 });
    }

    // Parse mentions & hashtags
    const mentions = parseMentions(content);
    const hashtags = parseHashtags(content);

    // Resolve mention user IDs
    const mentionUsers = await User.find({ username: { $in: mentions } }).select('_id');
    const mentionIds = mentionUsers.map(u => u._id);

    // Handle media uploads
    const media: { url: string; type: 'image' | 'video' }[] = [];
    const mediaFiles = formData.getAll('media') as File[];

    for (const file of mediaFiles) {
      if (!file || file.size === 0) continue;

      const buffer = Buffer.from(await file.arrayBuffer());
      const fileType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : null;

      if (!fileType) {
        return NextResponse.json({ error: 'Only images and videos allowed' }, { status: 400 });
      }

      // Upload to Cloudinary
      const res = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: 'unfiltereduk/posts',
              public_id: `post_${uuidv4()}`,
              resource_type: fileType === 'image' ? 'image' : 'video',
              overwrite: false,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(buffer);
      });

      const uploadResult = res as any;
      media.push({
        url: uploadResult.secure_url,
        type: fileType,
      });
    }

    // Create post
    const newPost = new Post({
      author: session.userId,
      content: content.trim(),
      media,
      mentions: mentionIds,
      hashtags,
      visibility,
      community: communityId || null,
    });

    await newPost.save();

    return NextResponse.json(
      { success: true, postId: newPost._id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Post creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create post' },
      { status: 500 }
    );
  }
}
