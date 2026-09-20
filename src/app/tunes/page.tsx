'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { TuneSampler } from '@/components/TuneSampler';
import { Footer } from '@/components/Footer';
import { LiveChatWidget } from '@/components/LiveChatWidget';
import { VisualPencilOverlay } from '@/components/VisualPencilOverlay';
import { EditableElement } from '@/components/EditableElement';
import Link from 'next/link';
import { Music, Calendar, Sparkles } from 'lucide-react';

export default function TunesPage() {
  return (
    <div className="min-h-screen bg-tartan-dark flex flex-col relative">
      <VisualPencilOverlay />
      <Navbar />

      {/* Page Header */}
      <div className="bg-gradient-to-b from-tartan-card via-tartan-navy to-tartan-dark py-14 border-b border-tartan-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tartan-accent/15 border border-tartan-accent/40 text-tartan-gold text-xs font-semibold">
            <Music className="w-4 h-4 shrink-0" />
            <EditableElement
              id="tunes-page-badge"
              tag="span"
              defaultContent="Highland Melodies & Audio Jukebox"
              label="Tunes Page Badge"
              section="tunes"
            />
          </div>
          <EditableElement
            id="tunes-page-title"
            tag="h1"
            defaultContent="Bagpipe Tune Jukebox"
            className="text-4xl sm:text-6xl font-extrabold text-white font-serif tracking-tight uppercase"
            label="Tunes Page Title"
            section="tunes"
          />
          <EditableElement
            id="tunes-page-desc"
            tag="p"
            defaultContent="Listen to live sound samples and studio bagpipe recordings of Scotland's most beloved marches, wedding processionals, and laments."
            className="text-base text-gray-300 max-w-2xl mx-auto"
            label="Tunes Page Description"
            section="tunes"
          />
        </div>
      </div>

      <TuneSampler />

      {/* Booking CTA Bar */}
      <section className="py-16 bg-tartan-navy border-t border-tartan-border text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <EditableElement
            id="tunes-bottom-title"
            tag="h2"
            defaultContent="Select these tunes directly in your booking form!"
            className="text-3xl font-bold text-white font-serif"
            label="Tunes Bottom Title"
            section="tunes"
          />
          <div className="flex items-center justify-center gap-4">
            <EditableElement
              id="tunes-bottom-btn"
              tag="a"
              defaultContent="Go to Booking Form"
              defaultLinkUrl="/booking"
              className="px-6 py-3.5 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xl hover:brightness-110 flex items-center gap-2 text-center"
              label="Tunes Bottom Booking Button"
              section="tunes"
            />
          </div>
        </div>
      </section>

      <Footer />
      <LiveChatWidget />
    </div>
  );
}
