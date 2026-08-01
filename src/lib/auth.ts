import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'OTP Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        code: { label: 'Code', type: 'text' },
        purpose: { label: 'Purpose', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.code || !credentials?.purpose) {
          throw new Error('Email, code, and purpose are required');
        }

        const email = credentials.email.trim().toLowerCase();
        const code = credentials.code.trim();
        const purpose = credentials.purpose.trim().toLowerCase();
        const requestedRole = purpose === 'vendor' ? 'VENDOR' : 'STUDENT';

        // 1. Find the latest unconsumed, unexpired OTP for this email+purpose
        const otpRecord = await prisma.otpCode.findFirst({
          where: {
            email,
            purpose,
            consumedAt: null,
          },
          orderBy: { createdAt: 'desc' },
        });

        if (!otpRecord) {
          throw new Error('No valid code found. Please request a new one.');
        }

        if (new Date() > otpRecord.expiresAt) {
          throw new Error('Code has expired. Please request a new one.');
        }

        if (otpRecord.attempts >= 5) {
          throw new Error('Too many failed attempts. Please request a new code.');
        }

        // 2. Verify hash
        const isValid = await bcrypt.compare(code, otpRecord.codeHash);

        if (!isValid) {
          // Increment attempts
          await prisma.otpCode.update({
            where: { id: otpRecord.id },
            data: { attempts: { increment: 1 } },
          });
          throw new Error('Invalid code.');
        }

        // 3. Mark consumed
        await prisma.otpCode.update({
          where: { id: otpRecord.id },
          data: { consumedAt: new Date() },
        });

        // 4. Find existing user or create
        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: email.split('@')[0],
              role: requestedRole,
            },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  // IMPORTANT: Replace this with a strong random secret in production via
  // the NEXTAUTH_SECRET environment variable. Never ship the fallback value.
  secret: process.env.NEXTAUTH_SECRET || 'enjipuli-secret-key-campus-hotspot-2026',
};
