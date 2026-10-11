import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { fulfillOrderPayment } from '@/lib/order-fulfillment';

/**
 * POST /api/webhook/razorpay
 *
 * Listens for server-to-server Razorpay webhooks (e.g. payment.captured, order.paid).
 * Ensures that even if a student's browser closes during checkout or callback,
 * the order is automatically confirmed, token generated, and stock atomically deducted.
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // If webhook secret is configured, verify HMAC signature
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      const expectedBuf = Buffer.from(expectedSignature, 'utf8');
      const sigBuf = Buffer.from(signature, 'utf8');

      if (expectedBuf.length !== sigBuf.length || !crypto.timingSafeEqual(expectedBuf, sigBuf)) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // We handle payment.captured and order.paid
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderEntity = payload.payload?.order?.entity;

      const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
      const razorpayPaymentId = paymentEntity?.id;

      if (!razorpayOrderId) {
        return NextResponse.json({ received: true, note: 'No razorpay order ID in payload' });
      }

      // Find the pending order in our database
      const order = await prisma.order.findFirst({
        where: {
          OR: [
            { razorpayOrderId },
            { id: orderEntity?.receipt || paymentEntity?.receipt },
          ],
        },
      });

      if (!order) {
        return NextResponse.json({ received: true, note: 'Order not found in DB' });
      }

      // Atomically fulfill order and deduct stock
      const result = await fulfillOrderPayment({
        orderId: order.id,
        razorpayPaymentId,
      });

      return NextResponse.json({
        received: true,
        success: true,
        token: result.order.token,
      });
    }

    return NextResponse.json({ received: true, note: `Ignored event: ${event}` });
  } catch (err: any) {
    console.error('Razorpay webhook error:', err);
    return NextResponse.json(
      { error: err.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
