'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { VendorDashboardLayout } from '@/components/VendorDashboardLayout';
import {
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Package,
  Boxes,
  ShoppingBag,
  RefreshCw,
  UtensilsCrossed,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  priceAtOrderTime: number;
  menuItem: {
    id: string;
    name: string;
    category?: string;
    price: number;
  };
}

interface Order {
  id: string;
  token: string;
  status: 'PAID' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED' | 'EXPIRED';
  totalAmount: number;
  createdAt: string;
  user?: {
    name: string | null;
    email: string;
    collegeId?: string | null;
  };
  items: OrderItem[];
}

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  isActive: boolean;
  quantityAvailable: number;
  quantityReserved: number;
  netAvailable: number;
}

export default function VendorSummaryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSummaryData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [ordersRes, menuRes] = await Promise.all([
        fetch('/api/orders?mode=queue'),
        fetch('/api/menu?all=true'),
      ]);

      if (ordersRes.ok && menuRes.ok) {
        const ordersData = await ordersRes.json();
        const menuData = await menuRes.json();
        setOrders(ordersData);
        setMenuItems(menuData);
      }
    } catch (err) {
      console.error('Failed to fetch vendor summary:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSummaryData();
    const interval = setInterval(() => fetchSummaryData(), 15_000);
    return () => clearInterval(interval);
  }, []);

  // Compute Metrics
  const stats = useMemo(() => {
    const validOrders = orders.filter(
      (o) => o.status !== 'EXPIRED' && o.status !== 'CANCELLED'
    );
    const revenue = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED');
    const paidOrders = orders.filter((o) => o.status === 'PAID');
    const preparingOrders = orders.filter((o) => o.status === 'PREPARING');
    const readyOrders = orders.filter((o) => o.status === 'READY');
    const activeQueueOrders = orders.filter((o) =>
      ['PAID', 'PREPARING', 'READY'].includes(o.status)
    );

    const lowStock = menuItems.filter((i) => i.netAvailable <= 3 && i.isActive);

    return {
      revenue,
      totalOrders: validOrders.length,
      deliveredCount: deliveredOrders.length,
      activeQueueCount: activeQueueOrders.length,
      lowStockCount: lowStock.length,
      paidCount: paidOrders.length,
      preparingCount: preparingOrders.length,
      readyCount: readyOrders.length,
    };
  }, [orders, menuItems]);

  // Delivered orders for recent list
  const recentDelivered = useMemo(() => {
    return orders
      .filter((o) => o.status === 'DELIVERED')
      .slice(0, 8); // Latest 8 completed orders
  }, [orders]);

  // Aggregate top selling items
  const topSellingItems = useMemo(() => {
    const itemMap = new Map<
      string,
      { id: string; name: string; category: string; quantity: number; revenue: number }
    >();

    orders
      .filter((o) => o.status !== 'CANCELLED' && o.status !== 'EXPIRED')
      .forEach((order) => {
        order.items?.forEach((item) => {
          if (!item.menuItem) return;
          const key = item.menuItem.id || item.menuItem.name;
          const current = itemMap.get(key) || {
            id: key,
            name: item.menuItem.name,
            category: item.menuItem.category || 'General',
            quantity: 0,
            revenue: 0,
          };
          current.quantity += item.quantity;
          current.revenue += item.quantity * (item.priceAtOrderTime || item.menuItem.price || 0);
          itemMap.set(key, current);
        });
      });

    return Array.from(itemMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 6);
  }, [orders]);

  const maxSoldQty = topSellingItems.length > 0 ? topSellingItems[0].quantity : 1;

  return (
    <VendorDashboardLayout
      title="Daily Sales & Stock Summary"
      subtitle="Real-time campus food truck performance analytics & live inventory status"
      action={
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchSummaryData(true)}
            disabled={refreshing}
            className="p-2 rounded-xl bg-ej-surface hover:bg-ej-surface-2 border border-ej-border text-ej-muted hover:text-ej-cream transition flex items-center gap-1.5 text-xs font-semibold"
            title="Refresh analytics data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-ej-lime' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            href="/vendor/stock"
            className="btn-secondary text-xs flex items-center gap-1.5 py-2 px-3.5 shadow-sm"
          >
            <Boxes className="w-3.5 h-3.5 text-ej-lime" />
            <span>Manage Stock →</span>
          </Link>
        </div>
      }
    >
      {/* ─────────────────────────────────────────────────────────────
          1. TOP ROW: 4 KPI STAT TILES
          ───────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Today's Revenue */}
        <div className="card p-4 sm:p-5 border-ej-gold/30 bg-gradient-to-br from-ej-indigo/90 to-ej-surface hover:border-ej-gold/60 transition-all shadow-md group">
          <div className="flex items-center justify-between text-ej-gold">
            <span className="text-[11px] sm:text-xs font-bold text-ej-muted uppercase tracking-wider">
              Today's Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-ej-gold/15 flex items-center justify-center group-hover:scale-105 transition-transform">
              <IndianRupee className="w-4 h-4 text-ej-gold" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-ej-gold tracking-tight">
              ₹{stats.revenue.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-ej-muted mt-1 font-medium">
              From {stats.totalOrders} total order{stats.totalOrders === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        {/* Metric 2: Orders Completed */}
        <div className="card p-4 sm:p-5 border-ej-teal/30 bg-gradient-to-br from-ej-indigo/90 to-ej-surface hover:border-ej-teal/60 transition-all shadow-md group">
          <div className="flex items-center justify-between text-ej-teal">
            <span className="text-[11px] sm:text-xs font-bold text-ej-muted uppercase tracking-wider">
              Completed
            </span>
            <div className="w-8 h-8 rounded-lg bg-ej-teal/15 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-4 h-4 text-ej-teal" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-ej-teal tracking-tight">
              {stats.deliveredCount}
            </p>
            <p className="text-[11px] text-ej-muted mt-1 font-medium">
              Delivered &amp; handed off
            </p>
          </div>
        </div>

        {/* Metric 3: Active in Queue */}
        <div className="card p-4 sm:p-5 border-ej-lime/30 bg-gradient-to-br from-ej-indigo/90 to-ej-surface hover:border-ej-lime/60 transition-all shadow-md group">
          <div className="flex items-center justify-between text-ej-lime">
            <span className="text-[11px] sm:text-xs font-bold text-ej-muted uppercase tracking-wider">
              Active in Queue
            </span>
            <div className="w-8 h-8 rounded-lg bg-ej-lime/15 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4 text-ej-lime" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-ej-lime tracking-tight">
              {stats.activeQueueCount}
            </p>
            <p className="text-[11px] text-ej-muted mt-1 font-medium">
              Paid, cooking, or ready
            </p>
          </div>
        </div>

        {/* Metric 4: Low Stock Items */}
        <div className="card p-4 sm:p-5 border-ej-vermilion/30 bg-gradient-to-br from-ej-indigo/90 to-ej-surface hover:border-ej-vermilion/60 transition-all shadow-md group">
          <div className="flex items-center justify-between text-ej-vermilion">
            <span className="text-[11px] sm:text-xs font-bold text-ej-muted uppercase tracking-wider">
              Low Stock Items
            </span>
            <div className="w-8 h-8 rounded-lg bg-ej-vermilion/15 flex items-center justify-center group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-4 h-4 text-ej-vermilion" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-ej-vermilion tracking-tight">
              {stats.lowStockCount}
            </p>
            <p className="text-[11px] text-ej-muted mt-1 font-medium">
              Items with &le; 3 portions left
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. MIDDLE ROW: AGGREGATE ORDER FLOW PROGRESS CARD
          ───────────────────────────────────────────────────────────── */}
      <section className="card p-5 sm:p-6 border-ej-border/80 bg-ej-indigo/80 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ej-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-ej-lime" />
            <h2 className="text-sm sm:text-base font-extrabold text-ej-cream">
              Today's Live Order Flow Pipeline
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs text-ej-muted">
            <span>
              Total Pipeline:{' '}
              <strong className="text-ej-cream font-bold">{stats.totalOrders}</strong>
            </span>
            <span className="text-ej-border">•</span>
            <Link
              href="/vendor/queue"
              className="text-ej-lime hover:underline font-bold inline-flex items-center gap-1"
            >
              <span>View Kitchen Board</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 4 Pipeline Stages */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Stage 1: New / Paid */}
          <div className="p-3.5 rounded-xl bg-ej-surface/70 border border-ej-gold/30 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-ej-gold">
                Step 1
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-ej-gold/20 text-ej-gold">
                {stats.paidCount}
              </span>
            </div>
            <div className="mt-2.5">
              <h3 className="text-xs font-black text-ej-cream">New / Paid</h3>
              <p className="text-[10px] text-ej-muted mt-0.5">Awaiting preparation</p>
            </div>
          </div>

          {/* Stage 2: Preparing */}
          <div className="p-3.5 rounded-xl bg-ej-surface/70 border border-blue-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                Step 2
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-400">
                {stats.preparingCount}
              </span>
            </div>
            <div className="mt-2.5">
              <h3 className="text-xs font-black text-ej-cream">Preparing</h3>
              <p className="text-[10px] text-ej-muted mt-0.5">Currently cooking</p>
            </div>
          </div>

          {/* Stage 3: Ready for Pickup */}
          <div className="p-3.5 rounded-xl bg-ej-surface/70 border border-ej-lime/30 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-ej-lime">
                Step 3
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-ej-lime/20 text-ej-lime">
                {stats.readyCount}
              </span>
            </div>
            <div className="mt-2.5">
              <h3 className="text-xs font-black text-ej-cream">Ready for Pickup</h3>
              <p className="text-[10px] text-ej-muted mt-0.5">Waiting for student QR</p>
            </div>
          </div>

          {/* Stage 4: Delivered */}
          <div className="p-3.5 rounded-xl bg-ej-surface/70 border border-ej-teal/30 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-ej-teal">
                Step 4
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-ej-teal/20 text-ej-teal">
                {stats.deliveredCount}
              </span>
            </div>
            <div className="mt-2.5">
              <h3 className="text-xs font-black text-ej-cream">Delivered</h3>
              <p className="text-[10px] text-ej-muted mt-0.5">Order completed</p>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar Ratio */}
        {stats.totalOrders > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="w-full h-2.5 bg-ej-deep rounded-full overflow-hidden flex">
              <div
                style={{ width: `${(stats.paidCount / stats.totalOrders) * 100}%` }}
                className="bg-ej-gold transition-all duration-500"
                title={`New / Paid: ${stats.paidCount}`}
              />
              <div
                style={{ width: `${(stats.preparingCount / stats.totalOrders) * 100}%` }}
                className="bg-blue-400 transition-all duration-500"
                title={`Preparing: ${stats.preparingCount}`}
              />
              <div
                style={{ width: `${(stats.readyCount / stats.totalOrders) * 100}%` }}
                className="bg-ej-lime transition-all duration-500"
                title={`Ready: ${stats.readyCount}`}
              />
              <div
                style={{ width: `${(stats.deliveredCount / stats.totalOrders) * 100}%` }}
                className="bg-ej-teal transition-all duration-500"
                title={`Delivered: ${stats.deliveredCount}`}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-ej-muted">
              <span>Fulfillment completion rate:</span>
              <span className="font-bold text-ej-teal">
                {Math.round((stats.deliveredCount / stats.totalOrders) * 100)}% Completed
              </span>
            </div>
          </div>
        )}
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. TWO-COLUMN SECTION BELOW (stacked on mobile)
          ───────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: Recent Completed Orders */}
        <div className="card p-5 sm:p-6 border-ej-border/80 bg-ej-indigo/80 flex flex-col justify-between shadow-lg">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-ej-border/60">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-ej-teal" />
                <h2 className="text-sm sm:text-base font-extrabold text-ej-cream">
                  Recent Completed Orders
                </h2>
              </div>
              <span className="text-[11px] font-bold text-ej-teal bg-ej-teal/15 px-2 py-0.5 rounded-full border border-ej-teal/30">
                {recentDelivered.length} recent
              </span>
            </div>

            {loading ? (
              <div className="space-y-2 py-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-ej-surface/70 rounded-xl skeleton" />
                ))}
              </div>
            ) : recentDelivered.length === 0 ? (
              <div className="py-12 text-center space-y-2 border border-dashed border-ej-border/60 rounded-xl my-2">
                <ShoppingBag className="w-8 h-8 text-ej-muted mx-auto opacity-50" />
                <p className="text-xs font-bold text-ej-cream">No orders delivered yet today</p>
                <p className="text-[11px] text-ej-muted max-w-xs mx-auto">
                  When student QR codes are scanned at the pickup window, completed orders will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-ej-border/40 space-y-1">
                {recentDelivered.map((order) => (
                  <div
                    key={order.id}
                    className="pt-2.5 pb-2.5 flex items-center justify-between gap-3 hover:bg-ej-surface/40 px-2 rounded-xl transition"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-ej-lime">
                          {order.token}
                        </span>
                        {order.user?.name && (
                          <span className="text-[11px] text-ej-cream font-medium truncate max-w-[120px] sm:max-w-[160px]">
                            {order.user.name}
                          </span>
                        )}
                        <span className="text-[10px] text-ej-muted font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3 text-ej-muted" />
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-ej-muted truncate">
                        {order.items
                          ?.map((i) => `${i.quantity}× ${i.menuItem?.name || 'Item'}`)
                          .join(', ')}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="text-xs sm:text-sm font-black text-ej-gold">
                        ₹{order.totalAmount}
                      </span>
                      <span className="block text-[9px] font-bold text-ej-teal uppercase tracking-wider">
                        Delivered
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-ej-border/60 mt-2">
            <Link
              href="/vendor/scan"
              className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-ej-surface hover:bg-ej-surface-2 border border-ej-border text-ej-cream flex items-center justify-center gap-1.5 transition"
            >
              <span>Verify &amp; Hand Off Next Order</span>
              <ArrowRight className="w-3.5 h-3.5 text-ej-lime" />
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: Top-Selling Items Today */}
        <div className="card p-5 sm:p-6 border-ej-border/80 bg-ej-indigo/80 flex flex-col justify-between shadow-lg">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-ej-border/60">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-ej-gold" />
                <h2 className="text-sm sm:text-base font-extrabold text-ej-cream">
                  Top-Selling Items Today
                </h2>
              </div>
              <span className="text-[11px] font-bold text-ej-gold bg-ej-gold/15 px-2 py-0.5 rounded-full border border-ej-gold/30">
                Ranked by volume
              </span>
            </div>

            {loading ? (
              <div className="space-y-2 py-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-ej-surface/70 rounded-xl skeleton" />
                ))}
              </div>
            ) : topSellingItems.length === 0 ? (
              <div className="py-12 text-center space-y-2 border border-dashed border-ej-border/60 rounded-xl my-2">
                <UtensilsCrossed className="w-8 h-8 text-ej-muted mx-auto opacity-50" />
                <p className="text-xs font-bold text-ej-cream">No items sold yet today</p>
                <p className="text-[11px] text-ej-muted max-w-xs mx-auto">
                  As incoming orders are confirmed, this table automatically highlights today&apos;s campus favorites.
                </p>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                {topSellingItems.map((item, index) => {
                  const percent = Math.round((item.quantity / maxSoldQty) * 100);
                  const isGold = index === 0;
                  const isSilver = index === 1;
                  const isBronze = index === 2;

                  return (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-ej-surface/60 border border-ej-border/60 hover:border-ej-gold/40 transition space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                              isGold
                                ? 'bg-ej-gold text-ej-ink shadow-glow-sm'
                                : isSilver
                                ? 'bg-ej-teal text-ej-ink'
                                : isBronze
                                ? 'bg-ej-lime text-ej-ink'
                                : 'bg-ej-surface text-ej-muted border border-ej-border'
                            }`}
                          >
                            #{index + 1}
                          </span>
                          <span className="text-xs font-bold text-ej-cream truncate">
                            {item.name}
                          </span>
                          <span className="text-[10px] font-medium text-ej-muted px-1.5 py-0.2 rounded bg-ej-deep border border-ej-border/40 shrink-0">
                            {item.category}
                          </span>
                        </div>

                        <div className="shrink-0 text-right">
                          <span className="text-xs font-black text-ej-gold">
                            ₹{item.revenue.toLocaleString('en-IN')}
                          </span>
                          <span className="block text-[10px] font-bold text-ej-lime">
                            {item.quantity} sold
                          </span>
                        </div>
                      </div>

                      {/* Mini visual volume bar */}
                      <div className="w-full bg-ej-deep h-1.5 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${percent}%` }}
                          className={`h-full rounded-full ${
                            isGold
                              ? 'bg-ej-gold'
                              : isSilver
                              ? 'bg-ej-teal'
                              : isBronze
                              ? 'bg-ej-lime'
                              : 'bg-ej-muted'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-ej-border/60 mt-2">
            <Link
              href="/vendor/stock"
              className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-ej-surface hover:bg-ej-surface-2 border border-ej-border text-ej-cream flex items-center justify-center gap-1.5 transition"
            >
              <span>Adjust Stock &amp; Inventory Quantities</span>
              <ArrowRight className="w-3.5 h-3.5 text-ej-gold" />
            </Link>
          </div>
        </div>
      </section>
    </VendorDashboardLayout>
  );
}
