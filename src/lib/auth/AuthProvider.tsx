// src/lib/auth/AuthProvider.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { verifySession } from './session';

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const session = await verifySession();
      if (!session) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  // Optional: show loading spinner while checking
  return <>{children}</>;
}
