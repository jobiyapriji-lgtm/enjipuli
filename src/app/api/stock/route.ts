import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getTodayIST } from '@/lib/date';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (user?.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Unauthorized vendor action' }, { status: 403 });
    }

    const body = await request.json();
    const { menuItemId, quantityAvailable, isActive } = body;

    if (quantityAvailable != null && (isNaN(Number(quantityAvailable)) || Number(quantityAvailable) < 0)) {
      return NextResponse.json({ error: 'Stock quantity must be a non-negative number.' }, { status: 400 });
    }

    const todayStr = getTodayIST();

    if (menuItemId && quantityAvailable != null) {
      await prisma.dailyStock.upsert({
        where: {
          menuItemId_date: {
            menuItemId,
            date: todayStr,
          },
        },
        update: {
          quantityAvailable: parseInt(quantityAvailable, 10),
        },
        create: {
          menuItemId,
          date: todayStr,
          quantityAvailable: parseInt(quantityAvailable, 10),
          quantityReserved: 0,
        },
      });
    }

    if (menuItemId && isActive != null) {
      await prisma.menuItem.update({
        where: { id: menuItemId },
        data: { isActive: Boolean(isActive) },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
