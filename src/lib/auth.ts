import { PrismaAdapter } from '@auth/prisma-adapter';
import { compare } from 'bcryptjs';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Admin credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

        if (!adminEmail || !adminPasswordHash) {
          throw new Error('Admin credentials are not configured.');
        }

        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const emailMatches = credentials.email.toLowerCase() === adminEmail.toLowerCase();
        const passwordMatches = await compare(credentials.password, adminPasswordHash);

        if (!emailMatches || !passwordMatches) {
          return null;
        }

        return {
          id: adminEmail,
          email: adminEmail,
          name: 'Seedance Admin',
        };
      },
    }),
  ],
};
