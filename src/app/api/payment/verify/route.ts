import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';
import { getTodayStartIST, dateToISTString } from '@/lib/date';

export async function POST(request: Request) {
  try {
    // ── Authentication: caller must be logged in ─────────────────────────
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required to verify payment.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // ── Verify the caller owns this order ─────────────────────────────────
    const userId = (session.user as any).id;
    if (order.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ── Guard: reject terminal/invalid states before touching anything ───
    if (order.status === 'EXPIRED') {
      return NextResponse.json(
        { error: 'This order has expired. Stock reservation was released. Please start a new order.' },
        { status: 400 }
      );
    }

    if (order.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'This order has been cancelled.' },
        { status: 400 }
      );
    }

    // ── Idempotency: already paid — return success without re-processing ─
    if (order.status === 'PAID' || order.status === 'PREPARING' ||
        order.status === 'READY'  || order.status === 'DELIVERED') {
      return NextResponse.json({
        success: true,
        orderId: order.id,
        token: order.token,
        qrSecret: order.qrSecret,
        status: order.status,
      });
    }

    // ── Razorpay signature verification ─────────────────────────────────
    const secret = process.env.RAZORPAY_KEY_SECRET ?? '';
    const isMockKey = !secret || secret.includes('mock') || secret.startsWith('rzp_test_mock');

    if (!isMockKey) {
      // Production mode: signature is REQUIRED. Missing or invalid = reject.
      if (!razorpaySignature || !razorpayOrderId || !razorpayPaymentId) {
        return NextResponse.json(
          { error: 'Payment signature, order ID, and payment ID are all required.' },
          { status: 400 }
        );
      }

      // Validate that the razorpayOrderId matches what we stored at checkout
      if (order.razorpayOrderId && razorpayOrderId !== order.razorpayOrderId) {
        return NextResponse.json(
          { error: 'Razorpay order ID mismatch. Possible tampering detected.' },
          { status: 400 }
        );
      }

      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      // Handle length mismatch gracefully instead of crashing
      const genBuf = Buffer.from(generatedSignature, 'utf8');
      const sigBuf = Buffer.from(razorpaySignature, 'utf8');
      if (genBuf.length !== sigBuf.length || !crypto.timingSafeEqual(genBuf, sigBuf)) {
        return NextResponse.json(
          { error: 'Invalid payment signature. Possible tampering detected.' },
          { status: 400 }
        );
      }
    }
    // In mock/dev mode: signature check is skipped intentionally.

    // ── Use IST-based date calculations ──────────────────────────────────
    const todayStart = getTodayStartIST();
    // Use order's creation date for stock deduction (handles cross-midnight)
    const orderDateStr = dateToISTString(order.createdAt);

    // ── Transactionally: generate token, mark paid, convert reservation ─
    // Token generation is INSIDE the transaction to prevent race collisions.
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Generate daily sequential token inside the transaction
      const countToday = await tx.order.count({
        where: {
          createdAt: { gte: todayStart },
          status: { in: ['PAID', 'PREPARING', 'READY', 'DELIVERED'] },
        },
      });
      const tokenNumber = (countToday + 1).toString().padStart(3, '0');
      const token = `EJ-${tokenNumber}`;

      // Convert reservation to permanent deduction on the ORDER's date
      for (const item of order.items) {
        await tx.dailyStock.update({
          where: {
            menuItemId_date: {
              menuItemId: item.menuItemId,
              date: orderDateStr,
            },
          },
          data: {
            quantityAvailable: { decrement: item.quantity },
            quantityReserved: { decrement: item.quantity },
          },
        });
      }

      return tx.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          token,
          razorpayPaymentId: razorpayPaymentId || `pay_mock_${Date.now()}`,
          reservedUntil: null, // reservation fulfilled
        },
      });
    });

    return NextResponse.json({
      success: true,
      orderId: updatedOrder.id,
      token: updatedOrder.token,
      qrSecret: updatedOrder.qrSecret,
      status: updatedOrder.status,
    });
  } catch (err: any) {
    console.error('Payment verification error:', err);
    return NextResponse.json(
      { error: err.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
