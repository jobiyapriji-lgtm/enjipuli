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
    const { menuItemId, quantityAvailable, isActive } = body;

    const todayStr = new Date().toISOString().split('T')[0];

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
