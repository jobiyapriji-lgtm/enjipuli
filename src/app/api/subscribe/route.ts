import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    // In production, sync with Resend, Mailchimp, or database newsletter list
    console.log(`[ENJIPULI Newsletter] New campus subscriber: ${trimmedEmail}`);

    return NextResponse.json({
      success: true,
      message: "You're on the list! We'll notify you about new campus specials.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to process subscription.' }, { status: 500 });
  }
}
