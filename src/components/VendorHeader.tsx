'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { KeyRound, X, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

/**
 * Vendor-specific header with bold nav tabs and password management.
 * High contrast for sunlight readability at a busy counter.
 */
export function VendorHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword]         = useState('');
  const [newPassword, setNewPassword]                 = useState('');
  const [confirmPassword, setConfirmPassword]         = useState('');
  const [submitting, setSubmitting]                   = useState(false);
  const [statusMessage, setStatusMessage]             = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const tabs = [
    { href: '/vendor/queue',   label: '📋 Queue' },
    { href: '/vendor/scan',    label: '📷 Scan' },
    { href: '/vendor/stock',   label: '📦 Stock' },
    { href: '/vendor/summary', label: '📊 Summary' },
  ];

  const handleOpenModal = () => {
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

    setSubmitting(true);
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
      }, 2500);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error updating password.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
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
            onClick={handleOpenModal}
            title="Change Vendor Password"
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.35rem 0.6rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(234, 179, 8, 0.12)',
              color: 'var(--ej-gold)',
              border: '1px solid rgba(234, 179, 8, 0.35)',
              cursor: 'pointer',
              marginLeft: '0.3rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              transition: 'all 0.15s',
            }}
          >
            <KeyRound style={{ width: 13, height: 13 }} />
            Password
          </button>

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
              marginLeft: '0.2rem',
              transition: 'color 0.15s, border-color 0.15s',
            }}
          >
            Logout
          </button>
        </nav>
      </header>

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-ej-deep/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => {
            if ((e.target as HTMLElement).classList.contains('backdrop-blur-md')) {
              setIsPasswordModalOpen(false);
            }
          }}
        >
          <div className="card w-full max-w-md p-6 space-y-4 shadow-2xl border-ej-border bg-ej-indigo animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-ej-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-ej-gold/20 flex items-center justify-center text-ej-gold">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-ej-cream">Change Vendor Password</h2>
                  <p className="text-[11px] text-ej-muted">
                    Account: <strong className="text-ej-gold">{session?.user?.email || 'vendor@enjipuli.com'}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-ej-muted hover:text-ej-cream p-1 rounded-lg hover:bg-ej-surface transition"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {statusMessage && (
              <div
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                  statusMessage.type === 'success'
                    ? 'bg-ej-teal/15 border-ej-teal/40 text-ej-teal'
                    : 'bg-ej-vermilion/15 border-ej-vermilion/40 text-ej-vermilion animate-shake'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="block text-ej-muted mb-1 font-semibold">Current Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input-field w-full text-sm"
                  autoComplete="current-password"
                />
              </div>

              <div>
                <label className="block text-ej-muted mb-1 font-semibold">New Password (min 6 characters)</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Enter new strong password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field w-full text-sm"
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label className="block text-ej-muted mb-1 font-semibold">Confirm New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field w-full text-sm"
                  autoComplete="new-password"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-ej-border/60">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="btn-secondary py-2 px-3 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-gold py-2 px-4 text-xs font-extrabold flex items-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating…</span>
                    </>
                  ) : (
                    <span>Save New Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
