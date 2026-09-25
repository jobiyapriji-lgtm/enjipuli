'use client';

import { useEffect, useState } from 'react';
import { VendorHeader } from '@/components/VendorHeader';
import { TrendingUp, ShoppingBag, AlertTriangle, IndianRupee } from 'lucide-react';

export default function VendorSummaryPage() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
    lowStockCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const [ordersRes, menuRes] = await Promise.all([
          fetch('/api/orders?mode=queue'),
          fetch('/api/menu?all=true'),
        ]);

        if (ordersRes.ok && menuRes.ok) {
          const orders = await ordersRes.json();
          const menu = await menuRes.json();

          const delivered = orders.filter((o: any) => o.status === 'DELIVERED');
          const revenue = orders
            .filter((o: any) => o.status !== 'EXPIRED' && o.status !== 'PENDING_PAYMENT' && o.status !== 'CANCELLED')
            .reduce((sum: number, o: any) => sum + o.totalAmount, 0);

          const lowStock = menu.filter((i: any) => i.netAvailable <= 3).length;

          setStats({
            totalOrders: orders.length,
            deliveredOrders: delivered.length,
            totalRevenue: revenue,
            lowStockCount: lowStock,
          });
        }
      } catch (err) {
        console.error('Failed to fetch summary:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
    const id = setInterval(fetchSummary, 15_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-ej-deep text-ej-cream pb-16 flex flex-col">
      <VendorHeader />

      <main className="max-w-4xl w-full mx-auto px-4 pt-6 space-y-6 flex-1">
        <div>
          <h1 className="text-xl font-extrabold text-ej-cream">Daily Sales &amp; Stock Summary</h1>
          <p className="text-xs text-ej-muted mt-1">Today&apos;s campus food truck performance analytics</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-ej-indigo/60 rounded-2xl border border-ej-border/60 skeleton" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-5 border-ej-gold/40 bg-ej-indigo/80 space-y-2">
              <div className="flex items-center justify-between text-ej-gold">
                <span className="text-xs font-bold text-ej-muted uppercase tracking-wider">Total Revenue</span>
                <IndianRupee className="w-5 h-5" />
              </div>
              <p className="text-3xl font-black text-ej-gold">₹{stats.totalRevenue}</p>
              <p className="text-[11px] text-ej-muted">Paid &amp; fulfilled today</p>
            </div>

            <div className="card p-5 border-ej-border space-y-2">
              <div className="flex items-center justify-between text-ej-lime">
                <span className="text-xs font-bold text-ej-muted uppercase tracking-wider">Total Orders</span>
                <ShoppingBag className="w-5 h-5" />
              </div>
              <p className="text-3xl font-black text-ej-cream">{stats.totalOrders}</p>
              <p className="text-[11px] text-ej-muted">Received today</p>
            </div>

            <div className="card p-5 border-ej-teal/40 space-y-2">
              <div className="flex items-center justify-between text-ej-teal">
                <span className="text-xs font-bold text-ej-muted uppercase tracking-wider">Delivered Orders</span>
                <TrendingUp className="w-5 h-5" />
              </div>
              <p className="text-3xl font-black text-ej-teal">{stats.deliveredOrders}</p>
              <p className="text-[11px] text-ej-muted">Scanned &amp; picked up</p>
            </div>

            <div className="card p-5 border-ej-vermilion/40 space-y-2">
              <div className="flex items-center justify-between text-ej-vermilion">
                <span className="text-xs font-bold text-ej-muted uppercase tracking-wider">Low Stock Items</span>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <p className="text-3xl font-black text-ej-vermilion">{stats.lowStockCount}</p>
              <p className="text-[11px] text-ej-muted font-medium">Items with &le; 3 units left</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
