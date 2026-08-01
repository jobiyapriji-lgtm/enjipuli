'use client';

import { useState, useEffect, useRef } from 'react';
import { VendorHeader } from '@/components/VendorHeader';
import { Camera, CheckCircle2, AlertTriangle, XCircle, Search, RefreshCw } from 'lucide-react';
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
    <div className="min-h-screen bg-ej-deep text-ej-cream flex flex-col pb-16">
      <VendorHeader />

      <main className="max-w-md w-full mx-auto px-4 pt-6 space-y-5">
        {/* Verification Loading Banner */}
        {verifying && (
          <div className="p-4 rounded-2xl bg-ej-gold/20 border border-ej-gold/50 text-ej-gold text-sm flex items-center justify-center gap-2 animate-pulse font-bold">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Verifying QR token with server...</span>
          </div>
        )}

        {/* Scan Result Alert */}
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
              {scanResult.status === 'ALREADY_DELIVERED' && <AlertTriangle className="w-6 h-6 text-ej-gold shrink-0" />}
              {scanResult.status === 'ERROR' && <XCircle className="w-6 h-6 text-ej-vermilion shrink-0" />}
              <span>{scanResult.message}</span>
            </div>

            {scanResult.order && (
              <div className="text-xs space-y-1 pt-3 border-t border-white/10 font-mono text-ej-cream">
                <p>Token: <strong className="text-ej-lime font-black text-sm">{scanResult.order.token}</strong></p>
                <p>Items: {scanResult.order.items?.map((i: any) => `${i.quantity}x ${i.menuItem.name}`).join(', ')}</p>
                <p>Total: ₹{scanResult.order.totalAmount}</p>
              </div>
            )}

            <button
              onClick={() => setScanResult(null)}
              className="w-full py-2 rounded-xl bg-ej-surface hover:bg-ej-surface-2 text-ej-cream font-bold text-xs border border-ej-border transition"
            >
              Dismiss &amp; Scan Next
            </button>
          </div>
        )}

        {/* Camera Container */}
        <div className="card p-4 space-y-3 border-ej-border/80 shadow-2xl">
          <div className="flex items-center gap-2 text-xs font-extrabold text-ej-lime border-b border-ej-border pb-2.5">
            <Camera className="w-4 h-4" />
            <span>Point camera at Student&apos;s Order QR code</span>
          </div>

          <div id="reader" className="overflow-hidden rounded-xl border border-ej-border bg-ej-deep" />
        </div>

        {/* Manual Token Entry Fallback */}
        <div className="card p-4 space-y-3 border-ej-border/80">
          <h3 className="text-xs font-bold text-ej-cream flex items-center gap-2">
            <Search className="w-4 h-4 text-ej-gold" />
            <span>Manual Token Override</span>
          </h3>

          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. EJ-014"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              className="input-field flex-1 font-mono uppercase text-center text-sm tracking-wider"
            />
            <button
              type="submit"
              disabled={verifying}
              className="btn-gold py-2 px-4 text-xs font-extrabold"
            >
              Verify
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
