'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LiveChatWidget } from '@/components/LiveChatWidget';
import { VisualPencilOverlay } from '@/components/VisualPencilOverlay';
import Link from 'next/link';
import { FileText, ShieldCheck, Scale, CheckCircle2 } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-tartan-dark flex flex-col relative">
      <VisualPencilOverlay />
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-b from-tartan-card via-tartan-navy to-tartan-dark py-14 border-b border-tartan-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tartan-accent/15 border border-tartan-accent/40 text-tartan-gold text-xs font-semibold">
            <Scale className="w-4 h-4" />
            <span>Legal Agreements</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-serif tracking-tight uppercase">
            Terms & Conditions
          </h1>
          <p className="text-sm text-gray-300">
            Last Updated: September 2026 • Governed by Scots Law
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-xs sm:text-sm text-gray-300 space-y-8 leading-relaxed">
        
        <section className="bg-tartan-card p-6 sm:p-8 rounded-3xl border border-tartan-border space-y-4 shadow-xl">
          <h2 className="text-xl font-bold text-white font-serif flex items-center gap-2 text-tartan-gold">
            <span>1. Introduction & Musical Performance Scope</span>
          </h2>
          <p>
            These Terms and Conditions govern all musical performance contracts, bagpiping engagements, event bookings, and website services provided by <strong>Spud the Piper</strong> (referred to as &quot;the Musician&quot; or &quot;Spud&quot;) to the client (&quot;the Client&quot;).
          </p>
          <p>
            By submitting a provisional booking request, completing a PayPal deposit, or signing an event agreement, the Client confirms full acceptance of these Terms.
          </p>
        </section>

        <section className="bg-tartan-card p-6 sm:p-8 rounded-3xl border border-tartan-border space-y-4 shadow-xl">
          <h2 className="text-xl font-bold text-white font-serif text-tartan-gold">
            <span>2. Booking Process & Deposit Payment</span>
          </h2>
          <ul className="space-y-2.5 list-disc pl-5">
            <li><strong>Provisional Requests:</strong> Submission of an inquiry via the online booking diary does not constitute a confirmed booking until approved by Spud.</li>
            <li><strong>Brevo Confirmation & Invoicing:</strong> Upon Spud&apos;s approval, an official Brevo transactional email containing performance details and a PayPal deposit link will be issued.</li>
            <li><strong>Deposit Requirement:</strong> A non-refundable booking deposit (£50 – £150 depending on event package) is required within 7 days of approval to lock the date in the diary.</li>
            <li><strong>Remaining Balance:</strong> The remaining balance is payable 14 days prior to the event date via electronic transfer, PayPal, or on the day in cash by prior agreement.</li>
          </ul>
        </section>

        <section className="bg-tartan-card p-6 sm:p-8 rounded-3xl border border-tartan-border space-y-4 shadow-xl">
          <h2 className="text-xl font-bold text-white font-serif text-tartan-gold">
            <span>3. Performance Times, Attire & Venue Access</span>
          </h2>
          <p>
            Spud will arrive at least 30–45 minutes prior to the scheduled performance start time to tune the bagpipe chanter and drones and liaise with event coordinators.
          </p>
          <p>
            The Client is responsible for ensuring reasonable access to performance zones (e.g., castle archways, church entrances, banquet halls) and suitable parking arrangements.
          </p>
          <p>
            Spud performs in authentic Highland dress as chosen during the booking process (Full No. 1 Dress with Feather Bonnet, Royal Stewart, Black Watch, or Highland Tweed).
          </p>
        </section>

        <section className="bg-tartan-card p-6 sm:p-8 rounded-3xl border border-tartan-border space-y-4 shadow-xl">
          <h2 className="text-xl font-bold text-white font-serif text-tartan-gold">
            <span>4. Weather Conditions & Instrument Care</span>
          </h2>
          <p>
            Great Highland Bagpipes are delicate acoustic instruments crafted from African Blackwood, silver, and cane reeds. In cases of torrential rain, hail, or severe freezing temperatures, Spud reserves the right to play in covered or indoor areas to prevent damage to the instrument. Light Scottish mist or mild rain will not impede performance.
          </p>
        </section>

        <section className="bg-tartan-card p-6 sm:p-8 rounded-3xl border border-tartan-border space-y-4 shadow-xl">
          <h2 className="text-xl font-bold text-white font-serif text-tartan-gold">
            <span>5. Cancellations & Rescheduling</span>
          </h2>
          <ul className="space-y-2 list-disc pl-5">
            <li><strong>Client Cancellation &gt; 30 Days:</strong> The deposit remains retained to cover administration and date reservation; no additional fees apply.</li>
            <li><strong>Client Cancellation &lt; 14 Days:</strong> 50% of the total agreed fee is payable.</li>
            <li><strong>Date Rescheduling:</strong> If the Client needs to postpone a wedding or event, Spud will transfer the deposit to a new mutually available date at no penalty.</li>
          </ul>
        </section>

        <section className="bg-tartan-card p-6 sm:p-8 rounded-3xl border border-tartan-border space-y-4 shadow-xl">
          <h2 className="text-xl font-bold text-white font-serif text-tartan-gold">
            <span>6. Governing Law</span>
          </h2>
          <p>
            These terms are governed by and construed in accordance with the laws of <strong>Scotland</strong>, and both parties submit to the exclusive jurisdiction of the Scottish Courts.
          </p>
        </section>

      </main>

      <Footer />
      <LiveChatWidget />
    </div>
  );
}
