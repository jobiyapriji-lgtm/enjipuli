import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';
import { fulfillOrderPayment } from '@/lib/order-fulfillment';

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

    // ── Atomic Fulfillment: Token generation & Stock deduction ─────────
    const { order: updatedOrder } = await fulfillOrderPayment({
      orderId: order.id,
      razorpayPaymentId: razorpayPaymentId || `pay_verified_${Date.now()}`,
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
