// src/app/settings/billing/page.tsx
'use client';

import { useUser } from '@/hooks/useUser';

export default function BillingSettings() {
  const { user } = useUser();

  const handleUpgrade = async (tier: 'premium' | 'org') => {
    const res = await fetch('/api/payments/create-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Billing</h1>

      {user?.isPremium && !user.isOrganisation && (
        <div className="mb-6 p-4 bg-green-50 text-green-800 rounded">
          ✅ You are on <strong>Premium</strong> (£8.50/mo)
        </div>
      )}

      {user?.isOrganisation && (
        <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded">
          ✅ You are on <strong>Organisation</strong> (£25/mo)
        </div>
      )}

      {!user?.isPremium && (
        <div className="border p-4 rounded mb-6">
          <h2 className="font-bold">Premium — £8.50/month</h2>
          <ul className="list-disc list-inside text-sm mt-2 text-gray-600">
            <li>Blue verification tick</li>
            <li>No ads</li>
            <li>No tracking</li>
            <li>Priority in Community discovery</li>
          </ul>
          <button
            onClick={() => handleUpgrade('premium')}
            className="mt-3 bg-black text-white px-4 py-2 rounded"
          >
            Upgrade to Premium
          </button>
        </div>
      )}

      {!user?.isOrganisation && (
        <div className="border p-4 rounded">
          <h2 className="font-bold">Organisation — £25/month</h2>
          <ul className="list-disc list-inside text-sm mt-2 text-gray-600">
            <li>Verified org badge</li>
            <li>Affiliate users (gray ticks)</li>
            <li>Create & moderate official Communities</li>
            <li>Analytics & custom subdomain</li>
          </ul>
          <button
            onClick={() => handleUpgrade('org')}
            className="mt-3 bg-gray-800 text-white px-4 py-2 rounded"
          >
            Apply for Organisation
          </button>
        </div>
      )}
    </div>
  );
}
