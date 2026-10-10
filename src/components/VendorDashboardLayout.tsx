'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  ClipboardList,
  QrCode,
  Boxes,
  BarChart3,
  KeyRound,
  LogOut,
  X,
  RefreshCw,
  CheckCircle2,
  Calendar,
  Truck,
  Sparkles,
} from 'lucide-react';
import { LogoWordmark } from '@/components/LogoWordmark';

interface VendorDashboardLayoutProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export function VendorDashboardLayout({
  title,
  subtitle,
  action,
  children,
}: VendorDashboardLayoutProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Password change modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Time-based greeting
  const [greeting, setGreeting] = useState("Good day — here's today at a glance");
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 12) {
      setGreeting("Good morning — here's today at a glance");
    } else if (hour < 17) {
      setGreeting("Good afternoon — here's today at a glance");
    } else {
      setGreeting("Good evening — here's today at a glance");
    }

    setFormattedDate(
      now.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    );
  }, []);

  const navItems = [
    { href: '/vendor/queue', label: 'Live Queue', icon: ClipboardList },
    { href: '/vendor/scan', label: 'Scan QR', icon: QrCode },
    { href: '/vendor/stock', label: 'Stock & Menu', icon: Boxes },
    { href: '/vendor/summary', label: 'Daily Summary', icon: BarChart3 },
  ];

  const handleOpenPasswordModal = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setStatusMessage(null);
    setIsPasswordModalOpen(true);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setStatusMessage({ type: 'error', text: 'All fields are required.' });
      return;
    }

    if (newPassword.length < 6) {
      setStatusMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'New passwords do not match. Please recheck.' });
      return;
    }

    setSubmittingPassword(true);
    try {
      const res = await fetch('/api/vendor/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password.');
      }

      setStatusMessage({ type: 'success', text: data.message || 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setStatusMessage(null);
      }, 2000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error updating password.' });
    } finally {
      setSubmittingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-ej-deep text-ej-cream flex flex-col lg:flex-row relative">
      {/* ─────────────────────────────────────────────────────────────
          1. DESKTOP SIDEBAR (persistent across all vendor screens)
          ───────────────────────────────────────────────────────────── */}
      <aside
        id="vendor-desktop-sidebar"
        className="hidden lg:flex flex-col w-64 bg-ej-deep border-r border-ej-border fixed top-0 left-0 bottom-0 z-30 p-5 justify-between"
      >
        <div className="space-y-6">
          {/* Vendor Identity Block */}
          <div className="space-y-3 pb-4 border-b border-ej-border/60">
            <Link href="/vendor/queue" className="inline-block hover:opacity-90 transition">
              <LogoWordmark size={140} light glow={true} />
            </Link>

            <div className="flex items-center justify-between pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-ej-lime/15 text-ej-lime border border-ej-lime/40 shadow-glow-sm">
                <Truck className="w-3 h-3" />
                <span>VENDOR PORTAL</span>
              </span>

              <span className="inline-flex items-center gap-1 text-[10px] text-ej-teal font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-ej-teal animate-pulse" />
                Live
              </span>
            </div>

            {/* Today's Date */}
            <div className="flex items-center gap-1.5 text-[11px] text-ej-muted font-medium pt-0.5">
              <Calendar className="w-3.5 h-3.5 text-ej-gold" />
              <span>{formattedDate || 'Today'}</span>
            </div>
          </div>

          {/* Nav List */}
          <nav className="space-y-1.5">
            <p className="text-[10px] font-black uppercase tracking-wider text-ej-muted/70 px-3 pb-1">
              Kitchen Console
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
            onClick={handleOpenPasswordModal}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-ej-gold hover:bg-ej-gold/10 border border-ej-gold/30 hover:border-ej-gold/60 transition"
            title="Change Vendor Password"
          >
            <KeyRound className="w-4 h-4 shrink-0" />
            <span>Change Password</span>
          </button>

          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-ej-vermilion hover:bg-ej-vermilion/10 border border-ej-vermilion/30 hover:border-ej-vermilion/60 transition"
            title="Log Out of Vendor Dashboard"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          2. MOBILE TOP HEADER (branding & quick actions on phone)
          ───────────────────────────────────────────────────────────── */}
      <header
        id="vendor-mobile-header"
        className="lg:hidden flex items-center justify-between p-3.5 bg-ej-deep border-b border-ej-border sticky top-0 z-30"
      >
        <div className="flex items-center gap-2.5">
          <Link href="/vendor/queue">
            <span
              lang="ml"
              style={{
                fontFamily: "'Baloo Chettan 2', sans-serif",
                fontWeight: 800,
                color: 'var(--ej-lime)',
                fontSize: '1.15rem',
                textShadow: '0 0 10px rgba(212,255,61,0.3)',
              }}
            >
              ഇഞ്ചിപ്പുളി
            </span>
          </Link>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-ej-lime/15 text-ej-lime border border-ej-lime/30 uppercase">
            Vendor
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenPasswordModal}
            className="p-1.5 rounded-lg text-ej-gold border border-ej-gold/30 bg-ej-gold/10 text-xs"
            title="Change Password"
          >
            <KeyRound className="w-4 h-4" />
          </button>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="p-1.5 rounded-lg text-ej-vermilion border border-ej-vermilion/30 bg-ej-vermilion/10 text-xs"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN CONTENT AREA (offset by sidebar on desktop)
          ───────────────────────────────────────────────────────────── */}
      <div className="lg:pl-64 flex-1 flex flex-col min-h-screen pb-20 lg:pb-10">
        {/* Dashboard Page Header Bar */}
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

            {action && <div className="shrink-0">{action}</div>}
          </div>
        </section>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 pt-6 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. MOBILE BOTTOM TAB BAR (fixed for fast one-handed thumb use)
          ───────────────────────────────────────────────────────────── */}
      <nav
        id="vendor-mobile-bottom-tabs"
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-ej-deep/95 backdrop-blur-md border-t border-ej-border z-40 px-2 py-1.5 flex items-center justify-around shadow-2xl"
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
      </nav>

      {/* ─────────────────────────────────────────────────────────────
          5. CHANGE PASSWORD MODAL
          ───────────────────────────────────────────────────────────── */}
      {isPasswordModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(15, 10, 35, 0.85)', backdropFilter: 'blur(8px)' }}
        >
          <div className="card p-6 border-ej-border max-w-sm w-full space-y-4 animate-fade-in-up bg-ej-indigo shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-ej-border pb-3">
              <div className="flex items-center gap-2 text-ej-gold">
                <KeyRound className="w-5 h-5" />
                <h3 className="text-base font-extrabold text-ej-cream">Change Password</h3>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-ej-muted hover:text-ej-cream p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {statusMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  statusMessage.type === 'success'
                    ? 'bg-ej-teal/20 text-ej-teal border border-ej-teal/40'
                    : 'bg-ej-vermilion/20 text-ej-vermilion border border-ej-vermilion/40'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <X className="w-4 h-4 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-ej-muted mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full py-2 px-3 rounded-xl bg-ej-deep border border-ej-border text-ej-cream focus:border-ej-lime focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-ej-muted mb-1">New Password (min 6 chars)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full py-2 px-3 rounded-xl bg-ej-deep border border-ej-border text-ej-cream focus:border-ej-lime focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-ej-muted mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full py-2 px-3 rounded-xl bg-ej-deep border border-ej-border text-ej-cream focus:border-ej-lime focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submittingPassword}
                  className="btn-primary py-2 px-4 text-xs font-bold flex-1 flex items-center justify-center gap-1.5 shadow-glow-sm"
                >
                  {submittingPassword ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="py-2 px-3 text-xs font-semibold rounded-xl border border-ej-border text-ej-muted hover:text-ej-cream"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
