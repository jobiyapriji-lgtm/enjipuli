'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

/**
 * Vendor-specific header with bold nav tabs.
 * High contrast for sunlight readability at a busy counter.
 */
export function VendorHeader() {
  const pathname = usePathname();

  const tabs = [
    { href: '/vendor/queue',   label: '📋 Queue' },
    { href: '/vendor/scan',    label: '📷 Scan' },
    { href: '/vendor/stock',   label: '📦 Stock' },
    { href: '/vendor/summary', label: '📊 Summary' },
  ];

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.6rem 1rem',
        background: 'var(--ej-deep)',
        borderBottom: '2px solid var(--ej-border)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        flexShrink: 0,
        gap: '0.5rem',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <span
          lang="ml"
          style={{
            fontFamily: "'Baloo Chettan 2', sans-serif",
            fontWeight: 800,
            color: 'var(--ej-lime)',
            fontSize: '1.1rem',
            textShadow: '0 0 10px rgba(212,255,61,0.3)',
          }}
        >
          ഇഞ്ചിപ്പുളി
        </span>
        <span style={{
          color: 'var(--ej-muted)',
          fontSize: '0.7rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          background: 'var(--ej-surface)',
          padding: '0.15rem 0.5rem',
          borderRadius: 'var(--radius-sm)',
        }}>
          Vendor
        </span>
      </div>

      <nav style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        {tabs.map(tab => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.4rem 0.7rem',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                background: isActive ? 'var(--ej-lime)' : 'transparent',
                color: isActive ? 'var(--ej-ink)' : 'var(--ej-cream)',
                border: isActive ? 'none' : '1px solid transparent',
                boxShadow: isActive ? 'var(--shadow-glow-sm)' : 'none',
              }}
            >
              {tab.label}
            </Link>
          );
        })}

        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            padding: '0.35rem 0.6rem',
            borderRadius: 'var(--radius-md)',
            background: 'transparent',
            color: 'var(--ej-muted)',
            border: '1px solid var(--ej-border)',
            cursor: 'pointer',
            marginLeft: '0.3rem',
            transition: 'color 0.15s, border-color 0.15s',
          }}
        >
          Logout
        </button>
      </nav>
    </header>
  );
}
