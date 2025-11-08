// src/app/admin/verification-queue/page.tsx
'use client';

import { useEffect, useState } from 'react';

type VerificationRequest = {
  id: string;
  username: string;
  organisationName?: string;
  evidenceUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
};

export default function VerificationQueue() {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/verification/queue')
      .then(res => res.json())
      .then(data => {
        setRequests(data.requests || []);
        setLoading(false);
      });
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    await fetch(`/api/admin/verification/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    setRequests(reqs => reqs.filter(r => r.id !== id));
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Verification Queue</h2>
      {requests.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        <ul className="space-y-4">
          {requests.map(req => (
            <li key={req.id} className="border p-4 rounded">
              <p><strong>@{req.username}</strong></p>
              {req.organisationName && <p>Org: {req.organisationName}</p>}
              <a href={req.evidenceUrl} target="_blank" className="text-blue-500">Evidence</a>
              <div className="mt-2 space-x-2">
                <button
                  onClick={() => handleAction(req.id, 'approve')}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleAction(req.id, 'reject')}
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
