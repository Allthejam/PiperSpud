'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { AboutSection } from '@/components/AboutSection';
import { PiperToTheStars } from '@/components/PiperToTheStars';
import { Footer } from '@/components/Footer';
import { LiveChatWidget } from '@/components/LiveChatWidget';
import { VisualPencilOverlay } from '@/components/VisualPencilOverlay';
import { EditableElement } from '@/components/EditableElement';
import Link from 'next/link';
import { Calendar, Music, ArrowRight, Award, ShieldCheck, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-tartan-dark flex flex-col relative">
      <VisualPencilOverlay />
      <Navbar />

      {/* Page Header Banner */}
      <div className="bg-gradient-to-b from-tartan-card via-tartan-navy to-tartan-dark py-14 border-b border-tartan-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tartan-accent/15 border border-tartan-accent/40 text-tartan-gold text-xs font-semibold">
            <Award className="w-4 h-4" />
            <span>Over 15 Years of Masterclass Piping</span>
          </div>
          <EditableElement
            id="about-page-h1"
            tag="h1"
            defaultContent="About Spud The Piper"
            className="text-4xl sm:text-6xl font-extrabold text-white font-serif tracking-tight uppercase"
            label="About Page H1"
            section="about-header"
          />
          <EditableElement
            id="about-page-sub"
            tag="p"
            defaultContent="The story, awards, international tours, and musical heritage behind Scotland's most celebrated Highland Bagpiper."
            className="text-base text-gray-300 max-w-2xl mx-auto"
            label="About Page Subtitle"
            section="about-header"
          />
        </div>
      </div>

      {/* About Main Bio & Credentials */}
      <AboutSection />

      {/* Piper to the Stars Showcase */}
      <PiperToTheStars />

      {/* Call to Action Bar */}
      <section className="py-16 bg-tartan-navy border-t border-tartan-border text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl font-bold text-white font-serif">
            Ready to add Scotland\'s finest bagpipe music to your event?
          </h2>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/booking"
              className="px-6 py-3.5 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xl hover:brightness-110 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Check Spud\'s Live Diary</span>
            </Link>
            <Link
              href="/tunes"
              className="px-6 py-3.5 bg-tartan-card hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-tartan-border flex items-center gap-2"
            >
              <Music className="w-4 h-4 text-tartan-gold" />
              <span>Listen to Tune Samples</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <LiveChatWidget />
    </div>
  );
}
