'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { VendorDashboardLayout } from '@/components/VendorDashboardLayout';
import {
  Clock,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  QrCode,
  Flame,
  ChefHat,
  BellRing,
  PackageCheck,
  User,
} from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  menuItem: { name: string };
}

interface Order {
  id: string;
  token: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  user?: { name: string | null; email: string };
  items: OrderItem[];
}

type VendorStatus = 'PAID' | 'PREPARING' | 'READY';

const COLUMNS: {
  key: VendorStatus;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeColor: string;
  next?: string;
  nextLabel?: string;
  btnClass: string;
}[] = [
  {
    key: 'PAID',
    label: 'New / Paid',
    icon: Flame,
    badgeColor: 'bg-ej-gold/20 text-ej-gold border-ej-gold/40',
    next: 'PREPARING',
    nextLabel: 'Start Preparing →',
    btnClass: 'btn-gold',
  },
  {
    key: 'PREPARING',
    label: 'Preparing',
    icon: ChefHat,
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    next: 'READY',
    nextLabel: 'Mark Ready →',
    btnClass: 'bg-ej-teal hover:bg-ej-teal-dim text-ej-ink font-extrabold shadow-glow-sm',
  },
  {
    key: 'READY',
    label: 'Ready for Pickup',
    icon: BellRing,
    badgeColor: 'bg-ej-lime/20 text-ej-lime border-ej-lime/40',
    btnClass: 'btn-secondary text-xs',
  },
];

