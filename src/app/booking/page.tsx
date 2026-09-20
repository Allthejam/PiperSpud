'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { BookingCalendar } from '@/components/BookingCalendar';
import { Footer } from '@/components/Footer';
import { LiveChatWidget } from '@/components/LiveChatWidget';
import { VisualPencilOverlay } from '@/components/VisualPencilOverlay';
import { BrevoEmailModal } from '@/components/admin/BrevoEmailModal';
import { PayPalCheckoutModal } from '@/components/admin/PayPalCheckoutModal';
import { useApp } from '@/context/AppContext';
import { Calendar, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export default function BookingPage() {
  const { activeBrevoEmail, closeBrevoPreview, activePayPalModal, closePayPalModal } = useApp();

  return (
    <div className="min-h-screen bg-tartan-dark flex flex-col relative">
      <VisualPencilOverlay />
      <Navbar />

      {/* Page Header */}
      <div className="bg-gradient-to-b from-tartan-card via-tartan-navy to-tartan-dark py-14 border-b border-tartan-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tartan-accent/15 border border-tartan-accent/40 text-tartan-gold text-xs font-semibold">
            <Calendar className="w-4 h-4" />
            <span>Real-Time Availability & Booking</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white font-serif tracking-tight uppercase">
            Live Diary & Online Booking
          </h1>
          <p className="text-base text-gray-300 max-w-2xl mx-auto">
            Check open dates, estimate your event fee, and submit a provisional booking with automated Brevo confirmation and PayPal deposit options.
          </p>
        </div>
      </div>

      <BookingCalendar />

      {/* Automated Workflow Infographic */}
      <section className="py-16 bg-tartan-navy border-t border-tartan-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-white font-serif">How the Automated Booking Workflow Works</h3>
            <p className="text-xs text-tartan-gold">Seamless, secure, and instant</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="bg-tartan-card p-6 rounded-2xl border border-tartan-border space-y-3 shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-tartan-accent/20 text-tartan-gold font-extrabold flex items-center justify-center text-base border border-tartan-accent/40">1</div>
              <h4 className="text-base font-bold text-white font-serif">Select Date & Submit</h4>
              <p className="text-gray-300 leading-relaxed">Choose an open slot on the diary, select your attire and tunes, and send your provisional request.</p>
            </div>

            <div className="bg-tartan-card p-6 rounded-2xl border border-tartan-border space-y-3 shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-tartan-accent/20 text-tartan-gold font-extrabold flex items-center justify-center text-base border border-tartan-accent/40">2</div>
              <h4 className="text-base font-bold text-white font-serif">Spud Approves & Brevo Emails</h4>
              <p className="text-gray-300 leading-relaxed">Spud reviews the diary and approves your gig. Brevo instantly emails your confirmed invoice and PayPal link.</p>
            </div>

            <div className="bg-tartan-card p-6 rounded-2xl border border-tartan-border space-y-3 shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-green-950/80 text-green-400 font-extrabold flex items-center justify-center text-base border border-green-800">3</div>
              <h4 className="text-base font-bold text-white font-serif">PayPal Deposit Locks Date</h4>
              <p className="text-gray-300 leading-relaxed">Complete your deposit via PayPal. Your date is automatically locked in Spud\'s calendar and receipts are sent.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <LiveChatWidget />

      {/* Modals */}
      {activeBrevoEmail?.isOpen && activeBrevoEmail.booking && (
        <BrevoEmailModal
          isOpen={activeBrevoEmail.isOpen}
          onClose={closeBrevoPreview}
          booking={activeBrevoEmail.booking}
          paypalLink={activeBrevoEmail.paypalLink}
        />
      )}

      {activePayPalModal?.isOpen && activePayPalModal.booking && (
        <PayPalCheckoutModal
          isOpen={activePayPalModal.isOpen}
          onClose={closePayPalModal}
          booking={activePayPalModal.booking}
        />
      )}
    </div>
  );
}
