'use client';

import { useState, useEffect, use } from 'react';
import { Header } from '@/components/Header';
import Link from 'next/link';
import { LogoWordmark } from '@/components/LogoWordmark';
import { ElephantMascot } from '@/components/ElephantMascot';
import { MuralBackground } from '@/components/MuralBackground';
import { FloralDivider } from '@/components/FloralDivider';
import QRCode from 'qrcode';
import { CheckCircle2, Clock, QrCode, ArrowLeft, RefreshCw } from 'lucide-react';

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

      if (data.id && data.qrSecret && !qrDataUrl) {
        const payload = JSON.stringify({ orderId: data.id, qrSecret: data.qrSecret });
        const url = await QRCode.toDataURL(payload, {
          width: 280,
          margin: 2,
          color: { dark: '#150F2E', light: '#FFFFFF' }
        });
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
    const id = setInterval(fetchOrder, 4_000);
    return () => clearInterval(id);
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-ej-deep flex items-center justify-center text-ej-cream">
      <div className="flex flex-col items-center gap-3">
        <RefreshCw className="w-8 h-8 text-ej-lime animate-spin" />
        <p className="text-sm font-bold text-ej-muted">Retrieving order receipt...</p>
      </div>
    </div>
  );

  if (error || !order) return (
    <div className="min-h-screen bg-ej-deep text-ej-cream">
      <Header />
      <main className="max-w-md mx-auto pt-12 px-4">
        <div className="card p-6 text-center space-y-4">
          <p className="text-ej-vermilion font-bold text-sm">⚠ {error || 'Order not found'}</p>
          <Link href="/" className="btn-primary inline-flex items-center gap-2 text-xs">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Live Menu</span>
          </Link>
        </div>
      </main>
    </div>
  );

  const currentStep = stepIndex(order.status);
  const isCancelledOrExpired = order.status === 'CANCELLED' || order.status === 'EXPIRED';

  return (
    <div id="order-confirmation-page" className="min-h-screen bg-ej-deep text-ej-cream flex flex-col relative overflow-hidden">
      <Header />

      <MuralBackground opacity={0.12} />

      <main className="screen-branding flex-1 max-w-lg w-full mx-auto px-4 py-6 relative z-10 space-y-5">
        {/* Token Ticket */}
        <section
          id="order-ticket"
          className="card p-6 text-center animate-receipt-drop relative border-ej-border/80 shadow-2xl"
          aria-label="Order pickup ticket"
        >
          <div className="flex justify-center mb-3">
            <LogoWordmark size={140} light glow />
          </div>

          <FloralDivider width={120} className="mx-auto opacity-70 mb-4" />

          <div id="order-token" className="space-y-1">
            <p className="text-[11px] font-bold text-ej-muted uppercase tracking-widest">
              Your Pickup Token Number
            </p>
            <p className="text-5xl font-black text-ej-lime tracking-tight leading-none animate-token-reveal drop-shadow-[0_0_20px_rgba(212,255,61,0.3)]">
              {order.token}
            </p>
          </div>

          {/* QR code */}
          <div className="mt-5 flex justify-center">
            {qrDataUrl ? (
              <div
                id="order-qr"
                className="p-3 bg-white rounded-2xl shadow-xl border-4 border-ej-indigo"
              >
                <img
                  src={qrDataUrl}
                  alt={`QR code for order ${order.token}`}
                  width={200}
                  height={200}
                  className="block rounded-lg"
                />
              </div>
            ) : (
              <div className="w-[200px] h-[200px] bg-ej-surface rounded-2xl flex items-center justify-center">
                <span className="text-xs text-ej-muted font-medium">Generating QR Code...</span>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-ej-muted font-medium">
            <QrCode className="w-4 h-4 text-ej-lime" />
            <span>Show this QR to vendor at pickup</span>
          </div>
        </section>

        {isCancelledOrExpired && (
          <section className="card p-5 border-ej-vermilion/40 shadow-xl space-y-2 text-center">
            <p className="text-lg font-black text-ej-vermilion">
              {order.status === 'CANCELLED' ? '❌ Order Cancelled' : '⏰ Order Expired'}
            </p>
            <p className="text-xs text-ej-muted">
              {order.status === 'CANCELLED'
                ? 'This order has been cancelled. If you already paid, contact the vendor for a refund.'
                : 'This order expired because payment was not completed in time. Stock has been released.'}
            </p>
          </section>
        )}

        {/* Live Status Tracker */}
        {!isCancelledOrExpired && (
          <section id="order-status-tracker" className="card p-5 border-ej-border/80 shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-ej-border">
            <h2 className="text-sm font-extrabold text-ej-cream flex items-center gap-2">
              <Clock className="w-4 h-4 text-ej-lime" />
              <span>Live Order Tracker</span>
            </h2>
            <span
              id="order-status-badge"
              className={`text-xs font-black uppercase px-2.5 py-1 rounded-full border ${
                order.status === 'READY'
                  ? 'bg-ej-teal/20 text-ej-teal border-ej-teal/40 animate-pulse'
                  : order.status === 'DELIVERED'
                  ? 'bg-ej-muted/20 text-ej-muted border-ej-border'
                  : 'bg-ej-gold/20 text-ej-gold border-ej-gold/40'
              }`}
            >
              {order.status.replace('_', ' ')}
            </span>
          </div>

          <ol className="space-y-3 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-ej-border">
            {STATUS_STEPS.map((step, i) => {
              const done    = i <= currentStep;
              const current = i === currentStep;
              return (
                <li key={step.key} className="flex items-center gap-3 relative z-10">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all duration-300 ${
                      done
                        ? 'bg-ej-lime text-ej-ink shadow-glow-sm border-2 border-ej-lime'
                        : 'bg-ej-surface text-ej-muted border-2 border-ej-border'
                    }`}
                  >
                    {done ? '✓' : i + 1}
                  </span>
                  <div className="flex-1 min-w-0 flex items-center justify-between">
                    <span
                      className={`text-xs ${
                        current
                          ? 'font-extrabold text-ej-lime text-sm'
                          : done
                          ? 'font-bold text-ej-cream'
                          : 'font-medium text-ej-muted'
                      }`}
                    >
                      {step.label}
                    </span>
                    {current && order.status !== 'DELIVERED' && (
                      <span className="text-[10px] text-ej-lime/80 font-mono animate-pulse flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-ej-lime inline-block" />
                        LIVE
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
        )}

        {/* Receipt */}
        <section id="order-receipt" className="card p-5 border-ej-border/80 shadow-xl space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-ej-border">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ej-muted">Order Itemized Receipt</h2>
            <span className="text-[11px] text-ej-muted font-mono">
              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="space-y-2">
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between text-xs font-medium">
                <span className="text-ej-cream">{item.quantity}× {item.menuItem.name}</span>
                <span className="font-extrabold text-ej-gold">₹{item.priceAtOrderTime * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-ej-border flex justify-between items-center font-black">
            <span className="text-sm text-ej-cream">Total Amount Paid</span>
            <span className="text-base text-ej-lime">₹{order.totalAmount}</span>
          </div>
        </section>

        <div className="text-center pt-2 pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-ej-muted hover:text-ej-lime transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Order more items</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
