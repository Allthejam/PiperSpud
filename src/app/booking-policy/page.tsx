'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LiveChatWidget } from '@/components/LiveChatWidget';
import { VisualPencilOverlay } from '@/components/VisualPencilOverlay';
import Link from 'next/link';
import { Calendar, CreditCard, Mail, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function BookingPolicyPage() {
  return (
    <div className="min-h-screen bg-tartan-dark flex flex-col relative">
      <VisualPencilOverlay />
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-b from-tartan-card via-tartan-navy to-tartan-dark py-14 border-b border-tartan-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tartan-accent/15 border border-tartan-accent/40 text-tartan-gold text-xs font-semibold">
            <Calendar className="w-4 h-4" />
            <span>Clear & Fair Policies</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-serif tracking-tight uppercase">
            Booking & Deposit Policy
          </h1>
          <p className="text-sm text-gray-300">
            How provisional diary holds, Brevo confirmations, and PayPal deposits operate.
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-xs sm:text-sm text-gray-300 space-y-8 leading-relaxed">
        
        <section className="bg-tartan-card p-6 sm:p-8 rounded-3xl border border-tartan-border space-y-4 shadow-xl">
          <h2 className="text-xl font-bold text-white font-serif text-tartan-gold">
            1. Provisional Holds & Diary Reservation
          </h2>
          <p>
            When you submit a date request via the online booking diary, a <strong>provisional hold</strong> is placed on that slot. This protects your chosen date while Spud verifies travel logistics and performance timings.
          </p>
          <p>
            Provisional holds remain active for <strong>7 days</strong> following Spud&apos;s approval while awaiting deposit settlement.
          </p>
        </section>

        <section className="bg-tartan-card p-6 sm:p-8 rounded-3xl border border-tartan-border space-y-4 shadow-xl">
          <h2 className="text-xl font-bold text-white font-serif text-tartan-gold">
            2. Deposit Rates & PayPal Processing
          </h2>
          <p>Standard deposits required to lock your date are based on the package selected:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="bg-tartan-dark p-3.5 rounded-xl border border-tartan-border text-center">
              <span className="text-xs text-gray-400 block">Weddings & Castles</span>
              <strong className="text-lg font-bold text-white font-serif">£100 Deposit</strong>
            </div>
            <div className="bg-tartan-dark p-3.5 rounded-xl border border-tartan-border text-center">
              <span className="text-xs text-gray-400 block">Corporate Galas</span>
              <strong className="text-lg font-bold text-white font-serif">£150 Deposit</strong>
            </div>
            <div className="bg-tartan-dark p-3.5 rounded-xl border border-tartan-border text-center">
              <span className="text-xs text-gray-400 block">Funerals & Laments</span>
              <strong className="text-lg font-bold text-white font-serif">£50 Deposit</strong>
            </div>
          </div>
          <p className="text-xs text-gray-400 pt-2">
            All deposits are processed via PayPal Buyer Protection with instant confirmation receipts dispatched automatically via Brevo.
          </p>
        </section>

        <section className="bg-tartan-card p-6 sm:p-8 rounded-3xl border border-tartan-border space-y-4 shadow-xl">
          <h2 className="text-xl font-bold text-white font-serif text-tartan-gold">
            3. Rescheduling Guarantee
          </h2>
          <p>
            We understand that wedding dates or venue arrangements can shift. In the event of a postponement, your deposit is <strong>100% transferable</strong> to any future open date in Spud&apos;s diary with zero transfer fees.
          </p>
        </section>

        <div className="text-center pt-4">
          <Link
            href="/booking"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-2xl hover:brightness-110"
          >
            <Calendar className="w-4 h-4" />
            <span>Check Open Diary Slots & Book Now</span>
          </Link>
        </div>

      </main>

      <Footer />
      <LiveChatWidget />
    </div>
  );
}
