'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LiveChatWidget } from '@/components/LiveChatWidget';
import { VisualPencilOverlay } from '@/components/VisualPencilOverlay';
import { useApp } from '@/context/AppContext';
import { GalleryItem } from '@/types/spud';
import { 
  Camera, 
  MapPin, 
  Calendar, 
  Building2, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Maximize2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  ChevronDown
} from 'lucide-react';

export default function GalleryPage() {
  const { galleryItems } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortOption, setSortOption] = useState<'date-desc' | 'date-asc' | 'venue-asc' | 'title-asc'>('date-desc');
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  // Extract unique categories for filter tabs
  const categories = useMemo(() => {
    const set = new Set<string>();
    galleryItems.forEach(item => {
      if (item.eventType) set.add(item.eventType);
    });
    return ['All', ...Array.from(set)];
  }, [galleryItems]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    return galleryItems.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.eventType === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        item.title.toLowerCase().includes(q) ||
        (item.martOrVenueName && item.martOrVenueName.toLowerCase().includes(q)) ||
        (item.location && item.location.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.eventType && item.eventType.toLowerCase().includes(q))
      );
      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortOption === 'date-desc') {
        return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
      }
      if (sortOption === 'date-asc') {
        return new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime();
      }
      if (sortOption === 'venue-asc') {
        return (a.martOrVenueName || '').localeCompare(b.martOrVenueName || '');
      }
      if (sortOption === 'title-asc') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [galleryItems, selectedCategory, searchQuery, sortOption]);

  const activePhoto: GalleryItem | null = activeLightboxIndex !== null ? filteredItems[activeLightboxIndex] || null : null;

  const handlePrevPhoto = () => {
    if (activeLightboxIndex === null || filteredItems.length === 0) return;
    setActiveLightboxIndex((activeLightboxIndex - 1 + filteredItems.length) % filteredItems.length);
  };

  const handleNextPhoto = () => {
    if (activeLightboxIndex === null || filteredItems.length === 0) return;
    setActiveLightboxIndex((activeLightboxIndex + 1) % filteredItems.length);
  };

  return (
    <div className="min-h-screen bg-tartan-dark flex flex-col relative selection:bg-tartan-gold selection:text-tartan-dark">
      <VisualPencilOverlay />
      <Navbar />

      {/* Hero Header Section */}
      <section className="bg-gradient-to-b from-tartan-card via-tartan-navy to-tartan-dark py-14 sm:py-16 border-b border-tartan-border relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tartan-accent/15 border border-tartan-accent/40 text-tartan-gold text-xs font-semibold shadow-inner">
            <Camera className="w-4 h-4 text-tartan-gold" />
            <span>Scottish Venues, Castle Weddings & Highland Gatherings</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white font-serif tracking-tight uppercase">
            Photo Gallery
          </h1>

          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
            A visual showcase of Spud the Piper performing at historic castles, highland gatherings, lochside lodges, and VIP galas across Scotland and beyond.
          </p>
        </div>
      </section>

      {/* Main Gallery Workspace */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Filter & Sort Controls Bar */}
        <div className="bg-tartan-navy/70 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-tartan-border shadow-xl space-y-4 mb-10">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by venue name, mart, location, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-tartan-dark/90 border border-tartan-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-tartan-gold transition-colors"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <ArrowUpDown className="w-4 h-4 text-tartan-gold shrink-0 hidden sm:inline" />
              <span className="text-xs text-gray-300 font-medium shrink-0">Sort By:</span>
              <div className="relative">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as any)}
                  className="appearance-none bg-tartan-dark/90 border border-tartan-border rounded-xl px-4 py-2.5 pr-8 text-xs font-semibold text-white focus:outline-none focus:border-tartan-gold transition-colors cursor-pointer"
                >
                  <option value="date-desc">Date (Newest First)</option>
                  <option value="date-asc">Date (Oldest First)</option>
                  <option value="venue-asc">Mart / Venue Name (A-Z)</option>
                  <option value="title-asc">Photo Title (A-Z)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <Filter className="w-3.5 h-3.5 text-tartan-gold shrink-0 ml-1 mr-1" />
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                    active
                      ? 'bg-tartan-accent text-white font-bold shadow-md ring-1 ring-tartan-gold'
                      : 'bg-tartan-dark/70 text-gray-300 hover:text-white hover:bg-tartan-dark border border-tartan-border/70'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Gallery Results Count */}
        <div className="flex items-center justify-between text-xs text-gray-400 mb-6 px-1">
          <span>Showing <strong className="text-tartan-gold">{filteredItems.length}</strong> photo{filteredItems.length === 1 ? '' : 's'}</span>
          {selectedCategory !== 'All' && (
            <button 
              onClick={() => setSelectedCategory('All')} 
              className="text-tartan-gold hover:underline text-xs font-semibold"
            >
              Reset Category
            </button>
          )}
        </div>

        {/* Gallery Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-tartan-navy/40 rounded-3xl border border-dashed border-tartan-border p-8 space-y-3">
            <Camera className="w-12 h-12 text-gray-500 mx-auto opacity-50" />
            <h3 className="text-lg font-bold text-white font-serif">No Photos Found</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              No gallery images match your current search query or filter. Try clearing your filters or search for another venue.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="mt-2 px-4 py-2 rounded-xl bg-tartan-accent text-white text-xs font-semibold hover:bg-tartan-gold hover:text-tartan-dark transition-all"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setActiveLightboxIndex(idx)}
                className="group relative bg-tartan-navy rounded-2xl overflow-hidden border border-tartan-border shadow-lg hover:shadow-2xl hover:border-tartan-gold/50 transition-all duration-300 cursor-pointer flex flex-col transform hover:-translate-y-1"
              >
                {/* Photo Frame */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  
                  {/* Top Badge: Event Type */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-[11px] font-bold text-tartan-gold border border-tartan-gold/30 shadow-md">
                      {item.eventType || 'Scottish Event'}
                    </span>
                  </div>

                  {/* Top Date Badge */}
                  {item.date && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-[11px] font-medium text-gray-200 border border-white/10 shadow-md flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-tartan-gold" />
                        {new Date(item.date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  )}

                  {/* Hover Zoom Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-11 h-11 rounded-full bg-tartan-gold/90 text-tartan-dark flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
                      <Maximize2 className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Content Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    {/* Venue / Mart Name */}
                    {item.martOrVenueName && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-tartan-gold">
                        <Building2 className="w-3.5 h-3.5 shrink-0 text-tartan-gold" />
                        <span className="truncate">{item.martOrVenueName}</span>
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="text-base font-bold text-white font-serif group-hover:text-tartan-gold transition-colors line-clamp-1">
                      {item.title}
                    </h3>

                    {/* Location */}
                    {item.location && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-300">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </div>
                    )}

                    {/* Description */}
                    {item.description && (
                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed pt-1">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-gray-400 border-t border-tartan-border/60">
                    <span className="text-tartan-gold font-medium group-hover:underline">Click to view in full HD</span>
                    <span className="text-gray-300">#{(idx + 1).toString().padStart(2, '0')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          
          {/* Close Button */}
          <button
            onClick={() => setActiveLightboxIndex(null)}
            className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all shadow-lg focus:outline-none"
            title="Close viewer"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous Button */}
          <button
            onClick={handlePrevPhoto}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-tartan-gold hover:text-tartan-dark text-white transition-all shadow-xl focus:outline-none"
            title="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next Button */}
          <button
            onClick={handleNextPhoto}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-tartan-gold hover:text-tartan-dark text-white transition-all shadow-xl focus:outline-none"
            title="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Lightbox Content Container */}
          <div className="max-w-6xl w-full max-h-[90vh] bg-tartan-navy rounded-3xl overflow-hidden border border-tartan-border shadow-2xl flex flex-col lg:flex-row">
            
            {/* Image Preview Container */}
            <div className="relative flex-1 bg-black flex items-center justify-center min-h-[300px] lg:min-h-[500px]">
              <img
                src={activePhoto.imageUrl}
                alt={activePhoto.title}
                className="max-h-[60vh] lg:max-h-[80vh] max-w-full object-contain"
              />
            </div>

            {/* Sidebar Details */}
            <div className="w-full lg:w-96 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-tartan-card border-t lg:border-t-0 lg:border-l border-tartan-border overflow-y-auto">
              <div className="space-y-4">
                
                {/* Event Type & Date */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full bg-tartan-accent/30 text-tartan-gold text-xs font-bold border border-tartan-gold/30">
                    {activePhoto.eventType || 'Highland Event'}
                  </span>
                  {activePhoto.date && (
                    <span className="text-xs text-gray-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-tartan-gold" />
                      {new Date(activePhoto.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2 className="text-2xl font-extrabold text-white font-serif leading-tight">
                  {activePhoto.title}
                </h2>

                {/* Mart / Venue Name */}
                {activePhoto.martOrVenueName && (
                  <div className="p-3 rounded-xl bg-tartan-dark/70 border border-tartan-border space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Mart / Venue</span>
                    <div className="flex items-center gap-2 text-sm font-bold text-tartan-gold">
                      <Building2 className="w-4 h-4 text-tartan-gold shrink-0" />
                      <span>{activePhoto.martOrVenueName}</span>
                    </div>
                  </div>
                )}

                {/* Location */}
                {activePhoto.location && (
                  <div className="flex items-start gap-2 text-xs text-gray-300">
                    <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{activePhoto.location}</span>
                  </div>
                )}

                {/* Description */}
                {activePhoto.description && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Event Details & Story</span>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {activePhoto.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-tartan-border space-y-3">
                <Link
                  href="/booking"
                  className="w-full py-3 px-4 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider text-center shadow-lg hover:brightness-110 flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Spud for this Venue</span>
                </Link>

                <div className="text-center">
                  <span className="text-[11px] text-gray-400">
                    Photo {(activeLightboxIndex! + 1)} of {filteredItems.length}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Booking CTA Bar */}
      <section className="py-14 bg-tartan-navy border-t border-tartan-border text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif">
            Planning an event at a Scottish castle or venue?
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto font-light">
            Bring the authentic sound and majestic spectacle of the Great Highland Bagpipe to your special day.
          </p>
          <div className="pt-2 flex items-center justify-center gap-4">
            <Link
              href="/booking"
              className="px-6 py-3.5 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xl hover:brightness-110 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Check Availability & Book Online</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <LiveChatWidget />
    </div>
  );
}
