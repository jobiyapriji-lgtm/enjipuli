'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { FloralDivider } from '@/components/FloralDivider';
import { ShoppingBag, X, Plus, Minus, ArrowRight, RefreshCw, AlertTriangle } from 'lucide-react';

/* ─── Types ───────────────────────────────────────────────────────────── */
export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  photoUrl: string | null;
  isActive: boolean;
  netAvailable: number;
  isSoldOut: boolean;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

declare global {
  interface Window { Razorpay: any; }
}

const CATEGORIES = ['All', 'Snacks', 'Bakery', 'Soft Drinks', 'Ice Creams', 'Tea & Snacks'] as const;

export default function StudentHomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [menuItems, setMenuItems]               = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading]           = useState(true);
  const [menuError, setMenuError]               = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const [cart, setCart]             = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartItemCount = cart.reduce((s, c) => s + c.quantity, 0);
  const cartTotal     = cart.reduce((s, c) => s + c.menuItem.price * c.quantity, 0);

  const [checkingOut, setCheckingOut]     = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const fetchMenu = useCallback(async () => {
    try {
      const res = await fetch('/api/menu');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to load menu');
      }
      const data: MenuItem[] = await res.json();
      setMenuItems(data);
      setMenuError(null);
    } catch (err: any) {
      setMenuError(err.message);
    } finally {
      setMenuLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
    const id = setInterval(fetchMenu, 10_000);
    return () => clearInterval(id);
  }, [fetchMenu]);

  useEffect(() => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    document.body.appendChild(s);
    return () => { document.body.removeChild(s); };
  }, []);

  function addToCart(item: MenuItem) {
    if (item.isSoldOut) return;
    setCart(prev => {
      const existing = prev.find(c => c.menuItem.id === item.id);
      if (existing) {
        if (existing.quantity >= item.netAvailable) return prev;
        return prev.map(c =>
          c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  }

  function updateCartQuantity(itemId: string, delta: number) {
    setCart(prev =>
      prev
        .map(c => {
          if (c.menuItem.id !== itemId) return c;
          const next = c.quantity + delta;
          if (next <= 0) return null as any;
          return { ...c, quantity: Math.min(next, c.menuItem.netAvailable) };
        })
        .filter(Boolean)
    );
  }

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!session) {
      router.push('/login');
      return;
    }

    setCheckingOut(true);
    setCheckoutError(null);

    try {
      const checkoutRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(c => ({ menuItemId: c.menuItem.id, quantity: c.quantity })),
        }),
      });

      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok) {
        setCheckoutError(checkoutData.error || 'Checkout failed. Please try again.');
        await fetchMenu();
        setCheckingOut(false);
        return;
      }

      const { orderId, razorpayOrderId, amount, currency, key } = checkoutData;

      if (typeof window !== 'undefined' && window.Razorpay) {
        const rzp = new window.Razorpay({
          key,
          amount: Math.round(amount * 100),
          currency,
          name: 'ഇഞ്ചിപ്പുളി',
          description: 'Campus food truck order',
          order_id: razorpayOrderId,
          handler: async (response: any) => {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId,
                razorpayOrderId:   response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              setCart([]);
              setIsCartOpen(false);
              router.push(`/order/${orderId}`);
            } else {
              setCheckoutError(verifyData.error || 'Payment verification failed. Contact the truck vendor.');
            }
          },
          prefill: { email: session.user?.email ?? '' },
          modal: {
            ondismiss: () => { setCheckingOut(false); },
          },
        });
        rzp.on('payment.failed', (r: any) => {
          setCheckoutError(`Payment failed: ${r.error.description}`);
          setCheckingOut(false);
        });
        rzp.open();
      } else {
        const verifyRes = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            razorpayOrderId,
            razorpayPaymentId: `pay_dev_${Date.now()}`,
          }),
        });
        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          setCart([]);
          setIsCartOpen(false);
          router.push(`/order/${orderId}`);
        } else {
          setCheckoutError(verifyData.error || 'Payment failed');
        }
      }
    } catch (err: any) {
      setCheckoutError(err.message || 'Unexpected error during checkout');
    } finally {
      setCheckingOut(false);
    }
  };

  const filteredItems = selectedCategory === 'All'
    ? menuItems
    : menuItems.filter(i => i.category === selectedCategory);

  return (
    <div id="student-home" className="min-h-screen bg-ej-deep text-ej-cream flex flex-col">
      <Header cartItemCount={cartItemCount} onOpenCart={() => setIsCartOpen(true)} />

      <main className="screen-task flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        {/* Hero Section */}
        <section id="menu-hero" className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-ej-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-ej-cream tracking-tight">
                Today&apos;s Live Menu
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-ej-teal/15 text-ej-teal border border-ej-teal/30">
                <span className="w-2 h-2 rounded-full bg-ej-teal animate-pulse" />
                LIVE STOCK
              </span>
            </div>
            <p className="text-sm text-ej-muted mt-1">
              Order online &amp; pick up hot at the food truck counter.
            </p>
          </div>
          <FloralDivider width={100} className="hidden md:block opacity-60" />
        </section>

        {/* Category Tabs */}
        <nav id="category-tabs" aria-label="Menu categories" className="flex gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
          {CATEGORIES.map(cat => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                aria-pressed={isActive}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-ej-lime text-ej-ink shadow-glow-sm scale-[1.02]'
                    : 'bg-ej-indigo/70 text-ej-cream border border-ej-border hover:border-ej-lime/50 hover:bg-ej-indigo'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </nav>

        {/* Error message */}
        {menuError && (
          <div id="menu-error" role="alert" className="p-4 mb-6 rounded-2xl bg-ej-vermilion/10 border border-ej-vermilion/40 text-ej-vermilion text-sm flex items-center gap-2 animate-shake">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>⚠ {menuError}</span>
          </div>
        )}

        {/* Menu Loading Skeleton */}
        {menuLoading ? (
          <div id="menu-skeleton" aria-busy="true" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-ej-indigo/60 border border-ej-border/60 rounded-2xl p-4 flex flex-col justify-between skeleton" />
            ))}
          </div>
        ) : (
          /* Menu Items Grid */
          <div id="menu-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item, idx) => {
              const inCart = cart.find(c => c.menuItem.id === item.id);
              const qtyInCart = inCart?.quantity ?? 0;
              return (
                <article
                  key={item.id}
                  id={`menu-item-${item.id}`}
                  data-sold-out={item.isSoldOut}
                  className={`card card-hover p-4 flex flex-col justify-between gap-3 animate-fade-in-up delay-${(idx % 6) + 1} ${
                    item.isSoldOut ? 'opacity-60 border-ej-border/40' : ''
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="text-base font-bold text-ej-cream leading-tight">
                          {item.name}
                        </h2>
                        <span className="text-[11px] font-semibold text-ej-muted uppercase tracking-wider">
                          {item.category}
                        </span>
                      </div>
                      <span className="price-tag text-base font-black shrink-0">
                        ₹{item.price}
                      </span>
                    </div>

                    {item.description && (
                      <p className="text-xs text-ej-muted line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-ej-border/60 flex items-center justify-between mt-auto">
                    {item.isSoldOut ? (
                      <span className="badge-sold-out">Sold out</span>
                    ) : (
                      <span className="badge-available">
                        {item.netAvailable} left
                      </span>
                    )}

                    {!item.isSoldOut && (
                      qtyInCart > 0 ? (
                        <div className="flex items-center gap-2 bg-ej-deep/80 border border-ej-border p-1 rounded-xl">
                          <button
                            onClick={() => updateCartQuantity(item.id, -1)}
                            className="w-7 h-7 rounded-lg bg-ej-surface hover:bg-ej-surface-2 text-ej-cream font-bold text-sm flex items-center justify-center transition active:scale-95"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-extrabold text-sm min-w-[20px] text-center text-ej-lime">
                            {qtyInCart}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.id, 1)}
                            disabled={qtyInCart >= item.netAvailable}
                            className="w-7 h-7 rounded-lg bg-ej-lime hover:bg-ej-lime-dim text-ej-ink font-bold text-sm flex items-center justify-center transition active:scale-95 disabled:opacity-40 disabled:hover:bg-ej-lime"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(item)}
                          className="btn-primary py-1.5 px-4 text-xs font-bold flex items-center gap-1.5 shadow-glow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add
                        </button>
                      )
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Cart Bar */}
      {cartItemCount > 0 && !isCartOpen && (
        <div
          id="cart-bar"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-30 animate-slide-in-up"
        >
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full p-4 bg-ej-indigo border border-ej-lime/60 rounded-2xl shadow-2xl flex items-center justify-between text-ej-cream hover:border-ej-lime transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-ej-lime text-ej-ink font-black flex items-center justify-center text-sm shadow-glow-sm group-hover:scale-105 transition">
                {cartItemCount}
              </div>
              <div className="text-left">
                <p className="text-xs text-ej-muted font-medium">Cart total</p>
                <p className="text-base font-black text-ej-gold">₹{cartTotal}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-extrabold text-ej-lime group-hover:translate-x-1 transition-transform">
              <span>View Cart</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Slide-over Cart Drawer */}
      {isCartOpen && (
        <div
          id="cart-drawer-overlay"
          className="fixed inset-0 z-50 bg-ej-deep/80 backdrop-blur-md flex justify-end"
          onClick={e => { if ((e.target as HTMLElement).id === 'cart-drawer-overlay') setIsCartOpen(false); }}
        >
          <div
            id="cart-drawer"
            className="w-full max-w-md bg-ej-indigo border-l border-ej-border h-full flex flex-col shadow-2xl animate-slide-in-right"
          >
            {/* Header */}
            <div className="p-4 border-b border-ej-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-ej-lime" />
                <h2 className="text-base font-extrabold text-ej-cream">Your Order Cart</h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-xl text-ej-muted hover:text-ej-cream hover:bg-ej-surface transition"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error in checkout */}
            {checkoutError && (
              <div id="checkout-error" role="alert" className="m-4 p-3 rounded-xl bg-ej-vermilion/10 border border-ej-vermilion/40 text-ej-vermilion text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>⚠ {checkoutError}</span>
              </div>
            )}

            {/* Items List */}
            <div id="cart-items" className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-ej-muted space-y-2">
                  <ShoppingBag className="w-12 h-12 stroke-1 mx-auto opacity-40 text-ej-muted" />
                  <p className="text-sm font-medium">Your cart is empty</p>
                  <p className="text-xs text-ej-muted/70">Add some delicious snacks to get started.</p>
                </div>
              ) : (
                cart.map(c => (
                  <div
                    key={c.menuItem.id}
                    className="p-3 bg-ej-surface/70 border border-ej-border/80 rounded-xl flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-ej-cream truncate">{c.menuItem.name}</p>
                      <p className="text-xs font-extrabold text-ej-gold mt-0.5">
                        ₹{c.menuItem.price} × {c.quantity} = ₹{c.menuItem.price * c.quantity}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 bg-ej-deep p-1 rounded-lg border border-ej-border">
                      <button
                        onClick={() => updateCartQuantity(c.menuItem.id, -1)}
                        className="w-6 h-6 rounded bg-ej-surface hover:bg-ej-surface-2 text-ej-cream flex items-center justify-center font-bold text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-extrabold text-xs text-ej-lime min-w-[16px] text-center">
                        {c.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(c.menuItem.id, 1)}
                        disabled={c.quantity >= c.menuItem.netAvailable}
                        className="w-6 h-6 rounded bg-ej-lime text-ej-ink flex items-center justify-center font-bold text-xs disabled:opacity-40"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div id="cart-footer" className="p-4 border-t border-ej-border bg-ej-deep/90 space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-ej-muted font-medium">Subtotal Amount</span>
                  <span className="text-xl font-black text-ej-gold">₹{cartTotal}</span>
                </div>
                <p className="text-[11px] text-ej-muted leading-tight">
                  ⚡ Stock is held for 5 mins upon checkout. Complete payment to get your token &amp; QR.
                </p>
                <button
                  id="checkout-btn"
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="btn-primary w-full py-3.5 text-sm font-extrabold shadow-glow flex items-center justify-center gap-2"
                >
                  {checkingOut ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Reserving Stock &amp; Launching...</span>
                    </>
                  ) : (
                    <span>Pay ₹{cartTotal} via Razorpay →</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
