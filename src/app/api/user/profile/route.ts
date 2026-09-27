import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionUser = session.user as any;

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        orders: {
          select: {
            id: true,
            token: true,
            status: true,
            totalAmount: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const paidStatuses = ['PAID', 'PREPARING', 'READY', 'DELIVERED'];
    const activeStatuses = ['PAID', 'PREPARING', 'READY'];

    const totalOrders = user.orders.length;
    const completedOrders = user.orders.filter((o) => o.status === 'DELIVERED').length;
    const activeOrders = user.orders.filter((o) => activeStatuses.includes(o.status)).length;
    const totalSpent = user.orders
      .filter((o) => paidStatuses.includes(o.status))
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const isProvidence = user.email.toLowerCase().includes('providence.edu.in');

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name || user.email.split('@')[0],
      role: user.role,
      createdAt: user.createdAt,
      isProvidence,
      stats: {
        totalOrders,
        completedOrders,
        activeOrders,
        totalSpent,
      },
      recentOrders: user.orders.slice(0, 5),
    });
  } catch (error: any) {
    console.error('Failed to fetch user profile:', error);
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionUser = session.user as any;
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      return NextResponse.json({ error: 'Name must be between 2 and 50 characters' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: sessionUser.id },
      data: { name: trimmedName },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updated,
    });
  } catch (error: any) {
    console.error('Failed to update profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
