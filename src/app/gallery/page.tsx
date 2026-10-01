'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Heart,
  Flame,
  Sparkles
} from 'lucide-react';

const ITEMS_PER_PAGE = 15; // 5 rows of 3 on desktop

export default function GalleryPage() {
  const { galleryItems, likeGalleryItem } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortOption, setSortOption] = useState<'likes-desc' | 'date-desc' | 'date-asc' | 'venue-asc' | 'title-asc'>('likes-desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  // Track liked photo IDs in browser local storage
  const [likedIds, setLikedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('spud_liked_gallery_photos');
      if (stored) {
        setLikedIds(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  const handleToggleLike = (e: React.MouseEvent, item: GalleryItem) => {
    e.stopPropagation();
    const isCurrentlyLiked = likedIds.includes(item.id);
    let updated: string[];
    if (isCurrentlyLiked) {
      updated = likedIds.filter(id => id !== item.id);
      likeGalleryItem(item.id, -1);
    } else {
      updated = [...likedIds, item.id];
      likeGalleryItem(item.id, 1);
    }
    setLikedIds(updated);
    try {
      localStorage.setItem('spud_liked_gallery_photos', JSON.stringify(updated));
    } catch (e) {}
  };

  const galleryGridRef = useRef<HTMLDivElement>(null);

  // Extract unique categories for filter dropdown
  const categories = useMemo(() => {
    const set = new Set<string>();
    galleryItems.forEach(item => {
      if (item.eventType && item.eventType.trim()) {
        set.add(item.eventType.trim());
      }
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
      if (sortOption === 'likes-desc') {
        const likesA = typeof a.likes === 'number' ? a.likes : 0;
        const likesB = typeof b.likes === 'number' ? b.likes : 0;
        if (likesB !== likesA) {
          return likesB - likesA;
        }
        // Fallback to date
        return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
      }
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

  // Total pages calculation
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));

  // Current page items (5 rows max)
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    if (galleryGridRef.current) {
      galleryGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  // Lightbox navigation
  const activePhoto: GalleryItem | null = activeLightboxIndex !== null ? filteredItems[activeLightboxIndex] || null : null;

  const handlePrevPhoto = () => {
    if (activeLightboxIndex === null || filteredItems.length === 0) return;
    setActiveLightboxIndex((activeLightboxIndex - 1 + filteredItems.length) % filteredItems.length);
  };

  const handleNextPhoto = () => {
    if (activeLightboxIndex === null || filteredItems.length === 0) return;
    setActiveLightboxIndex((activeLightboxIndex + 1) % filteredItems.length);
  };

  const openLightboxForPaginatedItem = (indexInPaginatedList: number) => {
    const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + indexInPaginatedList;
    setActiveLightboxIndex(globalIndex);
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
      <main ref={galleryGridRef} className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Filter & Sort Controls Bar (No Horizontal Scroll - Clean Dropdowns & Search) */}
        <div className="bg-tartan-navy/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-tartan-border shadow-xl space-y-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            
            {/* Search Input (6 cols on md) */}
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by venue name, mart, location, keyword..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full bg-tartan-dark/95 border border-tartan-border rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-white placeholder-gray-400 focus:outline-none focus:border-tartan-gold transition-colors"
              />
              {searchQuery && (
                <button 
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Dropdown (3 cols on md) */}
            <div className="md:col-span-3 relative">
              <div className="flex items-center gap-1.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-tartan-gold">
                <Filter className="w-3.5 h-3.5" />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full appearance-none bg-tartan-dark/95 border border-tartan-border rounded-xl pl-8 pr-8 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-tartan-gold transition-colors cursor-pointer"
              >
                <option value="All">All Categories ({galleryItems.length})</option>
                {categories.filter(c => c !== 'All').map(cat => {
                  const count = galleryItems.filter(g => g.eventType === cat).length;
                  return (
                    <option key={cat} value={cat}>
                      {cat} ({count})
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort Selector Dropdown (3 cols on md) */}
            <div className="md:col-span-3 relative">
              <div className="flex items-center gap-1.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-tartan-gold">
                <ArrowUpDown className="w-3.5 h-3.5" />
              </div>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="w-full appearance-none bg-tartan-dark/95 border border-tartan-border rounded-xl pl-8 pr-8 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-tartan-gold transition-colors cursor-pointer"
              >
                <option value="likes-desc">🔥 Most Popular (Most Liked)</option>
                <option value="date-desc">Date (Newest First)</option>
                <option value="date-asc">Date (Oldest First)</option>
                <option value="venue-asc">Mart / Venue (A - Z)</option>
                <option value="title-asc">Photo Title (A - Z)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

          </div>

          {/* Active Filter Indicators */}
          {(selectedCategory !== 'All' || searchQuery || sortOption !== 'likes-desc') && (
            <div className="flex items-center gap-2 pt-2 border-t border-tartan-border/50 text-xs flex-wrap">
              <span className="text-gray-400 text-[11px]">Active Filters:</span>
              {selectedCategory !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tartan-accent/30 text-tartan-gold border border-tartan-gold/30 text-[11px]">
                  Category: {selectedCategory}
                  <button onClick={() => handleCategoryChange('All')} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tartan-accent/30 text-tartan-gold border border-tartan-gold/30 text-[11px]">
                  Search: &quot;{searchQuery}&quot;
                  <button onClick={() => handleSearchChange('')} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {sortOption === 'likes-desc' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-950/60 text-rose-300 border border-rose-500/30 text-[11px]">
                  <Flame className="w-3 h-3 text-rose-400" />
                  Sorted by Most Popular
                </span>
              )}
              <button 
                onClick={() => { handleCategoryChange('All'); handleSearchChange(''); setSortOption('likes-desc'); }}
                className="text-[11px] text-gray-400 hover:text-white underline ml-auto"
              >
                Reset All
              </button>
            </div>
          )}
        </div>

        {/* Gallery Results Count & Page Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-400 mb-6 px-1 gap-2">
          <div>
            Showing <strong className="text-tartan-gold">{filteredItems.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}</strong> to <strong className="text-tartan-gold">{Math.min(currentPage * ITEMS_PER_PAGE, filteredItems.length)}</strong> of <strong className="text-white">{filteredItems.length}</strong> photos
          </div>
          {totalPages > 1 && (
            <div className="text-gray-400 text-[11px]">
              Page <strong className="text-tartan-gold">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong> (5 rows per page)
            </div>
          )}
        </div>

        {/* Gallery Grid (Up to 5 rows of 3 columns = 15 cards per page) */}
        {paginatedItems.length === 0 ? (
          <div className="text-center py-20 bg-tartan-navy/40 rounded-3xl border border-dashed border-tartan-border p-8 space-y-3">
            <Camera className="w-12 h-12 text-gray-500 mx-auto opacity-50" />
            <h3 className="text-lg font-bold text-white font-serif">No Photos Found</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              No gallery images match your current search query or filter. Try choosing another category or clearing your search.
            </p>
            <button
              onClick={() => { handleSearchChange(''); handleCategoryChange('All'); }}
              className="mt-2 px-4 py-2 rounded-xl bg-tartan-accent text-white text-xs font-semibold hover:bg-tartan-gold hover:text-tartan-dark transition-all"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {paginatedItems.map((item, idx) => {
              const isLiked = likedIds.includes(item.id);
              const likeCount = typeof item.likes === 'number' ? item.likes : 0;

              return (
                <div
                  key={item.id}
                  onClick={() => openLightboxForPaginatedItem(idx)}
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

                    {/* Top Right: LIKE BUTTON */}
                    <div className="absolute top-3 right-3 z-20">
                      <button
                        type="button"
                        onClick={(e) => handleToggleLike(e, item)}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md flex items-center gap-1.5 transition-all shadow-lg active:scale-95 ${
                          isLiked
                            ? 'bg-rose-600 text-white ring-2 ring-rose-400/80 shadow-rose-600/50'
                            : 'bg-black/75 text-gray-200 hover:text-rose-300 hover:bg-black/90 border border-white/20'
                        }`}
                        title={isLiked ? 'Liked! Click to remove like' : 'Like this photo'}
                      >
                        <Heart className={`w-3.5 h-3.5 transition-transform ${isLiked ? 'fill-white text-white scale-110' : 'text-rose-400'}`} />
                        <span className="font-sans font-semibold">{likeCount}</span>
                      </button>
                    </div>

                    {/* Bottom Right Date Badge */}
                    {item.date && (
                      <div className="absolute bottom-3 right-3 z-10">
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

                    <div className="pt-2.5 flex items-center justify-between text-[11px] text-gray-400 border-t border-tartan-border/60">
                      <span className="text-tartan-gold font-medium group-hover:underline">Click to view in full HD</span>
                      <div className="flex items-center gap-2">
                        {likeCount > 0 && (
                          <span className="text-rose-400 font-semibold flex items-center gap-1">
                            <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />
                            {likeCount} {likeCount === 1 ? 'like' : 'likes'}
                          </span>
                        )}
                        <span className="text-gray-500 font-mono">#{( (currentPage - 1) * ITEMS_PER_PAGE + idx + 1 ).toString().padStart(2, '0')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Multi-Page Pagination Bar (5 Rows per Page) */}
        {totalPages > 1 && (
          <div className="mt-12 pt-6 border-t border-tartan-border flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="text-xs text-gray-400">
              Page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong> (showing 15 photos / 5 rows per page)
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              
              {/* First Page Button */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-tartan-navy border border-tartan-border text-gray-300 hover:text-white hover:border-tartan-gold disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Go to first page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Previous Page Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3.5 py-2 rounded-xl bg-tartan-navy border border-tartan-border text-xs font-semibold text-gray-300 hover:text-white hover:border-tartan-gold disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              {/* Numbered Page Buttons */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  const isCurrent = pageNum === currentPage;
                  // Show current, +/- 1 neighbor, first, and last page
                  if (
                    pageNum === 1 || 
                    pageNum === totalPages || 
                    Math.abs(pageNum - currentPage) <= 1
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                          isCurrent
                            ? 'bg-gold-gradient text-tartan-dark shadow-md scale-105'
                            : 'bg-tartan-navy border border-tartan-border text-gray-300 hover:text-white hover:border-tartan-gold'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  if (
                    pageNum === currentPage - 2 || 
                    pageNum === currentPage + 2
                  ) {
                    return <span key={pageNum} className="text-gray-500 px-1 text-xs">...</span>;
                  }
                  return null;
                })}
              </div>

              {/* Next Page Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3.5 py-2 rounded-xl bg-tartan-navy border border-tartan-border text-xs font-semibold text-gray-300 hover:text-white hover:border-tartan-gold disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* Last Page Button */}
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-tartan-navy border border-tartan-border text-gray-300 hover:text-white hover:border-tartan-gold disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Go to last page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>

            </div>

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

                {/* Like Button in Lightbox */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={(e) => handleToggleLike(e, activePhoto)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all border ${
                      likedIds.includes(activePhoto.id)
                        ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-lg shadow-rose-950/50'
                        : 'bg-tartan-dark border-tartan-border text-gray-300 hover:text-rose-400 hover:border-rose-500/50'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${likedIds.includes(activePhoto.id) ? 'fill-rose-500 text-rose-500' : 'text-rose-400'}`} />
                    <span>{likedIds.includes(activePhoto.id) ? 'Liked by you' : 'Like this photo'} ({typeof activePhoto.likes === 'number' ? activePhoto.likes : 0} likes)</span>
                  </button>
                </div>

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
