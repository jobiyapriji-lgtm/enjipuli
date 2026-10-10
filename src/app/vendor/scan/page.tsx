'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { VendorDashboardLayout } from '@/components/VendorDashboardLayout';
import {
  Camera,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  RefreshCw,
  ClipboardList,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function VendorScanPage() {
  const [manualToken, setManualToken] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [scanResult, setScanResult] = useState<{
    status: 'SUCCESS' | 'ALREADY_DELIVERED' | 'ERROR';
    message: string;
    order?: any;
  } | null>(null);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const handleProcessPayload = async (payload: { orderId?: string; qrSecret?: string; token?: string }) => {
    setVerifying(true);
    setScanResult(null);

    try {
      const res = await fetch('/api/vendor/deliver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.alreadyDelivered) {
          setScanResult({
            status: 'ALREADY_DELIVERED',
            message: data.message || 'Order was already delivered earlier!',
            order: data.order,
          });
        } else {
          setScanResult({
            status: 'SUCCESS',
            message: data.message || `Order ${data.order?.token} marked DELIVERED!`,
            order: data.order,
          });
        }
      } else {
        setScanResult({
          status: 'ERROR',
          message: data.error || 'Failed to verify QR scan code',
        });
      }
    } catch (err: any) {
      setScanResult({
        status: 'ERROR',
        message: err.message || 'Scan verification failed',
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    handleProcessPayload({ token: manualToken.trim() });
  };

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        try {
          if (decodedText.startsWith('{')) {
            const parsed = JSON.parse(decodedText);
            handleProcessPayload({ orderId: parsed.orderId, qrSecret: parsed.qrSecret });
          } else {
            handleProcessPayload({ token: decodedText.trim() });
          }
        } catch {
          handleProcessPayload({ token: decodedText.trim() });
        }
      },
      (_error) => {
        // quiet background frame errors
      }
    );

    return () => {
      scanner.clear().catch((err) => console.error('Failed to clear scanner', err));
    };
  }, []);

  return (
    <VendorDashboardLayout
      title="QR Order Verification"
      subtitle="Scan student ticket QR code or manually enter token for instant pickup verification"
      action={
        <Link
          href="/vendor/queue"
          className="btn-secondary text-xs flex items-center gap-1.5 py-2 px-3.5 shadow-sm"
        >
          <ClipboardList className="w-3.5 h-3.5 text-ej-lime" />
          <span>Live Queue →</span>
        </Link>
      }
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* ─────────────────────────────────────────────────────────────
            1. VERIFICATION LOADING BANNER
            ───────────────────────────────────────────────────────────── */}
        {verifying && (
          <div className="p-4 rounded-2xl bg-ej-gold/20 border border-ej-gold/50 text-ej-gold text-sm flex items-center justify-center gap-2 animate-pulse font-bold shadow-md">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Verifying QR token with server...</span>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            2. SCAN RESULT ALERT NOTIFICATION
            ───────────────────────────────────────────────────────────── */}
        {scanResult && !verifying && (
          <div
            className={`p-5 rounded-2xl border shadow-2xl space-y-3 ${
              scanResult.status === 'SUCCESS'
                ? 'bg-ej-teal/20 border-ej-teal text-ej-teal animate-success-flash'
                : scanResult.status === 'ALREADY_DELIVERED'
                ? 'bg-ej-gold/20 border-ej-gold text-ej-gold animate-fade-in-up'
                : 'bg-ej-vermilion/20 border-ej-vermilion text-ej-vermilion animate-shake'
            }`}
          >
            <div className="flex items-center gap-2 font-extrabold text-base">
              {scanResult.status === 'SUCCESS' && <CheckCircle2 className="w-6 h-6 text-ej-teal shrink-0" />}
              {scanResult.status === 'ALREADY_DELIVERED' && (
                <AlertTriangle className="w-6 h-6 text-ej-gold shrink-0" />
              )}
              {scanResult.status === 'ERROR' && <XCircle className="w-6 h-6 text-ej-vermilion shrink-0" />}
              <span>{scanResult.message}</span>
            </div>

            {scanResult.order && (
              <div className="text-xs space-y-1.5 pt-3 border-t border-white/10 font-mono text-ej-cream bg-ej-deep/50 p-3 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-ej-muted">Order Token:</span>
                  <strong className="text-ej-lime font-black text-base">{scanResult.order.token}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ej-muted">Items:</span>
                  <span className="text-right text-ej-cream font-medium">
                    {scanResult.order.items?.map((i: any) => `${i.quantity}× ${i.menuItem.name}`).join(', ')}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-1">
                  <span className="text-ej-muted">Total:</span>
                  <span className="text-ej-gold font-bold">₹{scanResult.order.totalAmount}</span>
                </div>
              </div>
            )}

            <button
              onClick={() => setScanResult(null)}
              className="w-full py-2.5 rounded-xl bg-ej-surface hover:bg-ej-surface-2 text-ej-cream font-bold text-xs border border-ej-border transition shadow-sm"
            >
              Dismiss &amp; Ready for Next Scan
            </button>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            3. CAMERA SCANNER CARD
            ───────────────────────────────────────────────────────────── */}
        <div className="card p-5 space-y-4 border-ej-border shadow-xl bg-ej-indigo/80">
          <div className="flex items-center justify-between border-b border-ej-border/60 pb-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-ej-lime">
              <Camera className="w-4 h-4 text-ej-lime" />
              <span>Camera QR Scanner</span>
            </div>
            <span className="text-[10px] text-ej-muted font-bold flex items-center gap-1">
              <Zap className="w-3 h-3 text-ej-gold" />
              <span>Auto-detect active</span>
            </span>
          </div>

          <div
            id="reader"
            className="overflow-hidden rounded-xl border border-ej-border bg-ej-deep min-h-[260px]"
          />

          <p className="text-[11px] text-ej-muted text-center">
            Position the student&apos;s digital ticket QR code steadily within the scanner frame.
          </p>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            4. MANUAL TOKEN ENTRY FALLBACK
            ───────────────────────────────────────────────────────────── */}
        <div className="card p-5 space-y-3.5 border-ej-border bg-ej-indigo/80 shadow-md">
          <div className="flex items-center gap-2 text-xs font-bold text-ej-cream">
            <Search className="w-4 h-4 text-ej-gold" />
            <span>Manual Token Override</span>
          </div>
          <p className="text-[11px] text-ej-muted">
            If camera scanning is unavailable or the student screen is cracked, enter the 3-5 character token manually:
          </p>

          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. 104 or EJ-104"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              className="input-field flex-1 font-mono uppercase text-center text-sm tracking-wider font-extrabold text-ej-lime"
            />
            <button
              type="submit"
              disabled={verifying}
              className="btn-gold py-2 px-5 text-xs font-extrabold shadow-sm shrink-0"
            >
              Verify Token
            </button>
          </form>
        </div>
      </div>
    </VendorDashboardLayout>
  );
}
