import { prisma } from '@/lib/prisma';
import { getTodayStartIST, dateToISTString } from '@/lib/date';

export interface FulfillOrderParams {
  orderId: string;
  razorpayPaymentId?: string;
}

export interface FulfillOrderResult {
  success: boolean;
  alreadyProcessed?: boolean;
  order: any;
  message?: string;
}

/**
 * Atomic fulfillment and stock deduction for confirmed payments.
 * Called by both /api/payment/verify and /api/webhook/razorpay.
 *
 * 1. Checks order status (idempotent if already PAID/PREPARING/READY/DELIVERED).
 * 2. Generates a collision-proof sequential order token (e.g. EJ-014).
 * 3. Atomically decrements quantityAvailable (and releases quantityReserved).
 * 4. Updates order to status 'PAID'.
 */
export async function fulfillOrderPayment({
  orderId,
  razorpayPaymentId,
}: FulfillOrderParams): Promise<FulfillOrderResult> {
  const existingOrder = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { menuItem: true } },
      user: { select: { id: true, name: true, email: true, collegeId: true } },
    },
  });

  if (!existingOrder) {
    throw new Error('Order not found');
  }

  // Idempotency: If already in a paid or fulfilled state, return without re-deducting stock
  if (['PAID', 'PREPARING', 'READY', 'DELIVERED'].includes(existingOrder.status)) {
    return {
      success: true,
      alreadyProcessed: true,
      order: existingOrder,
      message: `Order ${existingOrder.token} is already paid.`,
    };
  }

  if (existingOrder.status === 'CANCELLED') {
    throw new Error('This order has been cancelled.');
  }

  const todayStart = getTodayStartIST();
  const orderDateStr = dateToISTString(existingOrder.createdAt);

  return await prisma.$transaction(async (tx) => {
    // 1. Generate sequential, unique human-readable token for today (e.g. EJ-014)
    const countToday = await tx.order.count({
      where: {
        createdAt: { gte: todayStart },
        status: { in: ['PAID', 'PREPARING', 'READY', 'DELIVERED'] },
      },
    });

    let tokenNum = countToday + 1;
    let token = `EJ-${tokenNum.toString().padStart(3, '0')}`;

    // Ensure token is strictly unique for today in case of concurrent transactions
    while (
      await tx.order.findFirst({
        where: {
          token,
          createdAt: { gte: todayStart },
        },
      })
    ) {
      tokenNum++;
      token = `EJ-${tokenNum.toString().padStart(3, '0')}`;
    }

    // 2. Stock deduction:
    // If order was PENDING_PAYMENT, the reservation was active (quantityReserved was incremented).
    // Payment confirmation converts reservation into confirmed deduction by decrementing
    // quantityAvailable AND decrementing quantityReserved.
    const wasPending = existingOrder.status === 'PENDING_PAYMENT';

    for (const item of existingOrder.items) {
      const stockRow = await tx.dailyStock.findUnique({
        where: {
          menuItemId_date: {
            menuItemId: item.menuItemId,
            date: orderDateStr,
          },
        },
      });

      if (!stockRow) {
        throw new Error(
          `No daily stock record found for item '${item.menuItemId}' on date ${orderDateStr}.`
        );
      }

      // If reservation had already expired, check if stock is still available to deduct
      if (!wasPending && stockRow.quantityAvailable < item.quantity) {
        throw new Error(`Insufficient stock for '${item.menuItem?.name || 'Item'}'.`);
      }

      await tx.dailyStock.update({
        where: {
          menuItemId_date: {
            menuItemId: item.menuItemId,
            date: orderDateStr,
          },
        },
        data: {
          quantityAvailable: { decrement: item.quantity },
          ...(wasPending
            ? { quantityReserved: { decrement: Math.min(stockRow.quantityReserved, item.quantity) } }
            : {}),
        },
      });
    }

    // 3. Update order status to PAID with assigned token and clear reservation expiry
    const updatedOrder = await tx.order.update({
      where: { id: existingOrder.id },
      data: {
        status: 'PAID',
        token,
        razorpayPaymentId: razorpayPaymentId || existingOrder.razorpayPaymentId || `pay_confirmed_${Date.now()}`,
        reservedUntil: null,
      },
      include: {
        items: { include: { menuItem: true } },
        user: { select: { id: true, name: true, email: true, collegeId: true } },
      },
    });

    return {
      success: true,
      alreadyProcessed: false,
      order: updatedOrder,
      message: `Order ${token} confirmed and stock deducted.`,
    };
  });
}
