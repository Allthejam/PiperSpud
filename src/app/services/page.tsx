'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { ServicesSection } from '@/components/ServicesSection';
import { Footer } from '@/components/Footer';
import { LiveChatWidget } from '@/components/LiveChatWidget';
import { VisualPencilOverlay } from '@/components/VisualPencilOverlay';
import { EditableElement } from '@/components/EditableElement';
import Link from 'next/link';
import { Castle, Calendar, ArrowRight, ShieldCheck, Heart } from 'lucide-react';

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-tartan-dark flex flex-col relative">
      <VisualPencilOverlay />
      <Navbar />

      {/* Page Header */}
      <div className="bg-gradient-to-b from-tartan-card via-tartan-navy to-tartan-dark py-14 border-b border-tartan-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tartan-accent/15 border border-tartan-accent/40 text-tartan-gold text-xs font-semibold">
            <Castle className="w-4 h-4" />
            <span>Piping Packages & Transparent Pricing</span>
          </div>
          <EditableElement
            id="services-page-h1"
            tag="h1"
            defaultContent="Services & Packages"
            className="text-4xl sm:text-6xl font-extrabold text-white font-serif tracking-tight uppercase"
            label="Services Page H1"
            section="services-header"
          />
          <EditableElement
            id="services-page-sub"
            tag="p"
            defaultContent="From romantic castle weddings to memorial laments and corporate galas, explore all of Spud's bespoke piping services."
            className="text-base text-gray-300 max-w-2xl mx-auto"
            label="Services Page Subtitle"
            section="services-header"
          />
        </div>
      </div>

      <ServicesSection />

      {/* Booking CTA Bar */}
      <section className="py-16 bg-tartan-navy border-t border-tartan-border text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl font-bold text-white font-serif">
            Found the right package for your occasion?
          </h2>
          <p className="text-sm text-gray-300">
            Check vacant dates on Spud\'s calendar and submit a provisional booking in under 60 seconds.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/booking"
              className="px-8 py-4 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-2xl hover:brightness-110 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Your Date Now</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <LiveChatWidget />
    </div>
  );
}
