'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { VendorDashboardLayout } from '@/components/VendorDashboardLayout';
import {
  Clock,
  CheckCircle2,
  RefreshCw,
  QrCode,
  Flame,
  ChefHat,
  BellRing,
  PackageCheck,
  User,
  X,
  AlertTriangle,
  XCircle,
  Search,
  Camera,
  Check,
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface OrderItem {
  id: string;
  quantity: number;
  menuItem: { name: string };
}

interface Order {
  id: string;
  token: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  user?: { name: string | null; email: string; collegeId?: string | null };
  items: OrderItem[];
}

type VendorStatus = 'PAID' | 'PREPARING' | 'READY';

const COLUMNS: {
  key: VendorStatus;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeColor: string;
  next?: string;
  nextLabel?: string;
  btnClass: string;
}[] = [
  {
    key: 'PAID',
    label: 'New / Paid',
    icon: Flame,
    badgeColor: 'bg-ej-gold/20 text-ej-gold border-ej-gold/40',
    next: 'PREPARING',
    nextLabel: 'Start Preparing →',
    btnClass: 'btn-gold',
  },
  {
    key: 'PREPARING',
    label: 'Preparing',
    icon: ChefHat,
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    next: 'READY',
    nextLabel: 'Mark Ready →',
    btnClass: 'bg-ej-teal hover:bg-ej-teal-dim text-ej-ink font-extrabold shadow-glow-sm',
  },
  {
    key: 'READY',
    label: 'Ready for Pickup',
    icon: BellRing,
    badgeColor: 'bg-ej-lime/20 text-ej-lime border-ej-lime/40',
    btnClass: 'btn-secondary text-xs',
  },
];

export default function VendorQueuePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Delivery Modal states
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [targetOrder, setTargetOrder] = useState<Order | null>(null);
  const [manualTokenInput, setManualTokenInput] = useState('');
  const [verifyingDelivery, setVerifyingDelivery] = useState(false);
  const [deliveryResult, setDeliveryResult] = useState<{
    status: 'SUCCESS' | 'ALREADY_DELIVERED' | 'ERROR';
    message: string;
    order?: any;
  } | null>(null);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const fetchQueue = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch('/api/orders?mode=queue');
      if (res.ok) setOrders(await res.json());
    } catch {
      /* silent poll error */
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const id = setInterval(() => fetchQueue(), 5_000);
    return () => clearInterval(id);
  }, []);

  const advanceStatus = async (orderId: string, status: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch('/api/vendor/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to update order status.');
      }
      fetchQueue();
    } finally {
      setUpdatingId(null);
    }
  };

  // Open delivery modal for a specific order or general scan
  const openDeliveryModal = (order?: Order) => {
    setTargetOrder(order || null);
    setManualTokenInput(order ? order.token : '');
    setDeliveryResult(null);
    setIsDeliveryModalOpen(true);
  };

  // Close delivery modal
  const closeDeliveryModal = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }
    setIsDeliveryModalOpen(false);
    setTargetOrder(null);
    setDeliveryResult(null);
    setManualTokenInput('');
  };

  // Process delivery payload (either scanned QR data or manual token)
  const processDelivery = async (payload: { orderId?: string; qrSecret?: string; token?: string }) => {
    setVerifyingDelivery(true);
    setDeliveryResult(null);

    try {
      const res = await fetch('/api/vendor/deliver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          expectedOrderId: targetOrder ? targetOrder.id : undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.alreadyDelivered) {
          setDeliveryResult({
            status: 'ALREADY_DELIVERED',
            message: data.message || `Order ${data.order?.token} was already delivered earlier!`,
            order: data.order,
          });
        } else {
          setDeliveryResult({
            status: 'SUCCESS',
            message: data.message || `Order ${data.order?.token} marked DELIVERED!`,
            order: data.order,
          });
        }
        fetchQueue();
      } else {
        setDeliveryResult({
          status: 'ERROR',
          message: data.error || 'Delivery verification failed.',
        });
      }
    } catch (err: any) {
      setDeliveryResult({
        status: 'ERROR',
        message: err.message || 'Network error during delivery verification.',
      });
    } finally {
      setVerifyingDelivery(false);
    }
  };

  // Mount camera scanner when modal opens
  useEffect(() => {
    if (!isDeliveryModalOpen) return;

    // Small timeout to allow DOM to render #queue-reader container
    const timer = setTimeout(() => {
      const container = document.getElementById('queue-reader');
      if (!container) return;

      const scanner = new Html5QrcodeScanner(
        'queue-reader',
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
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
              processDelivery({ orderId: parsed.orderId, qrSecret: parsed.qrSecret });
            } else {
              processDelivery({ token: decodedText.trim() });
            }
          } catch {
            processDelivery({ token: decodedText.trim() });
          }
        },
        (_scanError) => {
          // quiet camera frame errors
        }
      );
    }, 150);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [isDeliveryModalOpen]);

  const deliveredToday = useMemo(() => orders.filter((o) => o.status === 'DELIVERED'), [orders]);
  const paidOrders = useMemo(() => orders.filter((o) => o.status === 'PAID'), [orders]);
  const preparingOrders = useMemo(() => orders.filter((o) => o.status === 'PREPARING'), [orders]);
  const readyOrders = useMemo(() => orders.filter((o) => o.status === 'READY'), [orders]);
  const activeCount = paidOrders.length + preparingOrders.length + readyOrders.length;

  return (
    <VendorDashboardLayout
      title="Live Kitchen Queue"
      subtitle="Real-time order ticket board & instant QR pickup fulfillment"
      action={
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchQueue(true)}
            disabled={refreshing}
            className="p-2 rounded-xl bg-ej-surface hover:bg-ej-surface-2 border border-ej-border text-ej-muted hover:text-ej-cream transition flex items-center gap-1.5 text-xs font-semibold"
            title="Refresh queue"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-ej-lime' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => openDeliveryModal()}
            className="btn-primary text-xs flex items-center gap-1.5 py-2 px-3.5 shadow-glow-sm"
            title="Open camera scanner or manual token entry to deliver"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan Pickup / Deliver →</span>
          </button>
        </div>
      }
    >
      {/* ─────────────────────────────────────────────────────────────
          1. TOP KPI SUMMARY STRIP
          ───────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="card p-3.5 sm:p-4 border-ej-border bg-ej-indigo/80 flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-ej-muted uppercase tracking-wider">
              Total in Queue
            </p>
            <p className="text-xl sm:text-2xl font-black text-ej-lime mt-1">{activeCount}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-ej-lime/15 text-ej-lime flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="card p-3.5 sm:p-4 border-ej-border bg-ej-indigo/80 flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-ej-muted uppercase tracking-wider">
              New / Paid
            </p>
            <p className="text-xl sm:text-2xl font-black text-ej-gold mt-1">{paidOrders.length}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-ej-gold/15 text-ej-gold flex items-center justify-center">
            <Flame className="w-4 h-4" />
          </div>
        </div>

        <div className="card p-3.5 sm:p-4 border-ej-border bg-ej-indigo/80 flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-ej-muted uppercase tracking-wider">
              Cooking Now
            </p>
            <p className="text-xl sm:text-2xl font-black text-blue-400 mt-1">{preparingOrders.length}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
            <ChefHat className="w-4 h-4" />
          </div>
        </div>

        <div className="card p-3.5 sm:p-4 border-ej-border bg-ej-indigo/80 flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-ej-muted uppercase tracking-wider">
              Ready / Call
            </p>
            <p className="text-xl sm:text-2xl font-black text-ej-teal mt-1">{readyOrders.length}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-ej-teal/15 text-ej-teal flex items-center justify-center">
            <BellRing className="w-4 h-4" />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. KANBAN TICKET BOARD (Chronological queue order)
          ───────────────────────────────────────────────────────────── */}
      <section
        id="kanban-board"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start"
      >
        {loading ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center gap-3 text-ej-muted text-sm font-bold">
            <RefreshCw className="w-6 h-6 animate-spin text-ej-lime" />
            <span>Loading live order queue…</span>
          </div>
        ) : (
          <>
            {COLUMNS.map((col) => {
              const colOrders = orders.filter((o) => o.status === col.key);
              const ColIcon = col.icon;
              return (
                <div
                  key={col.key}
                  id={`kanban-col-${col.key.toLowerCase()}`}
                  className="card p-4 flex flex-col gap-3 border-ej-border/80 bg-ej-indigo/80 shadow-md"
                >
                  {/* Column header */}
                  <div className="flex items-center justify-between pb-3 border-b border-ej-border">
                    <div className="flex items-center gap-2">
                      <ColIcon className="w-4 h-4 text-ej-muted" />
                      <h2 className="text-sm font-extrabold text-ej-cream">{col.label}</h2>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${col.badgeColor}`}
                    >
                      {colOrders.length}
                    </span>
                  </div>

                  {/* Order cards */}
                  {colOrders.length === 0 ? (
                    <div className="py-10 text-center text-ej-muted/60 text-xs font-medium border border-dashed border-ej-border/60 rounded-xl">
                      — No orders —
                    </div>
                  ) : (
                    colOrders.map((order) => {
                      const customerName =
                        order.user?.name ||
                        (order.user?.email ? order.user.email.split('@')[0] : 'Student');
                      return (
                        <article
                          key={order.id}
                          id={`order-card-${order.id}`}
                          className="p-3.5 bg-ej-surface border border-ej-border hover:border-ej-lime/50 rounded-xl flex flex-col gap-2.5 transition-all shadow-md group"
                        >
                          {/* Order token & time */}
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-black text-ej-lime tracking-tight drop-shadow-[0_0_8px_rgba(212,255,61,0.2)]">
                              {order.token}
                            </span>
                            <span className="text-[11px] font-mono text-ej-muted flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(order.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          {/* Customer Identifier ("who it's for") */}
                          <div className="flex items-center justify-between text-[11px] text-ej-muted font-medium bg-ej-deep/60 px-2 py-1 rounded-lg">
                            <div className="flex items-center gap-1.5 truncate">
                              <User className="w-3 h-3 shrink-0 text-ej-gold" />
                              <span className="truncate text-ej-cream font-bold">
                                {customerName}
                              </span>
                            </div>
                            {order.user?.collegeId && (
                              <span className="text-[9px] font-mono text-ej-muted shrink-0">
                                {order.user.collegeId}
                              </span>
                            )}
                          </div>

                          {/* Item names and quantities (e.g. "1x Puffs") */}
                          <ul className="space-y-1 my-1 text-xs text-ej-cream/90 font-medium border-y border-ej-border/50 py-2">
                            {order.items.map((i) => (
                              <li key={i.id} className="flex justify-between items-center">
                                <span>
                                  <strong className="text-ej-gold font-bold">{i.quantity}×</strong>{' '}
                                  {i.menuItem.name}
                                </span>
                              </li>
                            ))}
                          </ul>

                          {/* Action Buttons: DELIVERY action on every order */}
                          <div className="space-y-1.5 pt-1">
                            <button
                              onClick={() => openDeliveryModal(order)}
                              className={`w-full py-2 px-3 text-xs font-black rounded-lg transition active:scale-98 flex items-center justify-center gap-1.5 shadow-sm ${
                                col.key === 'READY'
                                  ? 'bg-ej-lime hover:bg-ej-lime-dim text-ej-ink shadow-glow-sm'
                                  : 'bg-ej-surface hover:bg-ej-surface-2 text-ej-cream border border-ej-border hover:border-ej-lime/50'
                              }`}
                              title={`Scan QR or type order number to mark ${order.token} delivered`}
                            >
                              <QrCode className="w-3.5 h-3.5 text-ej-lime" />
                              <span>Delivery (Fulfill Order)</span>
                            </button>

                            {/* Optional Kitchen Prep Advancement */}
                            {col.next && (
                              <button
                                className={`w-full py-1.5 text-[11px] font-bold rounded-lg transition active:scale-98 flex items-center justify-center gap-1 ${col.btnClass}`}
                                onClick={() => advanceStatus(order.id, col.next!)}
                                disabled={updatingId === order.id}
                              >
                                {updatingId === order.id ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <span>{col.nextLabel}</span>
                                )}
                              </button>
                            )}
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>
              );
            })}

            {/* Delivered column */}
            <div
              id="kanban-col-delivered"
              className="card p-4 border-ej-border/80 bg-ej-indigo/60 shadow-md"
            >
              <div className="flex items-center justify-between pb-3 border-b border-ej-border mb-3">
                <div className="flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-ej-teal" />
                  <h2 className="text-sm font-extrabold text-ej-cream">Delivered Today</h2>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-ej-teal/20 text-ej-teal border border-ej-teal/40">
                  {deliveredToday.length}
                </span>
              </div>

              {deliveredToday.length === 0 ? (
                <div className="py-10 text-center text-ej-muted/60 text-xs font-medium border border-dashed border-ej-border/60 rounded-xl">
                  — None yet —
                </div>
              ) : (
                <div className="space-y-2">
                  {deliveredToday.slice(0, 15).map((o) => (
                    <div
                      key={o.id}
                      className="p-2 rounded-xl bg-ej-surface/60 border border-ej-border/40 text-xs space-y-1 hover:border-ej-teal/40 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-ej-teal" />
                          <span className="font-black text-ej-lime">{o.token}</span>
                          <span className="text-[10px] text-ej-muted font-medium truncate max-w-[90px]">
                            {o.user?.name || o.user?.email?.split('@')[0] || 'Student'}
                          </span>
                        </div>
                        <span className="font-mono text-ej-gold font-bold">₹{o.totalAmount}</span>
                      </div>
                      <p className="text-[10px] text-ej-muted/80 truncate">
                        {o.items.map((i) => `${i.quantity}× ${i.menuItem.name}`).join(', ')}
                      </p>
                    </div>
                  ))}
                  {deliveredToday.length > 15 && (
                    <p className="text-[11px] text-ej-muted text-center pt-1 font-semibold">
                      +{deliveredToday.length - 15} more delivered
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. MODAL: QR SCANNER & MANUAL DELIVERY FULFILLMENT
          ───────────────────────────────────────────────────────────── */}
      {isDeliveryModalOpen && (
        <div
          id="delivery-modal-overlay"
          className="fixed inset-0 z-50 bg-ej-deep/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => {
            if ((e.target as HTMLElement).id === 'delivery-modal-overlay') closeDeliveryModal();
          }}
        >
          <div
            id="delivery-modal"
            className="w-full max-w-lg bg-ej-indigo border border-ej-border rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-scale-up max-h-[92vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-ej-border/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-ej-lime/15 text-ej-lime flex items-center justify-center font-black">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-ej-cream leading-tight">
                    Order Delivery &amp; Pickup
                  </h3>
                  <p className="text-[11px] text-ej-muted">
                    {targetOrder
                      ? `Fulfill ${targetOrder.token} — ${targetOrder.user?.name || 'Student'}`
                      : 'Scan student pickup ticket or enter token'}
                  </p>
                </div>
              </div>

              <button
                onClick={closeDeliveryModal}
                className="p-1.5 rounded-xl text-ej-muted hover:text-ej-cream hover:bg-ej-surface transition"
                aria-label="Close delivery modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Order Summary (if launched from an order ticket) */}
            {targetOrder && (
              <div className="p-3 rounded-2xl bg-ej-surface border border-ej-border/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ej-muted">Order Ticket:</span>
                  <span className="text-lg font-black text-ej-lime font-mono">{targetOrder.token}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ej-muted">Customer:</span>
                  <span className="text-ej-cream font-bold">
                    {targetOrder.user?.name || targetOrder.user?.email || 'Student'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-ej-border/40 pt-1">
                  <span className="text-ej-muted">Items:</span>
                  <span className="text-ej-gold font-bold text-right truncate max-w-[260px]">
                    {targetOrder.items.map((i) => `${i.quantity}× ${i.menuItem.name}`).join(', ')}
                  </span>
                </div>
              </div>
            )}

            {/* Verification Loading State */}
            {verifyingDelivery && (
              <div className="p-3.5 rounded-2xl bg-ej-gold/20 border border-ej-gold/50 text-ej-gold text-xs font-bold flex items-center justify-center gap-2 animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verifying ticket &amp; marking delivered...</span>
              </div>
            )}

            {/* Result Alerts */}
            {deliveryResult && !verifyingDelivery && (
              <div
                className={`p-4 rounded-2xl border space-y-2.5 animate-fade-in ${
                  deliveryResult.status === 'SUCCESS'
                    ? 'bg-ej-teal/20 border-ej-teal text-ej-teal'
                    : deliveryResult.status === 'ALREADY_DELIVERED'
                    ? 'bg-ej-gold/20 border-ej-gold text-ej-gold'
                    : 'bg-ej-vermilion/20 border-ej-vermilion text-ej-vermilion'
                }`}
              >
                <div className="flex items-center gap-2 font-black text-sm">
                  {deliveryResult.status === 'SUCCESS' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                  {deliveryResult.status === 'ALREADY_DELIVERED' && (
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                  )}
                  {deliveryResult.status === 'ERROR' && <XCircle className="w-5 h-5 shrink-0" />}
                  <span>{deliveryResult.message}</span>
                </div>

                {deliveryResult.order && (
                  <div className="text-[11px] font-mono text-ej-cream bg-ej-deep/60 p-2.5 rounded-xl space-y-1">
                    <p>
                      <strong>Token:</strong>{' '}
                      <span className="text-ej-lime font-black">{deliveryResult.order.token}</span>
                    </p>
                    <p>
                      <strong>Customer:</strong>{' '}
                      {deliveryResult.order.user?.name ||
                        deliveryResult.order.user?.email ||
                        'Customer'}
                    </p>
                    <p>
                      <strong>Items:</strong>{' '}
                      {deliveryResult.order.items
                        ?.map((i: any) => `${i.quantity}× ${i.menuItem?.name || 'Item'}`)
                        .join(', ')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Camera QR Scanner */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-ej-cream">
                <span className="flex items-center gap-1.5 text-ej-lime">
                  <Camera className="w-4 h-4" />
                  <span>Scan Student Pickup QR</span>
                </span>
                <span className="text-[10px] text-ej-muted">Position QR inside box</span>
              </div>

              <div
                id="queue-reader"
                className="overflow-hidden rounded-2xl border border-ej-border bg-ej-deep min-h-[240px]"
              />
            </div>

            {/* Manual Order Number Fallback */}
            <div className="p-3.5 rounded-2xl bg-ej-surface border border-ej-border space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-ej-cream">
                <Search className="w-3.5 h-3.5 text-ej-gold" />
                <span>Manual Order Number Override</span>
              </div>
              <p className="text-[11px] text-ej-muted">
                If the student camera or screen is unavailable, type their order number:
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!manualTokenInput.trim()) return;
                  processDelivery({ token: manualTokenInput.trim() });
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  placeholder="e.g. EJ-014 or 14"
                  value={manualTokenInput}
                  onChange={(e) => setManualTokenInput(e.target.value)}
                  className="input-field flex-1 font-mono uppercase text-center text-sm font-black text-ej-lime"
                />
                <button
                  type="submit"
                  disabled={verifyingDelivery}
                  className="btn-gold py-2 px-4 text-xs font-black shrink-0"
                >
                  Deliver →
                </button>
              </form>
            </div>

            {/* Done button */}
            <button
              onClick={closeDeliveryModal}
              className="w-full py-2.5 rounded-xl bg-ej-surface hover:bg-ej-surface-2 text-ej-cream text-xs font-bold border border-ej-border transition"
            >
              Done / Close Scanner
            </button>
          </div>
        </div>
      )}
    </VendorDashboardLayout>
  );
}
