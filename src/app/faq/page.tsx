'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { FaqSection } from '@/components/FaqSection';
import { Footer } from '@/components/Footer';
import { LiveChatWidget } from '@/components/LiveChatWidget';
import { VisualPencilOverlay } from '@/components/VisualPencilOverlay';
import Link from 'next/link';
import { HelpCircle, Phone, Calendar, Mail } from 'lucide-react';

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-tartan-dark flex flex-col relative">
      <VisualPencilOverlay />
      <Navbar />

      {/* Page Header */}
      <div className="bg-gradient-to-b from-tartan-card via-tartan-navy to-tartan-dark py-14 border-b border-tartan-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tartan-accent/15 border border-tartan-accent/40 text-tartan-gold text-xs font-semibold">
            <HelpCircle className="w-4 h-4" />
            <span>Got Questions?</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white font-serif tracking-tight uppercase">
            Frequently Asked Questions
          </h1>
          <p className="text-base text-gray-300 max-w-2xl mx-auto">
            Everything you need to know about deposits, travel radius, Highland attire choices, tune selections, and weather contingencies.
          </p>
        </div>
      </div>

      <FaqSection />

      {/* Direct Contact Bar */}
      <section className="py-16 bg-tartan-navy border-t border-tartan-border text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <h2 className="text-3xl font-bold text-white font-serif">
            Still have a specific question for Spud?
          </h2>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a
              href="tel:07793491367"
              className="px-6 py-3.5 bg-green-700 hover:bg-green-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xl flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Call 07793 491367</span>
            </a>
            <Link
              href="/contact"
              className="px-6 py-3.5 bg-tartan-card hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-tartan-border flex items-center gap-2"
            >
              <Mail className="w-4 h-4 text-tartan-gold" />
              <span>Send Contact Message</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <LiveChatWidget />
    </div>
  );
}
