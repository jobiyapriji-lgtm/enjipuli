import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

import { validateStudentEmail } from '@/lib/collegeEmail';

// Vendor emails allowed to access the vendor portal.
// Can be extended via VENDOR_EMAILS env var (comma-separated).
const VENDOR_ALLOWLIST: string[] = [
  'vendor@enjipuli.com',
  ...(process.env.VENDOR_EMAILS?.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean) || []),
];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'OTP Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        code: { label: 'Code', type: 'text' },
        password: { label: 'Password', type: 'password' },
        purpose: { label: 'Purpose', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.purpose) {
          throw new Error('Email and purpose are required');
        }

        const email = credentials.email.trim().toLowerCase();
        const purpose = credentials.purpose.trim().toLowerCase();
        const requestedRole = purpose === 'vendor' ? 'VENDOR' : 'STUDENT';

        // ── Strict student domain enforcement ────────────────────────────
        if (requestedRole === 'STUDENT') {
          const validation = validateStudentEmail(email);
          if (!validation.valid) {
            throw new Error(validation.error || 'Only verified college email addresses are permitted.');
          }
        }

        // ── Vendor allowlist enforcement ─────────────────────────────────
        if (requestedRole === 'VENDOR' && !VENDOR_ALLOWLIST.includes(email)) {
          throw new Error('Not an authorized vendor email.');
        }

        // ── Password-based login (vendor only) ──────────────────────────
        if (credentials.password && credentials.password.trim()) {
          if (requestedRole !== 'VENDOR') {
            throw new Error('Password login is only available for vendors.');
          }

          let user = await prisma.user.findUnique({ where: { email } });
          const defaultVendorPassword = process.env.VENDOR_DEFAULT_PASSWORD || 'Enjipuli@2026';

          if (!user) {
            // First-time vendor auto-provisioning if on allowlist
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(defaultVendorPassword, salt);
            user = await prisma.user.create({
              data: {
                email,
                name: 'Enjipuli Vendor',
                role: 'VENDOR',
                passwordHash,
              },
            });
          } else if (!user.passwordHash) {
            // Initialize passwordHash with default vendor password if missing
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(defaultVendorPassword, salt);
            user = await prisma.user.update({
              where: { id: user.id },
              data: { passwordHash, role: 'VENDOR' },
            });
          }

          const valid = await bcrypt.compare(credentials.password.trim(), user.passwordHash || '');
          if (!valid) {
            throw new Error('Invalid password. Please check your credentials or contact administrator.');
          }

          if (user.role !== 'VENDOR') {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { role: 'VENDOR' },
            });
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        }

        // ── OTP-based login ──────────────────────────────────────────────
        if (!credentials.code || !credentials.code.trim()) {
          throw new Error('Please enter your verification code or password.');
        }

        const code = credentials.code.trim();

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

        // 4. Find existing user or create — sync role if needed
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
        } else if (user.role !== requestedRole && requestedRole === 'VENDOR' && VENDOR_ALLOWLIST.includes(email)) {
          // Upgrade: user was STUDENT but is a legitimate vendor → update role
          user = await prisma.user.update({
            where: { email },
            data: { role: 'VENDOR' },
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
