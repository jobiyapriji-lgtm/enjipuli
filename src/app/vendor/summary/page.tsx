'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, ShoppingBag, AlertTriangle, IndianRupee } from 'lucide-react';

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
            .filter((o: any) => o.status !== 'EXPIRED' && o.status !== 'CANCELLED' && o.status !== 'PENDING_PAYMENT')
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
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-16">
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <Link href="/vendor/queue" className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-amber-400">Daily Sales & Stock Summary</h1>
            <p className="text-xs text-slate-400">Today's campus food truck performance</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-amber-400">
                <span className="text-xs font-bold text-slate-400">Total Revenue</span>
                <IndianRupee className="w-5 h-5" />
              </div>
              <p className="text-3xl font-black text-amber-400">₹{stats.totalRevenue}</p>
              <p className="text-[11px] text-slate-400">Paid & fulfilled today</p>
            </div>

            <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-blue-400">
                <span className="text-xs font-bold text-slate-400">Total Orders</span>
                <ShoppingBag className="w-5 h-5" />
              </div>
              <p className="text-3xl font-black text-white">{stats.totalOrders}</p>
              <p className="text-[11px] text-slate-400">Received today</p>
            </div>

            <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-emerald-400">
                <span className="text-xs font-bold text-slate-400">Delivered Orders</span>
                <TrendingUp className="w-5 h-5" />
              </div>
              <p className="text-3xl font-black text-emerald-400">{stats.deliveredOrders}</p>
              <p className="text-[11px] text-slate-400">Successfully scanned & picked up</p>
            </div>

            <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-red-400">
                <span className="text-xs font-bold text-slate-400">Low Stock Items</span>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <p className="text-3xl font-black text-red-400">{stats.lowStockCount}</p>
              <p className="text-[11px] text-slate-400 font-semibold">Items with &le; 3 units left</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
