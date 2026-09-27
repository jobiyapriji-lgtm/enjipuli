'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import {
  User,
  Mail,
  GraduationCap,
  ShieldCheck,
  IdCard,
  Phone,
  Receipt,
  ShoppingBag,
  LogOut,
  Edit2,
  Check,
  X,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface ProfileData {
  id: string;
  email: string;
  name: string;
  collegeId: string;
  phone: string;
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

function ProfileContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFirstTimeUrl = searchParams.get('firstTime') === 'true';

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false);

  // Form states
  const [nameInput, setNameInput] = useState('');
  const [collegeIdInput, setCollegeIdInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');

  const [saving, setSaving] = useState(false);
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
          const data: ProfileData = await res.json();
          setProfile(data);

          const emailPrefix = data.email ? data.email.split('@')[0] : '';
          const isDefaultName = !data.name || data.name.toLowerCase() === emailPrefix.toLowerCase();

          // Prefill inputs
          setNameInput(isDefaultName ? '' : data.name);
          setCollegeIdInput(data.collegeId || '');
          setPhoneInput(data.phone || '');

          // Check if this is a first-time setup (either via query param or missing college ID)
          const needsSetup = isFirstTimeUrl || !data.collegeId || isDefaultName;
          if (needsSetup && data.role !== 'VENDOR') {
            setIsEditing(true);
            setIsFirstTimeSetup(true);
          }
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
  }, [status, isFirstTimeUrl]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!nameInput.trim() || nameInput.trim().length < 2) {
      setErrorMessage('Please enter your full name (at least 2 characters)');
      return;
    }

    if (profile?.role !== 'VENDOR' && (!collegeIdInput.trim() || collegeIdInput.trim().length < 2)) {
      setErrorMessage('Please enter your College ID or Roll Number');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage('');
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameInput.trim(),
          collegeId: collegeIdInput.trim().toUpperCase(),
          phone: phoneInput.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                name: data.user.name,
                collegeId: data.user.collegeId || '',
                phone: data.user.phone || '',
              }
            : null
        );

        setIsEditing(false);
        setSuccessMessage(
          isFirstTimeSetup
            ? 'Profile created successfully! Ready to order 🍔'
            : 'Profile details updated successfully!'
        );

        // If first time setup, redirect smoothly to home menu after a short delay
        if (isFirstTimeSetup) {
          setTimeout(() => {
            router.push('/');
            router.refresh();
          }, 1500);
        } else {
          setTimeout(() => setSuccessMessage(''), 3000);
        }
      } else {
        const err = await res.json();
        setErrorMessage(err.error || 'Failed to update profile');
      }
    } catch {
      setErrorMessage('Network error while saving profile');
    } finally {
      setSaving(false);
    }
  }

  const isVendor = profile?.role === 'VENDOR';
  const displayName =
    profile?.name || session?.user?.name || (profile?.email ? profile.email.split('@')[0] : 'User');
  const userInitial = (displayName[0] || 'U').toUpperCase();

  return (
    <div className="min-h-screen bg-ej-deep text-ej-cream flex flex-col">
      <Header />

      <main className="max-w-xl w-full mx-auto px-4 py-8 space-y-5 flex-1">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-ej-cream">
              {isFirstTimeSetup && isEditing ? 'Complete Your Profile' : 'Account Profile'}
            </h1>
            <p className="text-xs text-ej-muted">Campus ID &amp; Student Details</p>
          </div>

          {!isFirstTimeSetup && (
            <Link
              href="/orders"
              className="text-xs font-bold text-ej-lime hover:underline flex items-center gap-1.5 bg-ej-lime/10 px-3 py-1.5 rounded-xl border border-ej-lime/25 hover:bg-ej-lime/20 transition"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>My Orders</span>
            </Link>
          )}
        </div>

        {/* First Time Setup Banner */}
        {isFirstTimeSetup && isEditing && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-ej-lime/20 via-ej-teal/15 to-ej-indigo/60 border border-ej-lime/40 text-ej-cream space-y-1.5 animate-fade-in-up">
            <div className="flex items-center gap-2 text-ej-lime font-black text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Welcome to Enjipuli! Set up your Campus Profile</span>
            </div>
            <p className="text-xs text-ej-muted">
              Please enter your full name and College ID / Roll Number below. This helps the food truck staff identify your orders and issue your tokens.
            </p>
          </div>
        )}

        {/* Feedback Alerts */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-ej-lime/20 border border-ej-lime/40 text-ej-lime text-xs font-bold flex items-center gap-2 animate-fade-in-up">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-ej-vermilion/20 border border-ej-vermilion/40 text-ej-vermilion text-xs font-bold flex items-center gap-2 animate-fade-in-up">
            <X className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <div className="card p-6 border-ej-border/60 space-y-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-ej-indigo/60" />
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-ej-indigo/60 rounded w-1/2" />
                <div className="h-4 bg-ej-indigo/60 rounded w-3/4" />
              </div>
            </div>
            <div className="h-32 bg-ej-indigo/40 rounded-xl" />
          </div>
        ) : profile ? (
          <>
            {/* Main Campus Profile Card */}
            <div className="card p-6 border-ej-border/80 bg-gradient-to-b from-ej-indigo/90 to-ej-surface/90 shadow-2xl rounded-2xl space-y-6">
              {/* Header Info with Avatar and Edit Toggle */}
              <div className="flex items-center justify-between gap-4 border-b border-ej-border/60 pb-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-ej-lime via-ej-teal to-ej-gold text-ej-ink font-black flex items-center justify-center text-2xl shadow-glow-sm shrink-0">
                    {userInitial}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-black text-ej-cream truncate">{displayName}</h2>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-ej-lime/15 border border-ej-lime/30 text-ej-lime">
                        {isVendor ? (
                          <>
                            <ShieldCheck className="w-3 h-3" /> Food Truck Vendor
                          </>
                        ) : (
                          <>
                            <GraduationCap className="w-3 h-3" /> Student
                          </>
                        )}
                      </span>

                      {profile.isProvidence ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-ej-teal/20 text-ej-teal border border-ej-teal/30">
                          <Sparkles className="w-2.5 h-2.5" /> Providence
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-ej-surface text-ej-muted border border-ej-border">
                          Campus Member
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {!isEditing && (
                  <button
                    onClick={() => {
                      setNameInput(profile.name || '');
                      setCollegeIdInput(profile.collegeId || '');
                      setPhoneInput(profile.phone || '');
                      setIsEditing(true);
                      setIsFirstTimeSetup(false);
                    }}
                    className="p-2 rounded-xl text-ej-muted hover:text-ej-lime hover:bg-ej-indigo border border-ej-border hover:border-ej-lime/40 transition flex items-center gap-1.5 text-xs font-semibold shrink-0"
                    title="Edit Profile Details"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Edit Details</span>
                  </button>
                )}
              </div>

              {/* Profile Details (View Mode vs Edit Mode) */}
              {!isEditing ? (
                <div className="space-y-3.5 text-sm">
                  {/* Full Name */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-ej-deep/60 border border-ej-border/50">
                    <div className="flex items-center gap-2.5 text-ej-muted">
                      <User className="w-4 h-4 text-ej-lime shrink-0" />
                      <span className="text-xs font-semibold">Name</span>
                    </div>
                    <span className="font-bold text-ej-cream text-right">{profile.name || 'Not set'}</span>
                  </div>

                  {/* College ID / Roll Number */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-ej-deep/60 border border-ej-border/50">
                    <div className="flex items-center gap-2.5 text-ej-muted">
                      <IdCard className="w-4 h-4 text-ej-gold shrink-0" />
                      <span className="text-xs font-semibold">
                        {isVendor ? 'Vendor ID' : 'College ID / Roll No'}
                      </span>
                    </div>
                    {profile.collegeId ? (
                      <span className="font-mono font-bold text-ej-gold text-right uppercase">
                        {profile.collegeId}
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setIsFirstTimeSetup(true);
                        }}
                        className="text-xs font-bold text-ej-lime hover:underline"
                      >
                        + Add College ID
                      </button>
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-ej-deep/60 border border-ej-border/50">
                    <div className="flex items-center gap-2.5 text-ej-muted">
                      <Mail className="w-4 h-4 text-ej-teal shrink-0" />
                      <span className="text-xs font-semibold">Email</span>
                    </div>
                    <span className="font-mono text-xs text-ej-cream text-right truncate max-w-[200px] sm:max-w-none">
                      {profile.email}
                    </span>
                  </div>

                  {/* Phone (Optional) */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-ej-deep/60 border border-ej-border/50">
                    <div className="flex items-center gap-2.5 text-ej-muted">
                      <Phone className="w-4 h-4 text-ej-lime shrink-0" />
                      <span className="text-xs font-semibold">Phone</span>
                    </div>
                    {profile.phone ? (
                      <span className="font-mono text-xs font-semibold text-ej-cream text-right">
                        {profile.phone}
                      </span>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-xs text-ej-muted hover:text-ej-lime hover:underline"
                      >
                        + Add Phone
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Edit / First-Time Setup Form */
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-ej-cream flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-ej-lime" />
                      <span>Full Name *</span>
                    </label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="e.g. Jobiy Apriji"
                      className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-ej-deep border border-ej-border focus:border-ej-lime focus:outline-none text-ej-cream"
                      required
                      autoFocus
                    />
                    <p className="text-[10px] text-ej-muted">Your actual name as recognized on campus</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-ej-cream flex items-center gap-1.5">
                      <IdCard className="w-3.5 h-3.5 text-ej-gold" />
                      <span>{isVendor ? 'Vendor ID' : 'College ID / Roll No *'}</span>
                    </label>
                    <input
                      type="text"
                      value={collegeIdInput}
                      onChange={(e) => setCollegeIdInput(e.target.value.toUpperCase())}
                      placeholder={isVendor ? 'e.g. VENDOR-01' : 'e.g. PRC22CS045 or Roll Number'}
                      className="w-full py-2.5 px-3.5 text-sm font-mono uppercase rounded-xl bg-ej-deep border border-ej-border focus:border-ej-gold focus:outline-none text-ej-cream"
                      required={!isVendor}
                    />
                    <p className="text-[10px] text-ej-muted">Shown to vendor for token and order collection</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-ej-cream flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-ej-teal" />
                      <span>Phone Number (Optional)</span>
                    </label>
                    <input
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full py-2.5 px-3.5 text-sm font-mono rounded-xl bg-ej-deep border border-ej-border focus:border-ej-teal focus:outline-none text-ej-cream"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-primary py-2.5 px-5 text-xs font-bold flex items-center justify-center gap-1.5 flex-1 shadow-glow-sm"
                    >
                      <Check className="w-4 h-4" />
                      <span>
                        {saving
                          ? 'Saving...'
                          : isFirstTimeSetup
                          ? 'Save & Continue to Menu 🍔'
                          : 'Save Changes'}
                      </span>
                    </button>
                    {!isFirstTimeSetup && (
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="py-2.5 px-4 text-xs font-semibold rounded-xl border border-ej-border text-ej-muted hover:text-ej-cream hover:bg-ej-indigo transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}

              {/* Compact Stats Summary */}
              <div className="pt-2 border-t border-ej-border/60 grid grid-cols-2 gap-3 text-center">
                <div className="p-2.5 rounded-xl bg-ej-deep/40 border border-ej-border/40">
                  <p className="text-[11px] text-ej-muted font-semibold">Total Orders</p>
                  <p className="text-lg font-black text-ej-cream">{profile.stats.totalOrders}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-ej-deep/40 border border-ej-border/40">
                  <p className="text-[11px] text-ej-muted font-semibold">Total Spent</p>
                  <p className="text-lg font-black text-ej-lime">₹{profile.stats.totalSpent.toFixed(0)}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/"
                className="card card-hover p-4 border-ej-border/70 bg-ej-indigo/40 flex items-center justify-between group hover:border-ej-lime/50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-ej-lime/15 text-ej-lime flex items-center justify-center font-bold">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-ej-cream group-hover:text-ej-lime transition">
                      Browse Food Truck Menu
                    </h3>
                    <p className="text-[10px] text-ej-muted">Order snacks &amp; meals</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-ej-muted group-hover:text-ej-lime group-hover:translate-x-0.5 transition" />
              </Link>

              <Link
                href="/orders"
                className="card card-hover p-4 border-ej-border/70 bg-ej-indigo/40 flex items-center justify-between group hover:border-ej-gold/50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-ej-gold/15 text-ej-gold flex items-center justify-center font-bold">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-ej-cream group-hover:text-ej-gold transition">
                      Order History &amp; Tokens
                    </h3>
                    <p className="text-[10px] text-ej-muted">View receipts &amp; QR status</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-ej-muted group-hover:text-ej-gold group-hover:translate-x-0.5 transition" />
              </Link>
            </div>

            {/* Log Out */}
            <div className="pt-2">
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-ej-vermilion hover:bg-ej-vermilion/10 border border-ej-vermilion/30 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out of Enjipuli</span>
              </button>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ej-deep text-ej-cream flex items-center justify-center">
          <div className="text-xs text-ej-muted flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border-2 border-ej-lime border-t-transparent animate-spin" />
            <span>Loading Profile...</span>
          </div>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
