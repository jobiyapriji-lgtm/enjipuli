import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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
      order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { menuItem: true } } },
      });

      if (!order || order.qrSecret !== qrSecret) {
        return NextResponse.json(
          { success: false, error: 'Invalid or forged QR code!' },
          { status: 400 }
        );
      }
    } else if (token) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      order = await prisma.order.findFirst({
        where: {
          token: token.trim().toUpperCase(),
          createdAt: { gte: todayStart },
        },
        include: { items: { include: { menuItem: true } } },
      });

      if (!order) {
        return NextResponse.json(
          { success: false, error: `No active order found for token ${token}` },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'QR Code payload or Token required' },
        { status: 400 }
      );
    }

    // Idempotent delivery check
    if (order.status === 'DELIVERED') {
      return NextResponse.json({
        success: true,
        alreadyDelivered: true,
        message: `Order ${order.token} was ALREADY delivered!`,
        order,
      });
    }

    if (order.status === 'PENDING_PAYMENT' || order.status === 'EXPIRED') {
      return NextResponse.json(
        { success: false, error: `Order ${order.token} has not been paid!` },
        { status: 400 }
      );
    }

    // Update order status to DELIVERED
    const deliveredOrder = await prisma.order.update({
      where: { id: order.id },
      data: { status: 'DELIVERED' },
      include: { items: { include: { menuItem: true } } },
    });

    return NextResponse.json({
      success: true,
      alreadyDelivered: false,
      message: `Order ${deliveredOrder.token} successfully marked DELIVERED!`,
      order: deliveredOrder,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
