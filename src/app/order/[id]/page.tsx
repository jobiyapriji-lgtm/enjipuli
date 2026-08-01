'use client';

import { useState, useEffect, use } from 'react';
import { Header } from '@/components/Header';
import Link from 'next/link';
import { LogoWordmark } from '@/components/LogoWordmark';
import QRCode from 'qrcode';

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface OrderItem {
  id: string;
  quantity: number;
  priceAtOrderTime: number;
  menuItem: { name: string; category: string };
}

interface OrderDetails {
  id: string;
  token: string;
  qrSecret: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

const STATUS_STEPS = [
  { key: 'PAID',      label: 'Order received & paid' },
  { key: 'PREPARING', label: 'Food being prepared' },
  { key: 'READY',     label: 'Ready for pickup!' },
  { key: 'DELIVERED', label: 'Delivered ✓' },
];

function stepIndex(status: string) {
  const i = STATUS_STEPS.findIndex(s => s.key === status);
  return i === -1 ? 0 : i;
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE: Order confirmation + live tracker
   Screen type: .screen-branding  (decoration-heavy per Stitch brief)
   ═══════════════════════════════════════════════════════════════════════════ */
export default function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [order, setOrder]         = useState<OrderDetails | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || `Order not found (${res.status})`);
      }
      const data: OrderDetails = await res.json();
      setOrder(data);
      setError(null);

      // Build QR once token is available
      if (data.id && data.qrSecret && !qrDataUrl) {
        const payload = JSON.stringify({ orderId: data.id, qrSecret: data.qrSecret });
        const url = await QRCode.toDataURL(payload, { width: 280, margin: 2, color: { dark: '#0f0e1a', light: '#ffffff' } });
        setQrDataUrl(url);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // Poll every 4 s for status updates
    const id = setInterval(fetchOrder, 4_000);
    return () => clearInterval(id);
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── Loading ──────────────────────────────────────────────────────────── */
  if (loading) return (
    <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
      <p style={{ color: 'var(--color-text-muted)' }}>Loading order…</p>
    </div>
  );

  /* ─── Error ────────────────────────────────────────────────────────────── */
  if (error || !order) return (
    <div style={{ minHeight: '100svh', background: 'var(--color-bg)' }}>
      <Header />
      <main style={{ maxWidth: 480, margin: '3rem auto', padding: '1.5rem' }}>
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-error)', fontWeight: 600 }}>⚠ {error || 'Order not found'}</p>
          <Link href="/" style={{ color: 'var(--color-accent)', display: 'block', marginTop: '1rem', fontSize: '0.875rem' }}>
            ← Back to menu
          </Link>
        </div>
      </main>
    </div>
  );

  const currentStep = stepIndex(order.status);

  return (
    <div id="order-confirmation-page">
      <Header />

      {/*
       * screen-branding: Stitch applies richer decoration here
       * (glow effects, brand-colour backgrounds, etc.)
       */}
      <main className="screen-branding" style={{ maxWidth: 520, margin: '0 auto', padding: '1.5rem 1rem' }}>

        {/* ── Token ticket ───────────────────────────────────────────────── */}
        <section
          id="order-ticket"
          className="card"
          style={{ padding: '2rem', textAlign: 'center', marginBottom: '1rem' }}
          aria-label="Order pickup ticket"
        >
          <LogoWordmark size={110} light />

          <div id="order-token" style={{ margin: '1.5rem 0 0.5rem' }}>
            <p style={{ margin: 0, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>
              Your pickup token
            </p>
            <p style={{ margin: '0.3rem 0 0', fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--color-accent)', lineHeight: 1 }}>
              {order.token}
            </p>
          </div>

          {/* QR code */}
          {qrDataUrl ? (
            <div id="order-qr" style={{ display: 'inline-block', padding: '0.75rem', background: '#fff', borderRadius: 'var(--radius-lg)', marginTop: '1rem' }}>
              <img src={qrDataUrl} alt={`QR code for order ${order.token}`} width={200} height={200} style={{ display: 'block' }} />
            </div>
          ) : (
            <div style={{ width: 200, height: 200, background: 'var(--color-surface-2)', borderRadius: 'var(--radius-lg)', margin: '1rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Generating QR…</span>
            </div>
          )}

          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: '0.75rem' }}>
            Show this QR to the vendor at pickup.
          </p>
        </section>

        {/* ── Live status tracker ────────────────────────────────────────── */}
        <section id="order-status-tracker" className="card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>Order status</h2>
            <span
              id="order-status-badge"
              className={`status-${order.status}`}
              style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              {order.status.replace('_', ' ')}
            </span>
          </div>

          <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {STATUS_STEPS.map((step, i) => {
              const done    = i <= currentStep;
              const current = i === currentStep;
              return (
                <li key={step.key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{
                    width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: done ? 'var(--color-accent)' : 'var(--color-surface-2)',
                    border: `2px solid ${done ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    color: done ? 'var(--color-text-inverse)' : 'var(--color-text-muted)',
                    fontWeight: 700, fontSize: '0.75rem', flexShrink: 0,
                    boxShadow: current ? 'var(--shadow-glow)' : 'none',
                  }}>
                    {done ? '✓' : i + 1}
                  </span>
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: current ? 700 : 400,
                    color: current ? 'var(--color-text-primary)' : done ? 'var(--color-text-muted)' : 'var(--color-text-muted)',
                  }}>
                    {step.label}
                  </span>
                  {current && order.status !== 'DELIVERED' && (
                    <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                      live ↻
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        {/* ── Receipt ───────────────────────────────────────────────────── */}
        <section id="order-receipt" className="card" style={{ padding: '1.25rem' }}>
          <h2 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', fontWeight: 700 }}>Receipt</h2>
          {order.items.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.25rem 0', borderBottom: '1px solid var(--color-border)' }}>
              <span>{item.quantity}× {item.menuItem.name}</span>
              <span style={{ fontWeight: 600 }}>₹{item.priceAtOrderTime * item.quantity}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontWeight: 800, fontSize: '1rem' }}>
            <span>Total paid</span>
            <span style={{ color: 'var(--color-accent)' }}>₹{order.totalAmount}</span>
          </div>
        </section>

        <Link href="/" style={{ display: 'block', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '1.5rem' }}>
          ← Order more
        </Link>
      </main>
    </div>
  );
}
