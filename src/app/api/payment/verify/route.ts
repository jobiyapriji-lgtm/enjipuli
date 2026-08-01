import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
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

    // ── Guard: reject terminal/invalid states before touching anything ───
    if (order.status === 'EXPIRED') {
      return NextResponse.json(
        { error: 'This order has expired. Stock reservation was released. Please start a new order.' },
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

      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (!crypto.timingSafeEqual(
        Buffer.from(generatedSignature, 'utf8'),
        Buffer.from(razorpaySignature, 'utf8')
      )) {
        return NextResponse.json({ error: 'Invalid payment signature. Possible tampering detected.' }, { status: 400 });
      }
    }
    // In mock/dev mode: signature check is skipped intentionally.

    // ── Generate daily sequential token (EJ-001, EJ-014, …) ─────────────
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const countToday = await prisma.order.count({
      where: {
        createdAt: { gte: todayStart },
        status: { in: ['PAID', 'PREPARING', 'READY', 'DELIVERED'] },
      },
    });

    const tokenNumber = (countToday + 1).toString().padStart(3, '0');
    const token = `EJ-${tokenNumber}`;
    const todayStr = new Date().toISOString().split('T')[0];

    // ── Transactionally mark paid & convert reservation → permanent deduction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.dailyStock.update({
          where: {
            menuItemId_date: {
              menuItemId: item.menuItemId,
              date: todayStr,
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
