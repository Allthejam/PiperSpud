'use client';

import React, { useState } from 'react';
import { HighlandDressOption } from '@/types/spud';
import { Sparkles, Check, Info, Shirt } from 'lucide-react';
import { EditableElement } from './EditableElement';

interface TartanStyle {
  id: string;
  name: HighlandDressOption;
  title: string;
  tagline: string;
  description: string;
  colorScheme: string[];
  bestFor: string;
  imageUrl: string;
}

export const TartanSelector: React.FC = () => {
  const tartans: TartanStyle[] = [
    {
      id: 'no1',
      name: 'Full No. 1 Dress (Feather Bonnet & Plaid)',
      title: 'Full Ceremonial Number 1 Military Dress',
      tagline: 'The ultimate royal and castle spectacle',
      description: 'Feather bonnet, cross-belt with silver crest, full shoulder plaid, horsehair sporran, doublet tunic, spats, and dirk. Maximum visual majesty.',
      colorScheme: ['#991B1B', '#1E3A8A', '#D4AF37', '#000000'],
      bestFor: 'Castle Weddings, Cathedral Ceremonies & VIP State Galas',
      imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80'
    },
    {
      id: 'royal-stewart',
      name: 'Royal Stewart Tartan (Traditional Red)',
      title: 'Royal Stewart Highland Dress',
      tagline: 'The iconic traditional Scottish monarch tartan',
      description: 'Bright, bold crimson red tartan paired with Prince Charlie black formal jacket, silver thistle buttons, and dress sporran.',
      colorScheme: ['#DC2626', '#1D4ED8', '#F59E0B', '#15803D'],
      bestFor: 'Traditional Weddings, Burns Suppers & Hogmanay',
      imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80'
    },
    {
      id: 'black-watch',
      name: 'Black Watch Tartan (Military Green/Blue)',
      title: 'Black Watch Government Tartan',
      tagline: 'Subtle, distinguished military elegance',
      description: 'Deep navy, forest green and black woven tartan. Understated and distinguished with formal Prince Charlie or Argyle jacket.',
      colorScheme: ['#064E3B', '#1E3A8A', '#0F172A'],
      bestFor: 'Formal Evening Dinners, Memorials & Autumn/Winter Weddings',
      imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80'
    },
    {
      id: 'modern-tweed',
      name: 'Modern Day Highland Tweed Jacket',
      title: 'Contemporary Highland Day Tweed',
      tagline: 'Modern Scottish chic for rustic and outdoor weddings',
      description: 'Tailored Scottish wool tweed jacket and waistcoat with antler or horn buttons. Relaxed yet deeply stylish Scottish heritage aesthetic.',
      colorScheme: ['#78716C', '#334155', '#D97706'],
      bestFor: 'Barn & Woodland Weddings, Daytime Receptions & Outdoor Venues',
      imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80'
    },
    {
      id: 'isle-of-skye',
      name: 'Isle of Skye Tartan (Purple/Heather/Green)',
      title: 'Isle of Skye Misty Tartan',
      tagline: 'Inspired by the purple heather & sea mists',
      description: 'Muted purple, heather, sage green and slate blue tones reminiscent of the Cuillin mountains and Western Isles.',
      colorScheme: ['#6B21A8', '#047857', '#64748B'],
      bestFor: 'Romantic Highland Weddings, Destination Elopements & Celtic Themes',
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80'
    }
  ];

  const [selectedTartan, setSelectedTartan] = useState<TartanStyle>(tartans[0]);

  return (
    <section id="attire" className="py-20 bg-tartan-navy relative border-y border-tartan-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tartan-accent/15 border border-tartan-accent/40 text-tartan-gold text-xs font-semibold">
            <Shirt className="w-4 h-4 shrink-0" />
            <EditableElement
              id="tartan-header-badge"
              tag="span"
              defaultContent="Highland Dress & Tartan Studio"
              label="Tartan Header Badge"
              section="attire"
            />
          </div>
          <EditableElement
            id="tartan-header-title"
            tag="h2"
            defaultContent="Customize Spud's Attire for Your Occasion"
            className="text-3xl sm:text-5xl font-extrabold text-white font-serif tracking-tight"
            label="Tartan Header Title"
            section="attire"
          />
          <EditableElement
            id="tartan-header-desc"
            tag="p"
            defaultContent="Every event is unique. Select your preferred Highland dress to perfectly complement your wedding colors, bridal theme, or ceremony atmosphere."
            className="text-base text-gray-300"
            label="Tartan Header Description"
            section="attire"
          />
        </div>

        {/* Interactive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Tartan Selection List */}
          <div className="lg:col-span-5 space-y-3">
            {tartans.map((tartan) => {
              const isSelected = selectedTartan.id === tartan.id;

              return (
                <div
                  key={tartan.id}
                  onClick={() => setSelectedTartan(tartan)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border flex items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-tartan-card border-tartan-gold ring-2 ring-tartan-gold/40 shadow-xl'
                      : 'bg-tartan-dark/70 border-tartan-border/70 hover:bg-tartan-card/80'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {/* Swatch chips */}
                      <div className="flex -space-x-1">
                        {tartan.colorScheme.map((color, idx) => (
                          <span
                            key={idx}
                            className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-sm"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <EditableElement
                        id={`tartan-${tartan.id}-list-title`}
                        tag="span"
                        defaultContent={tartan.title}
                        className={`text-sm font-bold font-serif ${isSelected ? 'text-tartan-gold' : 'text-white'}`}
                        label={`${tartan.title} List Title`}
                        section="attire"
                      />
                    </div>
                    <EditableElement
                      id={`tartan-${tartan.id}-list-tagline`}
                      tag="p"
                      defaultContent={tartan.tagline}
                      className="text-xs text-gray-400"
                      label={`${tartan.title} List Tagline`}
                      section="attire"
                    />
                  </div>

                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                    isSelected ? 'bg-tartan-gold text-tartan-dark border-yellow-300 font-bold' : 'border-slate-600 text-transparent'
                  }`}>
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Large Preview Showcase Card */}
          <div className="lg:col-span-7 bg-tartan-card rounded-3xl p-6 sm:p-8 border border-tartan-accent/40 shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              
              {/* Left Side: Uploadable & Editable Photo */}
              <div className="relative rounded-2xl overflow-hidden border border-tartan-border shadow-inner group">
                <EditableElement
                  id={`tartan-${selectedTartan.id}-photo`}
                  isImage={true}
                  defaultImageUrl={selectedTartan.imageUrl}
                  defaultAlt={`Spud the Piper in ${selectedTartan.title}`}
                  className="w-full h-72 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                  label={`${selectedTartan.title} Photo`}
                  section="attire"
                />
                <div className="absolute bottom-2 left-2 z-20 pointer-events-none">
                  <span className="text-xs font-bold text-white bg-tartan-red/90 px-3 py-1 rounded-full border border-red-400 shadow-md">
                    <EditableElement
                      id={`tartan-${selectedTartan.id}-badge`}
                      tag="span"
                      defaultContent={selectedTartan.name}
                      label={`${selectedTartan.title} Badge`}
                      section="attire"
                    />
                  </span>
                </div>
              </div>

              {/* Right Side: Details & Copy */}
              <div className="space-y-4">
                <div className="inline-block px-2.5 py-1 rounded-md bg-tartan-navy text-tartan-gold text-xs font-semibold border border-tartan-accent/30">
                  <EditableElement
                    id={`tartan-${selectedTartan.id}-tag-label`}
                    tag="span"
                    defaultContent="Ideal Matching"
                    label={`${selectedTartan.title} Tag Label`}
                    section="attire"
                  />
                </div>
                
                <EditableElement
                  id={`tartan-${selectedTartan.id}-title`}
                  tag="h3"
                  defaultContent={selectedTartan.title}
                  className="text-2xl font-bold text-white font-serif"
                  label={`${selectedTartan.title} Heading`}
                  section="attire"
                />

                <EditableElement
                  id={`tartan-${selectedTartan.id}-desc`}
                  tag="p"
                  defaultContent={selectedTartan.description}
                  className="text-xs text-gray-300 leading-relaxed"
                  label={`${selectedTartan.title} Description`}
                  section="attire"
                />

                <div className="pt-2">
                  <EditableElement
                    id={`tartan-${selectedTartan.id}-rec-header`}
                    tag="p"
                    defaultContent="Recommended For:"
                    className="text-xs text-tartan-gold font-bold uppercase tracking-wider mb-1"
                    label={`${selectedTartan.title} Recommended Header`}
                    section="attire"
                  />
                  <EditableElement
                    id={`tartan-${selectedTartan.id}-bestfor`}
                    tag="p"
                    defaultContent={selectedTartan.bestFor}
                    className="text-xs text-white font-medium bg-tartan-dark/80 p-2.5 rounded-lg border border-tartan-border/60"
                    label={`${selectedTartan.title} Recommended For`}
                    section="attire"
                  />
                </div>

                <EditableElement
                  id={`tartan-${selectedTartan.id}-btn`}
                  tag="a"
                  defaultContent="Select this Attire in Booking Form"
                  defaultLinkUrl="#booking"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs tracking-wider uppercase shadow-md hover:brightness-110 transition-all mt-2 text-center"
                  label={`${selectedTartan.title} Action Button`}
                  section="attire"
                />
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
