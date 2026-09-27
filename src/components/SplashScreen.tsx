'use client';

import React from 'react';
import { LogoWordmark } from '@/components/LogoWordmark';
import { ElephantMascot } from '@/components/ElephantMascot';
import { MuralBackground } from '@/components/MuralBackground';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  stage: 'logo' | 'loading';
  message?: string;
}

export function SplashScreen({ stage, message = 'Connecting to Providence campus kitchen...' }: SplashScreenProps) {
  return (
    <div
      id="app-splash-screen"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, #1E1744 0%, #150F2E 70%, #0D0920 100%)',
      }}
    >
      {/* Decorative Mural Backdrop */}
      <MuralBackground opacity={0.12} />

      {/* Ambient background glow orb */}
      <div
        className="absolute w-96 h-96 rounded-full pointer-events-none blur-3xl opacity-30 animate-pulse"
        style={{ background: 'radial-gradient(circle, var(--ej-lime) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full space-y-6 animate-fade-in-up">
        {/* Elephant Mascot with playful float animation */}
        <div className="relative">
          <div className="transform transition-transform duration-700 hover:scale-105">
            <ElephantMascot size={150} />
          </div>
          <div className="absolute -top-1 -right-1 p-1.5 rounded-full bg-ej-lime text-ej-ink shadow-glow-sm animate-bounce">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Brand Logo Wordmark */}
        <div className="flex flex-col items-center space-y-1">
          <LogoWordmark size={220} light glow={true} />
          <p className="text-xs font-bold text-ej-gold tracking-widest uppercase mt-1">
            Campus Hotspot • Food Truck
          </p>
        </div>

        {/* Loading Indicator (Stage: 'loading') */}
        {stage === 'loading' ? (
          <div className="w-full max-w-xs space-y-3 pt-2 animate-fade-in">
            {/* Sleek animated progress bar */}
            <div className="w-full h-1.5 bg-ej-indigo/80 rounded-full overflow-hidden border border-ej-border/60 relative">
              <div
                className="h-full bg-gradient-to-r from-ej-lime via-ej-teal to-ej-lime rounded-full animate-indeterminate-bar"
                style={{
                  boxShadow: '0 0 12px rgba(212, 255, 61, 0.8)',
                }}
              />
            </div>

            {/* Friendly status message */}
            <p className="text-xs text-ej-muted font-medium tracking-wide">
              {message}
            </p>
          </div>
        ) : (
          <div className="h-8 flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 text-xs text-ej-muted/80 font-medium animate-pulse">
              <span>Providence College of Engineering</span>
            </span>
          </div>
        )}
      </div>

      {/* Inline styles for custom animations */}
      <style jsx>{`
        @keyframes indeterminate {
          0% {
            transform: translateX(-100%) scaleX(0.2);
          }
          50% {
            transform: translateX(30%) scaleX(0.8);
          }
          100% {
            transform: translateX(150%) scaleX(0.2);
          }
        }
        .animate-indeterminate-bar {
          animation: indeterminate 1.4s infinite cubic-bezier(0.65, 0.815, 0.735, 0.395);
        }
      `}</style>
    </div>
  );
}
