import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { getTodayIST, dateToISTString } from '@/lib/date';

const razorpay = new Razorpay({
  // IMPORTANT: Replace fallback values with real env vars in production.
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkey123',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mocksecret123',
});

/**
 * Release stock reservations for PENDING_PAYMENT orders whose reservedUntil
 * has passed, then mark them EXPIRED.
 *
 * Uses order.createdAt (not today's date) for the DailyStock lookup so that
 * orders created just before midnight release stock on the correct date row.
 *
 * Exported so the menu route can also call it on every read.
 */
export async function cleanupExpiredOrders() {
  const now = new Date();
  const expiredOrders = await prisma.order.findMany({
    where: {
      status: 'PENDING_PAYMENT',
      reservedUntil: { lt: now },
    },
    include: { items: true },
  });

  for (const order of expiredOrders) {
    // Key fix: use the date the order was CREATED, not today's date,
    // so we always release from the correct DailyStock row.
    const orderDateStr = dateToISTString(order.createdAt);

    await prisma.$transaction(async (tx) => {
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
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'EXPIRED' },
      });
    });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required to checkout' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { items } = body as { items: { menuItemId: string; quantity: number }[] };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty — add items before checking out.' },
        { status: 400 }
      );
    }

    // Deduplicate items by menuItemId — combine quantities.
    const consolidatedMap = new Map<string, { menuItemId: string; quantity: number }>();
    for (const item of items) {
      const existing = consolidatedMap.get(item.menuItemId);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        consolidatedMap.set(item.menuItemId, { ...item });
      }
    }
    const consolidatedItems = Array.from(consolidatedMap.values());

    // Release stock from any expired reservations before reading availability.
    await cleanupExpiredOrders();

    const todayStr = getTodayIST();

    // ── Server-side item validation ──────────────────────────────────────
    // Prices are always taken from the DB; the client total is never trusted.
    let totalAmount = 0;
    const itemDetails: {
      menuItemId: string;
      quantity: number;
      priceAtOrderTime: number;
      name: string;
    }[] = [];

    for (const reqItem of consolidatedItems) {
      if (
        !reqItem.menuItemId ||
        !Number.isInteger(reqItem.quantity) ||
        reqItem.quantity < 1
      ) {
        return NextResponse.json(
          { error: 'Invalid item or quantity in cart.' },
          { status: 400 }
        );
      }

      const dbItem = await prisma.menuItem.findUnique({
        where: { id: reqItem.menuItemId },
        include: {
          dailyStocks: { where: { date: todayStr } },
        },
      });

      if (!dbItem) {
        return NextResponse.json(
          { error: 'An item in your cart no longer exists. Please refresh the menu.' },
          { status: 400 }
        );
      }

      if (!dbItem.isActive) {
        return NextResponse.json(
          { error: `'${dbItem.name}' is no longer available today.` },
          { status: 400 }
        );
      }

      const stock = dbItem.dailyStocks[0];
      const available = stock?.quantityAvailable ?? 0;
      const reserved = stock?.quantityReserved ?? 0;
      const netAvailable = Math.max(0, available - reserved);

      if (reqItem.quantity > netAvailable) {
        return NextResponse.json(
          {
            error:
              netAvailable === 0
                ? `'${dbItem.name}' is sold out.`
                : `Only ${netAvailable} unit(s) of '${dbItem.name}' remain.`,
          },
          { status: 400 }
        );
      }

      totalAmount += dbItem.price * reqItem.quantity;
      itemDetails.push({
        menuItemId: dbItem.id,
        quantity: reqItem.quantity,
        priceAtOrderTime: dbItem.price,
        name: dbItem.name,
      });
    }

    // ── Atomic reservation & order creation ─────────────────────────────
    //
    // Race-condition guard: inside the transaction we re-read each stock row
    // and verify net availability BEFORE incrementing quantityReserved.
    //
    // On SQLite: transactions are serialised at the connection level, so this
    // read-check-write pattern is safe.
    //
    // On PostgreSQL: Prisma uses READ COMMITTED by default. For stricter
    // isolation you should upgrade to REPEATABLE READ or use SELECT FOR UPDATE
    // via $queryRaw. For the current campus-scale load this pattern is
    // sufficient; if you need full SERIALIZABLE add a migration note.
    const reservedUntil = new Date(Date.now() + 5 * 60 * 1000); // +5 minutes
    const qrSecret = crypto.randomBytes(16).toString('hex');

    let resultOrder;
    try {
      resultOrder = await prisma.$transaction(async (tx) => {
        for (const item of itemDetails) {
          // Re-read stock inside the transaction to catch concurrent changes.
          const stockRow = await tx.dailyStock.findUnique({
            where: {
              menuItemId_date: {
                menuItemId: item.menuItemId,
                date: todayStr,
              },
            },
          });

          if (!stockRow) {
            throw new Error(
              `SOLD_OUT:${item.menuItemId}:${item.name}:No stock record for today.`
            );
          }

          const net = stockRow.quantityAvailable - stockRow.quantityReserved;
          if (net < item.quantity) {
            // Throw a typed error so the outer catch can return a clean 400.
            throw new Error(
              `SOLD_OUT:${item.menuItemId}:${item.name}:Only ${Math.max(0, net)} left.`
            );
          }

          // Stock confirmed — increment the reservation.
          await tx.dailyStock.update({
            where: {
              menuItemId_date: {
                menuItemId: item.menuItemId,
                date: todayStr,
              },
            },
            data: { quantityReserved: { increment: item.quantity } },
          });
        }

        // Create the order now that all reservations are secured.
        return tx.order.create({
          data: {
            userId,
            token: 'PENDING',
            qrSecret,
            status: 'PENDING_PAYMENT',
            totalAmount,
            reservedUntil,
            items: {
              create: itemDetails.map((i) => ({
                menuItemId: i.menuItemId,
                quantity: i.quantity,
                priceAtOrderTime: i.priceAtOrderTime,
              })),
            },
          },
        });
      });
    } catch (txErr: any) {
      if (txErr.message?.startsWith('SOLD_OUT:')) {
        const [, , itemName, reason] = txErr.message.split(':');
        return NextResponse.json(
          {
            error: `'${itemName}' just sold out while you were checking out. ${reason ?? ''} Please refresh your cart.`,
          },
          { status: 400 }
        );
      }
      throw txErr;
    }

    // ── Create Razorpay Order ────────────────────────────────────────────
    let rzpOrder: { id: string };
    try {
      const created = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100), // in paisa
        currency: 'INR',
        receipt: resultOrder.id,
      });
      rzpOrder = { id: created.id };

      await prisma.order.update({
        where: { id: resultOrder.id },
        data: { razorpayOrderId: rzpOrder.id },
      });
    } catch (rzpErr) {
      const keyId = process.env.RAZORPAY_KEY_ID || '';
      const isMockEnv = !keyId || keyId.includes('mock');
      if (!isMockEnv) {
        // Real keys — propagate the error so checkout fails visibly.
        console.error('Razorpay order creation failed:', rzpErr);
        // Release the reservation we just made since payment can't proceed.
        await prisma.$transaction(async (tx) => {
          for (const item of itemDetails) {
            await tx.dailyStock.update({
              where: {
                menuItemId_date: { menuItemId: item.menuItemId, date: getTodayIST() },
              },
              data: { quantityReserved: { decrement: item.quantity } },
            });
          }
          await tx.order.update({
            where: { id: resultOrder.id },
            data: { status: 'EXPIRED' },
          });
        });
        return NextResponse.json(
          { error: 'Payment gateway is temporarily unavailable. Please try again in a moment.' },
          { status: 502 }
        );
      }
      // Dev / CI fallback when mock keys are in use.
      console.warn('Razorpay SDK mock fallback for local testing:', rzpErr);
      rzpOrder = { id: `rzp_order_mock_${resultOrder.id}` };
      await prisma.order.update({
        where: { id: resultOrder.id },
        data: { razorpayOrderId: rzpOrder.id },
      });
    }

    return NextResponse.json({
      success: true,
      orderId: resultOrder.id,
      razorpayOrderId: rzpOrder.id,
      amount: totalAmount,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkey123',
      reservedUntil,
    });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json(
      { error: err.message || 'Checkout failed. Please try again.' },
      { status: 500 }
    );
  }
}
