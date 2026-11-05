'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { 
  Music, 
  Sparkles, 
  ExternalLink, 
  Download, 
  Sliders, 
  Award, 
  HelpCircle,
  Volume2,
  BookOpen,
  ArrowRight
} from 'lucide-react';

export default function StudioPage() {
  return (
    <div className="min-h-screen bg-tartan-dark flex flex-col relative text-gray-200">
      <Navbar />

      {/* Hero Header */}
      <div className="relative bg-gradient-to-b from-tartan-card via-tartan-navy to-tartan-dark border-b border-tartan-border py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Breadcrumbs & Badge */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Link href="/" className="hover:text-tartan-gold transition-colors">Home</Link>
              <span>/</span>
              <Link href="/services" className="hover:text-tartan-gold transition-colors">Services</Link>
              <span>/</span>
              <span className="text-tartan-gold font-bold">Bagpipe Studio</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-tartan-accent/15 border border-tartan-accent/40 text-tartan-gold text-xs font-bold shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-tartan-gold" />
              <span>Ceòl Mòr &amp; Ceòl Beag • Interactive Highland Synthesiser</span>
            </div>
          </div>

          {/* Heading & Summary */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-serif tracking-tight">
              Highland Bagpipe Synthesiser &amp; Virtual Practice Studio
            </h1>
            <p className="text-base sm:text-lg text-gray-300 max-w-4xl leading-relaxed">
              Explore the authentic acoustics of the Great Highland Bagpipe. Compose original Scottish pipe tunes procedurally, practice finger placement and Highland embellishments (birls, taorluaths, and doublings) on the virtual chanter, tune cane drones at modern concert pitch (A = 478 Hz), and record high-fidelity WAV audio directly in your browser.
            </p>
          </div>

          {/* Quick Action Pills */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap pt-2">
            <a
              href="/bagpipe-studio.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 hover:scale-105 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open Fullscreen Studio</span>
            </a>

            <Link
              href="/experience"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 hover:text-white hover:bg-rose-900/80 font-bold text-xs shadow-lg transition-all"
            >
              <Award className="w-4 h-4 text-rose-400" />
              <span>Airbnb Masterclass with Spud</span>
            </Link>

            <Link
              href="/booking"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-tartan-card border border-tartan-border hover:border-tartan-accent text-gray-300 hover:text-tartan-gold font-bold text-xs transition-all"
            >
              <Music className="w-4 h-4" />
              <span>Book Spud Live for an Event</span>
            </Link>
          </div>

        </div>
      </div>

      {/* Main Studio Frame Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-12 w-full flex-grow">
        
        {/* Interactive App Window */}
        <section className="space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-400 px-1">
            <span className="flex items-center gap-1.5 text-tartan-gold font-semibold">
              <Sliders className="w-3.5 h-3.5" />
              <span>Live Web Audio Engine (Pure Synthesis • No External Samples)</span>
            </span>
            <a 
              href="/bagpipe-studio.html" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>Pop out standalone tab</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="w-full rounded-3xl overflow-hidden border border-tartan-accent/40 shadow-2xl bg-slate-950 relative">
            <iframe
              src="/bagpipe-studio.html"
              title="Solo Great Highland Bagpipe Synthesiser"
              className="w-full h-[920px] border-0"
              allow="autoplay"
            />
          </div>
        </section>

        {/* Educational Masterclass Info Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-6 rounded-3xl bg-tartan-card border border-tartan-border space-y-3 shadow-xl">
            <div className="w-10 h-10 rounded-2xl bg-tartan-navy text-tartan-gold flex items-center justify-center font-bold text-base">
              1
            </div>
            <h3 className="text-lg font-bold text-white font-serif">The 9-Note Highland Scale</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Unlike classical instruments in 440 Hz concert pitch, the Great Highland Bagpipe chanter is tuned higher (approx. <strong>478 Hz to 482 Hz</strong>) in a specialized Mixolydian mode. The chanter scale ranges from Low G up to High A with a distinctive flattened 7th and natural third.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-tartan-card border border-tartan-border space-y-3 shadow-xl">
            <div className="w-10 h-10 rounded-2xl bg-tartan-navy text-tartan-gold flex items-center justify-center font-bold text-base">
              2
            </div>
            <h3 className="text-lg font-bold text-white font-serif">Grace Notes &amp; Birls</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Because bagpipe air flows continuously without dynamic accents or rests, pipers use rapid finger movements called <strong>gracenotes</strong> to separate notes and create rhythm. Use the studio ornamentation pad to hear authentic Highland <em>Birls</em>, <em>Taorluaths</em>, and <em>Doublings</em>.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-tartan-card border border-tartan-border space-y-3 shadow-xl">
            <div className="w-10 h-10 rounded-2xl bg-tartan-navy text-tartan-gold flex items-center justify-center font-bold text-base">
              3
            </div>
            <h3 className="text-lg font-bold text-white font-serif">Hands-On at Carrbridge</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Want to hold a real practice chanter and blow genuine Scottish pipes? Join Spud for his official <strong>Airbnb Experience</strong> at the historic Carrbridge Hotel. 90-minute masterclass for beginners with all equipment provided.
            </p>
            <Link
              href="/experience"
              className="inline-flex items-center gap-1.5 text-xs text-tartan-gold font-bold hover:underline pt-1"
            >
              <span>Explore the Airbnb Masterclass</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
