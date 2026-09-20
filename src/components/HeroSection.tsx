'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { EditableElement } from './EditableElement';
import { 
  Calendar, 
  Play, 
  Volume2, 
  Award, 
  Star, 
  CheckCircle2, 
  Phone, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { playTune, currentPlayingTune, stopTune } = useApp();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative min-h-[90vh] flex items-center justify-center bg-tartan-dark overflow-hidden py-16 lg:py-24">
      {/* Background Graphic & Tartan Atmospheric Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-tartan-card via-tartan-navy to-tartan-dark opacity-90"></div>
      
      {/* Subtle Celtic Tartan Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E3A8A15_1px,transparent_1px),linear-gradient(to_bottom,#1E3A8A15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Award Badge Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tartan-accent/15 border border-tartan-accent/40 text-tartan-gold text-xs font-semibold shadow-inner">
              <Award className="w-4 h-4 text-tartan-gold" />
              <span>Multiple Scottish Wedding Industry Award Winner</span>
              <span className="hidden sm:inline text-tartan-goldLight">• 15+ Years Worldwide</span>
            </div>

            {/* Main H1 Title & Subheader (Editable by pencil) */}
            <div className="space-y-2">
              <EditableElement
                id="hero-h1"
                tag="h1"
                defaultContent="Spud The Piper"
                className="text-4xl sm:text-6xl xl:text-7xl font-extrabold text-white font-serif tracking-tight leading-[1.1] uppercase drop-shadow-md"
                label="Main Hero Title"
                section="hero"
              />
              <EditableElement
                id="hero-catchphrase"
                tag="h2"
                defaultContent="Scotland's Premier Highland Bagpiper for Hire"
                className="text-xl sm:text-2xl text-tartan-gold font-serif italic"
                label="Hero Tagline / H2"
                section="hero"
              />
            </div>

            {/* Hero Subtitle / Mission */}
            <EditableElement
              id="hero-sub"
              tag="p"
              defaultContent="World-renowned for emotive Scottish wedding ceremonies, solemn memorial laments, castle galas, and VIP corporate celebrations. Piping unforgettable Highland memories worldwide."
              className="text-base sm:text-lg text-gray-300 max-w-2xl leading-relaxed"
              label="Hero Subtext"
              section="hero"
            />

            {/* Highlights bullet badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs text-gray-200">
              <div className="flex items-center gap-2 bg-tartan-card/80 p-2.5 rounded-lg border border-tartan-border/60">
                <CheckCircle2 className="w-4 h-4 text-tartan-gold shrink-0" />
                <span>Piper to the Stars</span>
              </div>
              <div className="flex items-center gap-2 bg-tartan-card/80 p-2.5 rounded-lg border border-tartan-border/60">
                <CheckCircle2 className="w-4 h-4 text-tartan-gold shrink-0" />
                <span>Full No. 1 Dress & Tartans</span>
              </div>
              <div className="flex items-center gap-2 bg-tartan-card/80 p-2.5 rounded-lg border border-tartan-border/60">
                <CheckCircle2 className="w-4 h-4 text-tartan-gold shrink-0" />
                <span>Instant Online Booking</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center lg:justify-start">
              <button
                onClick={() => scrollToSection('booking')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-sm tracking-wider uppercase shadow-2xl hover:shadow-yellow-500/30 transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                <span>Check Dates & Book Online</span>
              </button>

              <button
                onClick={() => {
                  if (currentPlayingTune) {
                    stopTune();
                  } else {
                    playTune('Highland Cathedral');
                  }
                }}
                className={`w-full sm:w-auto px-6 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all border ${
                  currentPlayingTune
                    ? 'bg-tartan-gold text-tartan-dark border-yellow-300'
                    : 'bg-tartan-navy/80 hover:bg-tartan-navy text-white border-tartan-accent/50'
                }`}
              >
                {currentPlayingTune ? (
                  <>
                    <Volume2 className="w-5 h-5 animate-pulse" />
                    <span>Stop Sample ({currentPlayingTune})</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 text-tartan-gold fill-tartan-gold" />
                    <span>Listen to Bagpipe Sample</span>
                  </>
                )}
              </button>
            </div>

            {/* Phone Quick Inquiry */}
            <div className="pt-2 flex items-center justify-center lg:justify-start gap-4 text-xs text-gray-400">
              <span>Prefer to speak directly?</span>
              <a href="tel:07793491367" className="text-tartan-gold font-bold hover:underline flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                <span>07793 491367</span>
              </a>
            </div>
          </div>

          {/* Right Hero Image Showcase & Live Stream Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Gold Border Highlight Frame */}
              <div className="absolute -inset-1.5 rounded-3xl bg-gold-gradient opacity-40 blur-sm group-hover:opacity-100 transition duration-1000"></div>
              
              <div className="relative rounded-2xl overflow-hidden bg-tartan-card border border-tartan-accent/50 shadow-2xl">
                {/* Hero Showcase Photo with Editable CMS Image wrapper */}
                <EditableElement
                  id="hero-main-photo"
                  isImage={true}
                  defaultImageUrl="https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80"
                  defaultAlt="Spud the Piper performing in full Highland Regalia in Scotland"
                  className="w-full h-96 object-cover object-center"
                  section="hero"
                />

                {/* Floating Rating Overlay */}
                <div className="absolute bottom-3 left-3 right-3 bg-tartan-dark/90 backdrop-blur-md rounded-xl p-3 border border-tartan-accent/30 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-[11px] text-gray-300 font-medium mt-0.5">5.0 Star Rated (120+ Reviews)</p>
                  </div>
                  <button
                    onClick={() => scrollToSection('reviews')}
                    className="px-3 py-1.5 bg-tartan-accent/20 hover:bg-tartan-accent/30 text-tartan-gold text-xs font-bold rounded-lg border border-tartan-accent/40"
                  >
                    Read Reviews
                  </button>
                </div>
              </div>
            </div>

            {/* Facebook Live Announcement Banner */}
            <div className="bg-gradient-to-r from-blue-950/80 to-tartan-navy rounded-xl p-4 border border-blue-500/40 shadow-lg flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Facebook Live Streams</h4>
                  <p className="text-[11px] text-blue-200">Every Tuesday & Friday • 6:00 - 6:30 PM</p>
                </div>
              </div>
              <a
                href="https://www.facebook.com/spudthepiper/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shrink-0 shadow"
              >
                Join Stream
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
