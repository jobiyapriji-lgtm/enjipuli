import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | ENJIPULI Food Truck',
  description: 'Privacy Policy for ENJIPULI campus food ordering at Providence College of Engineering.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-ej-deep text-ej-cream py-12 px-4 sm:px-6 lg:px-8 selection:bg-ej-lime selection:text-ej-ink">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-ej-lime hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="space-y-3 border-b border-ej-border/80 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ej-lime/10 text-ej-lime text-xs font-mono font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Campus Dining Privacy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-ej-cream tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-ej-muted font-mono">
            Last Updated: October 2026 • Providence College of Engineering Counter
          </p>
        </div>

        <div className="space-y-6 text-sm text-ej-muted/90 leading-relaxed font-normal">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-ej-cream">1. Information We Collect</h2>
            <p>
              When you order through the ENJIPULI campus food application, we collect minimal information necessary to deliver your meals: your campus email, student name, college ID/roll number, and order preferences.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-ej-cream">2. How Your Information Is Used</h2>
            <p>
              Your contact details are strictly used to authenticate your session via secure OTP, generate your food pickup tokens, track preparing orders at the food truck counter, and provide payment receipts.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-ej-cream">3. Payment Security (Razorpay)</h2>
            <p>
              All online payments are securely processed through Razorpay. ENJIPULI never stores or accesses your credit card numbers, debit card details, or UPI MPIN on our campus servers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-ej-cream">4. Data Retention</h2>
            <p>
              Order tokens and item records are stored to assist vendors with daily kitchen stock reconciliations and to let you review your past meals. We do not sell or share student data with third-party advertisers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-ej-cream">5. Contact Support</h2>
            <p>
              If you have any questions regarding your account or data privacy, reach out to the campus counter crew at{' '}
              <a href="mailto:support@enjipuli.com" className="text-ej-lime hover:underline font-mono">
                support@enjipuli.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
