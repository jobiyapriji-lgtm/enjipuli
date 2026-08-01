'use client';

import { useEffect, useState } from 'react';
import { VendorHeader } from '@/components/VendorHeader';
import { Clock, CheckCircle2, ArrowRight, RefreshCw, Layers } from 'lucide-react';

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

const COLUMNS: { key: VendorStatus; label: string; badgeColor: string; next?: string; nextLabel?: string; btnClass: string }[] = [
  {
    key: 'PAID',
    label: 'New / Paid',
    badgeColor: 'bg-ej-gold/20 text-ej-gold border-ej-gold/40',
    next: 'PREPARING',
    nextLabel: 'Start Preparing →',
    btnClass: 'btn-gold',
  },
  {
    key: 'PREPARING',
    label: 'Preparing',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    next: 'READY',
    nextLabel: 'Mark Ready →',
    btnClass: 'bg-ej-teal hover:bg-ej-teal-dim text-ej-ink font-extrabold shadow-glow-sm',
  },
  {
    key: 'READY',
    label: 'Ready for Pickup',
    badgeColor: 'bg-ej-teal/20 text-ej-teal border-ej-teal/40',
    next: 'DELIVERED',
    nextLabel: 'Mark Delivered',
    btnClass: 'btn-secondary text-xs',
  },
];

export default function VendorQueuePage() {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/orders?mode=queue');
      if (res.ok) setOrders(await res.json());
    } catch { /* silent poll error */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchQueue();
    const id = setInterval(fetchQueue, 5_000);
    return () => clearInterval(id);
  }, []);

  const advanceStatus = async (orderId: string, status: string) => {
    setUpdatingId(orderId);
    try {
      await fetch('/api/vendor/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      });
      fetchQueue();
    } finally {
      setUpdatingId(null);
    }
  };

  const deliveredToday = orders.filter(o => o.status === 'DELIVERED');

  return (
    <div id="vendor-queue-page" className="min-h-screen bg-ej-deep text-ej-cream flex flex-col">
      <VendorHeader />

      <main
        id="kanban-board"
        className="screen-task flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 items-start"
      >
        {loading ? (
          <div className="col-span-full py-12 flex items-center justify-center gap-2 text-ej-muted text-sm font-bold">
            <RefreshCw className="w-5 h-5 animate-spin text-ej-lime" />
            <span>Loading live order queue…</span>
          </div>
        ) : (
          COLUMNS.map(col => {
            const colOrders = orders.filter(o => o.status === col.key);
            return (
              <div
                key={col.key}
                id={`kanban-col-${col.key.toLowerCase()}`}
                className="card p-4 flex flex-col gap-3 border-ej-border/80 bg-ej-indigo/80"
              >
                {/* Column header */}
                <div className="flex items-center justify-between pb-3 border-b border-ej-border">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-extrabold text-ej-cream">{col.label}</h2>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${col.badgeColor}`}>
                    {colOrders.length}
                  </span>
                </div>

                {/* Order cards */}
                {colOrders.length === 0 ? (
                  <div className="py-8 text-center text-ej-muted/60 text-xs font-medium border border-dashed border-ej-border/60 rounded-xl">
                    — No orders —
                  </div>
                ) : (
                  colOrders.map(order => (
                    <article
                      key={order.id}
                      id={`order-card-${order.id}`}
                      className="p-3.5 bg-ej-surface border border-ej-border hover:border-ej-lime/50 rounded-xl flex flex-col gap-2.5 transition-all shadow-md animate-kanban-slide"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-black text-ej-lime tracking-tight drop-shadow-[0_0_8px_rgba(212,255,61,0.2)]">
                          {order.token}
                        </span>
                        <span className="text-[11px] font-mono text-ej-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <ul className="space-y-1 my-1 text-xs text-ej-cream/90 font-medium border-y border-ej-border/50 py-2">
                        {order.items.map(i => (
                          <li key={i.id} className="flex justify-between">
                            <span><strong className="text-ej-gold font-bold">{i.quantity}×</strong> {i.menuItem.name}</span>
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
                    </article>
                  ))
                )}
              </div>
            );
          })
        )}

        {/* Delivered column */}
        <div id="kanban-col-delivered" className="card p-4 border-ej-border/80 bg-ej-indigo/60">
          <div className="flex items-center justify-between pb-3 border-b border-ej-border mb-3">
            <h2 className="text-sm font-extrabold text-ej-cream">Delivered Today</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-ej-teal/20 text-ej-teal border border-ej-teal/40">
              {deliveredToday.length}
            </span>
          </div>

          {deliveredToday.length === 0 ? (
            <div className="py-8 text-center text-ej-muted/60 text-xs font-medium border border-dashed border-ej-border/60 rounded-xl">
              — None yet —
            </div>
          ) : (
            <div className="space-y-2">
              {deliveredToday.slice(0, 10).map(o => (
                <div key={o.id} className="flex items-center justify-between text-xs py-1.5 border-b border-ej-border/40 text-ej-muted">
                  <span className="font-bold text-ej-cream">{o.token}</span>
                  <span className="font-mono text-ej-gold">₹{o.totalAmount}</span>
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
      </main>
    </div>
  );
}
