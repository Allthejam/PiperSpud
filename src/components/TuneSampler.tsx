'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Music, Play, Square, Volume2, Sparkles, Filter, Check } from 'lucide-react';
import { BagpipeTune } from '@/types/spud';
import { EditableElement } from './EditableElement';

export const TuneSampler: React.FC = () => {
  const { tunesList, currentPlayingTune, playTune, stopTune } = useApp();
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Wedding', 'Lament / Funeral', 'Celebration / March', 'Traditional Scottish'];

  const filteredTunes = activeCategory === 'All' 
    ? tunesList 
    : tunesList.filter(t => t.category === activeCategory);

  return (
    <section id="tunes" className="py-20 bg-tartan-dark relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tartan-accent/15 border border-tartan-accent/40 text-tartan-gold text-xs font-semibold">
            <Music className="w-4 h-4 shrink-0" />
            <EditableElement
              id="tunes-header-badge"
              tag="span"
              defaultContent="Interactive Bagpipe Jukebox"
              label="Tunes Header Badge"
              section="tunes"
            />
          </div>
          <EditableElement
            id="tunes-header-title"
            tag="h2"
            defaultContent="Listen to the Authentic Sound of the Highlands"
            className="text-3xl sm:text-5xl font-extrabold text-white font-serif tracking-tight"
            label="Tunes Header Title"
            section="tunes"
          />
          <EditableElement
            id="tunes-header-desc"
            tag="p"
            defaultContent="Preview iconic bagpipe tunes synthesized in real-time. Choose your favorite processional, celebratory march, or solemn lament for your special occasion."
            className="text-base text-gray-300"
            label="Tunes Header Description"
            section="tunes"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center justify-center flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-gold-gradient text-tartan-dark shadow-lg scale-105'
                  : 'bg-tartan-card text-gray-300 hover:bg-tartan-navy border border-tartan-border/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Jukebox Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTunes.map((tune: BagpipeTune) => {
            const isThisPlaying = currentPlayingTune === tune.title;

            return (
              <div
                key={tune.id}
                className={`bg-tartan-card rounded-2xl p-6 border transition-all relative overflow-hidden flex flex-col justify-between shadow-xl ${
                  isThisPlaying 
                    ? 'border-tartan-gold ring-2 ring-tartan-gold/50 shadow-yellow-500/10' 
                    : 'border-tartan-border/60 hover:border-tartan-accent/50'
                }`}
              >
                {/* Active Playing Wave Graphic */}
                {isThisPlaying && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-tartan-accent via-yellow-400 to-tartan-gold animate-pulse"></div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-tartan-navy text-tartan-gold border border-tartan-accent/30 uppercase tracking-wider">
                      {tune.category}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">{tune.duration}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white font-serif">{tune.title}</h3>
                  <p className="text-xs text-gray-300 leading-relaxed">{tune.description}</p>
                </div>

                {/* Player Controls */}
                <div className="mt-6 pt-4 border-t border-tartan-border/50 flex items-center justify-between">
                  <button
                    onClick={() => {
                      if (isThisPlaying) {
                        stopTune();
                      } else {
                        playTune(tune.title);
                      }
                    }}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
                      isThisPlaying
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-gold-gradient hover:brightness-110 text-tartan-dark'
                    }`}
                  >
                    {isThisPlaying ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-white" />
                        <span>Stop Bagpipes</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-tartan-dark" />
                        <span>Play Tune Sample</span>
                      </>
                    )}
                  </button>

                  {isThisPlaying && (
                    <div className="flex items-center gap-1.5 text-xs text-tartan-gold font-medium">
                      <Volume2 className="w-4 h-4 animate-bounce" />
                      <span>Live Sound</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Tune Request Banner */}
        <div className="mt-12 bg-tartan-navy/70 rounded-2xl p-6 border border-tartan-border text-center max-w-2xl mx-auto space-y-2">
          <p className="text-sm text-gray-200">
            <span className="text-tartan-gold font-bold">Have a special song or family tune in mind?</span> Spud accommodates custom tune requests for weddings, graduations, and memorials.
          </p>
          <a
            href="#contact"
            className="inline-block text-xs font-bold text-tartan-goldLight hover:underline mt-1"
          >
            Ask Spud about special tune arrangements →
          </a>
        </div>

      </div>
    </section>
  );
};
