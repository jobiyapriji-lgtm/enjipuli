'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogoWordmark } from '@/components/LogoWordmark';

/*
 * PAGE: Student login
 * Screen type: .screen-branding
 * Auth rule: any email address (college or Gmail) is accepted.
 *   Set ALLOWED_EMAIL_DOMAIN in .env to restrict to one domain.
 */
export default function StudentLoginPage() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await signIn('credentials', { email: email.trim(), role: 'STUDENT', redirect: false });
      if (res?.error) { setError(res.error); return; }
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      id="student-login-page"
      className="screen-branding"
      style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', padding: '1rem' }}
    >
      <div
        id="login-card"
        className="card"
        style={{ width: '100%', maxWidth: 400, padding: '2.5rem', textAlign: 'center' }}
      >
        {/* Logo slot */}
        <div id="login-logo" style={{ marginBottom: '2rem' }}>
          <LogoWordmark size={150} light />
        </div>

        <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 700 }}>
          Student login
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: '0 0 1.5rem' }}>
          Enter your college or Gmail address to continue.
        </p>

        {error && (
          <div id="login-error" role="alert" style={{ padding: '0.65rem', background: 'rgba(239,68,68,0.1)', border: '1px solid var(--color-error)', borderRadius: 'var(--radius-md)', color: 'var(--color-error)', fontSize: '0.8rem', marginBottom: '1rem', textAlign: 'left' }}>
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <input
            id="login-email"
            type="email"
            required
            className="input-field"
            placeholder="student@college.ac.in or @gmail.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
          />
          <button
            id="login-submit"
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '0.85rem' }}
            disabled={loading}
          >
            {loading ? 'Logging in…' : 'Continue to menu →'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
          <Link
            href="/vendor/login"
            style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textDecoration: 'none' }}
          >
            Vendor staff? Login here →
          </Link>
        </div>
      </div>
    </main>
  );
}
