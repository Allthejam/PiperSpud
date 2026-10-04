'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LiveChatWidget } from '@/components/LiveChatWidget';
import { VisualPencilOverlay } from '@/components/VisualPencilOverlay';
import { EditableElement } from '@/components/EditableElement';
import Link from 'next/link';
import { ShieldCheck, Lock, Mail, Eye } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-tartan-dark flex flex-col relative">
      <VisualPencilOverlay />
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-b from-tartan-card via-tartan-navy to-tartan-dark py-14 border-b border-tartan-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tartan-accent/15 border border-tartan-accent/40 text-tartan-gold text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <EditableElement
              id="privacy-badge-text"
              label="Privacy Badge Label"
              section="privacy-header"
              tag="span"
              defaultContent="UK GDPR & Data Protection"
            />
          </div>
          <EditableElement
            id="privacy-header-title"
            label="Privacy Page Heading"
            section="privacy-header"
            tag="h1"
            defaultContent="Privacy Policy"
            className="text-3xl sm:text-5xl font-extrabold text-white font-serif tracking-tight uppercase"
          />
          <EditableElement
            id="privacy-header-subtitle"
            label="Privacy Last Updated & Subtitle"
            section="privacy-header"
            tag="p"
            defaultContent="Last Updated: October 2026 • Compliance with UK GDPR & Data Protection Act 2018"
            className="text-sm text-gray-300"
          />
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-xs sm:text-sm text-gray-300 space-y-8 leading-relaxed">
        
        <section className="bg-tartan-card p-6 sm:p-8 rounded-3xl border border-tartan-border space-y-4 shadow-xl">
          <EditableElement
            id="privacy-sec1-title"
            label="Section 1 Title"
            section="privacy"
            tag="h2"
            defaultContent="1. Data Controller Information"
            className="text-xl font-bold text-white font-serif text-tartan-gold"
          />
          <EditableElement
            id="privacy-sec1-p1"
            label="Section 1 Controller Scope"
            section="privacy"
            tag="p"
            defaultContent="This Privacy Policy explains how Spud the Piper ('we', 'us', 'our') collects, uses, and protects personal data obtained through our website, progressive web app, live chat widget, and booking engine."
          />
          <EditableElement
            id="privacy-sec1-contact"
            label="Section 1 Controller Contact Details"
            section="privacy"
            tag="div"
            defaultContent={`Data Controller: Spud the Piper Ltd, Aviemore & Highlands, Scotland, UK.\nContact Email: privacy@spudthepiper.co.uk\nTelephone: 07793 491367`}
            className="whitespace-pre-line text-xs sm:text-sm text-gray-300 bg-tartan-dark p-4 rounded-xl border border-tartan-border/60"
          />
        </section>

        <section className="bg-tartan-card p-6 sm:p-8 rounded-3xl border border-tartan-border space-y-4 shadow-xl">
          <EditableElement
            id="privacy-sec2-title"
            label="Section 2 Title"
            section="privacy"
            tag="h2"
            defaultContent="2. What Data We Collect"
            className="text-xl font-bold text-white font-serif text-tartan-gold"
          />
          <EditableElement
            id="privacy-sec2-p1"
            label="Section 2 Intro"
            section="privacy"
            tag="p"
            defaultContent="We collect only the minimum necessary personal data required to arrange and perform bagpiping engagements:"
          />
          <EditableElement
            id="privacy-sec2-data-list"
            label="Section 2 Data Categories"
            section="privacy"
            tag="div"
            defaultContent={`• Identity & Contact Data: Full name, email address, telephone number.\n• Event Logistics Data: Wedding or ceremony date, start/finish times, venue address and postcode, special tune selections, tartan attire preferences.\n• Communication Data: Live chat session transcripts, contact form inquiries, email correspondence.\n• Customer Testimonials: Reviews, ratings, and optional photos submitted by clients for public display.`}
            className="whitespace-pre-line space-y-2 text-xs sm:text-sm"
          />
        </section>

        <section className="bg-tartan-card p-6 sm:p-8 rounded-3xl border border-tartan-border space-y-4 shadow-xl">
          <EditableElement
            id="privacy-sec3-title"
            label="Section 3 Title"
            section="privacy"
            tag="h2"
            defaultContent="3. Third-Party Processors & Security"
            className="text-xl font-bold text-white font-serif text-tartan-gold"
          />
          <EditableElement
            id="privacy-sec3-p1"
            label="Section 3 Intro"
            section="privacy"
            tag="p"
            defaultContent="We never sell your personal information. We partner strictly with industry-leading, GDPR-compliant service providers:"
          />
          <EditableElement
            id="privacy-sec3-processors"
            label="Section 3 Processors List"
            section="privacy"
            tag="div"
            defaultContent={`• Brevo (Sendinblue): Used to deliver transactional booking confirmations, invoice summaries, and gig updates.\n• PayPal: Handles deposit transactions securely via PCI-DSS compliant 256-bit encrypted gateways. We never store credit card numbers on our servers.`}
            className="whitespace-pre-line space-y-2 text-xs sm:text-sm"
          />
        </section>

        <section className="bg-tartan-card p-6 sm:p-8 rounded-3xl border border-tartan-border space-y-4 shadow-xl">
          <EditableElement
            id="privacy-sec4-title"
            label="Section 4 Title"
            section="privacy"
            tag="h2"
            defaultContent="4. Your Legal Rights Under UK GDPR"
            className="text-xl font-bold text-white font-serif text-tartan-gold"
          />
          <EditableElement
            id="privacy-sec4-p1"
            label="Section 4 Legal Rights Description"
            section="privacy"
            tag="p"
            defaultContent="You have the right to request access to your personal data, request correction of inaccurate records, request deletion of your contact information after your event is concluded, or object to processing. To exercise your rights, email privacy@spudthepiper.co.uk."
          />
        </section>

      </main>

      <Footer />
      <LiveChatWidget />
    </div>
  );
}
