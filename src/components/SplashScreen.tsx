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
          <div className="w-full max-w-[240px] sm:max-w-[280px] space-y-3 pt-3 flex flex-col items-center">
            {/* Animated Food Loader (inspired by reference: 4 satellite food discs + spotlight pizza disc) */}
            <div className="relative flex flex-nowrap items-center justify-center gap-2 sm:gap-2.5 py-1">
              {/* Subtle connecting track line */}
              <div
                className="absolute left-2 right-4 top-1/2 -translate-y-1/2 h-[2px] rounded-full pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, rgba(61,53,128,0.3) 0%, rgba(212,255,61,0.2) 60%, rgba(212,255,61,0.4) 100%)',
                }}
              />

              {/* 1. Croissant */}
              <div
                className="food-satellite-disc relative z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all"
                style={{ animationDelay: '0s' }}
                title="Croissant"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                >
                  <path d="M4.5 15.5c-1.2-1.5-.7-3.6.8-4.9 2-1.8 5-2.8 8.2-2.3 3 .4 5.3 2 6.3 4.2.8 1.6.3 3.3-.8 4.2-1.2 1-3 .5-3.8-.8-.6-1-1.2-1.9-2.2-2.5-1.5-.9-3.3-.9-4.8 0-1 .6-1.6 1.5-2.2 2.5-.7 1.3-2.3 1.7-3.5.7z" />
                  <path d="M9.5 9c.4 1.8.6 3.6.1 5.2" />
                  <path d="M14.5 9c-.4 1.8-.6 3.6-.1 5.2" />
                  <path d="M12 8.2v6.2" />
                </svg>
              </div>

              {/* 2. Takeaway Drink Cup */}
              <div
                className="food-satellite-disc relative z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all"
                style={{ animationDelay: '0.22s' }}
                title="Drink"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                >
                  <rect x="6" y="4.5" width="12" height="2.5" rx="1.2" />
                  <path d="M7.2 7l1 12.2c.1.9.8 1.6 1.7 1.6h4.2c.9 0 1.6-.7 1.7-1.6l1-12.2" />
                  <line x1="7.6" y1="11.5" x2="16.4" y2="11.5" />
                  <line x1="8" y1="15" x2="16" y2="15" />
                </svg>
              </div>

              {/* 3. Donut with Sprinkles */}
              <div
                className="food-satellite-disc relative z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all"
                style={{ animationDelay: '0.44s' }}
                title="Donut"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                >
                  <circle cx="12" cy="12" r="8" />
                  <circle cx="12" cy="12" r="3" />
                  <line x1="9" y1="8" x2="10" y2="7.5" />
                  <line x1="14.5" y1="7.5" x2="15.5" y2="8.5" />
                  <line x1="16.5" y1="12" x2="15.5" y2="12.5" />
                  <line x1="7.5" y1="12" x2="8.5" y2="12.5" />
                  <line x1="9.5" y1="16" x2="10.5" y2="15.5" />
                  <line x1="14" y1="16" x2="14.8" y2="15" />
                </svg>
              </div>

              {/* 4. Noodle Bowl with Chopsticks */}
              <div
                className="food-satellite-disc relative z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all"
                style={{ animationDelay: '0.66s' }}
                title="Noodles"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                >
                  <path d="M5 13c0 4.2 3.1 7.2 7 7.2s7-3 7-7.2" />
                  <line x1="4.5" y1="13" x2="19.5" y2="13" />
                  <path d="M8 13c0-2.5 2-3.8 4-3.8s4 1.3 4 3.8" />
                  <path d="M10 9.2c0-1.8 1.5-2.7 3-2.7" />
                  <line x1="13" y1="12.5" x2="19.5" y2="4.5" />
                  <line x1="15" y1="12.5" x2="21" y2="6" />
                </svg>
              </div>

              {/* 5. Spotlight Disc: Pizza Slice */}
              <div
                className="food-spotlight-disc relative z-10 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center"
                title="Pizza"
              >
                {/* Orbiting dashed accent ring */}
                <div className="absolute -inset-1 rounded-full border border-dashed border-ej-lime/30 food-spotlight-orbit pointer-events-none" />

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 sm:w-6 sm:h-6 food-pizza-icon"
                >
                  <path d="M10 5.2c3.5 1.5 6.8 4.8 8.8 8.8" />
                  <path d="M9.5 7.2c2.8 1.3 5.4 3.9 7 7" strokeWidth="1.5" />
                  <path d="M5.5 18.5L10 5.2" />
                  <path d="M5.5 18.5L18.8 14" />
                  <circle cx="10" cy="12.5" r="1.3" fill="currentColor" fillOpacity="0.3" />
                  <circle cx="14" cy="11.5" r="1.3" fill="currentColor" fillOpacity="0.3" />
                  <circle cx="11" cy="15.5" r="1.1" fill="currentColor" fillOpacity="0.3" />
                </svg>
              </div>
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

        @keyframes satelliteWave {
          0%, 100% {
            transform: translateY(0) scale(1);
            border-color: rgba(61, 53, 128, 0.55);
            color: rgba(155, 149, 196, 0.7);
            background: rgba(36, 27, 94, 0.7);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
          }
          18% {
            transform: translateY(-4px) scale(1.08);
            border-color: rgba(212, 255, 61, 0.9);
            color: #D4FF3D;
            background: rgba(42, 33, 104, 0.95);
            box-shadow: 0 0 14px rgba(212, 255, 61, 0.45), 0 4px 12px rgba(0, 0, 0, 0.35);
          }
          36% {
            transform: translateY(0) scale(1);
            border-color: rgba(47, 191, 160, 0.4);
            color: rgba(47, 191, 160, 0.85);
          }
        }

        @keyframes spotlightPulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 14px rgba(212, 255, 61, 0.35), 0 4px 16px rgba(0, 0, 0, 0.4);
            border-color: #D4FF3D;
          }
          20% {
            transform: scale(1.1);
            box-shadow: 0 0 24px rgba(212, 255, 61, 0.75), 0 0 36px rgba(47, 191, 160, 0.35), 0 6px 20px rgba(0,0,0,0.5);
            border-color: #FFFFFF;
          }
          40% {
            transform: scale(1);
            box-shadow: 0 0 14px rgba(212, 255, 61, 0.35), 0 4px 16px rgba(0, 0, 0, 0.4);
            border-color: #D4FF3D;
          }
        }

        @keyframes pizzaWiggle {
          0%, 100% {
            transform: rotate(0deg);
          }
          12% {
            transform: rotate(-10deg) scale(1.05);
          }
          24% {
            transform: rotate(6deg) scale(1.05);
          }
          36% {
            transform: rotate(0deg);
          }
        }

        @keyframes orbitRotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .splash-glow {
          animation: splashPulse 3.5s ease-in-out infinite;
        }

        .food-satellite-disc {
          border: 1px solid rgba(61, 53, 128, 0.55);
          color: rgba(155, 149, 196, 0.7);
          background: rgba(36, 27, 94, 0.7);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
          animation: satelliteWave 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .food-spotlight-disc {
          background: radial-gradient(circle at 35% 35%, rgba(42, 33, 94, 0.95), rgba(21, 15, 46, 0.98));
          border: 2px solid #D4FF3D;
          color: #D4FF3D;
          box-shadow: 0 0 14px rgba(212, 255, 61, 0.35), 0 4px 16px rgba(0, 0, 0, 0.4);
          animation: spotlightPulse 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          animation-delay: 0.88s;
        }

        .food-spotlight-orbit {
          animation: orbitRotate 9s linear infinite;
        }

        .food-pizza-icon {
          animation: pizzaWiggle 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          animation-delay: 0.88s;
          transform-origin: center center;
        }

        /* Respect prefers-reduced-motion */
        @media (prefers-reduced-motion: reduce) {
          .splash-glow,
          .food-satellite-disc,
          .food-spotlight-disc,
          .food-spotlight-orbit,
          .food-pizza-icon {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
