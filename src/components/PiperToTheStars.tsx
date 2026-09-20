'use client';

import React from 'react';
import { EditableElement } from './EditableElement';
import { Award, Star, Quote, Sparkles, MapPin, CheckCircle } from 'lucide-react';

export const PiperToTheStars: React.FC = () => {
  return (
    <section className="bg-tartan-card/90 border-y border-tartan-accent/30 py-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Quote Box from The Scottish Wedding Directory */}
        <div className="bg-tartan-navy/90 rounded-2xl p-6 sm:p-8 border border-tartan-accent/40 shadow-xl mb-12 relative overflow-hidden">
          <Quote className="absolute -top-4 -right-4 w-28 h-28 text-tartan-accent/10 pointer-events-none" />
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-3 text-center md:text-left border-b md:border-b-0 md:border-r border-tartan-border/60 pb-4 md:pb-0 md:pr-6">
              <div className="inline-flex p-3 rounded-2xl bg-tartan-accent/20 text-tartan-gold mb-2 border border-tartan-accent/40">
                <Award className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Industry Citation</h4>
              <p className="text-xs text-tartan-gold font-serif">The Scottish Wedding Directory</p>
            </div>

            <div className="md:col-span-9 space-y-2">
              <EditableElement
                id="hero-quote"
                tag="p"
                defaultContent="&quot;Spud the Piper is one of the wedding industry's best known characters. Couples were simply bowled over by his obvious musicianship and highly toned performance skills.&quot;"
                className="text-lg sm:text-xl text-white font-serif italic leading-relaxed"
                label="Industry Quote"
                section="stars"
              />
              <div className="flex items-center gap-1 text-yellow-400 text-sm">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400" />
                ))}
                <span className="text-xs text-gray-300 ml-2 font-sans font-semibold">Scottish Wedding Directory Official Feature</span>
              </div>
            </div>
          </div>
        </div>

        {/* Piper to the Stars Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* Card 1: Jamie Lee Curtis & Hollywood Credentials */}
          <div className="bg-tartan-dark/80 rounded-2xl p-6 border border-tartan-border/80 flex flex-col justify-between hover:border-tartan-accent/60 transition-all shadow-lg group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-red-950/80 text-red-300 text-xs font-bold border border-red-800">
                  Hollywood & VIPs
                </span>
                <Sparkles className="w-5 h-5 text-tartan-gold" />
              </div>

              <EditableElement
                id="stars-jamie-title"
                tag="h3"
                defaultContent="Piper to Jamie Lee Curtis & VIPs"
                className="text-xl font-bold text-white font-serif"
                label="Celebrity Card Title"
                section="stars"
              />

              <EditableElement
                id="stars-jamie-desc"
                tag="p"
                defaultContent="From personal piping for Oscar-winner Jamie Lee Curtis to private castle banquets for international dignitaries, Spud provides star-quality Scottish musical entertainment."
                className="text-sm text-gray-300 leading-relaxed"
                label="Celebrity Card Body"
                section="stars"
              />
            </div>

            <div className="mt-6 pt-4 border-t border-tartan-border/60 flex items-center gap-2 text-xs text-tartan-gold font-semibold">
              <CheckCircle className="w-4 h-4 text-tartan-gold" />
              <span>Worldwide Castle & Gala Experience</span>
            </div>
          </div>

          {/* Card 2: 15+ Years Global Experience */}
          <div className="bg-tartan-dark/80 rounded-2xl p-6 border border-tartan-accent/40 bg-gradient-to-b from-tartan-card to-tartan-dark flex flex-col justify-between hover:border-tartan-accent transition-all shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-tartan-accent/20 text-tartan-gold text-xs font-bold border border-tartan-accent/50">
                  Master Musician
                </span>
                <Award className="w-5 h-5 text-tartan-gold" />
              </div>

              <h3 className="text-3xl font-extrabold text-tartan-gold font-serif">15+ Years</h3>
              
              <p className="text-sm text-gray-300 leading-relaxed">
                Performing across Scotland, the UK, Europe, America, and worldwide. Mastery of traditional laments, jigs, reels, and modern Celtic anthems.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-tartan-border/60 flex items-center gap-2 text-xs text-tartan-goldLight font-semibold">
              <MapPin className="w-4 h-4 text-tartan-gold" />
              <span>Available Scotland & Worldwide Travel</span>
            </div>
          </div>

          {/* Card 3: Authentic Highland Regalia */}
          <div className="bg-tartan-dark/80 rounded-2xl p-6 border border-tartan-border/80 flex flex-col justify-between hover:border-tartan-accent/60 transition-all shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-green-950/80 text-green-300 text-xs font-bold border border-green-800">
                  Traditional Dress
                </span>
                <Sparkles className="w-5 h-5 text-green-400" />
              </div>

              <EditableElement
                id="stars-regalia-title"
                tag="h3"
                defaultContent="Full No. 1 Dress & Custom Tartans"
                className="text-xl font-bold text-white font-serif"
                label="Regalia Title"
                section="stars"
              />

              <EditableElement
                id="stars-regalia-desc"
                tag="p"
                defaultContent="Choose from Full Ceremonial Number 1 Military Dress with Feather Bonnet, Royal Stewart Tartan, Black Watch, or Modern Highland Tweed to complement your wedding color scheme."
                className="text-sm text-gray-300 leading-relaxed"
                label="Regalia Description"
                section="stars"
              />
            </div>

            <div className="mt-6 pt-4 border-t border-tartan-border/60 flex items-center gap-2 text-xs text-tartan-gold font-semibold">
              <CheckCircle className="w-4 h-4 text-tartan-gold" />
              <span>Tailored Attire for Every Occasion</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
