'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LiveChatWidget } from '@/components/LiveChatWidget';
import { VisualPencilOverlay } from '@/components/VisualPencilOverlay';
import { EditableElement } from '@/components/EditableElement';
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
            <EditableElement
              id="terms-badge-text"
              label="Terms Badge Label"
              section="terms-header"
              tag="span"
              defaultContent="Legal Agreements"
            />
          </div>
          <EditableElement
            id="terms-header-title"
            label="Terms Page Heading"
            section="terms-header"
            tag="h1"
            defaultContent="Terms & Conditions"
            className="text-3xl sm:text-5xl font-extrabold text-white font-serif tracking-tight uppercase"
          />
          <EditableElement
            id="terms-header-subtitle"
            label="Terms Last Updated & Subtitle"
            section="terms-header"
            tag="p"
            defaultContent="Last Updated: October 2026 • Governed by Scots Law"
            className="text-sm text-gray-300"
          />
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-xs sm:text-sm text-gray-300 space-y-8 leading-relaxed">
        
        <section className="bg-tartan-card p-6 sm:p-8 rounded-3xl border border-tartan-border space-y-4 shadow-xl">
          <EditableElement
            id="terms-sec1-title"
            label="Section 1 Title"
            section="terms"
            tag="h2"
            defaultContent="1. Introduction & Musical Performance Scope"
            className="text-xl font-bold text-white font-serif text-tartan-gold"
          />
          <EditableElement
            id="terms-sec1-p1"
            label="Section 1 Paragraph 1"
            section="terms"
            tag="p"
            defaultContent="These Terms and Conditions govern all musical performance contracts, bagpiping engagements, event bookings, and website services provided by Spud the Piper (referred to as 'the Musician' or 'Spud') to the client ('the Client')."
          />
          <EditableElement
            id="terms-sec1-p2"
            label="Section 1 Paragraph 2"
            section="terms"
            tag="p"
            defaultContent="By submitting a provisional booking request, completing a PayPal deposit, or signing an event agreement, the Client confirms full acceptance of these Terms."
          />
        </section>

        <section className="bg-tartan-card p-6 sm:p-8 rounded-3xl border border-tartan-border space-y-4 shadow-xl">
          <EditableElement
            id="terms-sec2-title"
            label="Section 2 Title"
            section="terms"
            tag="h2"
            defaultContent="2. Booking Process & Deposit Payment"
            className="text-xl font-bold text-white font-serif text-tartan-gold"
          />
          <EditableElement
            id="terms-sec2-body"
            label="Section 2 Booking & Deposit Clauses"
            section="terms"
            tag="div"
            defaultContent={`• Provisional Requests: Submission of an inquiry via the online booking diary does not constitute a confirmed booking until approved by Spud.\n• Brevo Confirmation & Invoicing: Upon Spud's approval, an official Brevo transactional email containing performance details and a PayPal deposit link will be issued.\n• Deposit Requirement: A non-refundable booking deposit (£50 – £150 depending on event package) is required within 7 days of approval to lock the date in the diary.\n• Remaining Balance: The remaining balance is payable 14 days prior to the event date via electronic transfer, PayPal, or on the day in cash by prior agreement.`}
            className="whitespace-pre-line space-y-2"
          />
        </section>

        <section className="bg-tartan-card p-6 sm:p-8 rounded-3xl border border-tartan-border space-y-4 shadow-xl">
          <EditableElement
            id="terms-sec3-title"
            label="Section 3 Title"
            section="terms"
            tag="h2"
            defaultContent="3. Performance Times, Attire & Venue Access"
            className="text-xl font-bold text-white font-serif text-tartan-gold"
          />
          <EditableElement
            id="terms-sec3-p1"
            label="Section 3 Paragraph 1"
            section="terms"
            tag="p"
            defaultContent="Spud will arrive at least 30–45 minutes prior to the scheduled performance start time to tune the bagpipe chanter and drones and liaise with event coordinators."
          />
          <EditableElement
            id="terms-sec3-p2"
            label="Section 3 Paragraph 2"
            section="terms"
            tag="p"
            defaultContent="The Client is responsible for ensuring reasonable access to performance zones (e.g., castle archways, church entrances, banquet halls) and suitable parking arrangements."
          />
          <EditableElement
            id="terms-sec3-p3"
            label="Section 3 Paragraph 3"
            section="terms"
            tag="p"
            defaultContent="Spud performs in authentic Highland dress as chosen during the booking process (Full No. 1 Dress with Feather Bonnet, Royal Stewart, Black Watch, or Highland Tweed)."
          />
        </section>

        <section className="bg-tartan-card p-6 sm:p-8 rounded-3xl border border-tartan-border space-y-4 shadow-xl">
          <EditableElement
            id="terms-sec4-title"
            label="Section 4 Title"
            section="terms"
            tag="h2"
            defaultContent="4. Weather Conditions & Instrument Care"
            className="text-xl font-bold text-white font-serif text-tartan-gold"
          />
          <EditableElement
            id="terms-sec4-p1"
            label="Section 4 Paragraph 1"
            section="terms"
            tag="p"
            defaultContent="Great Highland Bagpipes are delicate acoustic instruments crafted from African Blackwood, silver, and cane reeds. In cases of torrential rain, hail, or severe freezing temperatures, Spud reserves the right to play in covered or indoor areas to prevent damage to the instrument. Light Scottish mist or mild rain will not impede performance."
          />
        </section>

        <section className="bg-tartan-card p-6 sm:p-8 rounded-3xl border border-tartan-border space-y-4 shadow-xl">
          <EditableElement
            id="terms-sec5-title"
            label="Section 5 Title"
            section="terms"
            tag="h2"
            defaultContent="5. Cancellations & Rescheduling"
            className="text-xl font-bold text-white font-serif text-tartan-gold"
          />
          <EditableElement
            id="terms-sec5-body"
            label="Section 5 Cancellation Rules"
            section="terms"
            tag="div"
            defaultContent={`• Client Cancellation > 30 Days: The deposit remains retained to cover administration and date reservation; no additional fees apply.\n• Client Cancellation < 14 Days: 50% of the total agreed fee is payable.\n• Date Rescheduling: If the Client needs to postpone a wedding or event, Spud will transfer the deposit to a new mutually available date at no penalty.`}
            className="whitespace-pre-line space-y-2"
          />
        </section>

        <section className="bg-tartan-card p-6 sm:p-8 rounded-3xl border border-tartan-border space-y-4 shadow-xl">
          <EditableElement
            id="terms-sec6-title"
            label="Section 6 Title"
            section="terms"
            tag="h2"
            defaultContent="6. Governing Law"
            className="text-xl font-bold text-white font-serif text-tartan-gold"
          />
          <EditableElement
            id="terms-sec6-p1"
            label="Section 6 Governing Law Clause"
            section="terms"
            tag="p"
            defaultContent="These terms are governed by and construed in accordance with the laws of Scotland, and both parties submit to the exclusive jurisdiction of the Scottish Courts."
          />
        </section>

      </main>

      <Footer />
      <LiveChatWidget />
    </div>
  );
}
