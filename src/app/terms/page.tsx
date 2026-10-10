import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export const metadata = {
  title: 'Terms & Conditions | ENJIPULI Food Truck',
  description: 'Terms of Service for ENJIPULI campus food ordering at Providence College of Engineering.',
};

export default function TermsPage() {
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
            <FileText className="w-3.5 h-3.5" />
            <span>Campus Dining Service Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-ej-cream tracking-tight">
            Terms &amp; Conditions
          </h1>
          <p className="text-xs text-ej-muted font-mono">
            Last Updated: October 2026 • Providence College of Engineering Counter
          </p>
        </div>

        <div className="space-y-6 text-sm text-ej-muted/90 leading-relaxed font-normal">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-ej-cream">1. Ordering &amp; Token Redemption</h2>
            <p>
              Orders submitted through the app generate a unique digital token (e.g. EJ-042) and QR code. Food must be collected at the ENJIPULI Food Truck counter by presenting this token during regular campus operating hours.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-ej-cream">2. Stock Availability &amp; Fresh Prep</h2>
            <p>
              Menu items are prepared fresh daily in limited campus batches. While real-time inventory is tracked digitally, rare high-demand surges may require brief prep delays or vendor substitutions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-ej-cream">3. Cancellations &amp; Refunds</h2>
            <p>
              Due to immediate batch preparation in the food truck kitchen, orders cannot be cancelled once payment is completed and preparation begins. In case of payment debits without token generation, Razorpay automated reconciliations will reverse the amount within standard banking timelines.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-ej-cream">4. Campus Conduct &amp; Counter Etiquette</h2>
            <p>
              Students and campus personnel must observe queue guidelines at the pickup counter and present valid digital tokens. Sharing or forging tokens is strictly prohibited under campus conduct regulations.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-ej-cream">5. Inquiries</h2>
            <p>
              For queries or counter assistance, email{' '}
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
