'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LiveChatWidget } from '@/components/LiveChatWidget';
import { VisualPencilOverlay } from '@/components/VisualPencilOverlay';
import { EditableElement } from '@/components/EditableElement';
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
            <EditableElement
              id="deposits-badge-text"
              label="Deposits Badge Label"
              section="deposits-header"
              tag="span"
              defaultContent="Clear & Fair Policies"
            />
          </div>
          <EditableElement
            id="deposits-header-title"
            label="Deposits Page Heading"
            section="deposits-header"
            tag="h1"
            defaultContent="Booking & Deposit Policy"
            className="text-3xl sm:text-5xl font-extrabold text-white font-serif tracking-tight uppercase"
          />
          <EditableElement
            id="deposits-header-subtitle"
            label="Deposits Subtitle"
            section="deposits-header"
            tag="p"
            defaultContent="How provisional diary holds, Brevo confirmations, and PayPal deposits operate."
            className="text-sm text-gray-300"
          />
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-xs sm:text-sm text-gray-300 space-y-8 leading-relaxed">
        
        <section className="bg-tartan-card p-6 sm:p-8 rounded-3xl border border-tartan-border space-y-4 shadow-xl">
          <EditableElement
            id="deposits-sec1-title"
            label="Section 1 Title"
            section="deposits"
            tag="h2"
            defaultContent="1. Provisional Holds & Diary Reservation"
            className="text-xl font-bold text-white font-serif text-tartan-gold"
          />
          <EditableElement
            id="deposits-sec1-p1"
            label="Section 1 Paragraph 1"
            section="deposits"
            tag="p"
            defaultContent="When you submit a date request via the online booking diary, a provisional hold is placed on that slot. This protects your chosen date while Spud verifies travel logistics and performance timings."
          />
          <EditableElement
            id="deposits-sec1-p2"
            label="Section 1 Paragraph 2"
            section="deposits"
            tag="p"
            defaultContent="Provisional holds remain active for 7 days following Spud's approval while awaiting deposit settlement."
          />
        </section>

        <section className="bg-tartan-card p-6 sm:p-8 rounded-3xl border border-tartan-border space-y-4 shadow-xl">
          <EditableElement
            id="deposits-sec2-title"
            label="Section 2 Title"
            section="deposits"
            tag="h2"
            defaultContent="2. Deposit Rates & PayPal Processing"
            className="text-xl font-bold text-white font-serif text-tartan-gold"
          />
          <EditableElement
            id="deposits-sec2-intro"
            label="Section 2 Intro"
            section="deposits"
            tag="p"
            defaultContent="Standard deposits required to lock your date are based on the package selected:"
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="bg-tartan-dark p-3.5 rounded-xl border border-tartan-border text-center">
              <EditableElement
                id="deposits-pkg1-name"
                label="Package 1 Name"
                section="deposits"
                tag="span"
                defaultContent="Weddings & Castles"
                className="text-xs text-gray-400 block"
              />
              <EditableElement
                id="deposits-pkg1-amount"
                label="Package 1 Deposit Amount"
                section="deposits"
                tag="span"
                defaultContent="£100 Deposit"
                className="text-lg font-bold text-white font-serif block"
              />
            </div>
            <div className="bg-tartan-dark p-3.5 rounded-xl border border-tartan-border text-center">
              <EditableElement
                id="deposits-pkg2-name"
                label="Package 2 Name"
                section="deposits"
                tag="span"
                defaultContent="Corporate Galas"
                className="text-xs text-gray-400 block"
              />
              <EditableElement
                id="deposits-pkg2-amount"
                label="Package 2 Deposit Amount"
                section="deposits"
                tag="span"
                defaultContent="£150 Deposit"
                className="text-lg font-bold text-white font-serif block"
              />
            </div>
            <div className="bg-tartan-dark p-3.5 rounded-xl border border-tartan-border text-center">
              <EditableElement
                id="deposits-pkg3-name"
                label="Package 3 Name"
                section="deposits"
                tag="span"
                defaultContent="Funerals & Laments"
                className="text-xs text-gray-400 block"
              />
              <EditableElement
                id="deposits-pkg3-amount"
                label="Package 3 Deposit Amount"
                section="deposits"
                tag="span"
                defaultContent="£50 Deposit"
                className="text-lg font-bold text-white font-serif block"
              />
            </div>
          </div>
          
          <EditableElement
            id="deposits-sec2-footer"
            label="Section 2 Payment Protection Note"
            section="deposits"
            tag="p"
            defaultContent="All deposits are processed via PayPal Buyer Protection with instant confirmation receipts dispatched automatically via Brevo."
            className="text-xs text-gray-400 pt-2"
          />
        </section>

        <section className="bg-tartan-card p-6 sm:p-8 rounded-3xl border border-tartan-border space-y-4 shadow-xl">
          <EditableElement
            id="deposits-sec3-title"
            label="Section 3 Title"
            section="deposits"
            tag="h2"
            defaultContent="3. Rescheduling Guarantee"
            className="text-xl font-bold text-white font-serif text-tartan-gold"
          />
          <EditableElement
            id="deposits-sec3-p1"
            label="Section 3 Guarantee Clause"
            section="deposits"
            tag="p"
            defaultContent="We understand that wedding dates or venue arrangements can shift. In the event of a postponement, your deposit is 100% transferable to any future open date in Spud's diary with zero transfer fees."
          />
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
