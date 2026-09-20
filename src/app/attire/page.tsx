'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { TartanSelector } from '@/components/TartanSelector';
import { Footer } from '@/components/Footer';
import { LiveChatWidget } from '@/components/LiveChatWidget';
import { VisualPencilOverlay } from '@/components/VisualPencilOverlay';
import { EditableElement } from '@/components/EditableElement';
import Link from 'next/link';
import { Shirt, Calendar } from 'lucide-react';

export default function AttirePage() {
  return (
    <div className="min-h-screen bg-tartan-dark flex flex-col relative">
      <VisualPencilOverlay />
      <Navbar />

      {/* Page Header */}
      <div className="bg-gradient-to-b from-tartan-card via-tartan-navy to-tartan-dark py-14 border-b border-tartan-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tartan-accent/15 border border-tartan-accent/40 text-tartan-gold text-xs font-semibold">
            <Shirt className="w-4 h-4 shrink-0" />
            <EditableElement
              id="attire-page-badge"
              tag="span"
              defaultContent="Traditional & Modern Highland Regalia"
              label="Attire Page Badge"
              section="attire"
            />
          </div>
          <EditableElement
            id="attire-page-title"
            tag="h1"
            defaultContent="Tartan & Attire Studio"
            className="text-4xl sm:text-6xl font-extrabold text-white font-serif tracking-tight uppercase"
            label="Attire Page Title"
            section="attire"
          />
          <EditableElement
            id="attire-page-desc"
            tag="p"
            defaultContent="Choose from Full Ceremonial Military No. 1 Dress with Feather Bonnet, Royal Stewart, Black Watch, or Modern Highland Tweed."
            className="text-base text-gray-300 max-w-2xl mx-auto"
            label="Attire Page Description"
            section="attire"
          />
        </div>
      </div>

      <TartanSelector />

      {/* Booking CTA Bar */}
      <section className="py-16 bg-tartan-navy border-t border-tartan-border text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <EditableElement
            id="attire-bottom-title"
            tag="h2"
            defaultContent="Select your preferred tartan in the online booking diary"
            className="text-3xl font-bold text-white font-serif"
            label="Attire Bottom Title"
            section="attire"
          />
          <div className="flex items-center justify-center gap-4">
            <EditableElement
              id="attire-bottom-btn"
              tag="a"
              defaultContent="Book Spud in Your Tartan Choice"
              defaultLinkUrl="/booking"
              className="px-6 py-3.5 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xl hover:brightness-110 flex items-center gap-2 text-center"
              label="Attire Bottom Booking Button"
              section="attire"
            />
          </div>
        </div>
      </section>

      <Footer />
      <LiveChatWidget />
    </div>
  );
}
