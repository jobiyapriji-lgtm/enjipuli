'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, Send, Check, AlertCircle, Sparkles } from 'lucide-react';

interface LandingStats {
  ordersServed: number;
  menuItems: number;
  categories: number;
}

/* ─── Inline SVG Decoratives ──────────────────────────────────── */

// Yellow / amber oil drop
function OilDrop({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 4C20 4 4 22 4 36C4 48 11.2 56 20 56C28.8 56 36 48 36 36C36 22 20 4 20 4Z" fill="#F6A800" opacity="0.9"/>
      <ellipse cx="14" cy="30" rx="3" ry="6" fill="#FFD050" opacity="0.6" transform="rotate(-20 14 30)"/>
    </svg>
  );
}

// Red drop
function RedDrop({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 4C20 4 4 22 4 36C4 48 11.2 56 20 56C28.8 56 36 48 36 36C36 22 20 4 20 4Z" fill="#E53030" opacity="0.85"/>
    </svg>
  );
}

// Blue drop
function BlueDrop({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 4C20 4 4 22 4 36C4 48 11.2 56 20 56C28.8 56 36 48 36 36C36 22 20 4 20 4Z" fill="#2563EB" opacity="0.8"/>
    </svg>
  );
}

// Tropical leaf (large dark green)
function TropicalLeaf({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M60 190 C60 190 10 120 20 60 C30 10 60 5 80 20 C110 40 120 90 100 140 C85 175 60 190 60 190Z" fill="#1B4D1E"/>
      <path d="M60 190 C60 190 62 120 58 60" stroke="#2D7A31" strokeWidth="2" opacity="0.5"/>
      <path d="M60 140 C60 140 80 120 95 110" stroke="#2D7A31" strokeWidth="1.5" opacity="0.4"/>
      <path d="M60 160 C60 160 40 145 28 138" stroke="#2D7A31" strokeWidth="1.5" opacity="0.4"/>
    </svg>
  );
}

// Small bright green leaf
function SmallLeaf({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 120 C40 120 8 80 14 45 C20 14 40 8 55 18 C72 30 78 65 62 95 C52 115 40 120 40 120Z" fill="#22C55E"/>
      <path d="M40 120 C40 120 42 80 38 45" stroke="#16A34A" strokeWidth="1.5" opacity="0.6"/>
    </svg>
  );
}

// Red chili pepper
function ChiliPepper({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 10 C25 8 20 4 22 2 C24 0 30 2 32 5" fill="#1B4D1E"/>
      <path d="M30 10 C30 10 15 30 12 55 C9 80 18 105 30 108 C42 111 50 88 50 62 C50 38 38 15 30 10Z" fill="#DC2626"/>
      <path d="M30 10 C30 10 28 30 27 55 C26 75 28 95 30 108" stroke="#EF4444" strokeWidth="1.5" opacity="0.4"/>
      <ellipse cx="22" cy="50" rx="4" ry="8" fill="#EF4444" opacity="0.5" transform="rotate(-15 22 50)"/>
    </svg>
  );
}

