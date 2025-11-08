// ./src/lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
// add your actual providers, callbacks, etc. here

export const authOptions: NextAuthOptions = {
  // your config—session strategy, pages, callbacks, providers, etc.
  providers: [
    // your providers
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    // your callbacks
  },
  pages: {
    signIn: '/login',
  },
};