export default function VendorQueuePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchQueue = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch('/api/orders?mode=queue');
      if (res.ok) setOrders(await res.json());
    } catch {
      /* silent poll error */
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const id = setInterval(() => fetchQueue(), 5_000);
    return () => clearInterval(id);
  }, []);

  const advanceStatus = async (orderId: string, status: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch('/api/vendor/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to update order status.');
      }
      fetchQueue();
    } finally {
      setUpdatingId(null);
    }
  };

  const deliveredToday = useMemo(() => orders.filter((o) => o.status === 'DELIVERED'), [orders]);
  const paidOrders = useMemo(() => orders.filter((o) => o.status === 'PAID'), [orders]);
  const preparingOrders = useMemo(() => orders.filter((o) => o.status === 'PREPARING'), [orders]);
  const readyOrders = useMemo(() => orders.filter((o) => o.status === 'READY'), [orders]);
  const activeCount = paidOrders.length + preparingOrders.length + readyOrders.length;

  return (
    <VendorDashboardLayout
      title="Live Kitchen Queue"
      subtitle="Real-time order ticket board & kitchen prep dispatch"
      action={
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchQueue(true)}
            disabled={refreshing}
            className="p-2 rounded-xl bg-ej-surface hover:bg-ej-surface-2 border border-ej-border text-ej-muted hover:text-ej-cream transition flex items-center gap-1.5 text-xs font-semibold"
            title="Refresh queue"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-ej-lime' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            href="/vendor/scan"
            className="btn-primary text-xs flex items-center gap-1.5 py-2 px-3.5 shadow-sm"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan a Pickup →</span>
          </Link>
        </div>
      }
    >
      {/* ─────────────────────────────────────────────────────────────
          1. TOP KPI SUMMARY STRIP
          ───────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="card p-3.5 sm:p-4 border-ej-border bg-ej-indigo/80 flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-ej-muted uppercase tracking-wider">
              Total in Queue
            </p>
            <p className="text-xl sm:text-2xl font-black text-ej-lime mt-1">{activeCount}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-ej-lime/15 text-ej-lime flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="card p-3.5 sm:p-4 border-ej-border bg-ej-indigo/80 flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-ej-muted uppercase tracking-wider">
              New / Paid
            </p>
            <p className="text-xl sm:text-2xl font-black text-ej-gold mt-1">{paidOrders.length}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-ej-gold/15 text-ej-gold flex items-center justify-center">
            <Flame className="w-4 h-4" />
          </div>
        </div>

        <div className="card p-3.5 sm:p-4 border-ej-border bg-ej-indigo/80 flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-ej-muted uppercase tracking-wider">
              Cooking Now
            </p>
            <p className="text-xl sm:text-2xl font-black text-blue-400 mt-1">{preparingOrders.length}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
            <ChefHat className="w-4 h-4" />
          </div>
        </div>

        <div className="card p-3.5 sm:p-4 border-ej-border bg-ej-indigo/80 flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-ej-muted uppercase tracking-wider">
              Ready / Call
            </p>
            <p className="text-xl sm:text-2xl font-black text-ej-teal mt-1">{readyOrders.length}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-ej-teal/15 text-ej-teal flex items-center justify-center">
            <BellRing className="w-4 h-4" />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. KANBAN TICKET BOARD (4 columns)
          ───────────────────────────────────────────────────────────── */}
      <section
        id="kanban-board"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start"
      >
        {loading ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center gap-3 text-ej-muted text-sm font-bold">
            <RefreshCw className="w-6 h-6 animate-spin text-ej-lime" />
            <span>Loading live order queue…</span>
          </div>
        ) : (
          <>
            {COLUMNS.map((col) => {
              const colOrders = orders.filter((o) => o.status === col.key);
              const ColIcon = col.icon;
              return (
                <div
                  key={col.key}
                  id={`kanban-col-${col.key.toLowerCase()}`}
                  className="card p-4 flex flex-col gap-3 border-ej-border/80 bg-ej-indigo/80 shadow-md"
                >
                  {/* Column header */}
                  <div className="flex items-center justify-between pb-3 border-b border-ej-border">
                    <div className="flex items-center gap-2">
                      <ColIcon className="w-4 h-4 text-ej-muted" />
                      <h2 className="text-sm font-extrabold text-ej-cream">{col.label}</h2>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${col.badgeColor}`}
                    >
                      {colOrders.length}
                    </span>
                  </div>

                  {/* Order cards */}
                  {colOrders.length === 0 ? (
                    <div className="py-10 text-center text-ej-muted/60 text-xs font-medium border border-dashed border-ej-border/60 rounded-xl">
                      — No orders —
                    </div>
                  ) : (
                    colOrders.map((order) => (
                      <article
                        key={order.id}
                        id={`order-card-${order.id}`}
                        className="p-3.5 bg-ej-surface border border-ej-border hover:border-ej-lime/50 rounded-xl flex flex-col gap-2.5 transition-all shadow-md"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-black text-ej-lime tracking-tight drop-shadow-[0_0_8px_rgba(212,255,61,0.2)]">
                            {order.token}
                          </span>
                          <span className="text-[11px] font-mono text-ej-muted flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {order.user?.name && (
                          <div className="flex items-center gap-1.5 text-[11px] text-ej-muted font-medium truncate">
                            <User className="w-3 h-3 shrink-0" />
                            <span className="truncate">{order.user.name}</span>
                          </div>
                        )}

                        <ul className="space-y-1 my-1 text-xs text-ej-cream/90 font-medium border-y border-ej-border/50 py-2">
                          {order.items.map((i) => (
                            <li key={i.id} className="flex justify-between">
                              <span>
                                <strong className="text-ej-gold font-bold">{i.quantity}×</strong>{' '}
                                {i.menuItem.name}
                              </span>
                            </li>
                          ))}
                        </ul>

                        {col.next && (
                          <button
                            className={`w-full py-2 text-xs font-extrabold rounded-lg transition active:scale-98 flex items-center justify-center gap-1 ${col.btnClass}`}
                            onClick={() => advanceStatus(order.id, col.next!)}
                            disabled={updatingId === order.id}
                          >
                            {updatingId === order.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <span>{col.nextLabel}</span>
                            )}
                          </button>
                        )}

                        {col.key === 'READY' && (
                          <Link
                            href="/vendor/scan"
                            className="w-full py-2 text-xs font-extrabold rounded-lg transition flex items-center justify-center gap-1 btn-secondary"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Scan QR to Deliver</span>
                          </Link>
                        )}
                      </article>
                    ))
                  )}
                </div>
              );
            })}

            {/* Delivered column */}
            <div
              id="kanban-col-delivered"
              className="card p-4 border-ej-border/80 bg-ej-indigo/60 shadow-md"
            >
              <div className="flex items-center justify-between pb-3 border-b border-ej-border mb-3">
                <div className="flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-ej-teal" />
                  <h2 className="text-sm font-extrabold text-ej-cream">Delivered Today</h2>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-ej-teal/20 text-ej-teal border border-ej-teal/40">
                  {deliveredToday.length}
                </span>
              </div>

              {deliveredToday.length === 0 ? (
                <div className="py-10 text-center text-ej-muted/60 text-xs font-medium border border-dashed border-ej-border/60 rounded-xl">
                  — None yet —
                </div>
              ) : (
                <div className="space-y-2">
                  {deliveredToday.slice(0, 10).map((o) => (
                    <div
                      key={o.id}
                      className="flex items-center justify-between text-xs py-1.5 border-b border-ej-border/40 text-ej-muted hover:text-ej-cream transition"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-ej-lime">{o.token}</span>
                        {o.user?.name && (
                          <span className="text-[10px] text-ej-muted truncate max-w-[80px]">
                            {o.user.name}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-ej-gold font-bold">₹{o.totalAmount}</span>
                    </div>
                  ))}
                  {deliveredToday.length > 10 && (
                    <p className="text-[11px] text-ej-muted text-center pt-1 font-semibold">
                      +{deliveredToday.length - 10} more delivered
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </VendorDashboardLayout>
  );
}
