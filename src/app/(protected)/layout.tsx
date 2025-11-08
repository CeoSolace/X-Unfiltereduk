// src/app/(protected)/layout.tsx
import { verifySession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();
  if (!session) {
    redirect('/login');
  }

  // Optionally pass session data via context or props if needed
  return <>{children}</>;
}
