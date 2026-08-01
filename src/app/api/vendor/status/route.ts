import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Allowed forward transitions for the vendor status endpoint.
 *
 * READY → DELIVERED is intentionally excluded here: that transition must
 * go through the QR scan endpoint (/api/vendor/deliver) which verifies
 * the qrSecret. This prevents a vendor from marking an order delivered
 * without physically scanning the customer's QR code.
 */
const ALLOWED_TRANSITIONS: Record<string, string> = {
  PAID: 'PREPARING',
  PREPARING: 'READY',
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (user?.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Unauthorized vendor action' }, { status: 403 });
    }

    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: 'orderId and status are required' }, { status: 400 });
    }

    // Fetch current order to validate the transition.
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      return NextResponse.json({ error: `Order not found: ${orderId}` }, { status: 404 });
    }

    const allowedNext = ALLOWED_TRANSITIONS[order.status];

    if (!allowedNext) {
      return NextResponse.json(
        {
          error: `Order is in '${order.status}' — no further status updates are allowed via this endpoint.`,
        },
        { status: 400 }
      );
    }

    if (status !== allowedNext) {
      if (status === 'DELIVERED') {
        return NextResponse.json(
          {
            error: `Orders can only be marked DELIVERED via the QR scan endpoint. Use /api/vendor/deliver with the customer's QR code.`,
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error: `Invalid transition: '${order.status}' → '${status}'. The only allowed next status is '${allowedNext}'.`,
        },
        { status: 400 }
      );
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