// Kerala food bowl (stylized SVG illustration)
function KeralaFoodBowl({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 280 260" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Bowl base */}
      <ellipse cx="140" cy="185" rx="110" ry="28" fill="#8B5E3C" opacity="0.3"/>
      <path d="M40 140 Q40 220 140 225 Q240 220 240 140 Z" fill="#C8955C"/>
      <path d="M40 140 Q40 150 140 155 Q240 150 240 140" fill="#E8B87A"/>
      {/* Bowl rim */}
      <ellipse cx="140" cy="140" rx="100" ry="22" fill="#D4A574"/>
      <ellipse cx="140" cy="140" rx="96" ry="18" fill="#E8C99A"/>
      {/* Rice mound */}
      <ellipse cx="130" cy="128" rx="70" ry="30" fill="#F5F0E0"/>
      <ellipse cx="145" cy="120" rx="55" ry="22" fill="#FFF8EC"/>
      {/* Curry / red sauce */}
      <path d="M80 130 Q110 110 145 115 Q170 112 190 125 Q180 145 155 148 Q120 150 95 142 Z" fill="#C0392B" opacity="0.85"/>
      {/* Orange gravy */}
      <path d="M100 132 Q125 118 155 122 Q175 119 188 130 Q178 143 158 146 Q125 148 105 140 Z" fill="#E67E22" opacity="0.7"/>
      {/* Egg / protein */}
      <ellipse cx="155" cy="127" rx="18" ry="14" fill="#FFF3CD"/>
      <ellipse cx="155" cy="127" rx="10" ry="8" fill="#F39C12"/>
      {/* Garnish leaves */}
      <path d="M90 115 C90 115 75 100 85 88 C92 80 105 88 100 102 Z" fill="#27AE60"/>
      <path d="M190 118 C190 118 205 103 198 90 C192 81 178 89 183 103 Z" fill="#27AE60"/>
      <path d="M165 105 C168 98 178 94 182 100 C186 106 176 112 170 108 Z" fill="#2ECC71"/>
      {/* Small garnish dots */}
      <circle cx="120" cy="125" r="3" fill="#E74C3C"/>
      <circle cx="175" cy="120" r="2.5" fill="#E74C3C"/>
      <circle cx="140" cy="118" r="2" fill="#E74C3C"/>
      {/* Oil drops spilling */}
      <ellipse cx="225" cy="158" rx="8" ry="14" fill="#F6A800" opacity="0.7" transform="rotate(20 225 158)"/>
      <ellipse cx="240" cy="172" rx="5" ry="9" fill="#F6A800" opacity="0.6" transform="rotate(35 240 172)"/>
      <circle cx="248" cy="155" r="4" fill="#F6A800" opacity="0.5"/>
    </svg>
  );
}

// Garlic bulb (bottom left decoration)
function GarlicBulb({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 150" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M60 20 C60 20 50 10 55 5 C58 2 65 4 65 10 Z" fill="#8B7355"/>
      <path d="M60 20 C60 20 48 15 45 10 C43 6 46 2 50 4 C56 7 60 15 60 20 Z" fill="#7A6347"/>
      <path d="M60 20 C60 20 72 15 75 10 C77 6 74 2 70 4 C64 7 60 15 60 20 Z" fill="#7A6347"/>
      {/* Main bulb */}
      <ellipse cx="60" cy="85" rx="48" ry="58" fill="#F5F0E8"/>
      <ellipse cx="60" cy="85" rx="44" ry="54" fill="#FDF8F0"/>
      {/* Clove lines */}
      <path d="M60 35 C60 35 38 50 36 75 C34 95 42 125 60 132 C78 125 86 95 84 75 C82 50 60 35 60 35Z" fill="#F0EAE0" stroke="#D4C9B5" strokeWidth="1"/>
      <path d="M60 35 C60 35 48 55 47 78 C46 98 52 122 60 132" stroke="#D4C9B5" strokeWidth="1.5"/>
      <path d="M60 35 C60 35 72 55 73 78 C74 98 68 122 60 132" stroke="#D4C9B5" strokeWidth="1.5"/>
      <path d="M42 55 C42 55 30 65 28 82 C27 94 32 112 45 122" stroke="#D4C9B5" strokeWidth="1"/>
      <path d="M78 55 C78 55 90 65 92 82 C93 94 88 112 75 122" stroke="#D4C9B5" strokeWidth="1"/>
      {/* Base */}
      <path d="M25 118 Q60 140 95 118 Q90 135 60 140 Q30 135 25 118Z" fill="#E8DDD0"/>
      <path d="M40 120 C40 130 50 135 60 136" stroke="#C4B89A" strokeWidth="1.5"/>
      <path d="M80 120 C80 130 70 135 60 136" stroke="#C4B89A" strokeWidth="1.5"/>
    </svg>
  );
}

// Colorful paint splash (for wordmark area)
function PaintSplash({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="40" r="12" fill="#E53030" opacity="0.9"/>
      <circle cx="18" cy="22" r="6" fill="#E53030" opacity="0.7"/>
      <path d="M26 38 L35 28" stroke="#E53030" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
      <circle cx="70" cy="15" r="8" fill="#F6A800" opacity="0.9"/>
      <path d="M68 23 L64 35" stroke="#F6A800" strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
      <circle cx="150" cy="20" r="10" fill="#2563EB" opacity="0.85"/>
      <circle cx="165" cy="12" r="5" fill="#2563EB" opacity="0.6"/>
      <path d="M155 28 L160 40" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      <circle cx="185" cy="50" r="7" fill="#16A34A" opacity="0.8"/>
      <path d="M182 57 L178 68" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
    </svg>
  );
}

