// src/app/admin/moderators/page.tsx
'use client';

import { useEffect, useState } from 'react';

type Moderator = {
  id: string;
  username: string;
  role: 'admin' | 'moderator';
};

export default function ModeratorManagement() {
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/moderators')
      .then(res => res.json())
      .then(data => {
        setModerators(data.moderators || []);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Moderators</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="space-y-2">
          {moderators.map(mod => (
            <li key={mod.id} className="flex justify-between items-center border-b pb-2">
              <span>@{mod.username}</span>
              <span className="text-sm text-gray-600">{mod.role}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-sm text-gray-500">
        Moderator delegation for Organisations coming soon.
      </p>
    </div>
  );
}
