'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Camera, CheckCircle2, AlertTriangle, XCircle, Search, RefreshCw } from 'lucide-react';
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
    // Initialize html5-qrcode scanner
    const scanner = new Html5QrcodeScanner(
      'reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      /* verbose= */ false
    );

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        try {
          // Parse JSON payload or raw text
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
      (error) => {
        // quiet background frame errors
      }
    );

    return () => {
      scanner.clear().catch((err) => console.error('Failed to clear scanner', err));
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-16">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <Link href="/vendor/queue" className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-amber-400">In-Browser QR Scanner</h1>
            <p className="text-xs text-slate-400">Scan pickup QR codes using tablet/phone camera</p>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6 space-y-5">
        {/* Verification Status Toast Banner */}
        {verifying && (
          <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/50 text-amber-300 text-sm flex items-center space-x-2 animate-pulse">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Verifying QR token with server...</span>
          </div>
        )}

        {scanResult && !verifying && (
          <div
            className={`p-5 rounded-2xl border shadow-xl space-y-2 animate-in fade-in duration-200 ${
              scanResult.status === 'SUCCESS'
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                : scanResult.status === 'ALREADY_DELIVERED'
                ? 'bg-amber-950/80 border-amber-500 text-amber-200'
                : 'bg-red-950/80 border-red-500 text-red-200'
            }`}
          >
            <div className="flex items-center space-x-2 font-bold text-base">
              {scanResult.status === 'SUCCESS' && <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />}
              {scanResult.status === 'ALREADY_DELIVERED' && <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />}
              {scanResult.status === 'ERROR' && <XCircle className="w-6 h-6 text-red-400 shrink-0" />}
              <span>{scanResult.message}</span>
            </div>

            {scanResult.order && (
              <div className="text-xs space-y-1 pt-2 border-t border-white/10 font-mono">
                <p>Token: <strong className="text-white font-bold">{scanResult.order.token}</strong></p>
                <p>Items: {scanResult.order.items?.map((i: any) => `${i.quantity}x ${i.menuItem.name}`).join(', ')}</p>
                <p>Total: ₹{scanResult.order.totalAmount}</p>
              </div>
            )}

            <button
              onClick={() => setScanResult(null)}
              className="mt-2 w-full py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition"
            >
              Dismiss Alert
            </button>
          </div>
        )}

        {/* Camera Container */}
        <div className="bg-slate-800 rounded-3xl border border-slate-700 p-4 space-y-3 shadow-xl">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 border-b border-slate-700 pb-2">
            <Camera className="w-4 h-4" />
            <span>Point camera at Student's Order QR code</span>
          </div>

          <div id="reader" className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900" />
        </div>

        {/* Manual Token Entry Fallback */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
            <Search className="w-4 h-4 text-amber-400" />
            <span>Manual Token Override</span>
          </h3>

          <form onSubmit={handleManualSubmit} className="flex space-x-2">
            <input
              type="text"
              placeholder="e.g. EJ-014"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-500 uppercase"
            />
            <button
              type="submit"
              disabled={verifying}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition disabled:opacity-50"
            >
              Verify
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
