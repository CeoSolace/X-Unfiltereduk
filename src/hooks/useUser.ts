// src/hooks/useUser.ts
'use client';

import { useEffect, useState } from 'react';

interface UserSession {
  userId: string;
  username: string;
  verified: boolean;
  isPremium: boolean;
  isOrganisation: boolean;
}

export function useUser() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error('Session fetch failed');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  return { user, loading };
}
