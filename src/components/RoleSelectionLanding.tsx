'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  Clock,
  ShieldCheck,
  Zap,
  UtensilsCrossed,
  Flame,
  ChefHat,
  Coffee,
  CheckCircle2,
  MapPin,
  Calendar,
  Send,
  Check,
  AlertCircle,
} from 'lucide-react';

interface LandingStats {
  ordersServed: number;
  menuItems: number;
  categories: number;
}

export function RoleSelectionLanding() {
  const [stats, setStats] = useState<LandingStats>({
    ordersServed: 0,
    menuItems: 8,
    categories: 4,
  });

  // Newsletter subscribe state
  const [subscriberEmail, setSubscriberEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState<string | null>(null);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);

  // Pull real live numbers from the database
  useEffect(() => {
    fetch('/api/landing/stats')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setStats({
            ordersServed: Number(data.ordersServed) || 0,
            menuItems: Number(data.menuItems) || 8,
            categories: Number(data.categories) || 4,
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = subscriberEmail.trim().toLowerCase();
    if (!email) return;

    setSubscribing(true);
    setSubscribeError(null);
    setSubscribeSuccess(null);

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Subscription failed');
      }
      setSubscribeSuccess(data.message || 'Subscribed successfully!');
      setSubscriberEmail('');
    } catch (err: any) {
      setSubscribeError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div
      id="hero-landing-screen"
      className="min-h-screen flex flex-col bg-[#FAF7EE] text-[#120B24] relative overflow-x-hidden selection:bg-ej-lime selection:text-[#120B24] scroll-smooth"
    >
      {/* ─────────────────────────────────────────────────────────────
          EDITORIAL BACKGROUND VERTICAL GRID LINES (Beige/Tan on Cream)
          ───────────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none z-0 flex justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 opacity-40"
        aria-hidden="true"
      >
        <div className="w-[1px] h-full bg-[#E5DFD1]" />
        <div className="w-[1px] h-full bg-[#E5DFD1] hidden sm:block" />
        <div className="w-[1px] h-full bg-[#E5DFD1]" />
        <div className="w-[1px] h-full bg-[#E5DFD1] hidden md:block" />
        <div className="w-[1px] h-full bg-[#E5DFD1]" />
      </div>

      {/* Decorative Kerala Floral/Spices Droplet Accents */}
      <div className="absolute top-20 right-6 w-72 h-72 rounded-full bg-gradient-to-br from-amber-200/40 via-yellow-100/20 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-96 left-[-5%] w-80 h-80 rounded-full bg-gradient-to-tr from-lime-200/35 via-orange-100/25 to-transparent blur-3xl pointer-events-none" />

      {/* ─────────────────────────────────────────────────────────────
          1. NAVBAR (Floating Deep Navy Capsule with Lime Accents)
          ───────────────────────────────────────────────────────────── */}
      <div className="sticky top-4 z-50 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-all">
        <header className="w-full bg-[#120B24] text-white rounded-full px-4 sm:px-7 py-3 sm:py-3.5 flex items-center justify-between shadow-2xl border border-white/10">
          {/* Left: The ഇഞ്ചിപ്പുളി Wordmark Asset */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <img
              src="/branding/enjipuli-wordmark.png"
              alt="ഇഞ്ചിപ്പുളി"
              width={320}
              height={110}
              className="h-7 sm:h-8 w-auto object-contain drop-shadow-[0_0_12px_rgba(212,255,61,0.4)] transition-transform duration-300 group-hover:scale-105"
              decoding="async"
            />
            <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-widest text-[#F6A623] border-l border-white/20 pl-3 font-mono">
              ക്യാമ്പസ് ഫുഡ് ട്രക്ക്
            </span>
          </Link>

          {/* Middle: Anchor text links */}
          <nav className="hidden md:flex items-center gap-8 font-mono text-xs font-bold tracking-wider uppercase text-white/70">
            <a href="#story" className="hover:text-ej-lime transition-colors">
              Story
            </a>
            <a href="#counter" className="hover:text-ej-lime transition-colors">
              Behind the Counter
            </a>
          </nav>

          {/* Right: Two CTAs matching reference visual relationship */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quiet Button: Vendor Login */}
            <Link
              href="/vendor/login?purpose=vendor"
              className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold text-ej-lime border border-ej-lime/60 hover:border-ej-lime hover:bg-ej-lime/10 active:scale-95 transition-all duration-200"
            >
              Vendor Login
            </Link>

            {/* Bold Button: Order Now */}
            <Link
              href="/login?purpose=student"
              className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs font-black bg-ej-lime text-[#120B24] hover:bg-white shadow-glow-sm hover:shadow-glow active:scale-95 transition-all duration-200 flex items-center gap-1.5"
            >
              <span>Order Now</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </Link>
          </div>
        </header>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. SECTION 1: SPLIT HERO (Cream Theme with Orange Accents)
          ───────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-12 sm:pb-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center relative z-10">
        {/* Left Column: Headline, Badge, Subtext & CTAs */}
        <div className="lg:col-span-7 flex flex-col items-start space-y-6 sm:space-y-7 text-left animate-fade-in-up">
          {/* Badge: Campus Favorite (Orange / Black border) */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F6A623] text-[#120B24] border border-[#120B24] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#120B24] animate-pulse" />
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider">
              Campus Favorite • Hot &amp; Fresh
            </span>
            <Sparkles className="w-3.5 h-3.5 text-[#120B24]" />
          </div>

          {/* Bold Multi-Line Headline with Color Highlighting & Underline Accent */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-black text-[#120B24] tracking-tight leading-[1.08]">
            Skip the Queue,
            <br />
            Order{' '}
            <span className="relative inline-block text-[#FF7A00]">
              Fresh
              {/* Brush underline ornament */}
              <svg
                className="absolute -bottom-1 sm:-bottom-2 left-0 w-full h-3 text-[#FF7A00]"
                viewBox="0 0 100 12"
                preserveAspectRatio="none"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 9C25 3 75 3 98 9"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>{' '}
            Daily
            <br />
            Only at{' '}
            <span className="text-ej-lime drop-shadow-[0_2px_12px_rgba(212,255,61,0.5)] font-malayalam tracking-normal inline-block bg-[#120B24] px-4 py-1 rounded-2xl align-middle mt-1 sm:mt-2">
              ഇഞ്ചിപ്പുളി
            </span>
          </h1>

          {/* Value Prop Subtext */}
          <p className="text-sm sm:text-base md:text-lg text-[#32284D] max-w-xl font-medium leading-relaxed">
            Browse today&apos;s campus menu, order ahead, and pick up hot at the food truck
            counter with your token — no more waiting in line between classes.
          </p>

          {/* Large CTA Pair */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto pt-2">
            {/* Primary Filled Lime Button: Order Now */}
            <Link
              href="/login?purpose=student"
              className="px-8 py-4 rounded-full font-black text-sm sm:text-base bg-ej-lime text-[#120B24] hover:bg-[#120B24] hover:text-ej-lime shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 text-center group"
            >
              <span>Order Now</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Secondary Outlined Button: Vendor Portal */}
            <Link
              href="/vendor/login?purpose=vendor"
              className="px-7 py-4 rounded-full font-bold text-sm sm:text-base text-[#120B24] bg-[#FAF7EE] border-2 border-[#120B24] hover:bg-white active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-center"
            >
              <span>Vendor Portal</span>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="pt-4 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-[#443862] font-semibold border-t border-[#E5DFD1] w-full max-w-xl">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#FF7A00] shrink-0" />
              <span>Instant Digital Tokens</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#F6A623] shrink-0" />
              <span>5-Min Hot Counter Pickup</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-ej-teal shrink-0" />
              <span>Direct Campus Kitchen</span>
            </div>
          </div>
        </div>

        {/* Right Column: Actual Food Truck Photography with Vibrant Glow */}
        <div className="lg:col-span-5 flex items-center justify-center relative mt-6 lg:mt-0">
          {/* Subtle Ambient Warm & Lime Glow */}
          <div
            className="absolute inset-0 sm:-inset-6 rounded-3xl blur-3xl pointer-events-none opacity-45"
            style={{
              background:
                'radial-gradient(circle, rgba(212, 255, 61, 0.45) 0%, rgba(246, 166, 35, 0.25) 45%, transparent 70%)',
            }}
          />

          {/* Real Truck Photo Card Frame */}
          <div className="relative z-10 w-full max-w-lg lg:max-w-none group">
            <div className="relative rounded-3xl overflow-hidden border-2 border-[#120B24] shadow-2xl transition-all duration-500">
              <img
                src="/branding/enjipuli-truck-real.jpg"
                alt="Actual ENJIPULI Kerala Food Truck with Elephant Mural"
                width={1024}
                height={640}
                className="w-full h-auto object-cover transform group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                decoding="async"
                loading="eager"
              />

              {/* Bottom gradient fade for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#120B24]/90 via-transparent to-transparent pointer-events-none" />

              {/* Floating Live Counter Status Badge */}
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-[#120B24]/95 backdrop-blur-md border border-white/10 flex items-center justify-between shadow-xl text-white">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-ej-lime/15 border border-ej-lime/30 flex items-center justify-center text-ej-lime">
                    <span className="w-2.5 h-2.5 rounded-full bg-ej-lime animate-pulse" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white leading-tight">
                      Campus Counter Live
                    </p>
                    <p className="text-[10px] text-white/70 font-mono">
                      Providence College of Engineering
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-black text-ej-lime px-3 py-1 rounded-full bg-ej-lime/15 border border-ej-lime/30 uppercase tracking-wider">
                  Open
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. SECTION 2: STAT BAND (Full-Width, Deep Navy Band)
          ───────────────────────────────────────────────────────────── */}
      <section className="w-full bg-[#0E0A1F] text-white border-y border-white/10 py-10 sm:py-14 relative z-10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/15 text-center">
            {/* Stat 1: Delivered Orders */}
            <div className="py-6 sm:py-2 px-4 sm:px-8 flex flex-col items-center justify-center">
              <span className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tight font-sans">
                {stats.ordersServed > 1000
                  ? `${(stats.ordersServed / 1000).toFixed(1)}K`
                  : stats.ordersServed}
              </span>
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-ej-lime mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-ej-lime" />
                Orders Delivered
              </span>
              <p className="text-[11px] text-white/60 mt-1 font-mono">
                Live fulfilled orders from DB
              </p>
            </div>

            {/* Stat 2: Active Menu Items */}
            <div className="py-6 sm:py-2 px-4 sm:px-8 flex flex-col items-center justify-center">
              <span className="text-5xl sm:text-6xl md:text-7xl font-black text-ej-lime tracking-tight font-sans drop-shadow-[0_0_25px_rgba(212,255,61,0.3)]">
                {stats.menuItems}+
              </span>
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#F6A623] mt-2 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#F6A623]" />
                Fresh Menu Items
              </span>
              <p className="text-[11px] text-white/60 mt-1 font-mono">
                Snacks, hot tea &amp; chilled juices
              </p>
            </div>

            {/* Stat 3: Active Categories */}
            <div className="py-6 sm:py-2 px-4 sm:px-8 flex flex-col items-center justify-center">
              <span className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tight font-sans">
                {stats.categories}
              </span>
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-ej-teal mt-2 flex items-center gap-1.5">
                <UtensilsCrossed className="w-3.5 h-3.5 text-ej-teal" />
                Live Food Categories
              </span>
              <p className="text-[11px] text-white/60 mt-1 font-mono">
                Meals, bakery &amp; campus beverages
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. SECTION 3: BRAND STORY BLOCK (Bleeding & Overlapping Layout)
          ───────────────────────────────────────────────────────────── */}
      <section
        id="story"
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10 scroll-mt-20"
      >
        <div className="space-y-12 sm:space-y-16">
          {/* Top Story Header & Big Visual Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative">
            {/* Oversized Condensed Headline */}
            <div className="lg:col-span-5 relative z-10 space-y-4 text-left">
              <span className="inline-block text-[11px] font-black tracking-widest uppercase text-[#120B24] bg-[#120B24]/10 px-3 py-1 rounded-full border border-[#120B24]/30 font-mono">
                THE ENJIPULI STORY
              </span>

              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#120B24] tracking-tight uppercase leading-[1.02]">
                HOT, CRISPY,
                <br />
                <span className="text-[#FF7A00]">AUTHENTIC</span>
                <br />
                BITES EVERYDAY.
              </h2>

              <p className="text-sm sm:text-base text-[#34294F] font-medium leading-relaxed">
                Born out of a love for genuine Kerala street flavors and campus energy. Our food
                truck rolls up with boiling tea kettles, frying banana fritters, and ice-cold
                shakes ready for every break between lectures.
              </p>
            </div>

            {/* Massive Bleeding Truck Photo (Unboxed, Bleeding off Edge & Overlapping) */}
            <div className="lg:col-span-7 relative group lg:-mr-12 xl:-mr-20 lg:-ml-6">
              {/* Soft neon lime & amber ambient glow */}
              <div
                className="absolute -inset-6 sm:-inset-10 rounded-full blur-3xl opacity-35 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle, rgba(212,255,61,0.4) 0%, rgba(246,166,35,0.25) 50%, transparent 80%)',
                }}
              />

              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl transition-transform duration-700 ease-out group-hover:scale-[1.02] border border-[#120B24]/20">
                <img
                  src="/branding/enjipuli-truck-real.jpg"
                  alt="ENJIPULI Real Food Truck Mural Banner"
                  width={1200}
                  height={675}
                  className="w-full h-auto object-cover max-h-[500px]"
                  decoding="async"
                />
                {/* Vignette overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#120B24]/90 via-transparent to-transparent pointer-events-none" />

                {/* Corner caption directly on image */}
                <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-5 px-3 py-1.5 rounded-lg bg-[#120B24]/85 backdrop-blur-md border border-white/20 flex items-center gap-2 text-xs font-bold text-white">
                  <span className="font-malayalam text-ej-gold text-xs sm:text-sm font-extrabold tracking-wide">
                    ഇഞ്ചിപ്പുളി
                  </span>
                  <span className="text-white/40">•</span>
                  <span className="text-[10px] text-white/80 font-mono uppercase tracking-wider">
                    Providence Campus Truck
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description Grid with Thin Vertical Divider Lines (Editorial Style) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 md:divide-x divide-[#120B24]/15 border-t border-b border-[#120B24]/15 py-10">
            {/* Column 1: What's On The Menu */}
            <div className="md:px-8 first:pl-0 space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#FF7A00] font-mono flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#FF7A00]" />
                01 / WHAT&apos;S ON THE COUNTER
              </span>
              <h3 className="text-xl font-black text-[#120B24] tracking-tight">
                Fresh &amp; Spiced Delights
              </h3>
              <p className="text-xs sm:text-sm text-[#3E3259] leading-relaxed">
                Crispy golden Pazham Pori, hot spiced Egg Puffs, crunchy Chicken Cutlets, and
                authentic froth-poured Malabar Chaya made live throughout the day.
              </p>
            </div>

            {/* Column 2: The Ordering Experience */}
            <div className="md:px-8 space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#120B24] font-mono flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-ej-lime bg-[#120B24] p-0.5 rounded" />
                02 / ZERO-WAIT EXPERIENCE
              </span>
              <h3 className="text-xl font-black text-[#120B24] tracking-tight">
                Order Ahead, Skip the Rush
              </h3>
              <p className="text-xs sm:text-sm text-[#3E3259] leading-relaxed">
                Check real-time stock from your phone, place your order with fast UPI/Razorpay, and
                walk straight to the window with your digital token when it&apos;s ready.
              </p>
            </div>

            {/* Column 3: The Campus Angle */}
            <div className="md:px-8 last:pr-0 space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-ej-teal font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-ej-teal" />
                03 / CAMPUS-LOCAL HEART
              </span>
              <h3 className="text-xl font-black text-[#120B24] tracking-tight">
                Built for Providence College
              </h3>
              <p className="text-xs sm:text-sm text-[#3E3259] leading-relaxed">
                Designed specifically for college breaks. Student-friendly pricing, clean kitchen
                hygiene, and speedy prep times so you never miss the bell.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. SECTION 4: "BEHIND THE COUNTER" (Authentic Vendor Team)
          ───────────────────────────────────────────────────────────── */}
      <section
        id="counter"
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 relative z-10 border-t border-[#120B24]/15 scroll-mt-20"
      >
        <div className="space-y-10 sm:space-y-12">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-[11px] font-black tracking-widest uppercase text-[#FF7A00] font-mono">
                THE PEOPLE WHO FEED YOU
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#120B24] tracking-tight uppercase">
                Behind The Counter
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#473B63] max-w-md font-medium leading-relaxed">
              The culinary crew keeping the food truck firing, steaming hot tea, and serving fresh
              tokens across campus daily.
            </p>
          </div>

          {/* Editorial Kitchen Crew Presentation */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center py-4 sm:py-6 border-b border-[#120B24]/15">
            {/* Visual Chef Insignia Badge */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-8 rounded-3xl bg-[#120B24] border border-[#120B24] hover:shadow-xl transition-all duration-300 relative group text-white">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-[#1E143B] border border-ej-lime/40 flex flex-col items-center justify-center shadow-[0_0_35px_rgba(212,255,61,0.2)] group-hover:scale-105 transition-all duration-300">
                <ChefHat className="w-12 h-12 text-ej-lime stroke-[1.75] drop-shadow-[0_0_15px_rgba(212,255,61,0.6)]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-[#F6A623] mt-2 font-mono">
                  CAMPUS CREW
                </span>
              </div>

              <span className="mt-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-ej-lime/15 text-ej-lime border border-ej-lime/30 font-mono">
                Verified Campus Vendor
              </span>
            </div>

            {/* Team Description & Credentials */}
            <div className="md:col-span-8 space-y-4 text-left">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#FF7A00] uppercase tracking-wider font-mono">
                  Kitchen Operations &amp; Prep
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-[#120B24] tracking-tight">
                  Enjipuli Counter Crew
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-[#3E3259] leading-relaxed font-medium">
                Freshly sourcing local bananas for Pazham Pori, boiling traditional Malabar spice
                blends, and handling hundreds of token pickups with care. Dedicated to quick
                turnaround times and clean, delicious campus dining.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#120B24]">
                <span className="flex items-center gap-1.5 text-[#120B24]">
                  <CheckCircle2 className="w-4 h-4 text-ej-lime fill-[#120B24]" /> Fresh daily
                  batch cooking
                </span>
                <span className="flex items-center gap-1.5 text-[#120B24]">
                  <Coffee className="w-4 h-4 text-[#FF7A00]" /> Live boiling kettle tea
                </span>
                <span className="flex items-center gap-1.5 text-[#120B24]">
                  <ShieldCheck className="w-4 h-4 text-ej-teal" /> Campus hygiene verified
                </span>
              </div>

              {/* Staff login shortcut */}
              <div className="pt-4 border-t border-[#120B24]/15 flex items-center justify-between flex-wrap gap-3">
                <p className="text-[11px] text-[#473B63] font-mono">Operating the truck today?</p>
                <Link
                  href="/vendor/login?purpose=vendor"
                  className="text-xs font-bold text-[#120B24] hover:text-[#FF7A00] hover:underline flex items-center gap-1"
                >
                  Access Vendor Portal →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. MATCHING FOOTER SECTION (Reference-Exact Architecture)
          ───────────────────────────────────────────────────────────── */}
      <footer className="w-full bg-[#0E0A1F] text-white pt-16 sm:pt-20 pb-10 relative z-20 border-t border-white/10 overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-10 w-96 h-96 rounded-full bg-ej-lime/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 rounded-full bg-[#FF7A00]/5 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 pb-14 border-b border-white/10">
            {/* Left Column (lg:col-span-5): Wordmark, One-Line Pitch, Subscribe Box & Socials */}
            <div className="lg:col-span-5 space-y-6">
              {/* Wordmark with colorful splash flair */}
              <div className="flex items-center gap-3">
                <img
                  src="/branding/enjipuli-wordmark.png"
                  alt="ഇഞ്ചിപ്പുളി"
                  width={320}
                  height={110}
                  className="h-11 sm:h-12 w-auto object-contain drop-shadow-[0_0_16px_rgba(212,255,61,0.4)]"
                  decoding="async"
                />
              </div>

              {/* One-Line Description in ENJIPULI Voice */}
              <p className="text-xs sm:text-sm text-white/70 max-w-sm leading-relaxed font-normal">
                Your favourite campus flavours, now ordered ahead. Freshly made food, great vibes
                and speedy token pickups at Providence College of Engineering.
              </p>

              {/* Email Subscribe Box */}
              <form onSubmit={handleSubscribe} className="space-y-2 max-w-md">
                <div className="relative flex items-center">
                  <input
                    type="email"
                    value={subscriberEmail}
                    onChange={(e) => setSubscriberEmail(e.target.value)}
                    placeholder="Enter your email for updates"
                    className="w-full bg-[#1A1435] border border-white/15 rounded-full py-3 pl-4 pr-32 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-ej-lime focus:ring-1 focus:ring-ej-lime transition"
                    required
                  />
                  <button
                    type="submit"
                    disabled={subscribing}
                    className="absolute right-1.5 px-4 py-2 rounded-full bg-white text-[#120B24] text-xs font-black hover:bg-ej-lime transition-all disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {subscribing ? (
                      <span>...</span>
                    ) : (
                      <>
                        <span>Subscribe</span>
                        <Send className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>

                {subscribeSuccess && (
                  <p className="text-[11px] text-ej-lime flex items-center gap-1 font-mono pt-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>{subscribeSuccess}</span>
                  </p>
                )}
                {subscribeError && (
                  <p className="text-[11px] text-[#FF7A00] flex items-center gap-1 font-mono pt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{subscribeError}</span>
                  </p>
                )}
              </form>

              {/* Social Channels Note */}
              <div className="pt-2 flex items-center gap-3">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-ej-lime hover:text-[#120B24] flex items-center justify-center text-white/80 transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <span className="text-[11px] text-white/50 font-mono">
                  @enjipuli • Official Campus Truck
                </span>
              </div>
            </div>

            {/* Quick Links Column (lg:col-span-2) */}
            <div className="lg:col-span-2 space-y-3">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  Quick Links
                </h3>
                <div className="h-1 w-8 bg-[#F6A623] rounded-full mt-1.5" />
              </div>
              <ul className="space-y-2.5 text-xs text-white/70 font-medium">
                <li>
                  <a href="#hero-landing-screen" className="hover:text-ej-lime transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <Link href="/login?purpose=student" className="hover:text-ej-lime transition-colors">
                    Order Menu
                  </Link>
                </li>
                <li>
                  <a href="#story" className="hover:text-ej-lime transition-colors">
                    Our Story
                  </a>
                </li>
                <li>
                  <Link href="/orders" className="hover:text-ej-lime transition-colors">
                    My Orders
                  </Link>
                </li>
                <li>
                  <Link
                    href="/vendor/login?purpose=vendor"
                    className="hover:text-ej-lime transition-colors"
                  >
                    Vendor Portal
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support Column (lg:col-span-2) */}
            <div className="lg:col-span-2 space-y-3">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">Support</h3>
                <div className="h-1 w-8 bg-[#FF4785] rounded-full mt-1.5" />
              </div>
              <ul className="space-y-2.5 text-xs text-white/70 font-medium">
                <li>
                  <Link href="/orders" className="hover:text-ej-lime transition-colors">
                    Order Tracking
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-ej-lime transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-ej-lime transition-colors">
                    Terms &amp; Conditions
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:support@enjipuli.com"
                    className="hover:text-ej-lime transition-colors"
                  >
                    Help / Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Campus Info & Diagonal Tagline (lg:col-span-3) */}
            <div className="lg:col-span-3 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">
                    Campus Counter
                  </h3>
                  <div className="h-1 w-8 bg-ej-teal rounded-full mt-1.5" />
                </div>
                <div className="space-y-2 text-xs text-white/70 font-medium">
                  <p className="flex items-center gap-1.5 text-white/90">
                    <MapPin className="w-3.5 h-3.5 text-ej-teal shrink-0" />
                    <span>Providence College of Engineering</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-white/70">
                    <Calendar className="w-3.5 h-3.5 text-ej-gold shrink-0" />
                    <span>Mon – Sat • Campus Break Hours</span>
                  </p>
                  <p className="text-[11px] text-white/50 font-mono">
                    Token pickups at main ground counter.
                  </p>
                </div>
              </div>

              {/* Diagonal Tagline Callout (Inspired by Reference) */}
              <div className="pt-2 flex justify-start lg:justify-end">
                <div className="inline-block transform -rotate-6 bg-[#1A1435] border border-ej-lime/30 px-4 py-2.5 rounded-xl shadow-lg">
                  <p className="text-xs sm:text-sm font-black tracking-wider uppercase text-ej-lime">
                    SKIP THE QUEUE.
                  </p>
                  <p className="text-xs sm:text-sm font-black tracking-wider uppercase text-[#FF7A00] flex items-center justify-between">
                    <span>EAT FRESH.</span>
                    <span className="text-[10px] text-white/50 font-malayalam tracking-normal">
                      ഇഞ്ചിപ്പുളി
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50 font-mono">
            <p>© {new Date().getFullYear()} ഇഞ്ചിപ്പുളി. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms &amp; Conditions
              </Link>
              <span>|</span>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <span>|</span>
              <span className="text-white/40">Providence College</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
