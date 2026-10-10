'use client';

import React from 'react';
import Link from 'next/link';
import { LogoWordmark } from '@/components/LogoWordmark';
import { ElephantMascot } from '@/components/ElephantMascot';
import { MuralBackground } from '@/components/MuralBackground';
import { FloralDivider } from '@/components/FloralDivider';
import {
  ShoppingBag,
  Truck,
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export function RoleSelectionLanding() {
  return (
    <main
      id="role-selection-landing"
      className="screen-branding min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative select-none"
    >
      {/* Dark Mural Background Artwork */}
      <MuralBackground opacity={0.14} />

      {/* Ambient background glow orbs */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none blur-3xl opacity-20 -top-24 -left-24"
        style={{ background: 'radial-gradient(circle, var(--ej-lime) 0%, transparent 70%)' }}
      />
      <div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none blur-3xl opacity-15 -bottom-24 -right-24"
        style={{ background: 'radial-gradient(circle, var(--ej-gold) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-3xl w-full flex flex-col items-center text-center space-y-6 sm:space-y-8 animate-fade-in-up">
        {/* Header Branding */}
        <div className="flex flex-col items-center space-y-3">
          {/* Elephant Mascot with playful float animation */}
          <div className="relative animate-float">
            <ElephantMascot size={110} />
            <div className="absolute -top-1 -right-1 p-1 rounded-full bg-ej-lime text-ej-ink shadow-glow-sm">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Centered Wordmark + Tagline */}
          <div className="flex flex-col items-center">
            <LogoWordmark size={250} light glow={true} />
            <p className="text-xs sm:text-sm font-bold text-ej-gold tracking-widest uppercase mt-2">
              ക്യാമ്പസിന്റെ ഹോട്ട്സ്പോട്ട് • Food Truck
            </p>
            <p className="text-[11px] sm:text-xs text-ej-muted mt-0.5">
              Providence College of Engineering
            </p>
          </div>

          <FloralDivider width={140} className="opacity-80 my-1" />
        </div>

        {/* Short Subtitle */}
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-extrabold text-ej-cream tracking-tight">
            Welcome! Select your portal to continue
          </h2>
          <p className="text-xs text-ej-muted max-w-md mx-auto">
            Choose your role to get started with instant ordering or kitchen truck management.
          </p>
        </div>

        {/* Two Cards Side-by-Side (Stacked on Mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 w-full text-left">
          {/* Card 1 — Student */}
          <div className="card card-hover p-6 sm:p-7 flex flex-col justify-between rounded-2xl border border-ej-border hover:border-ej-lime/70 bg-gradient-to-b from-ej-indigo/90 to-ej-surface/90 shadow-xl transition-all duration-200 group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                {/* Food/Order Icon in App Motif Style */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-ej-lime/20 via-ej-lime/10 to-transparent border border-ej-lime/30 text-ej-lime flex items-center justify-center shadow-glow-sm group-hover:scale-105 group-hover:border-ej-lime transition-all duration-200">
                  <ShoppingBag className="w-7 h-7" />
                </div>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-ej-lime/15 text-ej-lime border border-ej-lime/30">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student</span>
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black text-ej-cream tracking-tight group-hover:text-ej-lime transition-colors">
                  Order Food
                </h3>
                <p className="text-xs sm:text-sm text-ej-muted leading-relaxed">
                  Browse the menu, order ahead, skip the queue.
                </p>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/login?purpose=student"
                className="btn-primary w-full py-3 px-5 text-sm font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-glow-sm group-hover:shadow-glow transition-all"
              >
                <span>Order Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 2 — Vendor */}
          <div className="card card-hover p-6 sm:p-7 flex flex-col justify-between rounded-2xl border border-ej-border hover:border-ej-gold/70 bg-gradient-to-b from-ej-indigo/90 to-ej-surface/90 shadow-xl transition-all duration-200 group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                {/* Truck/Management Icon in App Motif Style */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-ej-gold/20 via-ej-vermilion/10 to-transparent border border-ej-gold/30 text-ej-gold flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:border-ej-gold transition-all duration-200">
                  <Truck className="w-7 h-7" />
                </div>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-ej-gold/15 text-ej-gold border border-ej-gold/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Vendor</span>
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black text-ej-cream tracking-tight group-hover:text-ej-gold transition-colors">
                  Manage the Truck
                </h3>
                <p className="text-xs sm:text-sm text-ej-muted leading-relaxed">
                  Handle orders, stock, and pickups.
                </p>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/vendor/login?purpose=vendor"
                className="btn-secondary w-full py-3 px-5 text-sm font-bold rounded-xl flex items-center justify-center gap-2 border border-ej-border hover:border-ej-gold/80 hover:text-ej-gold hover:bg-ej-gold/10 transition-all text-ej-cream"
              >
                <span>Vendor Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-[11px] text-ej-muted/80 pt-2 font-mono">
          Enjipuli Food Truck • Fast Campus Pickup with Digital Tokens
        </p>
      </div>
    </main>
  );
}
