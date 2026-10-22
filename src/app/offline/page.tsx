'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { 
  WifiOff, 
  Sparkles, 
  Music, 
  Shirt, 
  Calendar, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  Volume2, 
  ShieldCheck,
  Compass,
  Camera,
  Star
} from 'lucide-react';
import { SpudHeritageLogo } from '@/components/SpudHeritageLogo';

export default function OfflinePage() {
  const { 
    isOffline, 
    isOfflineShowcaseMode, 
    toggleOfflineShowcaseMode,
    currentPlayingTune, 
    playTune, 
    stopTune, 
    tunesList,
    offlineQueueCount
  } = useApp();

  const showcaseTunes = (tunesList || []).slice(0, 4);

  return (
    <div className="min-h-screen bg-tartan-dark text-white flex flex-col selection:bg-tartan-gold selection:text-tartan-dark">
      
      {/* Top Highland Offline Showcase Bar */}
      <div className="bg-gradient-to-r from-amber-950 via-tartan-card to-amber-950 border-b border-amber-600/40 py-2.5 px-4 text-center">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 text-xs text-amber-200">
          <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-semibold">
            Highland Offline Showcase Mode Active — Full portfolio, tunes &amp; ceremony pricing cached.
          </span>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
        
        {/* Hero Card */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 mb-2">
            <SpudHeritageLogo variant="icon" size="custom" className="w-full h-full" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Castle &amp; Remote Venue Showcase</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-serif text-white uppercase tracking-tight">
            Offline Showcase Mode
          </h1>
          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Performing across Scotland means playing at historic stone castles, Glencoe lochs, and remote Highland glens with zero mobile reception. Spud&apos;s app is specially built to run 100% offline.
          </p>
        </div>

        {/* Offline Status Badge Banner */}
        <div className="bg-tartan-card border border-tartan-accent/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-tartan-border/70 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 shrink-0 shadow-inner">
                <WifiOff className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-serif">Highland Castle Ready</h2>
                <p className="text-xs text-gray-400">
                  {offlineQueueCount > 0 
                    ? `${offlineQueueCount} offline inquiry awaiting auto-sync` 
                    : 'All core features & bagpipe sounds ready without internet'}
                </p>
              </div>
            </div>

            <button
              onClick={() => toggleOfflineShowcaseMode()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-tartan-navy hover:bg-slate-700 text-tartan-gold border border-tartan-accent/50 transition-all"
            >
              {isOfflineShowcaseMode ? 'Exit Test Showcase' : 'Simulate Offline Mode'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-gray-300">
            <div className="flex items-center gap-2 bg-tartan-dark/60 p-3 rounded-xl border border-tartan-border/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Tunes &amp; Audio Chanter Cached</span>
            </div>
            <div className="flex items-center gap-2 bg-tartan-dark/60 p-3 rounded-xl border border-tartan-border/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Full Highland Attire Selector</span>
            </div>
            <div className="flex items-center gap-2 bg-tartan-dark/60 p-3 rounded-xl border border-tartan-border/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Inquiries Queue &amp; Auto-Sync</span>
            </div>
          </div>
        </div>

        {/* Offline Bagpipe Jukebox Sampler */}
        <div className="bg-tartan-navy/70 border border-tartan-accent/40 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Music className="w-5 h-5 text-tartan-gold" />
              <h3 className="font-serif font-bold text-base text-white">Instant Offline Jukebox</h3>
            </div>
            <span className="text-[11px] text-tartan-gold uppercase font-bold tracking-wider">Web Audio Active</span>
          </div>
          <p className="text-xs text-gray-300">
            Sample classic Scottish anthems below. Real recordings or real-time bagpipe synthesizer chanter will play instantly:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {showcaseTunes.map((tune) => {
              const isPlaying = currentPlayingTune === tune.title;
              return (
                <div
                  key={tune.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    isPlaying 
                      ? 'bg-tartan-gold/15 border-tartan-gold text-white shadow-lg' 
                      : 'bg-tartan-dark/80 border-tartan-border/80 text-gray-200 hover:border-tartan-accent'
                  }`}
                >
                  <div className="min-w-0 pr-3">
                    <p className="font-bold text-xs truncate">{tune.title}</p>
                    <p className="text-[10px] text-gray-400 truncate">{tune.category}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (isPlaying) {
                        stopTune();
                      } else {
                        playTune(tune.title);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 transition-transform active:scale-95 ${
                      isPlaying 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gold-gradient text-tartan-dark shadow'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isPlaying ? 'Stop' : 'Play'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Offline Navigation Grid */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-tartan-gold uppercase tracking-wider flex items-center gap-2">
            <Compass className="w-4 h-4" />
            <span>Cached Showcase Sections</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Link
              href="/"
              className="p-4 rounded-2xl bg-tartan-card hover:bg-tartan-dark border border-tartan-border hover:border-tartan-accent transition-all text-center space-y-1.5 group shadow-lg"
            >
              <div className="text-xl">🏰</div>
              <h4 className="font-bold text-xs text-white group-hover:text-tartan-gold transition-colors">Home Page</h4>
              <p className="text-[10px] text-gray-400">Full Highland Overview</p>
            </Link>

            <Link
              href="/tunes"
              className="p-4 rounded-2xl bg-tartan-card hover:bg-tartan-dark border border-tartan-border hover:border-tartan-accent transition-all text-center space-y-1.5 group shadow-lg"
            >
              <div className="text-xl">🎵</div>
              <h4 className="font-bold text-xs text-white group-hover:text-tartan-gold transition-colors">Tunes &amp; Jukebox</h4>
              <p className="text-[10px] text-gray-400">Ceremony &amp; March List</p>
            </Link>

            <Link
              href="/attire"
              className="p-4 rounded-2xl bg-tartan-card hover:bg-tartan-dark border border-tartan-border hover:border-tartan-accent transition-all text-center space-y-1.5 group shadow-lg"
            >
              <div className="text-xl">👔</div>
              <h4 className="font-bold text-xs text-white group-hover:text-tartan-gold transition-colors">Tartan Selector</h4>
              <p className="text-[10px] text-gray-400">Highland Dress Outfits</p>
            </Link>

            <Link
              href="/services"
              className="p-4 rounded-2xl bg-tartan-card hover:bg-tartan-dark border border-tartan-border hover:border-tartan-accent transition-all text-center space-y-1.5 group shadow-lg"
            >
              <div className="text-xl">✨</div>
              <h4 className="font-bold text-xs text-white group-hover:text-tartan-gold transition-colors">Services &amp; Pricing</h4>
              <p className="text-[10px] text-gray-400">Weddings, Funerals &amp; Events</p>
            </Link>

            <Link
              href="/gallery"
              className="p-4 rounded-2xl bg-tartan-card hover:bg-tartan-dark border border-tartan-border hover:border-tartan-accent transition-all text-center space-y-1.5 group shadow-lg"
            >
              <div className="text-xl">📸</div>
              <h4 className="font-bold text-xs text-white group-hover:text-tartan-gold transition-colors">Photo Gallery</h4>
              <p className="text-[10px] text-gray-400">Castles &amp; Gatherings</p>
            </Link>

            <Link
              href="/contact"
              className="p-4 rounded-2xl bg-tartan-card hover:bg-tartan-dark border border-tartan-border hover:border-tartan-accent transition-all text-center space-y-1.5 group shadow-lg"
            >
              <div className="text-xl">📅</div>
              <h4 className="font-bold text-xs text-white group-hover:text-tartan-gold transition-colors">Book / Inquiry</h4>
              <p className="text-[10px] text-gray-400">Queues for Auto-Sync</p>
            </Link>
          </div>
        </div>

        {/* Direct Telephone Info */}
        <div className="bg-tartan-dark/90 rounded-2xl p-5 border border-tartan-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left space-y-1">
            <h4 className="font-bold text-sm text-white flex items-center justify-center sm:justify-start gap-1.5">
              <Phone className="w-4 h-4 text-tartan-gold" />
              <span>Direct Phone &amp; SMS Voice Contact</span>
            </h4>
            <p className="text-xs text-gray-400">
              Cellular voice calls and standard SMS often work in remote castles even when mobile 4G/5G data is down:
            </p>
          </div>
          <a
            href="tel:07793491367"
            className="px-5 py-2.5 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs shadow-lg hover:brightness-110 shrink-0"
          >
            Call Spud: 07793 491367
          </a>
        </div>

      </main>

      {/* Footer Return Link */}
      <footer className="border-t border-tartan-border/60 py-6 text-center text-xs text-gray-400">
        <Link href="/" className="text-tartan-gold hover:underline font-semibold">
          ← Return to Main Spud The Piper Home
        </Link>
      </footer>

    </div>
  );
}
