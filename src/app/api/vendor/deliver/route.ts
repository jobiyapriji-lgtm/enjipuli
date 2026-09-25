import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getTodayStartIST } from '@/lib/date';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (user?.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Unauthorized vendor action' }, { status: 403 });
    }

    const body = await request.json();
    const { orderId, qrSecret, token } = body;

    let order;

    if (orderId && qrSecret) {
      // ── Primary path: QR scan (orderId + qrSecret) ───────────────────
      order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { menuItem: true } } },
      });

      if (!order || order.qrSecret !== qrSecret) {
        return NextResponse.json(
          { success: false, error: 'Invalid or tampered QR code. Delivery rejected.' },
          { status: 400 }
        );
      }
    } else if (token) {
      // ── Fallback path: manual token entry (no QR secret) ─────────────
      // The vendor is assumed to have physical possession of the customer
      // since this path requires being logged in as VENDOR. Token lookup is
      // scoped to today to avoid collisions across days.
      const todayStart = getTodayStartIST();

      order = await prisma.order.findFirst({
        where: {
          token: token.trim().toUpperCase(),
          createdAt: { gte: todayStart },
        },
        include: { items: { include: { menuItem: true } } },
      });

      if (!order) {
        return NextResponse.json(
          { success: false, error: `No order found for token '${token.trim().toUpperCase()}' today.` },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Provide either (orderId + qrSecret) from a QR scan, or a token for manual entry.' },
        { status: 400 }
      );
    }

    // ── Idempotency: already delivered ───────────────────────────────────
    if (order.status === 'DELIVERED') {
      return NextResponse.json({
        success: true,
        alreadyDelivered: true,
        message: `Order ${order.token} was already marked DELIVERED.`,
        order,
      });
    }

    // ── Guard: order must exist in a paid/active state ───────────────────
    if (order.status === 'PENDING_PAYMENT' || order.status === 'EXPIRED' || order.status === 'CANCELLED') {
      return NextResponse.json(
        { success: false, error: `Order ${order.token} is ${order.status} and cannot be delivered.` },
        { status: 400 }
      );
    }

    // ── Guard: must be READY before delivery ─────────────────────────────
    // This prevents scanning a QR while food is still PREPARING,
    // avoiding premature delivery confirmation.
    if (order.status === 'PAID') {
      return NextResponse.json(
        {
          success: false,
          error: `Order ${order.token} has been paid but preparation hasn't started yet. Advance it to PREPARING first.`,
        },
        { status: 400 }
      );
    }

    if (order.status === 'PREPARING') {
      return NextResponse.json(
        {
          success: false,
          error: `Order ${order.token} is still being PREPARED. Mark it READY before scanning for delivery.`,
        },
        { status: 400 }
      );
    }

    // ── Order is READY — mark as DELIVERED ───────────────────────────────
    const deliveredOrder = await prisma.order.update({
      where: { id: order.id },
      data: { status: 'DELIVERED' },
      include: { items: { include: { menuItem: true } } },
    });

    return NextResponse.json({
      success: true,
      alreadyDelivered: false,
      message: `Order ${deliveredOrder.token} successfully marked DELIVERED.`,
      order: deliveredOrder,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
