'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';

/* ─── Types (stable — Stitch integration maps to these) ─────────────────── */
export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  photoUrl: string | null;
  isActive: boolean;
  netAvailable: number;    // quantityAvailable - quantityReserved
  isSoldOut: boolean;      // netAvailable <= 0
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

declare global {
  interface Window { Razorpay: any; }
}

/* ─── Category list (Stitch renders the tab strip) ──────────────────────── */
const CATEGORIES = ['All', 'Snacks', 'Bakery', 'Soft Drinks', 'Ice Creams', 'Tea & Snacks'] as const;

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE: Student home — live menu + cart
   Screen type: .screen-task
   Stable state: cart, setCart, handleCheckout, selectedCategory, menuItems
   ═══════════════════════════════════════════════════════════════════════════ */
export default function StudentHomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  /* ── Menu & UI state ──────────────────────────────────────────────────── */
  const [menuItems, setMenuItems]               = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading]           = useState(true);
  const [menuError, setMenuError]               = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  /* ── Cart state (stable name — Stitch maps to this) ──────────────────── */
  const [cart, setCart]           = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartItemCount = cart.reduce((s, c) => s + c.quantity, 0);
  const cartTotal     = cart.reduce((s, c) => s + c.menuItem.price * c.quantity, 0);

  /* ── Checkout state ───────────────────────────────────────────────────── */
  const [checkingOut, setCheckingOut]     = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  /* ─── Fetch menu — also called on stock polling ────────────────────────── */
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
    // Poll stock every 10 s — keeps sold-out state current without websockets
    const id = setInterval(fetchMenu, 10_000);
    return () => clearInterval(id);
  }, [fetchMenu]);

  // Load Razorpay checkout.js once
  useEffect(() => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    document.body.appendChild(s);
    return () => { document.body.removeChild(s); };
  }, []);

  /* ─── Cart helpers ──────────────────────────────────────────────────────── */
  function addToCart(item: MenuItem) {
    if (item.isSoldOut) return;
    setCart(prev => {
      const existing = prev.find(c => c.menuItem.id === item.id);
      if (existing) {
        if (existing.quantity >= item.netAvailable) return prev; // cap at stock
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

  function removeFromCart(itemId: string) {
    setCart(prev => prev.filter(c => c.menuItem.id !== itemId));
  }

  /* ─── Checkout handler (stable name — Stitch maps to this) ─────────────── */
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    if (!session) {
      router.push('/login');
      return;
    }

    setCheckingOut(true);
    setCheckoutError(null);

    try {
      /* Step 1 — Reserve stock & create Razorpay order */
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
        await fetchMenu(); // refresh sold-out badges
        setCheckingOut(false);
        return;
      }

      const { orderId, razorpayOrderId, amount, currency, key } = checkoutData;

      /* Step 2 — Open Razorpay modal or fallback for local dev */
      if (typeof window !== 'undefined' && window.Razorpay) {
        const rzp = new window.Razorpay({
          key,
          amount: Math.round(amount * 100),
          currency,
          name: 'ഇഞ്ചിപ്പുളി',
          description: 'Campus food truck order',
          order_id: razorpayOrderId,
          handler: async (response: any) => {
            /* Step 3 — Verify payment server-side */
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
        /* Dev/test fallback — skips Razorpay modal */
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

  /* ─── Filtered menu ──────────────────────────────────────────────────────── */
  const filteredItems = selectedCategory === 'All'
    ? menuItems
    : menuItems.filter(i => i.category === selectedCategory);

  /* ═══════════════════════════════════════════════════════════════════════════
     RENDER
     All element IDs are stable — Stitch maps visual styles against these IDs.
     ═══════════════════════════════════════════════════════════════════════════ */
  return (
    <div id="student-home">
      <Header cartItemCount={cartItemCount} onOpenCart={() => setIsCartOpen(true)} />

      <main className="screen-task" id="menu-page" style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 1rem' }}>

        {/* ── Page heading ──────────────────────────────────────────────── */}
        <section id="menu-hero" style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
            Today&apos;s Menu
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: 4 }}>
            Order now — stock is live and limited.
          </p>
        </section>

        {/* ── Category tabs ─────────────────────────────────────────────── */}
        <nav id="category-tabs" aria-label="Menu categories" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              aria-pressed={selectedCategory === cat}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid',
                borderColor: selectedCategory === cat ? 'var(--color-accent)' : 'var(--color-border)',
                background: selectedCategory === cat ? 'var(--color-accent)' : 'var(--color-surface)',
                color: selectedCategory === cat ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </nav>

        {/* ── Error / loading states ─────────────────────────────────────── */}
        {menuError && (
          <div id="menu-error" role="alert" style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid var(--color-error)', borderRadius: 'var(--radius-md)', color: 'var(--color-error)', marginBottom: '1rem', fontSize: '0.875rem' }}>
            ⚠ {menuError}
          </div>
        )}

        {menuLoading ? (
          <div id="menu-skeleton" aria-busy="true" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ height: 140, background: 'var(--color-surface-2)', borderRadius: 'var(--radius-lg)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        ) : (
          /* ── Menu grid ──────────────────────────────────────────────── */
          <div id="menu-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {filteredItems.map(item => {
              const inCart = cart.find(c => c.menuItem.id === item.id);
              const qtyInCart = inCart?.quantity ?? 0;
              return (
                <article
                  key={item.id}
                  id={`menu-item-${item.id}`}
                  className="card"
                  data-sold-out={item.isSoldOut}
                  style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', opacity: item.isSoldOut ? 0.6 : 1 }}
                >
                  {/* Item info */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        {item.name}
                      </h2>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{item.category}</span>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-accent)', whiteSpace: 'nowrap' }}>
                      ₹{item.price}
                    </span>
                  </div>

                  {item.description && (
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                      {item.description}
                    </p>
                  )}

                  {/* Availability & cart controls */}
                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {item.isSoldOut ? (
                      <span className="badge-sold-out">Sold out</span>
                    ) : (
                      <span className="badge-available">{item.netAvailable} left</span>
                    )}

                    {!item.isSoldOut && (
                      qtyInCart > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button onClick={() => updateCartQuantity(item.id, -1)} style={qtyBtnStyle} aria-label="Decrease quantity">−</button>
                          <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{qtyInCart}</span>
                          <button
                            onClick={() => updateCartQuantity(item.id, 1)}
                            disabled={qtyInCart >= item.netAvailable}
                            style={qtyBtnStyle}
                            aria-label="Increase quantity"
                          >+</button>
                        </div>
                      ) : (
                        <button className="btn-primary" style={{ padding: '0.35rem 0.9rem', fontSize: '0.8rem' }} onClick={() => addToCart(item)}>
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

      {/* ── Floating cart bar ────────────────────────────────────────────── */}
      {cartItemCount > 0 && !isCartOpen && (
        <div
          id="cart-bar"
          style={{
            position: 'fixed', bottom: '1rem', left: '50%', transform: 'translateX(-50%)',
            width: 'min(92%, 500px)', zIndex: 30,
          }}
        >
          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              width: '100%', padding: '1rem 1.25rem',
              background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)', cursor: 'pointer',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {cartItemCount} item{cartItemCount !== 1 ? 's' : ''}
            </span>
            <span style={{ fontWeight: 800, color: 'var(--color-accent)', fontSize: '1rem' }}>
              ₹{cartTotal} — View Cart →
            </span>
          </button>
        </div>
      )}

      {/* ── Cart drawer ───────────────────────────────────────────────────── */}
      {isCartOpen && (
        <div id="cart-drawer-overlay" style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'flex-end' }} onClick={e => { if ((e.target as HTMLElement).id === 'cart-drawer-overlay') setIsCartOpen(false); }}>
          <div
            id="cart-drawer"
            className="card"
            style={{ width: 'min(100%, 420px)', height: '100%', borderRadius: '0', display: 'flex', flexDirection: 'column', overflowY: 'auto', boxShadow: 'var(--shadow-card)' }}
          >
            {/* Cart header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Your Cart</h2>
              <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1.2rem' }} aria-label="Close cart">✕</button>
            </div>

            {/* Checkout error */}
            {checkoutError && (
              <div id="checkout-error" role="alert" style={{ margin: '0.75rem', padding: '0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid var(--color-error)', borderRadius: 'var(--radius-md)', color: 'var(--color-error)', fontSize: '0.8rem' }}>
                ⚠ {checkoutError}
              </div>
            )}

            {/* Cart items */}
            <div id="cart-items" style={{ flex: 1, padding: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {cart.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', textAlign: 'center', marginTop: '2rem' }}>
                  Your cart is empty.
                </p>
              ) : (
                cart.map(c => (
                  <div key={c.menuItem.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--color-border)' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>{c.menuItem.name}</p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-accent)' }}>
                        ₹{c.menuItem.price} × {c.quantity} = ₹{c.menuItem.price * c.quantity}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <button onClick={() => updateCartQuantity(c.menuItem.id, -1)} style={qtyBtnStyle}>−</button>
                      <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{c.quantity}</span>
                      <button onClick={() => updateCartQuantity(c.menuItem.id, 1)} disabled={c.quantity >= c.menuItem.netAvailable} style={qtyBtnStyle}>+</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Checkout footer */}
            {cart.length > 0 && (
              <div id="cart-footer" style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--color-border)', flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Total</span>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-accent)' }}>₹{cartTotal}</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                  Stock is reserved for 5 minutes after checkout. Pay promptly.
                </p>
                <button
                  id="checkout-btn"
                  className="btn-primary"
                  style={{ width: '100%', padding: '0.85rem' }}
                  onClick={handleCheckout}
                  disabled={checkingOut}
                >
                  {checkingOut ? 'Processing…' : `Pay ₹${cartTotal} with Razorpay`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Tiny shared style objects ─────────────────────────────────────────── */
const qtyBtnStyle: React.CSSProperties = {
  width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 700, fontSize: '1rem',
  color: 'var(--color-text-primary)',
};
