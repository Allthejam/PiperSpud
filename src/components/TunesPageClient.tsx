'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { TuneSampler } from '@/components/TuneSampler';
import { Footer } from '@/components/Footer';
import { LiveChatWidget } from '@/components/LiveChatWidget';
import { VisualPencilOverlay } from '@/components/VisualPencilOverlay';
import { EditableElement } from '@/components/EditableElement';
import { Music, ShieldCheck, Scale, BookOpen, Award, CheckCircle2, ChevronRight } from 'lucide-react';

export default function TunesPageClient() {
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

      {/* Repertoire, Heritage & Musical Copyright Statement */}
      <section id="heritage-statement" className="py-16 bg-tartan-card border-t border-tartan-border/80 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tartan-accent/15 border border-tartan-accent/40 text-tartan-gold text-xs font-semibold">
              <Scale className="w-4 h-4 shrink-0 text-tartan-gold" />
              <EditableElement
                id="heritage-badge"
                tag="span"
                defaultContent="Scottish Cultural Commons & Legal Notice"
                label="Heritage Section Badge"
                section="tunes"
              />
            </div>
            <EditableElement
              id="heritage-title"
              tag="h2"
              defaultContent="Repertoire, Heritage & Musical Copyright Statement"
              className="text-2xl sm:text-4xl font-extrabold text-white font-serif tracking-tight uppercase"
              label="Heritage Section Title"
              section="tunes"
            />
            <EditableElement
              id="heritage-desc"
              tag="p"
              defaultContent="A transparent statement on performance repertoire, centuries-old Scottish folk traditions, and UK copyright law."
              className="text-sm sm:text-base text-gray-300 leading-relaxed"
              label="Heritage Section Description"
              section="tunes"
            />
          </div>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card 1: Repertoire & Performance Services */}
            <div className="p-6 sm:p-7 rounded-3xl bg-tartan-dark/90 border border-tartan-accent/50 shadow-xl space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-tartan-navy text-tartan-gold border border-tartan-border/80">
                    <Music className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-tartan-gold/15 text-tartan-gold border border-tartan-gold/30">
                    Trade Practice
                  </span>
                </div>
                <EditableElement
                  id="heritage-card1-title"
                  tag="h3"
                  defaultContent="1. Repertoire & Performance Services"
                  className="text-lg font-bold text-white font-serif"
                  label="Heritage Card 1 Title"
                  section="tunes"
                />
                <EditableElement
                  id="heritage-card1-body"
                  tag="p"
                  defaultContent="The tunes and musical selections catalogued across this website represent the working performance repertoire of Calum 'Spud' Fraser. Listing these titles serves solely to assist couples, event planners, and private clients in curating authentic bagpipe music for weddings, memorials, and ceremonial occasions. Professional musicians advertising what repertoire they offer is standard trade practice."
                  className="text-xs sm:text-sm text-gray-300 leading-relaxed"
                  label="Heritage Card 1 Body"
                  section="tunes"
                />
              </div>
              <div className="pt-2 text-[11px] text-tartan-gold font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Working repertoire for client event curation</span>
              </div>
            </div>

            {/* Card 2: Traditional Heritage & Public Domain Music */}
            <div className="p-6 sm:p-7 rounded-3xl bg-tartan-dark/90 border border-tartan-accent/50 shadow-xl space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-tartan-navy text-tartan-gold border border-tartan-border/80">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600/40">
                    Public Domain
                  </span>
                </div>
                <EditableElement
                  id="heritage-card2-title"
                  tag="h3"
                  defaultContent="2. Traditional Heritage & Public Domain Music"
                  className="text-lg font-bold text-white font-serif"
                  label="Heritage Card 2 Title"
                  section="tunes"
                />
                <EditableElement
                  id="heritage-card2-body"
                  tag="p"
                  defaultContent="The overwhelming majority of the Scottish bagpipe music listed here consists of traditional airs, marches, strathspeys, reels, and laments rooted in Scottish folk tradition, clan heritage, and military piping history (including The Skye Boat Song, Amazing Grace, Killiecrankie, Highland Wedding, and Flowers of the Forest). These works are in the public domain and form part of our shared cultural commons. No individual, artist, or commercial competitor holds exclusive rights over the performance or naming of traditional Scottish tunes."
                  className="text-xs sm:text-sm text-gray-300 leading-relaxed"
                  label="Heritage Card 2 Body"
                  section="tunes"
                />
              </div>
              <div className="pt-2 text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Free cultural commons under UK copyright law</span>
              </div>
            </div>

            {/* Card 3: Historical Facts & Educational Commentary */}
            <div className="p-6 sm:p-7 rounded-3xl bg-tartan-dark/90 border border-tartan-accent/50 shadow-xl space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-tartan-navy text-tartan-gold border border-tartan-border/80">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-600/40">
                    Original Research
                  </span>
                </div>
                <EditableElement
                  id="heritage-card3-title"
                  tag="h3"
                  defaultContent="3. Historical Facts & Educational Commentary"
                  className="text-lg font-bold text-white font-serif"
                  label="Heritage Card 3 Title"
                  section="tunes"
                />
                <EditableElement
                  id="heritage-card3-body"
                  tag="p"
                  defaultContent="All historical notes, song origins, composer backgrounds, and cultural lore presented alongside each tune are written independently for educational, informational, and contextual purposes. Historical facts, military timelines (Culloden, Flodden, 1854 Crimean campaigns), and folk traditions are matters of public record and are not protected by copyright under UK law."
                  className="text-xs sm:text-sm text-gray-300 leading-relaxed"
                  label="Heritage Card 3 Body"
                  section="tunes"
                />
              </div>
              <div className="pt-2 text-[11px] text-cyan-400 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Facts and folklore belong to the public record</span>
              </div>
            </div>

            {/* Card 4: Contemporary Compositions & Licensing */}
            <div className="p-6 sm:p-7 rounded-3xl bg-tartan-dark/90 border border-tartan-accent/50 shadow-xl space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-tartan-navy text-tartan-gold border border-tartan-border/80">
                    <Award className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-600/40">
                    PRS / PPL Licensed
                  </span>
                </div>
                <EditableElement
                  id="heritage-card4-title"
                  tag="h3"
                  defaultContent="4. Contemporary Compositions & Licensing"
                  className="text-lg font-bold text-white font-serif"
                  label="Heritage Card 4 Title"
                  section="tunes"
                />
                <EditableElement
                  id="heritage-card4-body"
                  tag="p"
                  defaultContent="Where modern, protected compositions (e.g., Highland Cathedral) are referenced or performed at public or commercial venues, all live performance rights are administered through standard venue licensing with the appropriate collection societies (PRS for Music / PPL in the UK, or reciprocal international bodies). We respect all living composers and intellectual property rights."
                  className="text-xs sm:text-sm text-gray-300 leading-relaxed"
                  label="Heritage Card 4 Body"
                  section="tunes"
                />
              </div>
              <div className="pt-2 text-[11px] text-amber-300 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Fully compliant venue performance rights</span>
              </div>
            </div>

          </div>

          {/* Bottom Callout & Terms Deep Link */}
          <div className="p-5 rounded-2xl bg-tartan-navy/80 border border-tartan-accent/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                <Scale className="w-4 h-4 text-tartan-gold" />
                <span>Governed by Scots Law & UK Intellectual Property Standards</span>
              </h4>
              <p className="text-xs text-gray-400">
                Spud the Piper operates with complete professional integrity, honoring traditional Scottish heritage while respecting all contemporary composers.
              </p>
            </div>
            <Link
              href="/terms#repertoire-heritage"
              className="px-4 py-2 rounded-xl bg-tartan-card hover:bg-tartan-navy text-tartan-gold border border-tartan-gold/50 text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow"
            >
              <span>Read Full Legal Terms</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

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
