// src/app/admin/communities/mod/page.tsx
'use client';

import { useEffect, useState } from 'react';

type Community = {
  id: string;
  name: string;
  creator: string;
  rules: string;
  status: 'pending' | 'approved' | 'rejected';
};

export default function CommunityModeration() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/communities/pending')
      .then(res => res.json())
      .then(data => {
        setCommunities(data.communities || []);
        setLoading(false);
      });
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    await fetch(`/api/admin/communities/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    setCommunities(comms => comms.filter(c => c.id !== id));
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Community Moderation</h2>
      {communities.length === 0 ? (
        <p>No pending communities.</p>
      ) : (
        <ul className="space-y-4">
          {communities.map(comm => (
            <li key={comm.id} className="border p-4 rounded">
              <h3 className="font-bold">#{comm.name}</h3>
              <p>By @{comm.creator}</p>
              <p className="mt-2">Rules: {comm.rules}</p>
              <div className="mt-2 space-x-2">
                <button
                  onClick={() => handleAction(comm.id, 'approve')}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleAction(comm.id, 'reject')}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
