'use client';

import React from 'react';
import Link from 'next/link';
import { EditableElement } from './EditableElement';
import { Trophy, Heart, Sparkles, Calendar, ArrowRight, Award, CheckCircle2, Music } from 'lucide-react';

export const ScottishWeddingAwardsCard: React.FC = () => {
  return (
    <section className="relative py-10 bg-gradient-to-b from-tartan-dark via-tartan-card to-tartan-dark border-y border-tartan-accent/40 overflow-hidden">
      {/* Background Celtic Tartan & Golden Glow Accents */}
      <div className="absolute -left-32 -top-32 w-80 h-80 bg-tartan-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-32 -bottom-32 w-80 h-80 bg-tartan-accent/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Award Showcase Container */}
        <div className="relative rounded-3xl bg-gradient-to-br from-tartan-navy/95 via-tartan-card/90 to-tartan-dark/95 border-2 border-tartan-gold/50 shadow-2xl overflow-hidden p-6 sm:p-8 lg:p-10">
          
          {/* Subtle Decorative Gold Corner Ribbons */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-tartan-gold/15 to-transparent pointer-events-none" />
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-tartan-gold/20 rounded-full blur-xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* ================= LEFT COLUMN: Award Emblem Image & Badges (5 cols) ================= */}
            <div className="lg:col-span-5 flex flex-col items-center text-center space-y-4">
              
              {/* Image Frame with Golden Glow */}
              <div className="relative group max-w-sm w-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-tartan-gold via-yellow-400 to-amber-600 rounded-3xl blur-md opacity-40 group-hover:opacity-75 transition duration-500" />
                
                <div className="relative rounded-2xl overflow-hidden bg-white border-2 border-tartan-gold shadow-2xl p-2.5">
                  <EditableElement
                    id="swa-badge-image"
                    isImage={true}
                    defaultImageUrl="/scottish-wedding-awards-2027-finalist.jpg"
                    defaultAlt="The Scottish Wedding Awards 2027 Finalist - Spud the Piper"
                    className="w-full h-auto object-contain rounded-xl shadow-inner transition-transform duration-300 group-hover:scale-[1.02]"
                    section="awards"
                  />
                  
                  {/* Floating Finalist Ribbons */}
                  <div className="mt-2.5 pt-2 border-t border-amber-900/10 flex items-center justify-between text-[11px] text-amber-950 font-bold px-1">
                    <span className="flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-700" />
                      14th Edition Oceanic Award
                    </span>
                    <span className="text-amber-800 uppercase tracking-wider font-extrabold text-[10px]">
                      Official Finalist
                    </span>
                  </div>
                </div>
              </div>

              {/* Verified Nomination Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tartan-accent/20 border border-tartan-accent/50 text-tartan-gold text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-tartan-gold animate-pulse" />
                <span>Powered by Weddings CNCT & Oceanic Events</span>
              </div>
            </div>

            {/* ================= RIGHT COLUMN: Award Story, 2 Categories, Quote & CTAs (7 cols) ================= */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              
              {/* Header Pill */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-yellow-300 text-xs font-bold border border-yellow-500/40 uppercase tracking-wider inline-flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-yellow-400" />
                  Scottish Wedding Awards 2027
                </span>
                <span className="px-3 py-1 rounded-full bg-red-950/80 text-red-300 text-xs font-bold border border-red-800">
                  Double Category Finalist
                </span>
              </div>

              {/* Main Headline */}
              <div className="space-y-1.5">
                <EditableElement
                  id="swa-card-title"
                  tag="h2"
                  defaultContent="Honoured Finalist in 2 Prestigious Categories"
                  className="text-2xl sm:text-4xl font-extrabold text-white font-serif tracking-tight leading-tight"
                  label="Award Showcase Title"
                  section="awards"
                />
                <EditableElement
                  id="swa-card-sub"
                  tag="p"
                  defaultContent="We are thrilled to announce that Calum 'Spud' Fraser has been shortlisted as a Finalist in Scotland's premier annual wedding industry accolades:"
                  className="text-sm sm:text-base text-gray-300 leading-relaxed"
                  label="Award Showcase Subtitle"
                  section="awards"
                />
              </div>

              {/* The Two Category Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                
                {/* Category 1: Couples Choice Award */}
                <div className="bg-tartan-dark/90 rounded-2xl p-4 border border-tartan-gold/40 hover:border-tartan-gold transition-all text-left space-y-2 shadow-lg group">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-tartan-accent/20 text-tartan-gold flex items-center justify-center border border-tartan-accent/40 group-hover:scale-110 transition-transform">
                      <Heart className="w-4 h-4 text-rose-400 fill-rose-400/20" />
                    </div>
                    <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-wider bg-yellow-950/60 px-2 py-0.5 rounded border border-yellow-700/40">
                      Category 1
                    </span>
                  </div>

                  <EditableElement
                    id="swa-category-1-title"
                    tag="h3"
                    defaultContent="Couples' Choice Award"
                    className="text-base font-bold text-white font-serif"
                    label="Award Category 1 Title"
                    section="awards"
                  />

                  <EditableElement
                    id="swa-category-1-desc"
                    tag="p"
                    defaultContent="Voted for and nominated directly by brides and grooms across Scotland who entrusted Spud to pipe at their wedding ceremonies and grand castle receptions."
                    className="text-xs text-gray-300 leading-relaxed"
                    label="Award Category 1 Description"
                    section="awards"
                  />
                </div>

                {/* Category 2: Piper of the Year Award */}
                <div className="bg-tartan-dark/90 rounded-2xl p-4 border border-tartan-gold/40 hover:border-tartan-gold transition-all text-left space-y-2 shadow-lg group">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-tartan-accent/20 text-tartan-gold flex items-center justify-center border border-tartan-accent/40 group-hover:scale-110 transition-transform">
                      <Music className="w-4 h-4 text-tartan-gold" />
                    </div>
                    <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-wider bg-yellow-950/60 px-2 py-0.5 rounded border border-yellow-700/40">
                      Category 2
                    </span>
                  </div>

                  <EditableElement
                    id="swa-category-2-title"
                    tag="h3"
                    defaultContent="Piper of the Year Award"
                    className="text-base font-bold text-white font-serif"
                    label="Award Category 2 Title"
                    section="awards"
                  />

                  <EditableElement
                    id="swa-category-2-desc"
                    tag="p"
                    defaultContent="Recognizing master musicianship, ceremonial Scottish bagpiping tradition, bespoke repertoire arrangements, and five-star Highland showmanship."
                    className="text-xs text-gray-300 leading-relaxed"
                    label="Award Category 2 Description"
                    section="awards"
                  />
                </div>

              </div>

              {/* Thank You Note & Quote */}
              <div className="bg-tartan-card/70 rounded-2xl p-3.5 border border-tartan-border/80 text-xs text-gray-300 italic text-left flex items-start gap-3">
                <span className="text-xl text-tartan-gold font-serif select-none shrink-0">&ldquo;</span>
                <div className="space-y-1">
                  <EditableElement
                    id="swa-thankyou-quote"
                    tag="p"
                    defaultContent="A massive thank you to all the wonderful couples, families, wedding planners, and castle venues who nominated and supported me. It is an absolute privilege to pipe you into married life!"
                    className="text-xs text-gray-200 leading-relaxed"
                    label="Spud's Thank You Quote"
                    section="awards"
                  />
                  <span className="text-[11px] font-bold text-tartan-gold not-italic block">
                    — Calum &quot;Spud&quot; Fraser
                  </span>
                </div>
              </div>

              {/* Call to Actions */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <Link
                  href="/booking"
                  className="px-6 py-3 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider shadow-xl hover:brightness-110 transition-all flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Check 2026/2027 Wedding Dates</span>
                </Link>

                <Link
                  href="/services"
                  className="px-5 py-3 rounded-xl bg-tartan-dark hover:bg-tartan-card text-white font-bold text-xs border border-tartan-border hover:border-tartan-accent transition-all flex items-center gap-2"
                >
                  <span>Explore Wedding Packages</span>
                  <ArrowRight className="w-3.5 h-3.5 text-tartan-gold" />
                </Link>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
