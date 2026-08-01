'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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

const COLUMNS: { key: VendorStatus; label: string; next?: string; nextLabel?: string }[] = [
  { key: 'PAID',      label: 'New / Paid',   next: 'PREPARING', nextLabel: 'Start preparing →' },
  { key: 'PREPARING', label: 'Preparing',    next: 'READY',     nextLabel: 'Mark ready →' },
  { key: 'READY',     label: 'Ready',        next: 'DELIVERED', nextLabel: 'Mark delivered' },
];

/*
 * PAGE: Vendor order queue (Kanban)
 * Screen type: .screen-task
 * Stable endpoint: GET /api/orders?mode=queue
 * Stable action:   POST /api/vendor/status { orderId, status }
 */
export default function VendorQueuePage() {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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
    await fetch('/api/vendor/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status }),
    });
    fetchQueue();
  };

  const deliveredToday = orders.filter(o => o.status === 'DELIVERED');

  return (
    <div id="vendor-queue-page" style={{ minHeight: '100svh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>

      {/* ── Vendor top nav ─────────────────────────────────────────────── */}
      <header
        id="vendor-header"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.25rem', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}
      >
        <div>
          <span lang="ml" style={{ fontFamily: "'Noto Sans Malayalam', sans-serif", fontWeight: 800, color: 'var(--color-accent)', fontSize: '1.2rem' }}>ഇഞ്ചിപ്പുളി</span>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>Vendor console</span>
        </div>
        <nav style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href="/vendor/scan"    className="btn-primary"   style={{ fontSize: '0.8rem', padding: '0.5rem 0.9rem' }}>📷 Scan QR</Link>
          <Link href="/vendor/stock"   className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.5rem 0.9rem' }}>📦 Stock</Link>
          <Link href="/vendor/summary" className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.5rem 0.9rem' }}>📊 Summary</Link>
        </nav>
      </header>

      {/* ── Kanban board ───────────────────────────────────────────────── */}
      <main
        id="kanban-board"
        className="screen-task"
        style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', padding: '1rem', alignItems: 'start' }}
      >
        {loading ? (
          <p style={{ color: 'var(--color-text-muted)', padding: '2rem' }}>Loading queue…</p>
        ) : (
          COLUMNS.map(col => {
            const colOrders = orders.filter(o => o.status === col.key);
            return (
              <div
                key={col.key}
                id={`kanban-col-${col.key.toLowerCase()}`}
                className="card"
                style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
              >
                {/* Column header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>
                  <h2 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700 }}>{col.label}</h2>
                  <span style={{
                    background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.5rem',
                    fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)',
                  }}>{colOrders.length}</span>
                </div>

                {/* Order cards */}
                {colOrders.length === 0 ? (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '1rem 0' }}>— empty —</p>
                ) : (
                  colOrders.map(order => (
                    <article
                      key={order.id}
                      id={`order-card-${order.id}`}
                      style={{
                        background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)', padding: '0.85rem',
                        display: 'flex', flexDirection: 'column', gap: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 900, fontSize: '1.4rem', color: 'var(--color-accent)', letterSpacing: '-0.02em' }}>
                          {order.token}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        {order.items.map(i => (
                          <li key={i.id}>{i.quantity}× {i.menuItem.name}</li>
                        ))}
                      </ul>

                      {col.next && (
                        <button
                          className="btn-primary"
                          style={{ width: '100%', fontSize: '0.8rem', padding: '0.5rem', marginTop: '0.25rem' }}
                          onClick={() => advanceStatus(order.id, col.next!)}
                        >
                          {col.nextLabel}
                        </button>
                      )}
                    </article>
                  ))
                )}
              </div>
            );
          })
        )}

        {/* Delivered column (today, compact) */}
        <div id="kanban-col-delivered" className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)', marginBottom: '0.5rem' }}>
            <h2 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700 }}>Delivered today</h2>
            <span style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-success)' }}>
              {deliveredToday.length}
            </span>
          </div>
          {deliveredToday.slice(0, 10).map(o => (
            <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '0.3rem 0', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
              <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{o.token}</span>
              <span>₹{o.totalAmount}</span>
            </div>
          ))}
          {deliveredToday.length > 10 && (
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>+{deliveredToday.length - 10} more</p>
          )}
        </div>
      </main>
    </div>
  );
}
