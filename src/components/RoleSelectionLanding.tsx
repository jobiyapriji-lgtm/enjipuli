'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, Send, Check, AlertCircle, Sparkles, X } from 'lucide-react';

interface LandingStats {
  ordersServed: number;
  menuItems: number;
  categories: number;
}

/* ─── Inline SVG Decoratives ──────────────────────────────────── */

// Hand-drawn glossy teardrop with specular reflection arc matching target branding
function GlossyDrop({
  color,
  rotate = 0,
  className = '',
}: {
  color: string;
  rotate?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 48"
      className={className}
      style={{ transform: `rotate(${rotate}deg)` }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 2 C16 2 2 18 2 30 C2 39 8.2 46 16 46 C23.8 46 30 39 30 30 C30 18 16 2 16 2 Z"
        fill={color}
      />
      <path
        d="M8 24 C7 28 8 34 11 38"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}

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

  // Campus map modal overlay state
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // Close modal on Escape key and lock body scroll while modal is active
  useEffect(() => {
    if (!isMapModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMapModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isMapModalOpen]);

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
      style={{ background: '#FBF3E2' }}
    >
      {/* ═══════════════════════════════════════════════════════════
          NAV BAR — native sticky dark header with exact button placement
          ═══════════════════════════════════════════════════════════ */}
      <header
        className="w-full sticky top-0 z-50 flex items-center justify-between px-6 sm:px-10 lg:px-14 shadow-lg border-b border-white/5"
        style={{ background: '#0F0C20', minHeight: 64, height: 64 }}
      >
        {/* Left: Wordmark + exact droplet accents */}
        <Link href="/" className="flex items-center shrink-0 py-2">
          <div className="relative flex items-center">
            {/* Left droplets */}
            <div className="flex flex-col items-center gap-0.5 -mr-1.5 z-10">
              <GlossyDrop color="#FFB800" rotate={-25} className="w-3 h-4" />
              <GlossyDrop color="#F21B55" rotate={20} className="w-2.5 h-3.5" />
            </div>

            <img
              src="/branding/enjipuli-wordmark.png"
              alt="ഇഞ്ചിപ്പുളി"
              width={160}
              height={52}
              className="h-8 sm:h-9 w-auto object-contain"
              decoding="async"
            />

            {/* Right droplets */}
            <div className="flex flex-col items-center gap-0.5 -ml-1.5 z-10">
              <GlossyDrop color="#FFB800" rotate={25} className="w-2.5 h-3.5" />
              <GlossyDrop color="#F21B55" rotate={-15} className="w-2.5 h-3.5" />
              <GlossyDrop color="#00A3FF" rotate={35} className="w-2 h-3" />
            </div>
          </div>
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-10">
          <a
            href="#story"
            className="text-white text-[12px] font-black uppercase tracking-[0.18em] hover:text-[#D4FF3D] transition-colors"
          >
            Story
          </a>
          <a
            href="#story"
            className="text-white text-[12px] font-black uppercase tracking-[0.18em] hover:text-[#D4FF3D] transition-colors"
          >
            Behind the Counter
          </a>
        </nav>

        {/* Right: CTAs — strictly single row, vertically centered, Vendor Login left, Order Now right */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/vendor/login?purpose=vendor"
            className="inline-flex items-center justify-center px-4 sm:px-5 py-2 rounded-full text-xs sm:text-[13px] font-bold text-[#D4FF3D] border-2 border-[#D4FF3D] hover:bg-[#D4FF3D]/10 transition-all whitespace-nowrap"
          >
            Vendor Login
          </Link>
          <Link
            href="/login?purpose=student"
            className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-[13px] font-black text-[#120B24] bg-[#D4FF3D] hover:bg-white transition-all whitespace-nowrap shadow-sm"
          >
            <span>Order Now</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </Link>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════
          HERO SECTION — Native HTML & SVG layout: 100% crisp, no blur, no image overlay issues
          ═══════════════════════════════════════════════════════════ */}
      <section
        id="hero-top"
        className="relative w-full overflow-hidden select-none"
        style={{ background: '#FBF3E2', minHeight: 620 }}
      >
        {/* Subtle vertical grid lines matching target warm tone */}
        <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
          {[14, 28, 42, 57, 71, 85].map((pct) => (
            <div
              key={pct}
              className="absolute top-0 bottom-0 w-[1px]"
              style={{ left: `${pct}%`, background: '#D8CEB4', opacity: 0.35 }}
            />
          ))}
        </div>

        {/* ── Decorative: Painterly Hand-Drawn Food Bowl (top right) ── */}
        <img
          src="/branding/hero-bowl-perfect.png"
          alt=""
          aria-hidden="true"
          className="absolute -top-1 -right-1 w-[320px] sm:w-[420px] lg:w-[480px] pointer-events-none z-10 object-contain"
        />

        {/* ── Decorative: Painterly Hand-Drawn Burrito Wrap (bottom left) ── */}
        <img
          src="/branding/hero-wrap-perfect.png"
          alt=""
          aria-hidden="true"
          className="absolute bottom-0 left-0 w-[170px] sm:w-[220px] lg:w-[260px] pointer-events-none z-10 object-contain"
        />

        {/* ── Decorative: Painterly Hand-Drawn Tropical Leaf & Chili (bottom right) ── */}
        <img
          src="/branding/hero-leaf-chili-perfect.png"
          alt=""
          aria-hidden="true"
          className="absolute bottom-0 right-0 w-[240px] sm:w-[320px] lg:w-[380px] pointer-events-none z-10 object-contain"
        />

        {/* ── Hero Content (Sharp Native Typography & Interactive Elements) ── */}
        <div className="relative z-20 max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 pt-9 sm:pt-11 pb-16">
          {/* Badge: Golden Amber pill with thin black border, star left, hand-drawn sparkle right */}
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full mb-4 border border-[#0F0C20] shadow-sm select-none"
            style={{ background: '#F5A31E' }}
          >
            {/* Outlined 5-point star on left */}
            <svg
              className="w-3.5 h-3.5 text-[#0F0C20]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="text-[11px] sm:text-[12px] font-black uppercase tracking-[0.08em] text-[#0F0C20]">
              Campus Favorite • Hot &amp; Fresh
            </span>
            {/* Hand-drawn 4-point sparkle with top-right accent stroke */}
            <svg
              className="w-3.5 h-3.5 text-[#0F0C20]"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 2 C10 6 6 10 2 10 C6 10 10 14 10 18 C10 14 14 10 18 10 C14 10 10 6 10 2 Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M15.5 3.5 L17.5 1.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Headline: Ultra-heavy bold display typography with tight line-height and letter-spacing */}
          <h1
            className="text-[44px] sm:text-[62px] lg:text-[76px] leading-[0.98] font-black text-[#0F0C20] tracking-[-0.035em] mb-2"
            style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", maxWidth: 680 }}
          >
            Skip the Queue,
            <br />
            Order{' '}
            <span className="relative inline-block text-[#FE8700]">
              Fresh
              {/* Double wavy brush underline matching target */}
              <svg
                className="absolute left-0 w-full"
                style={{ bottom: '-6px', height: 12 }}
                viewBox="0 0 120 12"
                preserveAspectRatio="none"
                fill="none"
              >
                <path
                  d="M2 5 C 32 1, 75 7, 118 4"
                  stroke="#FE8700"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <path
                  d="M10 10 C 42 6, 80 11, 110 8"
                  stroke="#FE8700"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>{' '}
            Daily
            <br />
            Only at
          </h1>

          {/* Large Enjipuli Wordmark with Exact Droplet Accents */}
          <div className="relative inline-flex items-center my-1 select-none">
            {/* Left droplets: yellow & red */}
            <div className="flex flex-col items-center gap-1 -mr-2 sm:-mr-3 z-10">
              <GlossyDrop color="#FFB800" rotate={-25} className="w-5 sm:w-6 h-7 sm:h-8" />
              <GlossyDrop color="#F21B55" rotate={20} className="w-4 sm:w-5 h-6 sm:h-7" />
            </div>

            {/* Sticker wordmark with thick black outline & lime fill */}
            <img
              src="/branding/enjipuli-wordmark.png"
              alt="ഇഞ്ചിപ്പുളി"
              width={420}
              height={145}
              className="h-[76px] sm:h-[96px] lg:h-[115px] w-auto object-contain drop-shadow-sm"
              decoding="async"
            />

            {/* Right droplets: yellow, red & cyan-blue */}
            <div className="flex flex-col items-center gap-0.5 -ml-2 sm:-ml-3 z-10">
              <GlossyDrop color="#FFB800" rotate={25} className="w-4 sm:w-5 h-6 sm:h-7" />
              <GlossyDrop color="#F21B55" rotate={-15} className="w-4 sm:w-5 h-6 sm:h-7" />
              <GlossyDrop color="#00A3FF" rotate={40} className="w-3.5 sm:w-4 h-5 sm:h-6" />
            </div>
          </div>

          {/* Subtext description with refined proportions */}
          <p className="text-[14px] sm:text-[15.5px] text-[#2A2438] font-medium leading-snug mb-6 max-w-[440px]">
            Browse today&apos;s campus menu, order ahead, and pick up hot at the food truck counter
            with your token — no more waiting in line between classes.
          </p>

          {/* Real, Clean, Responsive CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3.5">
            <Link
              href="/login?purpose=student"
              className="inline-flex items-center justify-center gap-2 px-7 sm:px-9 py-3 sm:py-3.5 rounded-full font-black text-sm sm:text-[15px] text-[#0F0C20] bg-[#D2FF1E] hover:bg-[#bbf014] hover:shadow-lg active:scale-95 transition-all shadow-sm"
            >
              <span>Order Now</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
            <Link
              href="/vendor/login?purpose=vendor"
              className="inline-flex items-center justify-center px-7 sm:px-9 py-3 sm:py-3.5 rounded-full font-bold text-sm sm:text-[15px] text-[#0F0C20] bg-[#FBF3E2] border-2 border-[#0F0C20] hover:bg-white active:scale-95 transition-all shadow-sm"
            >
              <span>Vendor Portal</span>
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
        style={{ background: '#FBF3E2' }}
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
          {/* Trust row at bottom of truck block matching final design */}
          <div
            className="absolute bottom-0 left-0 right-0 py-2.5 sm:py-3.5 px-6 sm:px-12 lg:px-16 flex items-center justify-between text-[#120B24] text-[9px] sm:text-[11px] font-black uppercase tracking-[0.18em] border-t border-[#C8C0A8]/40"
            style={{ background: '#FBF3E2' }}
          >
            <span>TAMARIND HOUSE CAFETERIA</span>
            <span>BRINGING CAMPUS FLAVOURS TO YOU</span>
            <span>SINCE 2015</span>
          </div>
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
        className="relative w-full overflow-hidden select-none"
        style={{ background: '#FBF3E2' }}
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
          {/* Interactive FIND US button hit area right over the banner's FIND US button */}
          <button
            type="button"
            onClick={() => setIsMapModalOpen(true)}
            className="absolute z-20 rounded-md transition-all hover:opacity-85 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#AADB1E]"
            style={{
              right: '3.6%',
              bottom: '15.5%',
              width: '10.5%',
              height: '8%',
            }}
            title="Find Us on Campus Map"
            aria-label="Find Us on Campus Map"
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
              <div className="relative inline-flex items-center">
                {/* Left droplets */}
                <div className="flex flex-col items-center gap-0.5 -mr-1.5 z-10">
                  <GlossyDrop color="#FFB800" rotate={-25} className="w-3.5 h-4.5" />
                  <GlossyDrop color="#F21B55" rotate={20} className="w-3 h-4" />
                </div>

                <img
                  src="/branding/enjipuli-wordmark.png"
                  alt="ഇഞ്ചിപ്പുളി"
                  width={200}
                  height={70}
                  className="h-12 sm:h-14 w-auto object-contain"
                  decoding="async"
                  style={{ filter: 'drop-shadow(0 0 12px rgba(210,255,30,0.35))' }}
                />

                {/* Right droplets */}
                <div className="flex flex-col items-center gap-0.5 -ml-1.5 z-10">
                  <GlossyDrop color="#FFB800" rotate={25} className="w-3 h-4" />
                  <GlossyDrop color="#F21B55" rotate={-15} className="w-3 h-4" />
                  <GlossyDrop color="#00A3FF" rotate={40} className="w-2.5 h-3.5" />
                </div>
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

      {/* ═══════════════════════════════════════════════════════════
          CAMPUS MAP MODAL OVERLAY (Opened via FIND US button)
          ═══════════════════════════════════════════════════════════ */}
      {isMapModalOpen && (
        <div
          id="campus-map-backdrop"
          className="fixed inset-0 z-50 bg-[#120B24]/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in"
          onClick={(e) => {
            if ((e.target as HTMLElement).id === 'campus-map-backdrop') {
              setIsMapModalOpen(false);
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="campus-map-title"
        >
          <div
            className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col border border-stone-200 overflow-hidden animate-scale-up"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-stone-200 bg-[#FBF3E2] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E53030]/10 flex items-center justify-center text-[#E53030]">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="campus-map-title" className="text-sm sm:text-base font-extrabold text-[#120B24] leading-tight">
                    Providence Campus Map
                  </h3>
                  <p className="text-[11px] text-[#120B24]/70 font-medium">
                    Injipulli ഇഞ്ചിപ്പുളി Food Truck Location
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMapModalOpen(false)}
                className="p-1.5 sm:p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-200/80 transition focus:outline-none focus:ring-2 focus:ring-[#120B24]/20"
                aria-label="Close campus map"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Scrollable, readable campus map image */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-4 bg-white flex justify-center items-start">
              <img
                src="/campus-map.png"
                alt="Providence campus map showing Injipulli food truck location"
                width={600}
                height={950}
                className="w-full h-auto max-w-[620px] rounded-lg shadow-sm border border-stone-100 object-contain select-none"
                loading="eager"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
