'use client';

import React, { useState, useEffect } from 'react';

interface SplashScreenProps {
  stage?: 'logo' | 'loading';
  message?: string;
}

const ON_BRAND_MESSAGES = [
  "Loading today's fresh menu...",
  "Checking live food truck stock...",
  "Getting campus counter ready...",
];

export function SplashScreen({
  stage = 'loading',
  message,
}: SplashScreenProps) {
  const [activeMessage, setActiveMessage] = useState(
    message || ON_BRAND_MESSAGES[0]
  );

  // If a custom specific message is provided (e.g. "Opening Vendor Dashboard..."), use it
  useEffect(() => {
    if (message) {
      setActiveMessage(message);
      return;
    }

    // Otherwise gently rotate through 2-3 short on-brand messages
    const interval = setInterval(() => {
      setActiveMessage((prev) => {
        const nextIdx = (ON_BRAND_MESSAGES.indexOf(prev) + 1) % ON_BRAND_MESSAGES.length;
        return ON_BRAND_MESSAGES[nextIdx];
      });
    }, 2400);

    return () => clearInterval(interval);
  }, [message]);

  return (
    <div
      id="app-splash-screen"
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, #1E1744 0%, #150F2E 65%, #0B081B 100%)',
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. CENTERED AMBIENT LIME GLOW (Minimal & Confident)
          ───────────────────────────────────────────────────────────── */}
      <div
        className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full pointer-events-none blur-3xl opacity-25 splash-glow"
        style={{
          background: 'radial-gradient(circle, rgba(212, 255, 61, 0.9) 0%, rgba(20, 184, 166, 0.4) 40%, transparent 70%)',
        }}
      />

      {/* ─────────────────────────────────────────────────────────────
          2. THE REAL LOGO ASSETS (Wordmark + Tagline)
          ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center max-w-sm sm:max-w-md w-full space-y-6">
        {/* Brand Group */}
        <div className="flex flex-col items-center select-none">
          {/* Main Wordmark Asset: ഇഞ്ചിപ്പുളി */}
          <div className="relative flex items-center justify-center">
            <img
              src="/branding/enjipuli-wordmark.png"
              alt="ഇഞ്ചിപ്പുളി"
              width={1024}
              height={377}
              className="w-64 sm:w-80 md:w-[22rem] max-w-[85vw] h-auto object-contain drop-shadow-[0_0_25px_rgba(212,255,61,0.3)] transition-transform duration-500 hover:scale-[1.02]"
              decoding="async"
            />
          </div>

          {/* Malayalam Tagline Asset: ക്യാമ്പസിന്റെ ഹോട്ട്സ്പോട്ട് */}
          <div className="mt-1 sm:mt-1.5 flex items-center justify-center">
            <img
              src="/branding/enjipuli-tagline.png"
              alt="ക്യാമ്പസിന്റെ ഹോട്ട്സ്പോട്ട്"
              width={1024}
              height={341}
              className="w-40 sm:w-52 md:w-60 max-w-[65vw] h-auto object-contain drop-shadow-[0_0_14px_rgba(212,255,61,0.22)]"
              decoding="async"
            />
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            3. REFINED SINGLE PROGRESS BAR & LOADING STATUS
            ───────────────────────────────────────────────────────────── */}
        {stage === 'loading' && (
          <div className="w-full max-w-[200px] sm:max-w-[240px] space-y-3 pt-3 flex flex-col items-center">
            {/* Ultra-clean gradient bar with subtle sheen */}
            <div className="w-full h-1 sm:h-1.5 bg-ej-indigo/70 rounded-full overflow-hidden border border-ej-border/40 relative shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-ej-teal via-ej-lime to-ej-gold indeterminate-bar"
                style={{
                  boxShadow: '0 0 10px rgba(212, 255, 61, 0.7)',
                }}
              />
              <div className="absolute inset-0 sheen-overlay pointer-events-none" />
            </div>

            {/* Clean loading message */}
            <p className="text-[11px] sm:text-xs text-ej-muted/80 font-medium tracking-wide transition-opacity duration-300">
              {activeMessage}
            </p>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. PERFORMANCE & ACCESSIBILITY STYLES
          ───────────────────────────────────────────────────────────── */}
      <style jsx>{`
        @keyframes splashPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.22;
          }
          50% {
            transform: scale(1.06);
            opacity: 0.35;
          }
        }

        @keyframes indeterminateMove {
          0% {
            transform: translateX(-100%) scaleX(0.25);
          }
          50% {
            transform: translateX(25%) scaleX(0.65);
          }
          100% {
            transform: translateX(130%) scaleX(0.25);
          }
        }

        @keyframes sheenSweep {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .splash-glow {
          animation: splashPulse 3.5s ease-in-out infinite;
        }

        .indeterminate-bar {
          animation: indeterminateMove 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .sheen-overlay {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.35) 50%,
            transparent 100%
          );
          animation: sheenSweep 2.2s ease-in-out infinite;
        }

        /* Respect prefers-reduced-motion */
        @media (prefers-reduced-motion: reduce) {
          .splash-glow,
          .indeterminate-bar,
          .sheen-overlay {
            animation: none !important;
          }
          .indeterminate-bar {
            width: 75% !important;
            transform: none !important;
            margin: 0 auto;
          }
        }
      `}</style>
    </div>
  );
}
