'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { LogoWordmark } from '@/components/LogoWordmark';

interface HeaderProps {
  cartItemCount?: number;
  onOpenCart?: () => void;
}

export function Header({ cartItemCount = 0, onOpenCart }: HeaderProps) {
  const { data: session } = useSession();
  const user = session?.user as any;
  const isVendor = user?.role === 'VENDOR';

  return (
    <header
      id="header-root"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.6rem 1.25rem',
        background: 'rgba(21, 15, 46, 0.85)',
        backdropFilter: 'blur(16px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
        borderBottom: '1px solid var(--ej-border)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.4)',
      }}
    >
      <Link id="header-logo" href="/" aria-label="Enjipuli home" style={{ textDecoration: 'none' }}>
        <LogoWordmark size={110} light />
      </Link>

      <div
        id="header-user-actions"
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        {/* Cart button — students only */}
        {!isVendor && onOpenCart && (
          <button
            id="header-cart-btn"
            onClick={onOpenCart}
            aria-label={`View cart (${cartItemCount} items)`}
            style={{
              position: 'relative',
              background: 'rgba(212,255,61,0.08)',
              border: '1px solid var(--ej-border)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              color: 'var(--ej-cream)',
              padding: '0.45rem 0.8rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--ej-lime)';
              e.currentTarget.style.background = 'rgba(212,255,61,0.12)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--ej-border)';
              e.currentTarget.style.background = 'rgba(212,255,61,0.08)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            Cart
            {cartItemCount > 0 && (
              <span
                id="header-cart-count"
                className="animate-badge-pop"
                key={cartItemCount}
                style={{
                  position: 'absolute',
                  top: -7,
                  right: -7,
                  background: 'var(--ej-lime)',
                  color: 'var(--ej-ink)',
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-glow-sm)',
                }}
              >
                {cartItemCount}
              </span>
            )}
          </button>
        )}

        {session ? (
          <>
            {isVendor ? (
              <Link href="/vendor/queue" className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.7rem' }}>
                Vendor Queue
              </Link>
            ) : (
              <Link href="/orders" className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.7rem' }}>
                My Orders
              </Link>
            )}
            <button
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.7rem' }}
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}>
              Login
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
