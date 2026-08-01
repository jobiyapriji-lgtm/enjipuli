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

    if (order.status === 'PAID') {
      return NextResponse.json({
        success: true,
        orderId: order.id,
        token: order.token,
        qrSecret: order.qrSecret,
        status: order.status,
      });
    }

    // Verify Razorpay signature if signature present and secret configured
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (razorpaySignature && secret && !secret.includes('mock')) {
      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== razorpaySignature) {
        return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
      }
    }

    // Generate daily sequential token (e.g. EJ-001, EJ-014)
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

    // Transactionally update Order & convert reserved stock into permanent deduction
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

      const updated = await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          token,
          razorpayPaymentId: razorpayPaymentId || `pay_mock_${Date.now()}`,
          reservedUntil: null,
        },
      });

      return updated;
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
    return NextResponse.json({ error: err.message || 'Payment verification failed' }, { status: 500 });
  }
}