// Footer food illustration (wrap/roll with splash)
function FooterFoodIllustration({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 300 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Wrap/roll base */}
      <path d="M60 280 C20 260 10 200 30 160 C50 110 100 90 140 100 C180 110 200 140 190 180 C175 230 130 270 90 285 Z" fill="#E8C27A"/>
      <path d="M60 280 C80 290 120 295 140 285 C160 275 175 255 175 235 C175 215 160 200 145 195 C125 188 100 192 80 205 C60 218 48 245 60 280Z" fill="#D4A856"/>
      {/* Filling colours */}
      <ellipse cx="120" cy="180" rx="45" ry="35" fill="#E74C3C" opacity="0.9"/>
      <path d="M80 175 Q120 155 160 168 Q165 182 155 192 Q115 205 80 190 Z" fill="#C0392B" opacity="0.8"/>
      <path d="M88 172 Q115 162 148 170 Q155 180 145 186 Q112 196 85 186Z" fill="#27AE60" opacity="0.7"/>
      <ellipse cx="125" cy="170" rx="15" ry="10" fill="#F39C12"/>
      {/* Sauce splashes */}
      <path d="M175 150 C195 130 210 120 225 130 C215 145 200 148 190 155 Z" fill="#F6A800" opacity="0.8"/>
      <path d="M185 140 C200 118 222 108 235 115 C228 132 210 138 198 145 Z" fill="#E67E22" opacity="0.65"/>
      <circle cx="240" cy="125" r="8" fill="#F6A800" opacity="0.7"/>
      <circle cx="252" cy="140" r="5" fill="#E53030" opacity="0.6"/>
      <circle cx="245" cy="155" r="4" fill="#F6A800" opacity="0.5"/>
      {/* White milk/cream splash */}
      <path d="M40 240 C20 225 5 235 8 250 C11 265 28 268 40 258 Z" fill="white" opacity="0.8"/>
      <path d="M15 258 C8 270 10 285 22 283 C30 282 36 272 30 262 Z" fill="white" opacity="0.7"/>
      {/* Garnish leaves */}
      <path d="M155 115 C165 95 185 90 190 100 C195 110 180 122 168 118 Z" fill="#27AE60"/>
      <path d="M165 108 C172 95 188 98 188 108" stroke="#16A34A" strokeWidth="1.5" opacity="0.6"/>
      {/* Colorful dots */}
      <circle cx="210" cy="180" r="6" fill="#8B5CF6" opacity="0.7"/>
      <circle cx="55" cy="210" r="8" fill="#E53030" opacity="0.6"/>
      <circle cx="35" cy="175" r="5" fill="#F6A800" opacity="0.7"/>
      {/* Bottom drip */}
      <path d="M100 285 C98 295 100 310 108 312 C116 314 120 300 118 288 Z" fill="#F6A800" opacity="0.5"/>
    </svg>
  );
}

