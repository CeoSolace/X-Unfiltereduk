// src/app/settings/profile/page.tsx
'use client';

import { useState, useRef } from 'react';
import { useUser } from '@/hooks/useUser';

export default function ProfileSettings() {
  const { user } = useUser();
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [headerFile, setHeaderFile] = useState<File | null>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('bio', bio);
    formData.append('location', location);
    if (avatarFile) formData.append('avatar', avatarFile);
    if (headerFile) formData.append('header', headerFile);

    await fetch('/api/users/update-profile', {
      method: 'POST',
      body: formData,
    });
    alert('Profile updated');
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Profile</h1>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block font-medium">Avatar</label>
          <img
            src={avatarFile ? URL.createObjectURL(avatarFile) : user?.avatar}
            alt="Preview"
            className="w-16 h-16 rounded-full my-2"
          />
          <input
            type="file"
            ref={avatarRef}
            onChange={e => e.target.files?.[0] && setAvatarFile(e.target.files[0])}
            accept="image/*"
            className="text-sm"
          />
        </div>

        <div>
          <label className="block font-medium">Header</label>
          <img
            src={headerFile ? URL.createObjectURL(headerFile) : user?.header}
            alt="Preview"
            className="w-full h-32 object-cover my-2"
          />
          <input
            type="file"
            ref={headerRef}
            onChange={e => e.target.files?.[0] && setHeaderFile(e.target.files[0])}
            accept="image/*"
            className="text-sm"
          />
        </div>

        <div>
          <label className="block font-medium">Bio</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            className="w-full p-2 border rounded"
            rows={3}
            maxLength={160}
          />
        </div>

        <div>
          <label className="block font-medium">Location</label>
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded"
        >
          Save
        </button>
      </form>
    </div>
  );
}
