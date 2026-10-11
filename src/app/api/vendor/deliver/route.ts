import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getTodayStartIST } from '@/lib/date';

/**
 * Normalizes input token strings into standard format (e.g., '14' or '014' or 'ej-14' -> 'EJ-014')
 */
function normalizeToken(raw: string): string[] {
  const clean = raw.trim().toUpperCase();
  const candidates = [clean];

  // If input is purely numeric (e.g. '14' or '014')
  if (/^\d+$/.test(clean)) {
    candidates.push(`EJ-${clean.padStart(3, '0')}`);
  }

  // If input starts with EJ- (e.g. 'EJ-14')
  const match = clean.match(/^EJ-(\d+)$/);
  if (match) {
    candidates.push(`EJ-${match[1].padStart(3, '0')}`);
  }

  return Array.from(new Set(candidates));
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (user?.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Unauthorized vendor action' }, { status: 403 });
    }

    const body = await request.json();
    const { orderId, qrSecret, token, expectedOrderId } = body;

    let order;

    if (orderId && qrSecret) {
      // ── Primary Path: QR Scan (signed secret validation) ───────────────
      order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: { include: { menuItem: true } },
          user: { select: { id: true, name: true, email: true, collegeId: true } },
        },
      });

      if (!order || order.qrSecret !== qrSecret) {
        return NextResponse.json(
          { success: false, error: 'Invalid or tampered QR code. Delivery rejected.' },
          { status: 400 }
        );
      }

      // If scanner was locked onto a specific target order in the queue
      if (expectedOrderId && order.id !== expectedOrderId) {
        return NextResponse.json(
          {
            success: false,
            error: `This QR code is for Order ${order.token}, not the selected order. Please scan the matching ticket.`,
          },
          { status: 400 }
        );
      }
    } else if (token) {
      // ── Fallback Path: Manual Order Number Entry ───────────────────────
      const todayStart = getTodayStartIST();
      const candidateTokens = normalizeToken(token);

      order = await prisma.order.findFirst({
        where: {
          token: { in: candidateTokens },
          createdAt: { gte: todayStart },
        },
        include: {
          items: { include: { menuItem: true } },
          user: { select: { id: true, name: true, email: true, collegeId: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      // If not found today, search recent orders as fallback
      if (!order) {
        order = await prisma.order.findFirst({
          where: {
            token: { in: candidateTokens },
          },
          include: {
            items: { include: { menuItem: true } },
            user: { select: { id: true, name: true, email: true, collegeId: true } },
          },
          orderBy: { createdAt: 'desc' },
        });
      }

      if (!order) {
        return NextResponse.json(
          {
            success: false,
            error: `No order found for order number '${token.trim().toUpperCase()}'. Check for typos.`,
          },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Provide either a scanned QR code (orderId + signed secret) or an order number for manual lookup.',
        },
        { status: 400 }
      );
    }

    const customerName = order.user?.name || (order.user?.email ? order.user.email.split('@')[0] : 'Customer');

    // ── Idempotency: Already delivered ───────────────────────────────────
    if (order.status === 'DELIVERED') {
      return NextResponse.json({
        success: true,
        alreadyDelivered: true,
        message: `Order ${order.token} for ${customerName} was already marked DELIVERED.`,
        order,
      });
    }

    // ── Guard: order must be in a paid/active queue state ─────────────────
    if (order.status === 'PENDING_PAYMENT' || order.status === 'EXPIRED' || order.status === 'CANCELLED') {
      return NextResponse.json(
        {
          success: false,
          error: `Order ${order.token} is currently ${order.status.replace('_', ' ')} and cannot be delivered.`,
        },
        { status: 400 }
      );
    }

    // ── Fulfill: Mark order as DELIVERED ──────────────────────────────────
    const deliveredOrder = await prisma.order.update({
      where: { id: order.id },
      data: { status: 'DELIVERED' },
      include: {
        items: { include: { menuItem: true } },
        user: { select: { id: true, name: true, email: true, collegeId: true } },
      },
    });

    return NextResponse.json({
      success: true,
      alreadyDelivered: false,
      message: `Order ${deliveredOrder.token} for ${customerName} successfully marked DELIVERED!`,
      order: deliveredOrder,
    });
  } catch (err: any) {
    console.error('Vendor deliver error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
