import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import bcrypt from 'bcryptjs';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

import { validateStudentEmail } from '@/lib/collegeEmail';

const VENDOR_ALLOWLIST = [
  'vendor@enjipuli.com',
  ...(process.env.VENDOR_EMAILS?.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean) || []),
];

export async function POST(req: Request) {
  try {
    const { email: rawEmail, purpose } = await req.json();

    if (!rawEmail || !purpose) {
      return NextResponse.json({ error: 'Email and purpose are required.' }, { status: 400 });
    }

    const email = rawEmail.trim().toLowerCase();

    // 1. Strict Validation
    if (purpose === 'student') {
      const validation = validateStudentEmail(email);
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error || 'Only verified college email addresses are permitted.' },
          { status: 403 }
        );
      }
    } else if (purpose === 'vendor') {
      if (!VENDOR_ALLOWLIST.includes(email)) {
        return NextResponse.json(
          { error: 'Not an authorized vendor email.' },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json({ error: 'Invalid purpose.' }, { status: 400 });
    }

    // 2. Rate Limiting (max 3 requests per 15 minutes)
    // Count ALL OTPs for this email in the last 15 min (not just this purpose)
    // to prevent bypass via alternating purposes.
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentRequests = await prisma.otpCode.count({
      where: {
        email,
        createdAt: { gte: fifteenMinutesAgo },
      },
    });

    if (recentRequests >= 3) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }

    // 3. Invalidate old UNCONSUMED OTPs for this email+purpose
    // Use updateMany to soft-expire instead of deleteMany, preserving rate-limit history.
    await prisma.otpCode.updateMany({
      where: { email, purpose, consumedAt: null },
      data: { expiresAt: new Date() },  // expire them immediately
    });

    // 4. Generate 6-digit code & Hash
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const codeHash = await bcrypt.hash(code, salt);
    
    // 5-minute expiry
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.otpCode.create({
      data: {
        email,
        codeHash,
        purpose,
        expiresAt,
      },
    });

    // 5. Send Email
    const hasEmailService = Boolean(
      process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_dummy_key'
    );

    if (!hasEmailService) {
      console.log(`\n\n=== OTP GENERATED FOR ${email} ===\nCODE: ${code}\n===============================\n`);
      return NextResponse.json({
        success: true,
        previewCode: code,
        message: 'Email service not configured. Test preview code provided.',
      });
    }

    try {
      await resend.emails.send({
        from: 'ENJIPULI <onboarding@resend.dev>', // Or custom domain if configured
        to: email,
        subject: 'Your ENJIPULI login code',
        html: `
          <div style="font-family: sans-serif; background-color: #0f172a; color: #f8fafc; padding: 40px; text-align: center; border-radius: 8px;">
            <h1 style="color: #a3e635; margin-bottom: 8px;">ENJIPULI</h1>
            <p style="font-size: 16px; margin-bottom: 24px;">Your login code is below. It will expire in 5 minutes.</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; padding: 20px; background-color: #1e293b; display: inline-block; border-radius: 8px; border: 1px solid #334155;">
              ${code}
            </div>
          </div>
        `,
      });
      return NextResponse.json({ success: true });
    } catch (emailErr: any) {
      console.error('Resend delivery error:', emailErr);
      return NextResponse.json(
        { error: 'Email delivery failed. ' + (emailErr?.message || 'Please check email settings.') },
        { status: 502 }
      );
    }
  } catch (error: any) {
    console.error('OTP Request Error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
