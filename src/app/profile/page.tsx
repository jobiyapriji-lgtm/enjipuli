'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { ElephantMascot } from '@/components/ElephantMascot';
import {
  User,
  Mail,
  GraduationCap,
  ShieldCheck,
  Calendar,
  ShoppingBag,
  Receipt,
  CheckCircle2,
  Clock,
  LogOut,
  Edit2,
  Check,
  X,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Flame,
} from 'lucide-react';

interface ProfileData {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  isProvidence: boolean;
  stats: {
    totalOrders: number;
    completedOrders: number;
    activeOrders: number;
    totalSpent: number;
  };
  recentOrders: Array<{
    id: string;
    token: string;
    status: string;
    totalAmount: number;
    createdAt: string;
  }>;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/profile');
    }
  }, [status, router]);

  useEffect(() => {
    async function loadProfile() {
      if (status !== 'authenticated') return;
      try {
        setLoading(true);
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setNameInput(data.name || '');
        } else {
          setErrorMessage('Unable to load profile information');
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
        setErrorMessage('Failed to connect to the server');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [status]);

  async function handleUpdateName(e: React.FormEvent) {
    e.preventDefault();
    if (!nameInput.trim() || nameInput.trim().length < 2) {
      setErrorMessage('Name must be at least 2 characters');
      return;
    }

    try {
      setSavingName(true);
      setErrorMessage('');
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameInput.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile((prev) => (prev ? { ...prev, name: data.user.name } : null));
        setIsEditingName(false);
        setSuccessMessage('Profile name updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const err = await res.json();
        setErrorMessage(err.error || 'Failed to update name');
      }
    } catch {
      setErrorMessage('Network error while updating name');
    } finally {
      setSavingName(false);
    }
  }

  const isVendor = profile?.role === 'VENDOR';
  const displayName = profile?.name || session?.user?.name || (profile?.email ? profile.email.split('@')[0] : 'User');
  const userInitial = (displayName[0] || 'U').toUpperCase();

  const formattedJoinDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric',
      })
    : 'Recent Member';

  return (
    <div className="min-h-screen bg-ej-deep text-ej-cream flex flex-col">
      <Header />

      <main className="max-w-3xl w-full mx-auto px-4 py-8 space-y-6 flex-1">
        {/* Breadcrumb / Top Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-ej-muted">
            <Link href="/" className="hover:text-ej-lime transition">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-ej-cream font-semibold">Account Holder Profile</span>
          </div>

          <Link
            href="/orders"
            className="text-xs font-bold text-ej-gold hover:underline flex items-center gap-1"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>My Orders</span>
          </Link>
        </div>

        {/* Loading State Skeleton */}
        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-44 bg-ej-indigo/60 rounded-3xl border border-ej-border/60" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-ej-indigo/60 rounded-2xl border border-ej-border/60" />
              ))}
            </div>
            <div className="h-48 bg-ej-indigo/60 rounded-2xl border border-ej-border/60" />
          </div>
        ) : profile ? (
          <>
            {/* Feedback Notifications */}
            {successMessage && (
              <div className="p-3.5 rounded-2xl bg-ej-lime/15 border border-ej-lime/30 text-ej-lime text-xs font-bold flex items-center gap-2 animate-fade-in-up">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-ej-vermilion/15 border border-ej-vermilion/30 text-ej-vermilion text-xs font-bold flex items-center gap-2 animate-fade-in-up">
                <X className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Profile Hero Card */}
            <div className="card p-6 sm:p-8 border-ej-border/80 relative overflow-hidden bg-gradient-to-br from-ej-indigo via-ej-deep to-ej-surface shadow-2xl">
              {/* Background ambient glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-ej-lime/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10 text-center sm:text-left">
                {/* Large Avatar */}
                <div className="relative shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-ej-lime via-ej-teal to-ej-gold text-ej-ink font-black flex items-center justify-center text-4xl shadow-glow-md">
                    {userInitial}
                  </div>
                  <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-ej-lime border-4 border-ej-deep shadow-md" title="Active Account" />
                </div>

                {/* Account Details */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-ej-lime/15 border border-ej-lime/30 text-ej-lime">
                      {isVendor ? (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5" /> Food Truck Vendor
                        </>
                      ) : (
                        <>
                          <GraduationCap className="w-3.5 h-3.5" /> Student Member
                        </>
                      )}
                    </span>

                    {profile.isProvidence ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-ej-teal/20 text-ej-teal border border-ej-teal/40">
                        <Sparkles className="w-3 h-3" /> Providence Campus
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-ej-surface text-ej-muted border border-ej-border">
                        Campus Guest
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] text-ej-muted border border-ej-border/60">
                      <Calendar className="w-3 h-3" /> Member since {formattedJoinDate}
                    </span>
                  </div>

                  {/* Name Edit / View */}
                  {isEditingName ? (
                    <form onSubmit={handleUpdateName} className="flex items-center gap-2 pt-1 max-w-sm mx-auto sm:mx-0">
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="Your full name"
                        className="input-field py-1.5 px-3 text-sm flex-1 bg-ej-deep border border-ej-lime/50 rounded-xl"
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={savingName}
                        className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1 shrink-0"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{savingName ? 'Saving...' : 'Save'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNameInput(profile.name || '');
                          setIsEditingName(false);
                        }}
                        className="p-2 rounded-xl text-ej-muted hover:text-ej-cream border border-ej-border hover:bg-ej-surface transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                      <h1 className="text-2xl sm:text-3xl font-black text-ej-cream truncate">
                        {displayName}
                      </h1>
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="p-1.5 rounded-lg text-ej-muted hover:text-ej-lime hover:bg-ej-surface transition"
                        title="Edit Name"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Email address */}
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-ej-muted font-mono">
                    <Mail className="w-3.5 h-3.5 text-ej-teal shrink-0" />
                    <span className="truncate">{profile.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="card p-4 border-ej-border/60 bg-ej-indigo/40 text-center space-y-1">
                <span className="text-[11px] font-bold text-ej-muted uppercase tracking-wider">Total Orders</span>
                <p className="text-2xl font-black text-ej-cream">{profile.stats.totalOrders}</p>
                <span className="text-[10px] text-ej-muted">Lifetime orders placed</span>
              </div>

              <div className="card p-4 border-ej-border/60 bg-ej-indigo/40 text-center space-y-1">
                <span className="text-[11px] font-bold text-ej-gold uppercase tracking-wider">Active Tokens</span>
                <p className="text-2xl font-black text-ej-gold">{profile.stats.activeOrders}</p>
                <span className="text-[10px] text-ej-muted">Currently preparing</span>
              </div>

              <div className="card p-4 border-ej-border/60 bg-ej-indigo/40 text-center space-y-1">
                <span className="text-[11px] font-bold text-ej-lime uppercase tracking-wider">Total Spent</span>
                <p className="text-2xl font-black text-ej-lime">₹{profile.stats.totalSpent.toFixed(0)}</p>
                <span className="text-[10px] text-ej-muted">Campus treats enjoyed</span>
              </div>

              <div className="card p-4 border-ej-border/60 bg-ej-indigo/40 text-center space-y-1">
                <span className="text-[11px] font-bold text-ej-teal uppercase tracking-wider">Completed</span>
                <p className="text-2xl font-black text-ej-teal">{profile.stats.completedOrders}</p>
                <span className="text-[10px] text-ej-muted">Successfully collected</span>
              </div>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/orders"
                className="card card-hover p-5 border-ej-border/60 bg-ej-indigo/50 flex items-center justify-between group transition hover:border-ej-gold/50"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-ej-gold/15 text-ej-gold flex items-center justify-center font-bold">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ej-cream group-hover:text-ej-gold transition">
                      My Orders &amp; Receipts
                    </h3>
                    <p className="text-[11px] text-ej-muted">
                      View QR pickup tokens &amp; past order bills
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-ej-muted group-hover:text-ej-gold group-hover:translate-x-1 transition" />
              </Link>

              {isVendor ? (
                <Link
                  href="/vendor/queue"
                  className="card card-hover p-5 border-ej-border/60 bg-ej-indigo/50 flex items-center justify-between group transition hover:border-ej-lime/50"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-ej-lime/15 text-ej-lime flex items-center justify-center font-bold">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-ej-cream group-hover:text-ej-lime transition">
                        Vendor Kitchen Queue
                      </h3>
                      <p className="text-[11px] text-ej-muted">
                        Manage live tokens, prep &amp; delivery
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-ej-muted group-hover:text-ej-lime group-hover:translate-x-1 transition" />
                </Link>
              ) : (
                <Link
                  href="/"
                  className="card card-hover p-5 border-ej-border/60 bg-ej-indigo/50 flex items-center justify-between group transition hover:border-ej-teal/50"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-ej-teal/15 text-ej-teal flex items-center justify-center font-bold">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-ej-cream group-hover:text-ej-teal transition">
                        Browse Food Truck Menu
                      </h3>
                      <p className="text-[11px] text-ej-muted">
                        Order fresh snacks, shakes &amp; meals
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-ej-muted group-hover:text-ej-teal group-hover:translate-x-1 transition" />
                </Link>
              )}
            </div>

            {/* Recent Orders Section */}
            <div className="card p-6 border-ej-border/60 bg-ej-indigo/30 space-y-4">
              <div className="flex items-center justify-between border-b border-ej-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-ej-lime" />
                  <h3 className="text-sm font-bold text-ej-cream">Recent Activity</h3>
                </div>
                <Link
                  href="/orders"
                  className="text-xs text-ej-lime hover:underline font-semibold flex items-center gap-1"
                >
                  <span>View All History</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {profile.recentOrders.length === 0 ? (
                <div className="py-6 text-center text-xs text-ej-muted space-y-2">
                  <p>You haven&apos;t placed any orders yet.</p>
                  <Link href="/" className="btn-primary inline-flex text-xs py-1.5 px-3">
                    Start Your First Order
                  </Link>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {profile.recentOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-ej-surface/70 border border-ej-border/40 hover:border-ej-border text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-black text-ej-lime bg-ej-indigo px-2.5 py-1 rounded-lg border border-ej-lime/20 font-mono">
                          {ord.token}
                        </span>
                        <div>
                          <p className="font-bold text-ej-cream">₹{ord.totalAmount.toFixed(0)}</p>
                          <p className="text-[10px] text-ej-muted font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(ord.createdAt).toLocaleDateString([], {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            ord.status === 'DELIVERED'
                              ? 'bg-ej-surface text-ej-muted border border-ej-border'
                              : ord.status === 'READY'
                              ? 'bg-ej-lime/20 text-ej-lime border border-ej-lime animate-pulse'
                              : 'bg-ej-gold/20 text-ej-gold border border-ej-gold/50'
                          }`}
                        >
                          {ord.status}
                        </span>
                        <Link
                          href={`/order/${ord.id}`}
                          className="p-1.5 rounded-lg text-ej-muted hover:text-ej-lime hover:bg-ej-indigo transition"
                          title="View Token & Receipt"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Account Settings / Sign Out */}
            <div className="card p-6 border-ej-border/60 bg-ej-indigo/30 space-y-4">
              <h3 className="text-sm font-bold text-ej-cream border-b border-ej-border/60 pb-3">
                Account &amp; Security
              </h3>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <div className="text-left w-full sm:w-auto">
                  <p className="font-semibold text-ej-cream">Session Authentication</p>
                  <p className="text-[11px] text-ej-muted">
                    Logged in via {isVendor ? 'Vendor Passkey' : 'One-Time Password (OTP)'}
                  </p>
                </div>

                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold text-ej-vermilion hover:bg-ej-vermilion/10 border border-ej-vermilion/30 transition shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out of Enjipuli</span>
                </button>
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
