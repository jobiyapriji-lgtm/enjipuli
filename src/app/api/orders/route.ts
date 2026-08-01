import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode'); // 'queue' for vendor

    if (user.role === 'VENDOR' || mode === 'queue') {
      // Return today's active orders for vendor queue
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const queueOrders = await prisma.order.findMany({
        where: {
          createdAt: { gte: todayStart },
          status: { in: ['PAID', 'PREPARING', 'READY', 'DELIVERED'] },
        },
        include: {
          items: {
            include: { menuItem: true },
          },
          user: {
            select: { name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json(queueOrders);
    }

    // Return student's order history
    const userOrders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: {
          include: { menuItem: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(userOrders);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
