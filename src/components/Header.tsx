'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { LogoWordmark } from '@/components/LogoWordmark';
import {
  User,
  LogOut,
  Receipt,
  ChevronDown,
  ShoppingBag,
  GraduationCap,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface HeaderProps {
  cartItemCount?: number;
  onOpenCart?: () => void;
}

export function Header({ cartItemCount = 0, onOpenCart }: HeaderProps) {
  const { data: session } = useSession();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = session?.user as any;
  const isVendor = user?.role === 'VENDOR';

  const userEmail: string = user?.email || '';
  const displayName: string =
    user?.name || (userEmail ? userEmail.split('@')[0] : 'User');
  const userInitial: string = (displayName[0] || 'U').toUpperCase();
  const isProvidence: boolean = userEmail.includes('providence.edu.in');

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      <Link
        id="header-logo"
        href="/"
        aria-label="Enjipuli home"
        style={{ textDecoration: 'none' }}
      >
        <LogoWordmark size={110} light />
      </Link>

      <div
        id="header-user-actions"
        style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}
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
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--ej-lime)';
              e.currentTarget.style.background = 'rgba(212,255,61,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--ej-border)';
              e.currentTarget.style.background = 'rgba(212,255,61,0.08)';
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span>Cart</span>
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
          <div className="relative" ref={dropdownRef}>
            {/* Account Profile Pill / Button */}
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 py-1.5 px-2.5 rounded-xl border border-ej-border hover:border-ej-lime/50 bg-ej-indigo/60 hover:bg-ej-indigo transition text-xs font-semibold text-ej-cream"
              title="View Account Profile"
            >
              {/* User Avatar Circle with Online Dot */}
              <div className="relative">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-ej-lime to-ej-teal text-ej-ink font-black flex items-center justify-center text-xs shadow-glow-sm">
                  {userInitial}
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-ej-lime border-2 border-ej-deep" />
              </div>

              {/* Username label */}
              <span className="max-w-[100px] truncate text-left hidden sm:inline-block">
                {displayName}
              </span>

              <ChevronDown
                className={`w-3.5 h-3.5 text-ej-muted transition-transform duration-200 ${
                  isProfileOpen ? 'rotate-180 text-ej-lime' : ''
                }`}
              />
            </button>

            {/* Profile Dropdown Card */}
            {isProfileOpen && (
              <div
                className="absolute right-0 mt-2 w-72 bg-ej-indigo border border-ej-border rounded-2xl shadow-2xl p-4 z-50 animate-fade-in-up space-y-3"
                style={{ background: '#171233' }}
              >
                {/* Account Details Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-ej-border/60">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-ej-lime via-ej-teal to-ej-gold text-ej-ink font-extrabold flex items-center justify-center text-lg shadow-md shrink-0">
                    {userInitial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold text-ej-cream truncate">
                      {displayName}
                    </p>
                    <p className="text-[11px] text-ej-muted truncate font-mono">
                      {userEmail}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-ej-lime/15 border border-ej-lime/30 text-ej-lime">
                        {isVendor ? (
                          <>
                            <ShieldCheck className="w-3 h-3" /> Vendor
                          </>
                        ) : (
                          <>
                            <GraduationCap className="w-3 h-3" /> Student
                          </>
                        )}
                      </span>
                      {isProvidence && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-ej-teal/15 text-ej-teal border border-ej-teal/30">
                          Providence
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Account Quick Links */}
                <div className="space-y-1">
                  <Link
                    href="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-ej-cream hover:bg-ej-surface hover:text-ej-lime transition"
                  >
                    <User className="w-4 h-4 text-ej-lime" />
                    <span>Account Profile</span>
                  </Link>

                  {isVendor ? (
                    <Link
                      href="/vendor/queue"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-ej-cream hover:bg-ej-surface hover:text-ej-lime transition"
                    >
                      <ShieldCheck className="w-4 h-4 text-ej-lime" />
                      <span>Vendor Dashboard</span>
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/orders"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-ej-cream hover:bg-ej-surface hover:text-ej-lime transition"
                      >
                        <Receipt className="w-4 h-4 text-ej-gold" />
                        <span>My Orders &amp; Receipts</span>
                      </Link>

                      <Link
                        href="/"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-ej-cream hover:bg-ej-surface hover:text-ej-lime transition"
                      >
                        <ShoppingBag className="w-4 h-4 text-ej-teal" />
                        <span>Browse Today&apos;s Menu</span>
                      </Link>
                    </>
                  )}
                </div>

                {/* Log Out Button */}
                <div className="pt-2 border-t border-ej-border/60">
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-ej-vermilion hover:bg-ej-vermilion/10 border border-ej-vermilion/30 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="btn-primary"
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
