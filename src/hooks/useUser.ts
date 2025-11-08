// src/hooks/useUser.ts
'use client';

import { useEffect, useState } from 'react';

export interface UserSession {
  userId: string;
  username: string;
  verified: boolean;
  isPremium: boolean;
  isOrganisation: boolean;
  following: string[]; // ← ADD THIS
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
          // Ensure `following` is present (default to empty array)
          setUser({
            ...data.user,
            following: data.user.following || [],
          });
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
