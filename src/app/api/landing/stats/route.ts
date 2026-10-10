import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [deliveredCount, activeItemsCount, activeCategories] = await Promise.all([
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.menuItem.count({ where: { isActive: true } }),
      prisma.menuItem.findMany({
        where: { isActive: true },
        select: { category: true },
        distinct: ['category'],
      }),
    ]);

    return NextResponse.json({
      ordersServed: deliveredCount,
      menuItems: activeItemsCount,
      categories: activeCategories.length,
    });
  } catch (error: any) {
    console.error('Failed to fetch landing stats:', error);
    return NextResponse.json(
      {
        ordersServed: 0,
        menuItems: 8,
        categories: 4,
      },
      { status: 200 }
    );
  }
}
