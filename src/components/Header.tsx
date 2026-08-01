'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { LogoWordmark } from '@/components/LogoWordmark';

interface HeaderProps {
  cartItemCount?: number;
  onOpenCart?: () => void;
}

/*
 * Header — Stitch integration notes:
 *
 * This component provides the logical structure only.
 * Stitch will replace the inline styles/classes with its own tokens.
 *
 * Stable element IDs for Stitch to target:
 *   #header-root         — the sticky <header> element
 *   #header-logo         — LogoWordmark wrapper
 *   #header-cart-btn     — cart trigger button
 *   #header-cart-count   — count badge
 *   #header-user-actions — nav buttons area
 */
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
        padding: '0.75rem 1.25rem',
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        /* STITCH_TODO: Replace background + border with Stitch header token */
      }}
    >
      {/* Logo slot — receives Stitch SVG wordmark */}
      <Link id="header-logo" href="/" aria-label="Enjipuli home">
        <LogoWordmark size={130} light />
      </Link>

      {/* Right-side actions */}
      <div
        id="header-user-actions"
        style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}
      >
        {/* Cart button — only for students */}
        {!isVendor && onOpenCart && (
          <button
            id="header-cart-btn"
            onClick={onOpenCart}
            aria-label={`View cart (${cartItemCount} items)`}
            style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-primary)' }}
          >
            🛒 Cart
            {cartItemCount > 0 && (
              <span
                id="header-cart-count"
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -8,
                  background: 'var(--color-accent)',
                  color: 'var(--color-text-inverse)',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
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
              <Link href="/vendor/queue" className="btn-secondary" style={{ fontSize: '0.8rem' }}>
                Vendor Queue
              </Link>
            ) : (
              <Link href="/orders" className="btn-secondary" style={{ fontSize: '0.8rem' }}>
                My Orders
              </Link>
            )}
            <button
              className="btn-secondary"
              style={{ fontSize: '0.8rem' }}
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="btn-primary" style={{ fontSize: '0.8rem' }}>
              Student login
            </Link>
            <Link href="/vendor/login" className="btn-secondary" style={{ fontSize: '0.8rem' }}>
              Vendor login
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
