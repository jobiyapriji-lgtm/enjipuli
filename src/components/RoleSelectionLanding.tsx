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
} from 'lucide-react';
import { MuralBackground } from '@/components/MuralBackground';

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

  return (
    <div
      id="hero-landing-screen"
      className="min-h-screen flex flex-col bg-ej-deep text-ej-cream relative overflow-x-hidden selection:bg-ej-lime selection:text-ej-ink scroll-smooth"
      style={{
        background: 'radial-gradient(ellipse at 80% 20%, #241B5E 0%, #150F2E 50%, #0B081B 100%)',
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          EDITORIAL BACKGROUND VERTICAL GRID LINES (Inspired by Reference)
          ───────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none z-0 flex justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 opacity-[0.06]" aria-hidden="true">
        <div className="w-[1px] h-full bg-ej-lime" />
        <div className="w-[1px] h-full bg-ej-lime hidden sm:block" />
        <div className="w-[1px] h-full bg-ej-lime" />
        <div className="w-[1px] h-full bg-ej-lime hidden md:block" />
        <div className="w-[1px] h-full bg-ej-lime" />
      </div>

      {/* Dark Mural Background Artwork */}
      <MuralBackground opacity={0.06} />

      {/* Large ambient glow behind hero */}
      <div
        className="absolute top-1/4 right-[-10%] w-[550px] sm:w-[700px] h-[550px] sm:h-[700px] rounded-full pointer-events-none blur-3xl opacity-25"
        style={{
          background: 'radial-gradient(circle, rgba(212, 255, 61, 0.45) 0%, rgba(47, 191, 160, 0.25) 40%, transparent 75%)',
        }}
      />

      {/* ─────────────────────────────────────────────────────────────
          1. NAVBAR (Persistent Sticky Header with Anchor Links)
          ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full bg-ej-deep/90 backdrop-blur-md border-b border-ej-border/60 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex items-center justify-between">
          {/* Left: The ഇഞ്ചിപ്പുളി Wordmark Asset (Small Scale) */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/branding/enjipuli-wordmark.png"
              alt="ഇഞ്ചിപ്പുളി"
              width={320}
              height={110}
              className="h-8 sm:h-9 w-auto object-contain drop-shadow-[0_0_16px_rgba(212,255,61,0.35)] transition-transform duration-300 group-hover:scale-105"
              decoding="async"
            />
            <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-widest text-ej-gold/80 border-l border-ej-border/80 pl-3 font-mono">
              ക്യാമ്പസ് ഫുഡ് ട്രക്ക്
            </span>
          </Link>

          {/* Center: Anchor Links */}
          <nav className="hidden md:flex items-center gap-8 font-mono text-xs font-bold tracking-wider uppercase text-ej-muted">
            <a href="#story" className="hover:text-ej-lime transition-colors">
              Story
            </a>
            <a href="#counter" className="hover:text-ej-lime transition-colors">
              Behind the Counter
            </a>
          </nav>

          {/* Right: Two CTAs matching reference visual relationship */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Quiet Button: Vendor Login */}
            <Link
              href="/vendor/login?purpose=vendor"
              className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-bold text-ej-lime border border-ej-lime/60 hover:border-ej-lime hover:bg-ej-lime/10 active:scale-95 transition-all duration-200"
            >
              Vendor Login
            </Link>

            {/* Bold Button: Order Now */}
            <Link
              href="/login?purpose=student"
              className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs font-black bg-ej-lime text-ej-ink hover:bg-white shadow-glow-sm hover:shadow-glow active:scale-95 transition-all duration-200 flex items-center gap-1.5"
            >
              <span>Order Now</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. SECTION 1: SPLIT HERO (Featuring Real Truck Photography)
          ───────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center relative z-10">
        {/* Left Column: Headline, Badge, Subtext & CTAs */}
        <div className="lg:col-span-7 flex flex-col items-start space-y-6 sm:space-y-7 text-left animate-fade-in-up">
          {/* Badge: Campus Favorite */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ej-surface/90 border border-ej-gold/50 shadow-glow-sm">
            <span className="w-2 h-2 rounded-full bg-ej-gold animate-pulse" />
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-ej-gold">
              Campus Favorite • Hot &amp; Fresh
            </span>
            <Sparkles className="w-3.5 h-3.5 text-ej-gold opacity-90" />
          </div>

          {/* Bold Multi-Line Headline with Color Highlighting */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-black text-ej-cream tracking-tight leading-[1.06]">
            Skip the Queue,
            <br />
            Order{' '}
            <span className="text-ej-lime drop-shadow-[0_0_35px_rgba(212,255,61,0.55)]">
              Fresh
            </span>{' '}
            Daily
            <br />
            Only at{' '}
            <span className="text-ej-gold font-malayalam tracking-normal">
              ഇഞ്ചിപ്പുളി
            </span>
          </h1>

          {/* Value Prop Subtext */}
          <p className="text-sm sm:text-base md:text-lg text-ej-muted/90 max-w-xl font-medium leading-relaxed">
            Browse today&apos;s campus menu, order ahead, and pick up hot at the food truck
            counter with your token — no more waiting in line between classes.
          </p>

          {/* Large CTA Pair */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto pt-2">
            {/* Primary Filled Lime Button: Order Now */}
            <Link
              href="/login?purpose=student"
              className="px-8 py-4 rounded-full font-black text-sm sm:text-base bg-ej-lime text-ej-ink hover:bg-white shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 text-center group"
            >
              <span>Order Now</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Secondary Outlined Button: Vendor Portal */}
            <Link
              href="/vendor/login?purpose=vendor"
              className="px-7 py-4 rounded-full font-bold text-sm sm:text-base text-ej-lime border-2 border-ej-lime/60 hover:border-ej-lime hover:bg-ej-lime/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-center"
            >
              <span>Vendor Portal</span>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="pt-4 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-ej-muted/80 font-medium border-t border-ej-border/60 w-full max-w-xl">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-ej-lime shrink-0" />
              <span>Instant Digital Tokens</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-ej-gold shrink-0" />
              <span>5-Min Hot Counter Pickup</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-ej-teal shrink-0" />
              <span>Direct Campus Kitchen</span>
            </div>
          </div>
        </div>

        {/* Right Column: Actual Food Truck Photography with Neon Lime Glow */}
        <div className="lg:col-span-5 flex items-center justify-center relative mt-4 lg:mt-0">
          {/* Concentric Neon Radial Glow Bleeding from Behind */}
          <div
            className="absolute inset-0 sm:-inset-6 rounded-3xl blur-3xl pointer-events-none opacity-50"
            style={{
              background: 'radial-gradient(circle, rgba(212, 255, 61, 0.35) 0%, rgba(47, 191, 160, 0.2) 40%, transparent 70%)',
            }}
          />

          {/* Real Truck Photo Card Frame */}
          <div className="relative z-10 w-full max-w-lg lg:max-w-none group">
            <div className="relative rounded-3xl overflow-hidden border-2 border-ej-lime/40 bg-gradient-to-b from-ej-surface/70 via-ej-indigo/40 to-ej-deep/95 shadow-[0_0_50px_rgba(212,255,61,0.2)] group-hover:border-ej-lime/80 group-hover:shadow-[0_0_60px_rgba(212,255,61,0.35)] transition-all duration-500">
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
              <div className="absolute inset-0 bg-gradient-to-t from-ej-deep via-transparent to-transparent opacity-85 pointer-events-none" />

              {/* Floating Live Counter Status Badge */}
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-ej-deep/95 backdrop-blur-md border border-ej-border/90 flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-ej-lime/15 border border-ej-lime/30 flex items-center justify-center text-ej-lime">
                    <span className="w-2.5 h-2.5 rounded-full bg-ej-lime animate-pulse" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-ej-cream leading-tight">
                      Campus Counter Live
                    </p>
                    <p className="text-[10px] text-ej-muted font-mono">
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
          3. SECTION 2: STAT BAND (Full-Width, Dark, Live Real Numbers)
          ───────────────────────────────────────────────────────────── */}
      <section className="w-full bg-[#0D0820] border-y border-ej-border/80 py-10 sm:py-14 relative z-10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-ej-border/60 text-center">
            {/* Stat 1: Delivered Orders */}
            <div className="py-6 sm:py-2 px-4 sm:px-8 flex flex-col items-center justify-center">
              <span className="text-5xl sm:text-6xl md:text-7xl font-black text-ej-cream tracking-tight font-sans">
                {stats.ordersServed > 1000
                  ? `${(stats.ordersServed / 1000).toFixed(1)}K`
                  : stats.ordersServed}
              </span>
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-ej-lime mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-ej-lime" />
                Orders Delivered
              </span>
              <p className="text-[11px] text-ej-muted/70 mt-1 font-mono">
                Live fulfilled orders from DB
              </p>
            </div>

            {/* Stat 2: Active Menu Items */}
            <div className="py-6 sm:py-2 px-4 sm:px-8 flex flex-col items-center justify-center">
              <span className="text-5xl sm:text-6xl md:text-7xl font-black text-ej-lime tracking-tight font-sans drop-shadow-[0_0_25px_rgba(212,255,61,0.3)]">
                {stats.menuItems}+
              </span>
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-ej-gold mt-2 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-ej-gold" />
                Fresh Menu Items
              </span>
              <p className="text-[11px] text-ej-muted/70 mt-1 font-mono">
                Snacks, hot tea &amp; chilled juices
              </p>
            </div>

            {/* Stat 3: Active Categories */}
            <div className="py-6 sm:py-2 px-4 sm:px-8 flex flex-col items-center justify-center">
              <span className="text-5xl sm:text-6xl md:text-7xl font-black text-ej-cream tracking-tight font-sans">
                {stats.categories}
              </span>
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-ej-teal mt-2 flex items-center gap-1.5">
                <UtensilsCrossed className="w-3.5 h-3.5 text-ej-teal" />
                Live Food Categories
              </span>
              <p className="text-[11px] text-ej-muted/70 mt-1 font-mono">
                Meals, bakery &amp; campus beverages
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. SECTION 3: BRAND STORY BLOCK (Bleeding & Overlapping Layout)
          ───────────────────────────────────────────────────────────── */}
      <section id="story" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10 scroll-mt-20">
        <div className="space-y-12 sm:space-y-16">
          {/* Top Story Header & Big Visual Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative">
            {/* Oversized Condensed Headline */}
            <div className="lg:col-span-5 relative z-10 space-y-4 text-left">
              <span className="inline-block text-[11px] font-black tracking-widest uppercase text-ej-lime bg-ej-lime/10 px-3 py-1 rounded-full border border-ej-lime/30 font-mono">
                THE ENJIPULI STORY
              </span>

              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-ej-cream tracking-tight uppercase leading-[1.02]">
                HOT, CRISPY,
                <br />
                <span className="text-ej-lime drop-shadow-[0_0_30px_rgba(212,255,61,0.4)]">
                  AUTHENTIC
                </span>
                <br />
                BITES EVERYDAY.
              </h2>

              <p className="text-sm sm:text-base text-ej-muted font-medium leading-relaxed">
                Born out of a love for genuine Kerala street flavors and campus energy.
                Our food truck rolls up with boiling tea kettles, frying banana fritters, and ice-cold
                shakes ready for every break between lectures.
              </p>
            </div>

            {/* Massive Bleeding Truck Photo (Unboxed, Bleeding off Edge & Overlapping) */}
            <div className="lg:col-span-7 relative group lg:-mr-12 xl:-mr-20 lg:-ml-6">
              {/* Soft neon lime & teal ambient glow */}
              <div
                className="absolute -inset-6 sm:-inset-10 rounded-full blur-3xl opacity-35 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(212,255,61,0.4) 0%, rgba(47,191,160,0.2) 50%, transparent 80%)',
                }}
              />

              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl transition-transform duration-700 ease-out group-hover:scale-[1.02]">
                <img
                  src="/branding/enjipuli-truck-real.jpg"
                  alt="ENJIPULI Real Food Truck Mural Banner"
                  width={1200}
                  height={675}
                  className="w-full h-auto object-cover max-h-[500px]"
                  decoding="async"
                />
                {/* Vignette overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-ej-deep/90 via-transparent to-transparent pointer-events-none" />

                {/* Corner caption directly on image */}
                <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-5 px-3 py-1.5 rounded-lg bg-ej-deep/80 backdrop-blur-md border border-ej-border/60 flex items-center gap-2 text-xs font-bold text-ej-cream">
                  <span className="font-malayalam text-ej-gold text-xs sm:text-sm font-extrabold tracking-wide">
                    ഇഞ്ചിപ്പുളി
                  </span>
                  <span className="text-ej-muted/60">•</span>
                  <span className="text-[10px] text-ej-muted font-mono uppercase tracking-wider">
                    Providence Campus Truck
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description Grid with Thin Vertical Divider Lines (Editorial Style) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 md:divide-x divide-ej-border/60 border-t border-b border-ej-border/80 py-10">
            {/* Column 1: What's On The Menu */}
            <div className="md:px-8 first:pl-0 space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-ej-gold font-mono flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-ej-gold" />
                01 / WHAT&apos;S ON THE COUNTER
              </span>
              <h3 className="text-xl font-black text-ej-cream tracking-tight">
                Fresh &amp; Spiced Delights
              </h3>
              <p className="text-xs sm:text-sm text-ej-muted leading-relaxed">
                Crispy golden Pazham Pori, hot spiced Egg Puffs, crunchy Chicken Cutlets, and authentic
                froth-poured Malabar Chaya made live throughout the day.
              </p>
            </div>

            {/* Column 2: The Ordering Experience */}
            <div className="md:px-8 space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-ej-lime font-mono flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-ej-lime" />
                02 / ZERO-WAIT EXPERIENCE
              </span>
              <h3 className="text-xl font-black text-ej-cream tracking-tight">
                Order Ahead, Skip the Rush
              </h3>
              <p className="text-xs sm:text-sm text-ej-muted leading-relaxed">
                Check real-time stock from your phone, place your order with fast UPI/Razorpay, and walk straight to
                the window with your digital token when it&apos;s ready.
              </p>
            </div>

            {/* Column 3: The Campus Angle */}
            <div className="md:px-8 last:pr-0 space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-ej-teal font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-ej-teal" />
                03 / CAMPUS-LOCAL HEART
              </span>
              <h3 className="text-xl font-black text-ej-cream tracking-tight">
                Built for Providence College
              </h3>
              <p className="text-xs sm:text-sm text-ej-muted leading-relaxed">
                Designed specifically for college breaks. Student-friendly pricing, clean kitchen hygiene, and
                speedy prep times so you never miss the bell.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. SECTION 4: "BEHIND THE COUNTER" (Authentic Vendor Team)
          ───────────────────────────────────────────────────────────── */}
      <section id="counter" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 relative z-10 border-t border-ej-border/60 scroll-mt-20">
        <div className="space-y-10 sm:space-y-12">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-[11px] font-black tracking-widest uppercase text-ej-lime font-mono">
                THE PEOPLE WHO FEED YOU
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-ej-cream tracking-tight uppercase">
                Behind The Counter
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-ej-muted max-w-md font-medium leading-relaxed">
              The culinary crew keeping the food truck firing, steaming hot tea, and serving fresh tokens across campus daily.
            </p>
          </div>

          {/* Editorial Kitchen Crew Presentation (No Boxed Nested Card, Stylized Chef Insignia) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center py-4 sm:py-6 border-b border-ej-border/40">
            {/* Visual Chef Insignia Badge */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-8 rounded-3xl bg-gradient-to-br from-ej-surface/60 via-ej-deep/80 to-ej-indigo/40 border border-ej-border/60 hover:border-ej-lime/50 transition-all duration-300 relative group">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-ej-surface via-ej-deep to-ej-indigo border border-ej-lime/30 flex flex-col items-center justify-center shadow-[0_0_35px_rgba(212,255,61,0.18)] group-hover:shadow-[0_0_45px_rgba(212,255,61,0.35)] group-hover:scale-105 transition-all duration-300">
                <ChefHat className="w-12 h-12 text-ej-lime stroke-[1.75] drop-shadow-[0_0_15px_rgba(212,255,61,0.5)]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-ej-gold mt-2 font-mono">
                  CAMPUS CREW
                </span>
              </div>

              <span className="mt-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-ej-lime/10 text-ej-lime border border-ej-lime/30 font-mono">
                Verified Campus Vendor
              </span>
            </div>

            {/* Team Description & Credentials */}
            <div className="md:col-span-8 space-y-4 text-left">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-ej-gold uppercase tracking-wider font-mono">
                  Kitchen Operations &amp; Prep
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-ej-cream tracking-tight">
                  Enjipuli Counter Crew
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-ej-muted/90 leading-relaxed font-medium">
                Freshly sourcing local bananas for Pazham Pori, boiling traditional Malabar spice blends, and handling hundreds of token pickups with care. Dedicated to quick turnaround times and clean, delicious campus dining.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-ej-cream/80">
                <span className="flex items-center gap-1.5 text-ej-lime">
                  <CheckCircle2 className="w-4 h-4" /> Fresh daily batch cooking
                </span>
                <span className="flex items-center gap-1.5 text-ej-gold">
                  <Coffee className="w-4 h-4" /> Live boiling kettle tea
                </span>
                <span className="flex items-center gap-1.5 text-ej-teal">
                  <ShieldCheck className="w-4 h-4" /> Campus hygiene verified
                </span>
              </div>

              {/* Staff login shortcut */}
              <div className="pt-4 border-t border-ej-border/60 flex items-center justify-between flex-wrap gap-3">
                <p className="text-[11px] text-ej-muted font-mono">
                  Operating the truck today?
                </p>
                <Link
                  href="/vendor/login?purpose=vendor"
                  className="text-xs font-bold text-ej-lime hover:underline flex items-center gap-1"
                >
                  Access Vendor Portal →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. FOOTER ATTRIBUTION
          ───────────────────────────────────────────────────────────── */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-xs text-ej-muted/60 border-t border-ej-border/40 relative z-20 font-mono space-y-1">
        <p className="text-ej-muted/80 font-bold">
          ENJIPULI Food Truck • Providence College of Engineering
        </p>
        <p className="text-[10px]">
          Order ahead, skip the queue, pick up with digital tokens.
        </p>
      </footer>
    </div>
  );
}
