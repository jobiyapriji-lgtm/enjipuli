'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Header } from '@/components/Header';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 pb-16">
      <Header />

      <main className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
          <p className="text-xs text-slate-500">Track current status or view past receipts</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700">No orders yet</h3>
            <p className="text-xs text-slate-500">Your order history will appear here once you place an order.</p>
            <Link
              href="/"
              className="inline-block px-4 py-2 rounded-xl bg-orange-600 text-white font-semibold text-xs hover:bg-orange-700"
            >
              Browse Menu & Order
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-orange-300 transition space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-base font-extrabold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200">
                      {order.token || 'UNPAID'}
                    </span>
                    <span className="text-xs text-slate-400 ml-3">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      order.status === 'DELIVERED'
                        ? 'bg-slate-100 text-slate-700'
                        : order.status === 'READY'
                        ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="text-xs space-y-1 text-slate-600">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.quantity}× {item.menuItem.name}</span>
                      <span className="font-medium">₹{item.priceAtOrderTime * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="text-xs">
                    <span className="text-slate-500">Total: </span>
                    <span className="font-bold text-slate-900">₹{order.totalAmount}</span>
                  </div>

                  <Link
                    href={`/order/${order.id}`}
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-orange-600 hover:underline"
                  >
                    <span>View QR & Status</span>
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
