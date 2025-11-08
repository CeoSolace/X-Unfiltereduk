// src/app/layout.tsx
import '@/styles/globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth/session';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
