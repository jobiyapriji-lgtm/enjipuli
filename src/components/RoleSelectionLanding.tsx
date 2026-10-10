'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Clock, ShieldCheck, Zap } from 'lucide-react';
import { MuralBackground } from '@/components/MuralBackground';

export function RoleSelectionLanding() {
  return (
    <div
      id="hero-landing-screen"
      className="min-h-screen flex flex-col bg-ej-deep text-ej-cream relative overflow-x-hidden selection:bg-ej-lime selection:text-ej-ink"
      style={{
        background: 'radial-gradient(ellipse at 80% 20%, #241B5E 0%, #150F2E 50%, #0B081B 100%)',
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          0. BACKGROUND ARTWORK & AMBIENT NEON GLOWS
          ───────────────────────────────────────────────────────────── */}
      <MuralBackground opacity={0.08} />

      {/* Large ambient glow behind the right column */}
      <div
        className="absolute top-1/4 right-[-10%] w-[550px] sm:w-[700px] h-[550px] sm:h-[700px] rounded-full pointer-events-none blur-3xl opacity-25"
        style={{
          background: 'radial-gradient(circle, rgba(212, 255, 61, 0.45) 0%, rgba(47, 191, 160, 0.25) 40%, transparent 75%)',
        }}
      />

      {/* Subtle secondary ambient glow behind the left column */}
      <div
        className="absolute bottom-10 left-[-10%] w-[450px] h-[450px] rounded-full pointer-events-none blur-3xl opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(244, 180, 0, 0.4) 0%, rgba(36, 27, 94, 0.8) 60%, transparent 80%)',
        }}
      />

      {/* ─────────────────────────────────────────────────────────────
          1. NAVBAR (Recreated from reference structure)
          ───────────────────────────────────────────────────────────── */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex items-center justify-between relative z-20">
        {/* Left: The ഇഞ്ചിപ്പുളി Wordmark Asset (Small Scale) */}
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/branding/enjipuli-wordmark.png"
            alt="ഇഞ്ചിപ്പുളി"
            width={320}
            height={110}
            className="h-9 sm:h-11 w-auto object-contain drop-shadow-[0_0_16px_rgba(212,255,61,0.35)] transition-transform duration-300 group-hover:scale-105"
            decoding="async"
          />
          <span className="hidden md:inline-block text-[10px] font-black uppercase tracking-widest text-ej-gold/80 border-l border-ej-border/80 pl-3 font-mono">
            ക്യാമ്പസിന്റെ ഹോട്ട്സ്പോട്ട്
          </span>
        </Link>

        {/* Right: Two CTAs matching reference visual relationship (One quiet, one bold) */}
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
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. SPLIT HERO SECTION (Left: Copy & CTAs, Right: Truck Photo)
          ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center relative z-10">
        {/* ── Left Column: Headline, Badge, Subtext & CTAs ───────── */}
        <div className="lg:col-span-7 flex flex-col items-start space-y-6 sm:space-y-7 text-left animate-fade-in-up">
          {/* Badge: Campus Favorite (inspired by "Family Owned Since 1985") */}
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

        {/* ── Right Column: Large Truck Hero Photo with Glow ─────── */}
        <div className="lg:col-span-5 flex items-center justify-center relative mt-4 lg:mt-0">
          {/* Concentric Neon Radial Glow Bleeding from Behind */}
          <div
            className="absolute inset-0 sm:-inset-6 rounded-3xl blur-3xl pointer-events-none opacity-50"
            style={{
              background: 'radial-gradient(circle, rgba(212, 255, 61, 0.35) 0%, rgba(47, 191, 160, 0.2) 40%, transparent 70%)',
            }}
          />

          {/* Hero Truck Card Frame */}
          <div className="relative z-10 w-full max-w-lg lg:max-w-none group">
            <div className="relative rounded-3xl overflow-hidden border-2 border-ej-lime/40 bg-gradient-to-b from-ej-surface/70 via-ej-indigo/40 to-ej-deep/95 shadow-[0_0_50px_rgba(212,255,61,0.2)] group-hover:border-ej-lime/80 group-hover:shadow-[0_0_60px_rgba(212,255,61,0.35)] transition-all duration-500">
              <img
                src="/branding/truck-hero.png"
                alt="ENJIPULI Kerala Psychedelic Food Truck"
                width={1024}
                height={768}
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
      </main>

      {/* ─────────────────────────────────────────────────────────────
          3. MINIMAL FOOTER ATTRIBUTION
          ───────────────────────────────────────────────────────────── */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-center text-[11px] text-ej-muted/60 border-t border-ej-border/40 relative z-20 font-mono">
        <p>ENJIPULI Food Truck • Serving hot Kerala snacks &amp; meals on campus</p>
      </footer>
    </div>
  );
}
