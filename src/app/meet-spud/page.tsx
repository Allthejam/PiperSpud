'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LiveChatWidget } from '@/components/LiveChatWidget';
import { VisualPencilOverlay } from '@/components/VisualPencilOverlay';
import { EditableElement } from '@/components/EditableElement';
import { SpudHeritageLogo } from '@/components/SpudHeritageLogo';
import { useApp } from '@/context/AppContext';
import { initialVideos } from '@/lib/initialData';
import { VideoItem } from '@/types/spud';
import Link from 'next/link';
import { 
  Play, 
  Youtube, 
  Calendar, 
  Music, 
  Sparkles, 
  Shirt, 
  ExternalLink, 
  Award, 
  CheckCircle2, 
  Volume2, 
  MessageCircle,
  Compass,
  Heart
} from 'lucide-react';

export default function MeetSpudPage() {
  const { videos, isAdminLoggedIn, isVisualEditMode } = useApp();
  const currentVideos = (videos && videos.length > 0) ? videos : initialVideos;

  // Filter categories
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Featured Hero Video (either marked featured or first video)
  const heroVideo = currentVideos.find(v => v.isFeatured) || currentVideos[0];
  const [activePlayingId, setActivePlayingId] = useState<string>(heroVideo?.youtubeId || '38zXOmwZVBA');
  const activeVideoObj = currentVideos.find(v => v.youtubeId === activePlayingId) || heroVideo;

  const categories = ['All', 'Introductions & Speaking', 'Live Castle Piping', 'Traditions & Stories', 'Weddings & Celebrations'];

  const filteredVideos = selectedCategory === 'All'
    ? currentVideos
    : currentVideos.filter(v => v.category === selectedCategory);

  return (
    <div className="min-h-screen bg-tartan-dark flex flex-col relative">
      <VisualPencilOverlay />
      <Navbar />

      {/* Hero Header */}
      <div className="bg-gradient-to-b from-tartan-card via-tartan-navy to-tartan-dark py-14 sm:py-20 border-b border-tartan-border relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 relative z-10">
          <div className="mx-auto w-20 h-20 mb-2">
            <SpudHeritageLogo variant="icon" size="custom" className="w-full h-full" />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-semibold shadow-lg">
            <Youtube className="w-4 h-4 text-red-500" />
            <span>Spud The Piper • Live Video & Story Hub</span>
          </div>

          <EditableElement
            id="meet-spud-title"
            tag="h1"
            defaultContent="Meet Spud The Piper"
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white font-serif tracking-tight uppercase"
            label="Meet Spud Page Title"
            section="meet-spud"
          />

          <EditableElement
            id="meet-spud-subtitle"
            tag="p"
            defaultContent="Hear Spud introduce himself, talk about his Scottish piping roots, explain Highland bagpipe traditions, and watch live performances from castles across the realm."
            className="text-base sm:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed"
            label="Meet Spud Page Subtitle"
            section="meet-spud"
          />

          {/* Quick Stats Banner */}
          <div className="pt-4 flex items-center justify-center gap-4 sm:gap-8 flex-wrap text-xs text-gray-300">
            <div className="flex items-center gap-2 bg-tartan-card/80 px-4 py-2 rounded-xl border border-tartan-border">
              <Award className="w-4 h-4 text-tartan-gold" />
              <span><strong>25+ Years</strong> Piping Master</span>
            </div>
            <div className="flex items-center gap-2 bg-tartan-card/80 px-4 py-2 rounded-xl border border-tartan-border">
              <Sparkles className="w-4 h-4 text-tartan-gold" />
              <span>Piper to the Stars</span>
            </div>
            <div className="flex items-center gap-2 bg-tartan-card/80 px-4 py-2 rounded-xl border border-tartan-border">
              <Volume2 className="w-4 h-4 text-tartan-gold" />
              <span>Full No. 1 Regalia & Audio</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Video Showcase Player */}
      <section className="py-12 bg-tartan-navy/60 border-b border-tartan-border relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-tartan-card rounded-3xl p-4 sm:p-8 border border-tartan-gold/50 shadow-2xl space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-tartan-border/60 pb-4">
              <div>
                <span className="text-xs font-bold text-tartan-gold uppercase tracking-wider flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 fill-tartan-gold text-tartan-gold" />
                  <span>Now Playing in Showcase</span>
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white font-serif mt-1">
                  {activeVideoObj?.title || 'Introducing Spud The Piper'}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-tartan-navy text-tartan-gold border border-tartan-border">
                  {activeVideoObj?.category}
                </span>
                {activeVideoObj?.youtubeUrl && (
                  <a
                    href={activeVideoObj.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-300 text-xs font-bold rounded-full border border-red-500/40 flex items-center gap-1 transition"
                  >
                    <span>Open in YouTube</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Embedded 16:9 Responsive YouTube Player */}
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-black shadow-2xl border border-tartan-border">
              <iframe
                src={`https://www.youtube.com/embed/${activePlayingId}?autoplay=1&rel=0`}
                title={activeVideoObj?.title || 'Spud The Piper Video'}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Video Bio & Description */}
            <div className="bg-tartan-dark/70 rounded-2xl p-5 border border-tartan-border space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-tartan-gold">
                <MessageCircle className="w-4 h-4" />
                <span>Video Notes & Introduction:</span>
              </div>
              <p className="text-sm text-gray-200 leading-relaxed font-sans">
                {activeVideoObj?.description || 'Listen to Spud the Piper speak about his love for Scottish piping, Highland wedding ceremonies, military regalia, and bringing joy to people through Scotland\'s iconic instrument.'}
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Video Gallery Grid & Categorized Playlists */}
      <section className="py-16 bg-tartan-dark flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-tartan-border pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-tartan-gold uppercase tracking-wider mb-1">
                <Youtube className="w-4 h-4 text-red-500" />
                <span>Spud\'s Video Library</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-serif">
                Select a Video to Watch
              </h3>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory === cat
                      ? 'bg-gold-gradient text-tartan-dark shadow-md'
                      : 'bg-tartan-card text-gray-300 hover:text-white border border-tartan-border hover:border-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Videos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => {
              const isCurrent = activePlayingId === video.youtubeId;
              const thumbUrl = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;

              return (
                <div
                  key={video.id}
                  onClick={() => {
                    setActivePlayingId(video.youtubeId);
                    window.scrollTo({ top: 320, behavior: 'smooth' });
                  }}
                  className={`bg-tartan-card rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer group flex flex-col ${
                    isCurrent
                      ? 'border-tartan-gold ring-2 ring-tartan-gold/50 shadow-2xl scale-[1.02]'
                      : 'border-tartan-border hover:border-tartan-gold/60 hover:shadow-xl'
                  }`}
                >
                  {/* Thumbnail with Play Overlay */}
                  <div className="relative aspect-video bg-black overflow-hidden">
                    <img 
                      src={thumbUrl} 
                      alt={video.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all ${
                        isCurrent 
                          ? 'bg-tartan-gold text-tartan-dark scale-110' 
                          : 'bg-black/60 text-white group-hover:bg-red-600 group-hover:scale-110'
                      }`}>
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                    
                    {video.isFeatured && (
                      <span className="absolute top-2 left-2 bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md">
                        Featured Intro
                      </span>
                    )}

                    <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[11px] font-mono px-2 py-0.5 rounded-md">
                      YouTube
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-tartan-gold uppercase tracking-wider">
                        {video.category}
                      </span>
                      <h4 className="text-base font-bold text-white font-serif line-clamp-2 group-hover:text-tartan-gold transition-colors">
                        {video.title}
                      </h4>
                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                        {video.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-tartan-border/60 flex items-center justify-between text-xs">
                      <span className={`font-semibold flex items-center gap-1 ${isCurrent ? 'text-tartan-gold' : 'text-gray-400 group-hover:text-white'}`}>
                        {isCurrent ? '● Now Playing' : 'Click to Watch'}
                      </span>
                      <span className="text-[11px] text-gray-500 underline group-hover:text-tartan-gold transition">
                        Watch video &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* About Spud Personal Story Highlight */}
          <div className="mt-12 bg-gradient-to-r from-tartan-card via-tartan-navy to-tartan-card rounded-3xl p-6 sm:p-10 border border-tartan-border shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tartan-gold/10 border border-tartan-gold/30 text-tartan-gold text-xs font-semibold">
                  <Award className="w-4 h-4" />
                  <span>The Man Behind the Music</span>
                </div>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-white font-serif">
                  Highland Passion, Warm Scottish Banter & Masterful Piping
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Callum &quot;Spud&quot; Fraser has been playing the Great Highland Bagpipe since childhood in the Scottish Highlands. Known for his charismatic presence, razor-sharp punctuality, and deep warmth, Spud doesn&apos;t just play music — he elevates the entire spirit of an occasion. From piping the Queen&apos;s royal visits and state banquets to playing in ancient castles and welcoming tour parties arriving in Scotland, Spud brings the true soul of the Highlands to every note.
                </p>
                <div className="pt-2 flex items-center gap-4 flex-wrap">
                  <Link
                    href="/about"
                    className="text-xs font-bold text-tartan-gold hover:text-white underline flex items-center gap-1"
                  >
                    <span>Read full 25-Year Biography & Piping Honours</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-3">
                <Link
                  href="/booking"
                  className="w-full py-3.5 px-6 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider text-center shadow-xl hover:brightness-110 flex items-center justify-center gap-2 transition"
                >
                  <Calendar className="w-4 h-4 text-tartan-dark" />
                  <span>Check Spud&apos;s Diary for Your Event</span>
                </Link>
                <Link
                  href="/tunes"
                  className="w-full py-3.5 px-6 rounded-xl bg-tartan-card hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider text-center border border-tartan-border flex items-center justify-center gap-2 transition"
                >
                  <Music className="w-4 h-4 text-tartan-gold" />
                  <span>Listen to 25+ Audio Samples</span>
                </Link>
                <Link
                  href="/tour-groups"
                  className="w-full py-3.5 px-6 rounded-xl bg-tartan-navy hover:bg-slate-700 text-amber-300 font-bold text-xs uppercase tracking-wider text-center border border-tartan-border flex items-center justify-center gap-2 transition"
                >
                  <Compass className="w-4 h-4" />
                  <span>Tour & Coach Group Bookings</span>
                </Link>
              </div>

            </div>
          </div>

        </div>
      </section>

      <Footer />
      <LiveChatWidget />
    </div>
  );
}
