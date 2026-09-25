import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const VENDOR_ALLOWLIST = [
  'vendor@enjipuli.com',
  ...(process.env.VENDOR_EMAILS?.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean) || []),
];

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in first.' },
        { status: 401 }
      );
    }

    const sessionUser = session.user as any;
    const email = sessionUser.email?.trim().toLowerCase();

    // 1. Role and Allowlist checks — only authorized vendor can change password
    if (sessionUser.role !== 'VENDOR' || !email || !VENDOR_ALLOWLIST.includes(email)) {
      return NextResponse.json(
        { error: 'Forbidden: Only authorized vendors can change vendor passwords.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Both current password and new password are required.' },
        { status: 400 }
      );
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: 'New password cannot be the same as the current password.' },
        { status: 400 }
      );
    }

    // 2. Fetch current user from database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Vendor account not found in database.' },
        { status: 404 }
      );
    }

    // If for some reason passwordHash is missing, check against default vendor password
    const defaultVendorPassword = process.env.VENDOR_DEFAULT_PASSWORD || 'Enjipuli@2026';
    let isCurrentValid = false;

    if (user.passwordHash) {
      isCurrentValid = await bcrypt.compare(currentPassword, user.passwordHash);
    } else {
      isCurrentValid = currentPassword === defaultVendorPassword;
    }

    if (!isCurrentValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect. Please re-enter.' },
        { status: 400 }
      );
    }

    // 3. Hash new password and save
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully! Please use your new password for future logins.',
    });
  } catch (err: any) {
    console.error('Change vendor password error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to change password. Please try again.' },
      { status: 500 }
    );
  }
}
