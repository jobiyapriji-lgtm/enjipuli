import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * POST /api/orders/[id]/cancel
 *
 * Cancels an order and releases any stock reservation or deduction.
 *
 * Rules:
 *  - Caller must be the order owner OR a VENDOR.
 *  - PENDING_PAYMENT: releases quantityReserved (reservation → freed).
 *  - PAID: reverses the permanent deduction (quantityAvailable is incremented
 *    back). quantityReserved was already zeroed at payment time, so only
 *    quantityAvailable needs to be restored.
 *  - Any other status (PREPARING, READY, DELIVERED, EXPIRED, CANCELLED):
 *    cancellation is rejected with a clear message.
 *  - Full refund via Razorpay is out of scope for now — status is set to
 *    CANCELLED so the vendor knows to issue a manual refund if needed.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const caller = session.user as any;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // Only the order owner or a VENDOR may cancel.
    if (order.userId !== caller.id && caller.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Forbidden — you do not own this order.' }, { status: 403 });
    }

    // ── Already in a terminal or non-cancellable state ────────────────
    if (order.status === 'CANCELLED') {
      return NextResponse.json(
        { success: true, message: 'Order was already cancelled.', status: 'CANCELLED' }
      );
    }

    if (order.status === 'PREPARING') {
      return NextResponse.json(
        { error: "Order is already being PREPARED and can no longer be cancelled. Please contact the vendor." },
        { status: 400 }
      );
    }

    if (order.status === 'READY') {
      return NextResponse.json(
        { error: 'Order is READY for pickup and cannot be cancelled at this stage.' },
        { status: 400 }
      );
    }

    if (order.status === 'DELIVERED') {
      return NextResponse.json(
        { error: 'Order has already been DELIVERED and cannot be cancelled.' },
        { status: 400 }
      );
    }

    if (order.status === 'EXPIRED') {
      return NextResponse.json(
        { error: 'Order has already EXPIRED. Stock was automatically released.' },
        { status: 400 }
      );
    }

    // ── Cancellable states: PENDING_PAYMENT and PAID ──────────────────
    const orderDateStr = order.createdAt.toISOString().split('T')[0];

    await prisma.$transaction(async (tx) => {
      if (order.status === 'PENDING_PAYMENT') {
        // Reservation was incremented at checkout but not yet converted.
        // Release quantityReserved for each item.
        for (const item of order.items) {
          await tx.dailyStock.updateMany({
            where: {
              menuItemId: item.menuItemId,
              date: orderDateStr,
            },
            data: {
              quantityReserved: { decrement: item.quantity },
            },
          });
        }
      } else if (order.status === 'PAID') {
        // Payment verify already: decremented quantityAvailable AND
        // quantityReserved. To restore: increment quantityAvailable back.
        // quantityReserved is already 0 for this order.
        for (const item of order.items) {
          await tx.dailyStock.updateMany({
            where: {
              menuItemId: item.menuItemId,
              date: orderDateStr,
            },
            data: {
              quantityAvailable: { increment: item.quantity },
            },
          });
        }
      }

      // Mark the order cancelled.
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED' },
      });
    });

    return NextResponse.json({
      success: true,
      message:
        order.status === 'PAID'
          ? 'Order cancelled. Stock has been restored. Please arrange a refund with the vendor.'
          : 'Order cancelled. Stock reservation released.',
      status: 'CANCELLED',
    });
  } catch (err: any) {
    console.error('Cancel order error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to cancel order.' },
      { status: 500 }
    );
  }
}
