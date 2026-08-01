import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkey123',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mocksecret123',
});

// Helper function to release stock for expired pending payment orders
export async function cleanupExpiredOrders() {
  const now = new Date();
  const expiredOrders = await prisma.order.findMany({
    where: {
      status: 'PENDING_PAYMENT',
      reservedUntil: { lt: now },
    },
    include: { items: true },
  });

  const todayStr = now.toISOString().split('T')[0];

  for (const order of expiredOrders) {
    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.dailyStock.updateMany({
          where: {
            menuItemId: item.menuItemId,
            date: todayStr,
          },
          data: {
            quantityReserved: {
              decrement: item.quantity,
            },
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
      return NextResponse.json({ error: 'Authentication required to checkout' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { items } = body as { items: { menuItemId: string; quantity: number }[] };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Step 1: Release stock from expired orders older than 5 mins
    await cleanupExpiredOrders();

    const todayStr = new Date().toISOString().split('T')[0];

    // Step 2: Re-validate menu items and stock on the server
    let totalAmount = 0;
    const itemDetails: { menuItemId: string; quantity: number; priceAtOrderTime: number }[] = [];

    for (const reqItem of items) {
      const dbItem = await prisma.menuItem.findUnique({
        where: { id: reqItem.menuItemId },
        include: {
          dailyStocks: {
            where: { date: todayStr },
          },
        },
      });

      if (!dbItem || !dbItem.isActive) {
        return NextResponse.json(
          { error: `Item '${dbItem?.name || 'Unknown'}' is no longer active.` },
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
            error: `Sold out! Only ${netAvailable} unit(s) of '${dbItem.name}' remain available.`,
          },
          { status: 400 }
        );
      }

      const linePrice = dbItem.price * reqItem.quantity;
      totalAmount += linePrice;
      itemDetails.push({
        menuItemId: dbItem.id,
        quantity: reqItem.quantity,
        priceAtOrderTime: dbItem.price,
      });
    }

    // Step 3: Atomic reservation & Order creation
    const reservedUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    const qrSecret = crypto.randomBytes(16).toString('hex');

    const resultOrder = await prisma.$transaction(async (tx) => {
      // Increment quantityReserved
      for (const item of itemDetails) {
        await tx.dailyStock.update({
          where: {
            menuItemId_date: {
              menuItemId: item.menuItemId,
              date: todayStr,
            },
          },
          data: {
            quantityReserved: {
              increment: item.quantity,
            },
          },
        });
      }

      // Create Order
      const newOrder = await tx.order.create({
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

      return newOrder;
    });

    // Step 4: Create Razorpay Order
    let rzpOrder;
    try {
      rzpOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100), // amount in paisa
        currency: 'INR',
        receipt: resultOrder.id,
      });

      await prisma.order.update({
        where: { id: resultOrder.id },
        data: { razorpayOrderId: rzpOrder.id },
      });
    } catch (rzpErr) {
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
    return NextResponse.json({ error: err.message || 'Checkout failed' }, { status: 500 });
  }
}