export function RoleSelectionLanding() {
  const [stats, setStats] = useState<LandingStats>({
    ordersServed: 0,
    menuItems: 8,
    categories: 4,
  });

  const [subscriberEmail, setSubscriberEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState<string | null>(null);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/landing/stats')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setStats({
            ordersServed: Number(d.ordersServed) || 0,
            menuItems: Number(d.menuItems) || 8,
            categories: Number(d.categories) || 4,
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
      if (!res.ok) throw new Error(data.error || 'Subscription failed');
      setSubscribeSuccess("You're on the list!");
      setSubscriberEmail('');
    } catch (err: any) {
      setSubscribeError(err.message || 'Try again.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col text-[#120B24] overflow-x-hidden scroll-smooth"
      style={{ background: '#EDE8DC' }}
    >
      {/* ═══════════════════════════════════════════════════════════
          NAV BAR — dark navy full-width, wordmark left, links center, CTAs right
          ═══════════════════════════════════════════════════════════ */}
      <header
        className="w-full sticky top-0 z-50 flex items-center justify-between px-6 sm:px-10 lg:px-14"
        style={{ background: '#1A1128', minHeight: 56 }}
      >
        {/* Left: Wordmark + colorful accent dots */}
        <Link href="/" className="flex items-center gap-1 shrink-0 py-2">
          <div className="relative">
            <img
              src="/branding/enjipuli-wordmark.png"
              alt="ഇഞ്ചിപ്പുളി"
              width={200}
              height={70}
              className="h-9 w-auto object-contain"
              decoding="async"
            />
            {/* Small colorful accent dots around wordmark */}
            <span className="absolute -top-1.5 -left-2 w-2.5 h-2.5 rounded-full bg-[#E53030] opacity-90" />
            <span className="absolute -bottom-1 left-2 w-2 h-2 rounded-full bg-[#F6A800] opacity-90" />
            <span className="absolute top-0.5 -right-1 w-2 h-2 rounded-full bg-[#2563EB] opacity-80" />
          </div>
        </Link>

        {/* Center: Nav links */}
        <nav className="hidden md:flex items-center gap-10">
          <a
            href="#story"
            className="text-white text-[11px] font-black uppercase tracking-[0.18em] hover:text-[#D4FF3D] transition-colors"
          >
            Story
          </a>
          <a
            href="#story"
            className="text-white text-[11px] font-black uppercase tracking-[0.18em] hover:text-[#D4FF3D] transition-colors"
          >
            Behind the Counter
          </a>
        </nav>

        {/* Right: CTAs */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/vendor/login?purpose=vendor"
            className="px-5 py-2 rounded-full text-[13px] font-bold text-[#D4FF3D] border-2 border-[#D4FF3D] hover:bg-[#D4FF3D]/10 transition-all"
          >
            Vendor Login
          </Link>
          <Link
            href="/login?purpose=student"
            className="px-5 py-2 rounded-full text-[13px] font-black text-[#120B24] bg-[#D4FF3D] hover:bg-white transition-all flex items-center gap-1.5"
          >
            Order Now
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </Link>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════
          HERO SECTION — cream bg, vertical grid lines, food illustrations
          ═══════════════════════════════════════════════════════════ */}
      <section
        className="relative w-full overflow-hidden"
        style={{ background: '#EDE8DC', minHeight: 580 }}
      >
        {/* Vertical grid lines */}
        <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
          {[14, 28, 42, 57, 71, 85].map((pct) => (
            <div
              key={pct}
              className="absolute top-0 bottom-0 w-[1px]"
              style={{ left: `${pct}%`, background: '#C8C0A8', opacity: 0.35 }}
            />
          ))}
        </div>

        {/* ── Decorative: Kerala food bowl — top right ── */}
        <div className="absolute top-[-20px] right-[-10px] w-[240px] sm:w-[300px] pointer-events-none z-10" aria-hidden="true">
          <KeralaFoodBowl className="w-full h-auto" />
          {/* Oil drops spilling from bowl */}
          <OilDrop className="absolute w-6 h-9 top-[55%] right-[-18px]" />
          <OilDrop className="absolute w-4 h-6 top-[68%] right-[-5px] opacity-80" />
          <SmallLeaf className="absolute w-10 h-14 top-[65%] right-[28px] opacity-90 -rotate-12" />
        </div>

        {/* ── Decorative: Garlic — bottom left ── */}
        <div className="absolute bottom-[-30px] left-[-15px] w-[130px] sm:w-[160px] pointer-events-none z-10 -rotate-12" aria-hidden="true">
          <GarlicBulb className="w-full h-auto opacity-90" />
        </div>

        {/* ── Decorative: Chili + Leaf — bottom right ── */}
        <div className="absolute bottom-[10px] right-[4%] pointer-events-none z-10 flex items-end gap-1" aria-hidden="true">
          <TropicalLeaf className="w-[90px] sm:w-[115px] h-auto opacity-95" />
          <ChiliPepper className="w-[30px] sm:w-[38px] h-auto -mb-4 -ml-2 opacity-90" />
          <OilDrop className="absolute w-5 h-7 bottom-20 right-2 opacity-70" />
          <OilDrop className="absolute w-4 h-6 bottom-28 right-10 opacity-60" />
        </div>

        {/* ── Decorative: Left side colored drops ── */}
        <div className="absolute left-4 top-[35%] pointer-events-none z-10 space-y-2" aria-hidden="true">
          <OilDrop className="w-5 h-7 opacity-80" />
          <RedDrop className="w-4 h-5 opacity-75 translate-x-3" />
          <BlueDrop className="w-3.5 h-5 opacity-70 -translate-x-1" />
        </div>

        {/* ── Hero content ── */}
        <div className="relative z-20 max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 pt-10 pb-14">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 border border-[#120B24]"
            style={{ background: '#F6A800' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#120B24]" />
            <span className="text-[11px] font-black uppercase tracking-[0.14em] text-[#120B24]">
              Campus Favorite • Hot &amp; Fresh
            </span>
            <Sparkles className="w-3.5 h-3.5 text-[#120B24]" />
          </div>

          {/* Main headline */}
          <h1
            className="text-[48px] sm:text-[60px] lg:text-[72px] leading-[1.08] font-black text-[#120B24] mb-1"
            style={{ fontFamily: "'Archivo Black', 'Inter', sans-serif", maxWidth: 640 }}
          >
            Skip the Queue,
            <br />
            Order{' '}
            <span className="relative inline-block" style={{ color: '#FF7A00' }}>
              Fresh
              {/* Wavy underline matching design */}
              <svg
                className="absolute left-0 w-full"
                style={{ bottom: '-6px', height: 12 }}
                viewBox="0 0 120 12"
                preserveAspectRatio="none"
                fill="none"
              >
                <path
                  d="M2 9 C 22 2, 42 12, 62 5 C 82 -1, 102 10, 118 5"
                  stroke="#FF7A00"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </span>{' '}
            Daily
            <br />
            Only at
          </h1>

          {/* ഇഞ്ചിപ്പുളി large wordmark in hero — lime brush, with paint splash decor */}
          <div className="relative inline-block mb-5 mt-1">
            <img
              src="/branding/enjipuli-wordmark.png"
              alt="ഇഞ്ചിപ്പുളി"
              width={420}
              height={145}
              className="h-[80px] sm:h-[100px] w-auto object-contain"
              decoding="async"
            />
            {/* Colorful paint splashes around the hero wordmark */}
            <span className="absolute -left-5 top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
              <OilDrop className="w-4 h-6 -rotate-12" />
              <RedDrop className="w-3 h-4.5 rotate-6" />
            </span>
            <span className="absolute -right-3 bottom-0 flex items-center gap-1">
              <BlueDrop className="w-3.5 h-5 rotate-12" />
            </span>
            <span className="absolute right-8 -top-3">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="#F6A800" opacity="0.9"/></svg>
            </span>
            <span className="absolute right-2 top-1/3">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="5" fill="#E53030" opacity="0.85"/></svg>
            </span>
          </div>

          {/* Subtext */}
          <p className="text-[14px] sm:text-[15px] text-[#3A3050] font-medium leading-relaxed mb-7 max-w-sm">
            Browse today&apos;s campus menu, order ahead, and pick up hot at the food truck counter
            with your token — no more waiting in line between classes.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/login?purpose=student"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-black text-[14px] text-[#120B24] hover:opacity-90 transition-all"
              style={{ background: '#AADB1E' }}
            >
              Order Now
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
            <Link
              href="/vendor/login?purpose=vendor"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-[14px] text-[#120B24] bg-white border-2 border-[#120B24] hover:bg-[#f0f0f0] transition-all"
            >
              Vendor Portal
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TRUCK STORY BANNER SECTION — exact match to approved design
          ═══════════════════════════════════════════════════════════ */}
      <section
        id="story"
        className="relative w-full overflow-hidden scroll-mt-14"
        style={{ background: '#EDE8DC' }}
      >
        <div className="relative z-10 w-full">
          <img
            src="/branding/the-taste-of-tamarind-house-banner.png"
            alt="The Taste of Tamarind House Food Truck"
            width={1600}
            height={900}
            className="w-full h-auto object-cover select-none"
            decoding="async"
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          4. STAT BAND — dark navy, 4 stat tiles with icons & labels
          ═══════════════════════════════════════════════════════════ */}
      <section
        className="w-full relative z-10 py-7 px-4 sm:px-8 border-y border-white/10"
        style={{ background: '#120B24' }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 items-center justify-between">
          {/* Stat 1: 40K+ */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 48 48" fill="none" className="w-11 h-11">
                <ellipse cx="24" cy="28" rx="20" ry="12" fill="#E8B87A" stroke="#FF7A00" strokeWidth="2.5" />
                <ellipse cx="24" cy="25" rx="16" ry="8" fill="#FFF3CD" />
                <circle cx="20" cy="24" r="3" fill="#E53030" />
                <circle cx="28" cy="24" r="2.5" fill="#22C55E" />
                <path d="M12 28 Q 24 38 36 28" stroke="#FF7A00" strokeWidth="2" fill="none" />
              </svg>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white leading-none font-sans">
                40K+
              </div>
              <div className="text-[11px] sm:text-xs text-white/70 font-medium leading-tight mt-1">
                Happy Students Served
              </div>
            </div>
          </div>

          {/* Stat 2: 15+ */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 48 48" fill="none" className="w-11 h-11">
                <circle cx="24" cy="14" r="6" fill="#F6A800" stroke="#FF7A00" strokeWidth="2" />
                <circle cx="14" cy="18" r="4.5" fill="#22C55E" />
                <circle cx="34" cy="18" r="4.5" fill="#2563EB" />
                <path d="M12 36 C12 28 20 26 24 26 C28 26 36 28 36 36" fill="#F6A800" opacity="0.9" />
                <path d="M6 38 C6 32 12 30 15 30" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M42 38 C42 32 36 30 33 30" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white leading-none font-sans">
                15+
              </div>
              <div className="text-[11px] sm:text-xs text-white/70 font-medium leading-tight mt-1">
                Campus Locations Covered
              </div>
            </div>
          </div>

          {/* Stat 3: 1M+ */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
                <path
                  d="M24 40 C24 40 6 28 6 16 C6 10 11 6 17 6 C21 6 24 9 24 11 C24 9 27 6 31 6 C37 6 42 10 42 16 C42 28 24 40 24 40 Z"
                  fill="#FF3366"
                />
                <ellipse cx="15" cy="14" rx="3" ry="5" fill="#FFA3BA" opacity="0.6" transform="rotate(-25 15 14)" />
              </svg>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white leading-none font-sans">
                1M+
              </div>
              <div className="text-[11px] sm:text-xs text-white/70 font-medium leading-tight mt-1">
                Meals Shared with Good Vibes
              </div>
            </div>
          </div>

          {/* Stat 4: 100+ */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
                <path
                  d="M24 4 L30 16 L44 18 L34 28 L36 42 L24 35 L12 42 L14 28 L4 18 L18 16 Z"
                  fill="#FFD000"
                  stroke="#FF9900"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white leading-none font-sans">
                100+
              </div>
              <div className="text-[11px] sm:text-xs text-white/70 font-medium leading-tight mt-1">
                Varieties of Campus Favourites
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          5. STORY SECTION — exact match to approved design image
          ═══════════════════════════════════════════════════════════ */}
      <section
        className="relative w-full overflow-hidden"
        style={{ background: '#EDE8DC' }}
      >
        <div className="relative z-10 w-full">
          <img
            src="/branding/big-flavours-story-banner.jpg"
            alt="Big flavours, one little truck, your campus."
            width={1600}
            height={900}
            className="w-full h-auto object-cover select-none"
            decoding="async"
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FOOTER — dark navy, 3-col links, subscribe, social, copyright
          ═══════════════════════════════════════════════════════════ */}
      <footer className="relative overflow-hidden" style={{ background: '#130F26' }}>
        {/* Top colorful border strip */}
        <div className="w-full h-1 flex" aria-hidden="true">
          <div className="flex-1" style={{ background: '#E53030' }} />
          <div className="flex-1" style={{ background: '#F6A800' }} />
          <div className="flex-1" style={{ background: '#AADB1E' }} />
          <div className="flex-1" style={{ background: '#2563EB' }} />
          <div className="flex-1" style={{ background: '#8B5CF6' }} />
        </div>

        {/* Footer bottom-left food illustration */}
        <div className="absolute bottom-10 left-0 w-[200px] sm:w-[260px] pointer-events-none z-0 opacity-90" aria-hidden="true">
          <FooterFoodIllustration className="w-full h-auto" />
        </div>

        {/* Decorative accents — top right area */}
        <div className="absolute top-8 right-16 pointer-events-none z-0" aria-hidden="true">
          <SmallLeaf className="w-10 h-14 rotate-[20deg] opacity-70" />
        </div>
        <div className="absolute top-14 right-10 pointer-events-none z-0" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="#E53030" opacity="0.7"/></svg>
        </div>
        <div className="absolute top-10 right-32 pointer-events-none z-0" aria-hidden="true">
          <OilDrop className="w-4 h-6 opacity-70" />
        </div>

        {/* Main footer content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 pt-12 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-10 border-b border-white/10">

            {/* Left column: wordmark, description, subscribe, socials */}
            <div className="lg:col-span-4 space-y-5 pl-[160px] sm:pl-[200px] lg:pl-0">
              {/* Wordmark + splash */}
              <div className="relative inline-block">
                <img
                  src="/branding/enjipuli-wordmark.png"
                  alt="ഇഞ്ചിപ്പുളി"
                  width={200}
                  height={70}
                  className="h-12 sm:h-14 w-auto object-contain"
                  decoding="async"
                  style={{ filter: 'drop-shadow(0 0 12px rgba(170,219,30,0.35))' }}
                />
                {/* Colorful paint splashes around footer wordmark */}
                <span className="absolute -left-5 top-0"><RedDrop className="w-4 h-6 -rotate-20 opacity-90" /></span>
                <span className="absolute -left-3 bottom-0"><OilDrop className="w-3.5 h-5 rotate-10 opacity-85" /></span>
                <span className="absolute -right-2 -top-2"><BlueDrop className="w-3 h-4 opacity-80" /></span>
                <span className="absolute right-2 bottom-0">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="5" fill="#E53030" opacity="0.85"/></svg>
                </span>
                <span className="absolute right-8 top-1">
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><circle cx="4" cy="4" r="4" fill="#F6A800"/></svg>
                </span>
              </div>

              {/* Description */}
              <p className="text-[13px] text-white/70 leading-relaxed max-w-[240px]">
                Your favourite cafeteria flavours, now on the move. Freshly made food, great vibes
                and campus memories served with love.
              </p>

              {/* Email subscribe */}
              <form onSubmit={handleSubscribe} className="max-w-[300px]">
                <div className="relative flex items-center">
                  <input
                    type="email"
                    value={subscriberEmail}
                    onChange={(e) => setSubscriberEmail(e.target.value)}
                    placeholder="Enter your email for updates"
                    className="w-full rounded-full py-2.5 pl-4 pr-28 text-[12px] text-[#120B24] placeholder:text-[#888] focus:outline-none"
                    style={{ background: '#2A2345', color: 'white', border: 'none' }}
                    required
                  />
                  <button
                    type="submit"
                    disabled={subscribing}
                    className="absolute right-1 px-4 py-2 rounded-full text-[12px] font-black text-[#120B24] bg-white hover:bg-[#AADB1E] transition-all disabled:opacity-60"
                  >
                    {subscribing ? '...' : 'Subscribe'}
                  </button>
                </div>
                {subscribeSuccess && (
                  <p className="text-[11px] text-[#AADB1E] flex items-center gap-1 mt-1 font-mono">
                    <Check className="w-3 h-3" />{subscribeSuccess}
                  </p>
                )}
                {subscribeError && (
                  <p className="text-[11px] text-[#E53030] flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />{subscribeError}
                  </p>
                )}
              </form>

              {/* Social icons */}
              <div className="flex items-center gap-3">
                {/* Instagram */}
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                  style={{ background: '#2A2345' }} aria-label="Instagram">
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                {/* Facebook */}
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                  style={{ background: '#2A2345' }} aria-label="Facebook">
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                {/* X / Twitter */}
                <a href="https://x.com" target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                  style={{ background: '#2A2345' }} aria-label="X">
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                {/* LinkedIn */}
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                  style={{ background: '#2A2345' }} aria-label="LinkedIn">
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links column */}
            <div className="lg:col-span-2 space-y-3">
              <div>
                <h3 className="text-[14px] font-black text-white tracking-wide">Quick Links</h3>
                <div className="h-[3px] w-8 mt-1.5 rounded-full" style={{ background: '#F6A800' }} />
              </div>
              <ul className="space-y-2.5 text-[13px] text-white/75">
                <li><a href="#hero-top" className="hover:text-white transition-colors">Home</a></li>
                <li><Link href="/login?purpose=student" className="hover:text-white transition-colors">Menu</Link></li>
                <li><a href="#story" className="hover:text-white transition-colors">Our Story</a></li>
                <li><Link href="/login?purpose=student" className="hover:text-white transition-colors">Food Truck</Link></li>
                <li><a href="#story" className="hover:text-white transition-colors">Gallery</a></li>
                <li><a href="mailto:support@enjipuli.com" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>

            {/* Support column */}
            <div className="lg:col-span-2 space-y-3">
              <div>
                <h3 className="text-[14px] font-black text-white tracking-wide">Support</h3>
                <div className="h-[3px] w-8 mt-1.5 rounded-full" style={{ background: '#E53030' }} />
              </div>
              <ul className="space-y-2.5 text-[13px] text-white/75">
                <li><Link href="/orders" className="hover:text-white transition-colors">Order Tracking</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms &amp; Conditions</Link></li>
                <li><a href="mailto:support@enjipuli.com" className="hover:text-white transition-colors">Help Center</a></li>
              </ul>
            </div>

            {/* More from ഇഞ്ചിപ്പുളി column */}
            <div className="lg:col-span-4 space-y-3 relative">
              <div>
                <h3 className="text-[14px] font-black text-white tracking-wide">
                  More from{' '}
                  <span style={{ fontFamily: "'Baloo Chettan 2', sans-serif" }}>ഇഞ്ചിപ്പുളി</span>
                </h3>
                <div className="h-[3px] w-8 mt-1.5 rounded-full" style={{ background: '#2563EB' }} />
              </div>
              <ul className="space-y-2.5 text-[13px] text-white/75">
                <li><a href="#story" className="hover:text-white transition-colors">Healthy Eating</a></li>
                <li><a href="#story" className="hover:text-white transition-colors">Campus Life</a></li>
                <li><a href="#story" className="hover:text-white transition-colors">Foodie Diaries</a></li>
                <li><a href="#story" className="hover:text-white transition-colors">Recipe Inspirations</a></li>
              </ul>

              {/* COME HUNGRY. LEAVE HAPPY. — diagonal callout bottom-right */}
              <div className="absolute bottom-[-20px] right-4 lg:right-0">
                <div className="transform -rotate-6 inline-block">
                  <p
                    className="text-[#F6A800] font-black leading-tight"
                    style={{
                      fontFamily: "'Permanent Marker', 'Caveat', cursive",
                      fontSize: 22,
                      textShadow: '1px 1px 0 rgba(0,0,0,0.3)',
                    }}
                  >
                    COME HUNGRY.
                    <br />
                    LEAVE HAPPY.
                  </p>
                  {/* Small colored accent dots near callout */}
                  <div className="absolute -bottom-2 -right-3 flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#E53030] opacity-80" />
                    <span className="w-2 h-2 rounded-full bg-[#F6A800] opacity-90" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] opacity-75 mt-0.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom copyright bar */}
          <div className="pt-6 pb-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[12px] text-white/60 font-mono">
              © Since 2015{' '}
              <span
                className="text-white/90 font-bold underline"
                style={{ fontFamily: "'Baloo Chettan 2', sans-serif" }}
              >
                ഇഞ്ചിപ്പുളി
              </span>
              . All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-[12px] text-white/55">
              <Link href="/terms" className="hover:text-white transition-colors">Terms &amp; Conditions</Link>
              <span className="text-white/25">|</span>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <span className="text-white/25">|</span>
              <span className="hover:text-white cursor-pointer transition-colors">Cookie Settings</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
