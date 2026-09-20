'use client';

import React from 'react';
import { EditableElement } from './EditableElement';
import { Award, Globe, Shield, Sparkles, Heart, CheckCircle2 } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-tartan-card relative overflow-hidden">
      {/* Subtle tartan glow */}
      <div className="absolute -right-40 -top-40 w-96 h-96 bg-tartan-accent/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Image Collage & Badges */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-3xl overflow-hidden border border-tartan-accent/50 shadow-2xl">
              <EditableElement
                id="about-photo-main"
                isImage={true}
                defaultImageUrl="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80"
                defaultAlt="Spud the Piper performing in Scotland with bagpipes"
                className="w-full h-[450px] object-cover"
                section="about"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 text-white">
                <div className="flex items-center gap-2 text-tartan-gold text-xs font-bold uppercase tracking-wider mb-1">
                  <Award className="w-4 h-4 shrink-0" />
                  <EditableElement
                    id="about-overlay-badge"
                    tag="span"
                    defaultContent="Voted Best Scottish Entertainer"
                    label="About Overlay Badge"
                    section="about"
                  />
                </div>
                <EditableElement
                  id="about-overlay-title"
                  tag="h3"
                  defaultContent="Spud the Piper"
                  className="text-xl font-bold font-serif"
                  label="About Overlay Title"
                  section="about"
                />
                <EditableElement
                  id="about-overlay-desc"
                  tag="p"
                  defaultContent="Providing masterclass piping for over 15 years globally"
                  className="text-xs text-gray-300"
                  label="About Overlay Subtitle"
                  section="about"
                />
              </div>
            </div>

            {/* Experience Stats Row */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-tartan-dark/90 p-4 rounded-2xl border border-tartan-border flex flex-col items-center justify-center">
                <EditableElement
                  id="about-stat-years-num"
                  tag="div"
                  defaultContent="15+"
                  className="text-2xl font-extrabold text-tartan-gold font-serif"
                  label="Years Piping Number"
                  section="about"
                />
                <EditableElement
                  id="about-stat-years-label"
                  tag="div"
                  defaultContent="Years Piping"
                  className="text-[11px] text-gray-400 font-semibold uppercase mt-0.5"
                  label="Years Piping Label"
                  section="about"
                />
              </div>
              <div className="bg-tartan-dark/90 p-4 rounded-2xl border border-tartan-border flex flex-col items-center justify-center">
                <EditableElement
                  id="about-stat-weddings-num"
                  tag="div"
                  defaultContent="1,200+"
                  className="text-2xl font-extrabold text-tartan-gold font-serif"
                  label="Weddings Number"
                  section="about"
                />
                <EditableElement
                  id="about-stat-weddings-label"
                  tag="div"
                  defaultContent="Weddings"
                  className="text-[11px] text-gray-400 font-semibold uppercase mt-0.5"
                  label="Weddings Label"
                  section="about"
                />
              </div>
              <div className="bg-tartan-dark/90 p-4 rounded-2xl border border-tartan-border flex flex-col items-center justify-center">
                <EditableElement
                  id="about-stat-rating-num"
                  tag="div"
                  defaultContent="100%"
                  className="text-2xl font-extrabold text-tartan-gold font-serif"
                  label="5-Star Rating Number"
                  section="about"
                />
                <EditableElement
                  id="about-stat-rating-label"
                  tag="div"
                  defaultContent="5-Star Rated"
                  className="text-[11px] text-gray-400 font-semibold uppercase mt-0.5"
                  label="5-Star Rating Label"
                  section="about"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Bio Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tartan-accent/15 border border-tartan-accent/40 text-tartan-gold text-xs font-semibold">
              <Sparkles className="w-4 h-4 shrink-0" />
              <EditableElement
                id="about-header-badge"
                tag="span"
                defaultContent="Meet Spud the Piper"
                label="About Header Badge"
                section="about"
              />
            </div>

            <EditableElement
              id="about-heading"
              tag="h2"
              defaultContent="A Lifetime of Scottish Heritage, Passion & Performance"
              className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-white font-serif tracking-tight leading-tight"
              label="About Heading"
              section="about"
            />

            <div className="space-y-4 text-sm sm:text-base text-gray-300 leading-relaxed">
              <EditableElement
                id="about-p1"
                tag="p"
                defaultContent="Spud the Highland Bagpiper is celebrated throughout Scotland and across the globe for his stirring bagpipe performances at traditional Scottish castle weddings, private VIP banquets, Burns Suppers, and poignant memorial services."
                label="About Paragraph 1"
                section="about"
              />

              <EditableElement
                id="about-p2"
                tag="p"
                defaultContent="Renowned as the 'Piper to the Stars', Spud has had the honor of piping for international celebrities, dignitaries, and Hollywood icons including Jamie Lee Curtis. His unmistakable presence, warm Scottish humor, and masterclass musicianship ensure your guests are captivated from the very first chord."
                label="About Paragraph 2"
                section="about"
              />

              <EditableElement
                id="about-p3"
                tag="p"
                defaultContent="Whether greeting your guests at historic castle gates, piping the bridal party down the aisle with Highland Cathedral, or providing a heart-stirring lament at a graveside, Spud brings uncompromised excellence, dignity, and authentic Scottish soul to every occasion."
                label="About Paragraph 3"
                section="about"
              />
            </div>

            {/* Key Quality Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-white">
              <div className="flex items-center gap-2.5 bg-tartan-navy/80 p-3 rounded-xl border border-tartan-border">
                <CheckCircle2 className="w-4 h-4 text-tartan-gold shrink-0" />
                <EditableElement
                  id="about-pillar-dress"
                  tag="span"
                  defaultContent="Full Military No. 1 Dress & Custom Tartans"
                  label="Quality Pillar 1 (Dress)"
                  section="about"
                />
              </div>
              <div className="flex items-center gap-2.5 bg-tartan-navy/80 p-3 rounded-xl border border-tartan-border">
                <CheckCircle2 className="w-4 h-4 text-tartan-gold shrink-0" />
                <EditableElement
                  id="about-pillar-travel"
                  tag="span"
                  defaultContent="Global & Destination Travel Available"
                  label="Quality Pillar 2 (Travel)"
                  section="about"
                />
              </div>
              <div className="flex items-center gap-2.5 bg-tartan-navy/80 p-3 rounded-xl border border-tartan-border">
                <CheckCircle2 className="w-4 h-4 text-tartan-gold shrink-0" />
                <EditableElement
                  id="about-pillar-repertoire"
                  tag="span"
                  defaultContent="Extensive Repertoire & Custom Requests"
                  label="Quality Pillar 3 (Repertoire)"
                  section="about"
                />
              </div>
              <div className="flex items-center gap-2.5 bg-tartan-navy/80 p-3 rounded-xl border border-tartan-border">
                <CheckCircle2 className="w-4 h-4 text-tartan-gold shrink-0" />
                <EditableElement
                  id="about-pillar-musician"
                  tag="span"
                  defaultContent="Fully Insured & Professional Master Musician"
                  label="Quality Pillar 4 (Master Musician)"
                  section="about"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4 flex-wrap">
              <EditableElement
                id="about-btn-diary"
                tag="a"
                defaultContent="Check Spud's Diary Availability"
                defaultLinkUrl="#booking"
                className="px-6 py-3.5 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs tracking-wider uppercase shadow-xl hover:brightness-110 transition-all inline-block text-center"
                label="About Diary Availability Button"
                section="about"
              />
              <EditableElement
                id="about-btn-facebook"
                tag="a"
                defaultContent="Watch on Facebook Live"
                defaultLinkUrl="https://www.facebook.com/spudthepiper/"
                className="px-5 py-3.5 rounded-xl bg-tartan-dark hover:bg-slate-800 text-white text-xs font-bold border border-tartan-border transition-all flex items-center justify-center gap-2"
                label="About Facebook Live Button"
                section="about"
              />
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
