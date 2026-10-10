'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  UtensilsCrossed,
  ShoppingBag,
  User,
  LogOut,
  Sparkles,
  ChevronRight,
  ShoppingCart,
} from 'lucide-react';
import { LogoWordmark } from '@/components/LogoWordmark';

interface StudentDashboardLayoutProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  cartItemCount?: number;
  onOpenCart?: () => void;
  children: React.ReactNode;
  hideHeader?: boolean;
}

export function StudentDashboardLayout({
  title = "Today's Live Menu",
  subtitle = "Order online & pick up hot at the food truck counter",
  action,
  cartItemCount = 0,
  onOpenCart,
  children,
  hideHeader = false,
}: StudentDashboardLayoutProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Time-based greeting
  const [greeting, setGreeting] = useState("Good day — ready to order?");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good morning — breakfast & snacks are fresh!");
    } else if (hour < 17) {
      setGreeting("Good afternoon — hot lunch & cold drinks ready!");
    } else {
      setGreeting("Good evening — evening tea & bites waiting!");
    }
  }, []);

  const sessionUser = session?.user as any;
  const userEmail: string = sessionUser?.email || '';
  const emailPrefix = userEmail ? userEmail.split('@')[0].toLowerCase() : '';
  const hasRealName = Boolean(sessionUser?.name && sessionUser.name.trim().toLowerCase() !== emailPrefix);
  const displayName: string = hasRealName ? sessionUser.name.trim() : (emailPrefix || 'Student Account');
  const userInitial: string = displayName ? displayName[0].toUpperCase() : 'S';

  const navItems = [
    { href: '/', label: 'Order Menu', icon: UtensilsCrossed },
    { href: '/orders', label: 'My Orders', icon: ShoppingBag },
    { href: '/profile', label: 'Account', icon: User },
  ];

  return (
    <div className="min-h-screen bg-ej-deep text-ej-cream flex flex-col lg:flex-row relative">
      {/* ─────────────────────────────────────────────────────────────
          1. DESKTOP SIDEBAR (persistent across student pages)
          ───────────────────────────────────────────────────────────── */}
      <aside
        id="student-desktop-sidebar"
        className="hidden lg:flex flex-col w-64 bg-ej-deep border-r border-ej-border fixed top-0 left-0 bottom-0 z-30 p-5 justify-between"
      >
        <div className="space-y-6">
          {/* Logo & Student Identity Block */}
          <div className="space-y-4 pb-4 border-b border-ej-border/60">
            <Link href="/" className="inline-block hover:opacity-90 transition">
              <LogoWordmark size={140} light glow={true} />
            </Link>

            {/* Student Account Card */}
            <Link
              href="/profile"
              className="flex items-center gap-3 p-2.5 rounded-2xl bg-ej-surface/70 border border-ej-border/80 hover:border-ej-lime/50 transition group"
              title="View & Edit Account Profile"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-ej-lime via-ej-teal to-ej-gold text-ej-ink font-black flex items-center justify-center text-sm shadow-glow-sm shrink-0 group-hover:scale-105 transition">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-ej-cream truncate group-hover:text-ej-lime transition">
                  {displayName}
                </p>
                <p className="text-[10px] text-ej-muted font-mono truncate">
                  {userEmail || 'student@enjipuli.com'}
                </p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-ej-muted group-hover:text-ej-lime group-hover:translate-x-0.5 transition shrink-0" />
            </Link>
          </div>

          {/* Student Nav List */}
          <nav className="space-y-1.5">
            <p className="text-[10px] font-black uppercase tracking-wider text-ej-muted/70 px-3 pb-1">
              Campus Dining
            </p>

            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                    isActive
                      ? 'bg-ej-lime text-ej-ink shadow-glow-sm font-extrabold translate-x-1'
                      : 'text-ej-cream/80 hover:text-ej-lime hover:bg-ej-surface/70 hover:translate-x-0.5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-ej-ink' : 'text-ej-muted'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom Actions */}
        <div className="space-y-2 pt-4 border-t border-ej-border/60">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-ej-vermilion hover:bg-ej-vermilion/10 border border-ej-vermilion/30 hover:border-ej-vermilion/60 transition"
            title="Log Out of Student Account"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          2. MOBILE TOP HEADER
          ───────────────────────────────────────────────────────────── */}
      <header
        id="student-mobile-header"
        className="lg:hidden flex items-center justify-between p-3.5 bg-ej-deep border-b border-ej-border sticky top-0 z-30"
      >
        <Link href="/" className="inline-block">
          <LogoWordmark size={110} light />
        </Link>

        <div className="flex items-center gap-2.5">
          {onOpenCart && cartItemCount > 0 && (
            <button
              onClick={onOpenCart}
              className="p-1.5 px-2.5 rounded-xl bg-ej-lime text-ej-ink text-xs font-black flex items-center gap-1.5 shadow-glow-sm"
              title="Open Cart"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>{cartItemCount}</span>
            </button>
          )}

          <Link
            href="/profile"
            className="w-8 h-8 rounded-xl bg-gradient-to-tr from-ej-lime via-ej-teal to-ej-gold text-ej-ink font-black flex items-center justify-center text-xs shadow-glow-sm"
            title="Account Profile"
          >
            {userInitial}
          </Link>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN CONTENT AREA (offset by sidebar on desktop)
          ───────────────────────────────────────────────────────────── */}
      <div className="lg:pl-64 flex-1 flex flex-col min-h-screen pb-24 lg:pb-10">
        {/* Dashboard Header Bar */}
        {!hideHeader && (
          <section className="p-4 sm:p-6 md:p-8 pb-4 border-b border-ej-border/60 bg-gradient-to-b from-ej-indigo/30 via-ej-surface/10 to-transparent">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-ej-muted flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-ej-gold" />
                  <span>{greeting}</span>
                </p>
                <h1 className="text-2xl sm:text-3xl font-black text-ej-cream tracking-tight">
                  {title}
                </h1>
                {subtitle && <p className="text-xs text-ej-muted/80">{subtitle}</p>}
              </div>

              {/* Contextual Action (e.g. View Cart) */}
              {action ? (
                <div className="shrink-0">{action}</div>
              ) : onOpenCart ? (
                <button
                  onClick={onOpenCart}
                  className="btn-primary py-2.5 px-4 text-xs font-black flex items-center gap-2 shadow-glow-sm self-start sm:self-auto"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>View Cart ({cartItemCount})</span>
                </button>
              ) : null}
            </div>
          </section>
        )}

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 pt-6 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. MOBILE BOTTOM TAB BAR
          ───────────────────────────────────────────────────────────── */}
      <nav
        id="student-mobile-bottom-tabs"
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-ej-deep/95 backdrop-blur-md border-t border-ej-border z-40 px-3 py-1.5 flex items-center justify-around shadow-2xl"
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-ej-lime font-black'
                  : 'text-ej-muted hover:text-ej-cream font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-lg ${
                  isActive ? 'bg-ej-lime/20 text-ej-lime shadow-glow-sm' : 'text-ej-muted'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}

        {/* Quick Cart Tab if items present */}
        {onOpenCart && (
          <button
            onClick={onOpenCart}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-ej-muted hover:text-ej-cream font-medium transition-all"
          >
            <div className="p-1 rounded-lg relative text-ej-cream">
              <ShoppingCart className="w-5 h-5 text-ej-gold" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-ej-lime text-ej-ink font-black text-[9px] rounded-full flex items-center justify-center shadow-glow-sm">
                  {cartItemCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Cart</span>
          </button>
        )}
      </nav>
    </div>
  );
}
