import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cleanupExpiredOrders } from '@/app/api/checkout/route';

export async function GET(request: Request) {
  try {
    // Release any expired PENDING_PAYMENT reservations before computing
    // availability, so students always see accurate stock counts even if
    // no new checkout has been attempted recently.
    await cleanupExpiredOrders();

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('all') === 'true';
    const todayStr = new Date().toISOString().split('T')[0];

    const menuItems = await prisma.menuItem.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        dailyStocks: {
          where: { date: todayStr },
        },
      },
      orderBy: { category: 'asc' },
    });

    const formatted = menuItems.map((item) => {
      const stock = item.dailyStocks[0];
      const qtyAvailable = stock?.quantityAvailable ?? 0;
      const qtyReserved = stock?.quantityReserved ?? 0;
      const netAvailable = Math.max(0, qtyAvailable - qtyReserved);

      return {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        photoUrl: item.photoUrl,
        isActive: item.isActive,
        quantityAvailable: qtyAvailable,
        quantityReserved: qtyReserved,
        netAvailable,
        isSoldOut: netAvailable <= 0,
      };
    });

    return NextResponse.json(formatted);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (user?.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Unauthorized vendor action' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, price, category, photoUrl, initialStock } = body;

    if (!name || price == null || !category) {
      return NextResponse.json({ error: 'Missing required fields: name, price, category' }, { status: 400 });
    }

    const newItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
        photoUrl,
        isActive: true,
      },
    });

    const todayStr = new Date().toISOString().split('T')[0];
    await prisma.dailyStock.create({
      data: {
        menuItemId: newItem.id,
        date: todayStr,
        quantityAvailable: parseInt(initialStock || '20', 10),
        quantityReserved: 0,
      },
    });

    return NextResponse.json(newItem);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
