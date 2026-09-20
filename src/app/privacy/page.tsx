'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LiveChatWidget } from '@/components/LiveChatWidget';
import { VisualPencilOverlay } from '@/components/VisualPencilOverlay';
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
            <span>UK GDPR & Data Protection</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-serif tracking-tight uppercase">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-300">
            Last Updated: September 2026 • Compliance with UK GDPR & Data Protection Act 2018
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-xs sm:text-sm text-gray-300 space-y-8 leading-relaxed">
        
        <section className="bg-tartan-card p-6 sm:p-8 rounded-3xl border border-tartan-border space-y-4 shadow-xl">
          <h2 className="text-xl font-bold text-white font-serif text-tartan-gold">
            1. Data Controller Information
          </h2>
          <p>
            This Privacy Policy explains how <strong>Spud the Piper</strong> (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) collects, uses, and protects personal data obtained through our website, progressive web app, live chat widget, and booking engine.
          </p>
          <p>
            <strong>Data Controller:</strong> Spud the Piper Ltd, Scotland, UK.<br />
            <strong>Contact Email:</strong> <a href="mailto:privacy@spudthepiper.co.uk" className="text-tartan-gold underline">privacy@spudthepiper.co.uk</a><br />
            <strong>Telephone:</strong> 07793 491367
          </p>
        </section>

        <section className="bg-tartan-card p-6 sm:p-8 rounded-3xl border border-tartan-border space-y-4 shadow-xl">
          <h2 className="text-xl font-bold text-white font-serif text-tartan-gold">
            2. What Data We Collect
          </h2>
          <p>We collect only the minimum necessary personal data required to arrange and perform bagpiping engagements:</p>
          <ul className="space-y-2 list-disc pl-5">
            <li><strong>Identity & Contact Data:</strong> Full name, email address, telephone number.</li>
            <li><strong>Event Logistics Data:</strong> Wedding or ceremony date, start/finish times, venue address and postcode, special tune selections, tartan attire preferences.</li>
            <li><strong>Communication Data:</strong> Live chat session transcripts, contact form inquiries, email correspondence.</li>
            <li><strong>Customer Testimonials:</strong> Reviews, ratings, and optional photos submitted by clients for public display.</li>
          </ul>
        </section>

        <section className="bg-tartan-card p-6 sm:p-8 rounded-3xl border border-tartan-border space-y-4 shadow-xl">
          <h2 className="text-xl font-bold text-white font-serif text-tartan-gold">
            3. Third-Party Processors & Security
          </h2>
          <p>We never sell your personal information. We partner strictly with industry-leading, GDPR-compliant service providers:</p>
          <ul className="space-y-2 list-disc pl-5">
            <li><strong>Brevo (Sendinblue):</strong> Used to deliver transactional booking confirmations, invoice summaries, and gig updates.</li>
            <li><strong>PayPal:</strong> Handles deposit transactions securely via PCI-DSS compliant 256-bit encrypted gateways. We never store credit card numbers on our servers.</li>
          </ul>
        </section>

        <section className="bg-tartan-card p-6 sm:p-8 rounded-3xl border border-tartan-border space-y-4 shadow-xl">
          <h2 className="text-xl font-bold text-white font-serif text-tartan-gold">
            4. Your Legal Rights Under UK GDPR
          </h2>
          <p>You have the right to request access to your personal data, request correction of inaccurate records, request deletion of your contact information after your event is concluded, or object to processing. To exercise your rights, email <a href="mailto:privacy@spudthepiper.co.uk" className="text-tartan-gold underline">privacy@spudthepiper.co.uk</a>.</p>
        </section>

      </main>

      <Footer />
      <LiveChatWidget />
    </div>
  );
}
