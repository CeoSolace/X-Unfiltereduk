// src/app/admin/layout.tsx
import { verifySession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();

  // Only CeoSolace (you) gets access — as per your platform rules
  if (!session || session.username !== 'CeoSolace') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white p-4">
        <h1 className="text-xl font-bold">UnfilteredUK Admin</h1>
      </header>
      <nav className="p-4 border-b">
        <ul className="flex space-x-6">
          <li><a href="/admin/verification-queue" className="text-blue-600 hover:underline">Verification</a></li>
          <li><a href="/admin/communities/mod" className="text-blue-600 hover:underline">Communities</a></li>
          <li><a href="/admin/moderators" className="text-blue-600 hover:underline">Moderators</a></li>
        </ul>
      </nav>
      <main className="p-4">{children}</main>
    </div>
  );
}
