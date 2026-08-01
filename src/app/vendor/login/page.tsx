'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogoWordmark } from '@/components/LogoWordmark';

/* PAGE: Vendor login — .screen-branding */
export default function VendorLoginPage() {
  const [email, setEmail]     = useState('vendor@enjipuli.com');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await signIn('credentials', { email: email.trim(), role: 'VENDOR', redirect: false });
      if (res?.error) { setError(res.error); return; }
      router.push('/vendor/queue');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Vendor login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      id="vendor-login-page"
      className="screen-branding"
      style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', padding: '1rem' }}
    >
      <div id="vendor-login-card" className="card" style={{ width: '100%', maxWidth: 400, padding: '2.5rem', textAlign: 'center' }}>

        <div id="vendor-login-logo" style={{ marginBottom: '1.5rem' }}>
          <LogoWordmark size={130} light />
        </div>

        <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem', fontWeight: 700 }}>Vendor staff portal</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: '0 0 1.5rem' }}>
          Restricted access — manage orders, stock & scanner.
        </p>

        {error && (
          <div id="vendor-login-error" role="alert" style={{ padding: '0.65rem', background: 'rgba(239,68,68,0.1)', border: '1px solid var(--color-error)', borderRadius: 'var(--radius-md)', color: 'var(--color-error)', fontSize: '0.8rem', marginBottom: '1rem', textAlign: 'left' }}>
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <input
            id="vendor-login-email"
            type="email"
            required
            className="input-field"
            placeholder="vendor@enjipuli.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <button
            id="vendor-login-submit"
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '0.85rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating…' : 'Access vendor dashboard →'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
          <Link href="/login" style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textDecoration: 'none' }}>
            ← Student login
          </Link>
        </div>
      </div>
    </main>
  );
}
