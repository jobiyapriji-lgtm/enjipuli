'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogoWordmark } from '@/components/LogoWordmark';
import { ElephantMascot } from '@/components/ElephantMascot';
import { MuralBackground } from '@/components/MuralBackground';
import { FloralDivider } from '@/components/FloralDivider';
import { ShieldCheck, RefreshCw, AlertTriangle } from 'lucide-react';

export default function VendorLoginPage() {
  const [step, setStep]       = useState<1 | 2>(1);
  const [email, setEmail]     = useState('vendor@enjipuli.com');
  const [code, setCode]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), purpose: 'vendor' }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send code.');
      }
      
      setStep(2);
      setCountdown(60);
      setCode('');
    } catch (err: any) {
      setError(err.message || 'Failed to send code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await signIn('credentials', { 
        email: email.trim(), 
        code: code.trim(),
        purpose: 'vendor', 
        redirect: false 
      });
      if (res?.error) { 
        setError(res.error); 
        return; 
      }
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
      style={{
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        position: 'relative',
      }}
    >
      <MuralBackground opacity={0.1} />

      <div
        className="animate-float"
        style={{
          position: 'absolute',
          bottom: '5%',
          left: '5%',
          opacity: 0.15,
          pointerEvents: 'none',
        }}
      >
        <ElephantMascot size={280} />
      </div>

      <div
        id="vendor-login-card"
        className="glass animate-fade-in-up"
        style={{
          width: '100%',
          maxWidth: 400,
          padding: '2.5rem 2rem',
          textAlign: 'center',
          borderRadius: 'var(--radius-2xl)',
          position: 'relative',
          zIndex: 1,
          boxShadow: '0 8px 48px rgba(0,0,0,0.5)',
        }}
      >
        <div id="vendor-login-logo" style={{ marginBottom: '1.25rem' }}>
          <LogoWordmark size={170} light glow />
        </div>

        <FloralDivider width={130} className="mx-auto" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ej-gold/15 border border-ej-gold/40 text-ej-gold text-xs font-bold my-4">
          <ShieldCheck className="w-4 h-4" />
          <span>STAFF PORTAL</span>
        </div>

        <p style={{
          color: 'var(--ej-muted)',
          fontSize: '0.8rem',
          margin: '0 0 1.25rem',
        }}>
          {step === 1 ? 'Restricted access — order queue & stock management.' : `Verification code sent to ${email}`}
        </p>

        {error && (
          <div
            id="vendor-login-error"
            role="alert"
            className="animate-shake"
            style={{
              padding: '0.65rem 0.85rem',
              background: 'rgba(240,86,46,0.1)',
              border: '1px solid rgba(240,86,46,0.4)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--ej-vermilion)',
              fontSize: '0.78rem',
              marginBottom: '1rem',
              textAlign: 'left',
            }}
          >
            ⚠ {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input
              id="vendor-login-email"
              type="email"
              required
              className="input-field"
              placeholder="vendor@enjipuli.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ textAlign: 'center', fontSize: '0.95rem' }}
            />
            <button
              id="vendor-login-submit"
              type="submit"
              className="btn-gold"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.9rem',
                fontWeight: 800,
              }}
              disabled={loading}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                  <RefreshCw className="animate-spin" width="16" height="16" />
                  Sending…
                </span>
              ) : (
                'Send Verification Code →'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input
              id="vendor-login-code"
              type="text"
              required
              maxLength={6}
              className="input-field"
              placeholder="123456"
              value={code}
              onChange={e => setCode(e.target.value.replace(/[^0-9]/g, ''))}
              autoComplete="one-time-code"
              style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '4px', fontWeight: 'bold' }}
            />
            <button
              id="vendor-login-verify"
              type="submit"
              className="btn-gold"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.9rem',
                fontWeight: 800,
              }}
              disabled={loading}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                  <RefreshCw className="animate-spin" width="16" height="16" />
                  Verifying…
                </span>
              ) : (
                'Access Dashboard'
              )}
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem' }}>
              <button 
                type="button" 
                onClick={() => setStep(1)}
                style={{ color: 'var(--ej-muted)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Wrong email?
              </button>
              <button 
                type="button"
                onClick={() => handleRequestOtp()}
                disabled={countdown > 0 || loading}
                style={{ 
                  color: countdown > 0 ? 'var(--ej-dark-text)' : 'var(--ej-gold)', 
                  background: 'none', 
                  border: 'none', 
                  cursor: countdown > 0 ? 'not-allowed' : 'pointer'
                }}
              >
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
              </button>
            </div>
          </form>
        )}

        <div style={{
          marginTop: '1.75rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--ej-border)',
        }}>
          <Link
            href="/login"
            style={{
              color: 'var(--ej-muted)',
              fontSize: '0.75rem',
              textDecoration: 'none',
              transition: 'color 0.15s',
            }}
          >
            ← Student login
          </Link>
        </div>
      </div>
    </main>
  );
}
