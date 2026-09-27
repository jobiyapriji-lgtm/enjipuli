'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Header } from '@/components/Header';
import { ElephantMascot } from '@/components/ElephantMascot';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Clock, User, ChevronRight } from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  priceAtOrderTime: number;
  menuItem: { name: string };
}

interface Order {
  id: string;
  token: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

export default function OrderHistoryPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const sessionUser = session?.user as any;
  const userEmail = sessionUser?.email || '';
  const emailPrefix = userEmail ? userEmail.split('@')[0].toLowerCase() : '';
  const hasRealName = Boolean(sessionUser?.name && sessionUser.name.trim().toLowerCase() !== emailPrefix);
  const displayName = hasRealName ? sessionUser.name.trim() : (sessionUser?.role === 'VENDOR' ? 'Vendor Account' : 'Student Account');
  const userInitial = hasRealName ? sessionUser.name.trim()[0].toUpperCase() : '';

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-ej-deep text-ej-cream pb-16 flex flex-col">
      <Header />

      <main className="max-w-3xl w-full mx-auto px-4 pt-6 space-y-6 flex-1">
        {/* Account Holder Profile Summary Banner */}
        {session && (
          <div className="card p-4 sm:p-5 border-ej-border/80 bg-gradient-to-r from-ej-indigo/80 via-ej-surface/70 to-ej-indigo/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-ej-lime via-ej-teal to-ej-gold text-ej-ink font-black flex items-center justify-center text-lg shadow-glow-sm shrink-0">
                {userInitial || <User className="w-6 h-6" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-extrabold text-ej-cream truncate">{displayName}</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-ej-lime/15 text-ej-lime border border-ej-lime/30">
                    {sessionUser?.role === 'VENDOR' ? 'Vendor' : 'Student'}
                  </span>
                </div>
                <p className="text-xs text-ej-muted font-mono truncate">{userEmail}</p>
              </div>
            </div>

            <Link
              href="/profile"
              className="text-xs font-bold text-ej-lime hover:underline flex items-center gap-1.5 self-end sm:self-center bg-ej-lime/10 px-3 py-1.5 rounded-xl border border-ej-lime/30 hover:bg-ej-lime/20 transition"
            >
              <User className="w-3.5 h-3.5" />
              <span>View Account Profile</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        <div>
          <h1 className="text-2xl font-extrabold text-ej-cream">My Orders</h1>
          <p className="text-xs text-ej-muted mt-1">Track current order status or view past receipts</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-ej-indigo/60 rounded-2xl border border-ej-border/60 skeleton" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="card p-10 text-center space-y-4 border-ej-border/60 my-8">
            <ElephantMascot size={160} className="mx-auto opacity-70" />
            <h3 className="text-lg font-bold text-ej-cream">No orders yet</h3>
            <p className="text-xs text-ej-muted max-w-sm mx-auto">
              Your order history will appear here once you place your first order at the food truck.
            </p>
            <Link
              href="/"
              className="btn-primary inline-flex items-center gap-2 text-xs"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Browse Menu &amp; Order</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, idx) => (
              <div
                key={order.id}
                className={`card card-hover p-5 border-ej-border space-y-3 animate-fade-in-up delay-${(idx % 5) + 1}`}
              >
                <div className="flex items-center justify-between border-b border-ej-border/60 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-ej-lime bg-ej-surface px-3 py-1 rounded-xl border border-ej-lime/30 shadow-glow-sm">
                      {order.token || 'UNPAID'}
                    </span>
                    <span className="text-xs text-ej-muted font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                      order.status === 'DELIVERED'
                        ? 'bg-ej-surface text-ej-muted border-ej-border'
                        : order.status === 'READY'
                        ? 'bg-ej-teal/20 text-ej-teal border-ej-teal/40 animate-pulse'
                        : order.status === 'PREPARING'
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                        : 'bg-ej-gold/20 text-ej-gold border-ej-gold/40'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="text-xs space-y-1.5 text-ej-muted">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span className="text-ej-cream font-medium">{item.quantity}× {item.menuItem.name}</span>
                      <span className="font-bold text-ej-gold">₹{item.priceAtOrderTime * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-ej-border/60 pt-3">
                  <div className="text-xs">
                    <span className="text-ej-muted">Total Paid: </span>
                    <span className="font-extrabold text-ej-lime text-sm">₹{order.totalAmount}</span>
                  </div>

                  <Link
                    href={`/order/${order.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-ej-lime hover:underline"
                  >
                    <span>View QR &amp; Live Status</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
