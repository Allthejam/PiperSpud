'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LiveChatWidget } from '@/components/LiveChatWidget';
import { VisualPencilOverlay } from '@/components/VisualPencilOverlay';
import { SpudHeritageLogo } from '@/components/SpudHeritageLogo';
import { useApp } from '@/context/AppContext';
import { BlogPost, BLOG_SERVICE_CATEGORIES } from '@/types/spud';
import { initialBlogPosts } from '@/lib/initialData';
import Link from 'next/link';
import { 
  Play, 
  Youtube, 
  Calendar, 
  Music, 
  Sparkles, 
  Shirt, 
  ExternalLink, 
  MapPin, 
  Clock, 
  Share2, 
  Copy, 
  Check, 
  Heart, 
  Eye, 
  Search, 
  X, 
  BookOpen, 
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';

function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  const clean = url.trim();
  const shortMatch = clean.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  const longMatch = clean.match(/(?:watch\?v=|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  if (longMatch) return longMatch[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) return clean;
  return null;
}

const LIKED_STORAGE_KEY = 'spud_blog_liked_ids';

function BlogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { blogPosts, likeBlogPost, recordBlogPostView } = useApp();

  const currentPosts = (blogPosts && blogPosts.length > 0) ? blogPosts : initialBlogPosts;
  const publishedPosts = useMemo(() => {
    return currentPosts
      .filter(p => p.isPublished)
      .sort((a, b) => new Date(b.publishDate || b.createdAt || 0).getTime() - new Date(a.publishDate || a.createdAt || 0).getTime());
  }, [currentPosts]);

  // Query Param for direct story reading (e.g. ?story=slug)
  const storyParam = searchParams.get('story');
  const categoryParam = searchParams.get('category');

  // Selected Category filter
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'All');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStoryModal, setActiveStoryModal] = useState<BlogPost | null>(null);
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  // Load visitor's liked posts from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LIKED_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setLikedPosts(new Set(parsed));
        }
      }
    } catch (e) {}
  }, []);

  // Available categories: "All" + Core 7 + any extra categories present in posts
  const allCategories = useMemo(() => {
    const set = new Set<string>(['All', ...BLOG_SERVICE_CATEGORIES]);
    publishedPosts.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [publishedPosts]);

  // Auto-open story modal if ?story=slug matches
  useEffect(() => {
    if (storyParam && publishedPosts.length > 0) {
      const match = publishedPosts.find(p => p.slug === storyParam || p.id === storyParam);
      if (match) {
        setActiveStoryModal(match);
        if (recordBlogPostView) {
          recordBlogPostView(match.id);
        }
      }
    }
  }, [storyParam, publishedPosts, recordBlogPostView]);

  // Featured Hero Post: either pinned featured or the most recent post
  const featuredPost = useMemo(() => {
    return publishedPosts.find(p => p.isFeatured) || publishedPosts[0];
  }, [publishedPosts]);

  // Filtered post list (excluding the featured post from the grid if on "All" without search)
  const filteredPosts = useMemo(() => {
    return publishedPosts.filter(p => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const inTitle = (p.title || '').toLowerCase().includes(q);
        const inContent = (p.content || '').toLowerCase().includes(q);
        const inVenue = (p.venueName || '').toLowerCase().includes(q);
        const inLocation = (p.venueLocation || '').toLowerCase().includes(q);
        const inTartan = (p.tartanChoice || '').toLowerCase().includes(q);
        const inTunes = (p.tunesPlayed || []).some(t => t.toLowerCase().includes(q));
        if (!inTitle && !inContent && !inVenue && !inLocation && !inTartan && !inTunes) {
          return false;
        }
      }
      return true;
    });
  }, [publishedPosts, selectedCategory, searchTerm]);

  // Open Story Modal and update URL smoothly
  const handleOpenStory = (post: BlogPost) => {
    setActiveStoryModal(post);
    if (recordBlogPostView) {
      recordBlogPostView(post.id);
    }
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `/blog?story=${post.slug}`);
    }
  };

  // Close Story Modal and restore URL
  const handleCloseStory = () => {
    setActiveStoryModal(null);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/blog');
    }
  };

  // Like or unlike a post with localStorage persistence
  const handleLike = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    const isCurrentlyLiked = likedPosts.has(postId);
    const updated = new Set(likedPosts);
    if (isCurrentlyLiked) {
      updated.delete(postId);
      setLikedPosts(updated);
      try {
        localStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify(Array.from(updated)));
      } catch (err) {}
      likeBlogPost(postId, -1);
    } else {
      updated.add(postId);
      setLikedPosts(updated);
      try {
        localStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify(Array.from(updated)));
      } catch (err) {}
      likeBlogPost(postId, 1);
    }
  };

  // 1-Click Social Sharing
  const handleShareFacebook = (e: React.MouseEvent, post: BlogPost) => {
    e.stopPropagation();
    const url = `https://spudthepiper.com/blog?story=${post.slug}`;
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(fbUrl, '_blank', 'width=600,height=500');
  };

  const handleShareWhatsApp = (e: React.MouseEvent, post: BlogPost) => {
    e.stopPropagation();
    const url = `https://spudthepiper.com/blog?story=${post.slug}`;
    const text = `Check out this Highland wedding story & bagpipe video from Spud the Piper: "${post.title}"! ${url}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const handleCopyLink = (e: React.MouseEvent, post: BlogPost) => {
    e.stopPropagation();
    const url = `https://spudthepiper.com/blog?story=${post.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedShareId(post.id);
    setTimeout(() => {
      setCopiedShareId(null);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-tartan-dark flex flex-col relative text-gray-100 font-sans">
      <VisualPencilOverlay />
      <Navbar />

      {/* 1. Hero Header Banner */}
      <section className="bg-gradient-to-b from-tartan-card via-tartan-navy to-tartan-dark py-14 sm:py-20 border-b border-tartan-border relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 relative z-10">
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 mb-2">
            <SpudHeritageLogo variant="icon" size="custom" className="w-full h-full" />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tartan-gold/10 border border-tartan-gold/30 text-tartan-gold text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5 text-tartan-gold" />
            <span>Spud&apos;s Official Highland Video Diary &amp; Wedding Blog</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white font-serif tracking-tight max-w-4xl mx-auto">
            Castle Weddings, Highland Stories &amp; Bagpipe Adventures
          </h1>

          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
            From romantic castle vows at Eilean Donan to interactive bagpipe masterclasses on the shores of Loch Lomond — watch the videos, read the stories, and feel the soul of Scotland.
          </p>

          {/* Direct Contact / Booking quick link */}
          <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/booking"
              className="px-6 py-3 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl hover:brightness-110 active:scale-95 transition-all"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Check Spud&apos;s Availability for Your Date</span>
            </Link>
            <Link
              href="/services"
              className="px-5 py-3 rounded-xl bg-tartan-card hover:bg-tartan-navy text-gray-200 border border-tartan-border text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <span>Explore All Services &amp; Packages →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12 flex-1 w-full">

        {/* 3. Featured Hero Post Spotlight */}
        {featuredPost && !searchTerm && selectedCategory === 'All' && (
          <div className="bg-gradient-to-br from-tartan-card via-tartan-navy to-tartan-dark rounded-3xl border border-tartan-accent/50 p-6 sm:p-8 lg:p-10 shadow-2xl overflow-hidden relative group">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Media Left Column (YouTube Embed or Cinematic Cover) */}
              <div className="lg:col-span-7">
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-tartan-border/80 shadow-2xl bg-black group-hover:border-tartan-gold/60 transition-all">
                  {featuredPost.youtubeId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${featuredPost.youtubeId}?rel=0`}
                      title={featuredPost.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <img
                      src={featuredPost.featuredImageUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=80'}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>

              {/* Text & Story Details Right Column */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-tartan-gold/20 text-tartan-gold border border-tartan-gold/40">
                    Featured Highland Story
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 text-gray-300 border border-tartan-border">
                    {featuredPost.category}
                  </span>
                </div>

                <h2 
                  onClick={() => handleOpenStory(featuredPost)}
                  className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight cursor-pointer hover:text-tartan-gold transition-colors"
                >
                  {featuredPost.title}
                </h2>

                {featuredPost.subtitle && (
                  <p className="text-xs sm:text-sm text-tartan-gold/90 italic">
                    {featuredPost.subtitle}
                  </p>
                )}

                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed line-clamp-3">
                  {featuredPost.excerpt || featuredPost.content}
                </p>

                {/* Event Metadata Chips */}
                <div className="pt-1 flex flex-wrap gap-2 text-xs">
                  {featuredPost.venueName && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-tartan-dark border border-tartan-border text-gray-200">
                      <MapPin className="w-3.5 h-3.5 text-tartan-gold shrink-0" />
                      <span className="font-semibold">{featuredPost.venueName}</span>
                    </div>
                  )}
                  {featuredPost.tartanChoice && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-tartan-dark border border-tartan-border text-gray-200">
                      <Shirt className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{featuredPost.tartanChoice}</span>
                    </div>
                  )}
                </div>

                {/* CTA & Social Actions */}
                <div className="pt-3 flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => handleOpenStory(featuredPost)}
                    className="px-5 py-2.5 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all"
                  >
                    <span>Read Full Story</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Share & Like buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Like button on Featured Post */}
                    {(() => {
                      const isLiked = likedPosts.has(featuredPost.id);
                      return (
                        <button
                          onClick={(e) => handleLike(e, featuredPost.id)}
                          className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isLiked
                              ? 'bg-rose-950/60 border-rose-500/50 text-rose-400'
                              : 'bg-tartan-dark hover:bg-slate-700 text-gray-300 hover:text-rose-400 border-tartan-border'
                          }`}
                          title={isLiked ? 'Liked! Click to remove like' : 'Like this story'}
                        >
                          <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
                          <span>{featuredPost.likes || 0}</span>
                        </button>
                      );
                    })()}

                    <button
                      onClick={(e) => handleShareFacebook(e, featuredPost)}
                      className="p-2.5 rounded-xl bg-[#1877F2]/15 hover:bg-[#1877F2] text-[#1877F2] hover:text-white border border-[#1877F2]/30 transition-all"
                      title="Share to Facebook"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </button>
                    <button
                      onClick={(e) => handleShareWhatsApp(e, featuredPost)}
                      className="p-2.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-white border border-[#25D366]/30 transition-all"
                      title="Share to WhatsApp"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                      </svg>
                    </button>
                    <button
                      onClick={(e) => handleCopyLink(e, featuredPost)}
                      className="p-2.5 rounded-xl bg-tartan-dark hover:bg-slate-700 text-gray-300 hover:text-white border border-tartan-border transition-all"
                      title="Copy Story Link"
                    >
                      {copiedShareId === featuredPost.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* 4. Filter & Search Bar */}
        <div className="space-y-4">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Category Pills (Scrollable on Mobile) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto scrollbar-thin">
              {allCategories.map(cat => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
                      isSelected
                        ? 'bg-tartan-gold text-tartan-dark border-tartan-gold font-bold shadow-lg shadow-tartan-gold/20'
                        : 'bg-tartan-card text-gray-300 border-tartan-border hover:border-tartan-accent/60 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72 shrink-0">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search stories, tunes, venues..."
                className="w-full pl-9.5 pr-4 py-2 bg-tartan-card border border-tartan-border rounded-xl text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-tartan-accent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>

          {/* Active Filter Summary */}
          {(selectedCategory !== 'All' || searchTerm) && (
            <div className="flex items-center justify-between text-xs text-gray-400 bg-tartan-card/60 p-3 rounded-xl border border-tartan-border">
              <span>
                Showing <strong>{filteredPosts.length}</strong> {filteredPosts.length === 1 ? 'story' : 'stories'}
                {selectedCategory !== 'All' && <span> in <strong>{selectedCategory}</strong></span>}
                {searchTerm && <span> matching &ldquo;<strong>{searchTerm}</strong>&rdquo;</span>}
              </span>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchTerm('');
                }}
                className="text-tartan-gold hover:underline font-semibold"
              >
                Reset Filters
              </button>
            </div>
          )}

        </div>

        {/* 5. Responsive Stories Grid */}
        {filteredPosts.length === 0 ? (
          <div className="p-16 rounded-3xl bg-tartan-card border border-dashed border-tartan-border text-center space-y-4">
            <BookOpen className="w-12 h-12 text-gray-500 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white font-serif">No stories found</h3>
              <p className="text-xs text-gray-400">
                Try selecting a different category or clearing your search term.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchTerm('');
              }}
              className="px-4 py-2 rounded-xl bg-gold-gradient text-tartan-dark text-xs font-bold"
            >
              View All Stories
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => {
              const hasVideo = Boolean(post.youtubeId || post.youtubeUrl);
              const thumbUrl = post.featuredImageUrl || (post.youtubeId ? `https://img.youtube.com/vi/${post.youtubeId}/hqdefault.jpg` : '');
              const isLiked = likedPosts.has(post.id);

              return (
                <article
                  key={post.id}
                  onClick={() => handleOpenStory(post)}
                  className="rounded-3xl bg-tartan-card border border-tartan-border shadow-xl hover:border-tartan-accent/60 transition-all flex flex-col overflow-hidden group cursor-pointer hover:shadow-2xl hover:-translate-y-1 duration-200"
                >
                  {/* Thumbnail / Video Banner */}
                  <div className="relative aspect-video bg-black overflow-hidden">
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-tartan-navy text-gray-500">
                        <BookOpen className="w-10 h-10" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-tartan-dark via-black/25 to-transparent" />

                    {/* Category Pill Top Left */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-tartan-gold border border-tartan-gold/30 shadow">
                        {post.category}
                      </span>
                    </div>

                    {/* YouTube Video Badge */}
                    {hasVideo && (
                      <div className="absolute bottom-3 left-3 px-2 py-1 rounded-lg bg-red-600/90 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 shadow">
                        <Play className="w-3 h-3 fill-white" />
                        <span>Video Story</span>
                      </div>
                    )}

                    {/* Read Time */}
                    <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-gray-300 text-[10px] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-tartan-gold" />
                      <span>{post.readTimeMinutes || 3} min</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[11px] text-gray-400">
                        <Calendar className="w-3 h-3 text-tartan-gold" />
                        <span>{post.publishDate}</span>
                        <span>•</span>
                        <span>{post.author || 'Spud The Piper'}</span>
                      </div>

                      <h3 className="text-lg font-bold text-white font-serif line-clamp-2 group-hover:text-tartan-gold transition-colors leading-snug">
                        {post.title}
                      </h3>

                      {post.subtitle && (
                        <p className="text-xs text-tartan-gold/85 italic line-clamp-1">
                          {post.subtitle}
                        </p>
                      )}

                      <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed">
                        {post.excerpt || post.content}
                      </p>

                      {/* Venue & Tartan chips */}
                      <div className="pt-2 flex flex-wrap gap-1.5 text-[10px]">
                        {post.venueName && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-tartan-navy text-gray-200 border border-tartan-border">
                            <MapPin className="w-2.5 h-2.5 text-tartan-gold" />
                            <span className="truncate max-w-[130px]">{post.venueName}</span>
                          </span>
                        )}
                        {post.tartanChoice && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-tartan-dark text-gray-300 border border-tartan-border">
                            <Shirt className="w-2.5 h-2.5 text-emerald-400" />
                            <span className="truncate max-w-[120px]">{post.tartanChoice}</span>
                          </span>
                        )}
                      </div>

                      {/* Tunes Played tags */}
                      {post.tunesPlayed && post.tunesPlayed.length > 0 && (
                        <div className="pt-1 flex items-center gap-1 text-[10px] text-gray-400 overflow-hidden">
                          <Music className="w-3 h-3 text-tartan-gold shrink-0" />
                          <span className="truncate">{post.tunesPlayed.slice(0, 2).join(', ')}{post.tunesPlayed.length > 2 ? ` +${post.tunesPlayed.length - 2} more` : ''}</span>
                        </div>
                      )}
                    </div>

                    {/* Card Footer: Action & Social Share */}
                    <div className="pt-4 border-t border-tartan-border/60 flex items-center justify-between">
                      <span className="text-xs font-bold text-tartan-gold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        <span>Read Story &amp; Video</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>

                      {/* Quick Share Icons & Like */}
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleLike(e, post.id)}
                          className={`p-1.5 rounded-lg border text-xs transition-all flex items-center gap-1 ${
                            isLiked
                              ? 'bg-rose-950/60 border-rose-500/50 text-rose-400'
                              : 'bg-tartan-navy hover:bg-slate-700 text-gray-400 hover:text-rose-400 border-tartan-border'
                          }`}
                          title={isLiked ? 'Liked! Click to remove like' : 'Like this story'}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
                          <span className="text-[10px]">{post.likes || 0}</span>
                        </button>

                        <button
                          onClick={(e) => handleShareFacebook(e, post)}
                          className="p-1.5 rounded-lg bg-[#1877F2]/10 hover:bg-[#1877F2] text-[#1877F2] hover:text-white border border-[#1877F2]/30 text-xs transition-all"
                          title="Share to Facebook"
                        >
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        </button>

                        <button
                          onClick={(e) => handleCopyLink(e, post)}
                          className="p-1.5 rounded-lg bg-tartan-navy hover:bg-slate-700 text-gray-300 hover:text-white border border-tartan-border text-xs transition-all"
                          title="Copy Link"
                        >
                          {copiedShareId === post.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                  </div>
                </article>
              );
            })}
          </div>
        )}

      </main>

      {/* 6. Full Story Reader Modal / Drawer */}
      {activeStoryModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-tartan-card border border-tartan-border rounded-3xl max-w-4xl w-full my-6 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header Bar */}
            <div className="bg-tartan-navy px-6 py-4 border-b border-tartan-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-tartan-gold/20 text-tartan-gold border border-tartan-gold/40">
                  {activeStoryModal.category}
                </span>
                <span className="text-xs text-gray-400 hidden sm:inline">• {activeStoryModal.publishDate}</span>
              </div>

              <div className="flex items-center gap-2">
                {/* 1-Click Share to Facebook */}
                <button
                  onClick={(e) => handleShareFacebook(e, activeStoryModal)}
                  className="px-3 py-1.5 rounded-xl bg-[#1877F2] text-white text-xs font-bold flex items-center gap-1.5 shadow hover:brightness-110 transition-all"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="hidden sm:inline">Share on Facebook</span>
                </button>

                <button
                  onClick={(e) => handleCopyLink(e, activeStoryModal)}
                  className="p-2 rounded-xl bg-tartan-card hover:bg-slate-700 text-gray-300 border border-tartan-border text-xs transition-all"
                  title="Copy Direct Story Link"
                >
                  {copiedShareId === activeStoryModal.id ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

                <button
                  onClick={handleCloseStory}
                  className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-tartan-dark transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1">
              
              {/* Media Player on Top (if YouTube present) */}
              {activeStoryModal.youtubeId && (
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-tartan-border bg-black shadow-2xl">
                  <iframe
                    src={`https://www.youtube.com/embed/${activeStoryModal.youtubeId}?autoplay=1&rel=0`}
                    title={activeStoryModal.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {/* Title, Subtitle, Author meta */}
              <div className="space-y-3">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-serif tracking-tight leading-tight">
                  {activeStoryModal.title}
                </h1>
                
                {activeStoryModal.subtitle && (
                  <p className="text-base sm:text-lg text-tartan-gold font-serif italic">
                    {activeStoryModal.subtitle}
                  </p>
                )}

                <div className="flex items-center gap-3 text-xs text-gray-400 pt-1 border-b border-tartan-border/60 pb-4 flex-wrap">
                  <span>By <strong>{activeStoryModal.author || 'Spud The Piper'}</strong></span>
                  <span>•</span>
                  <span>{activeStoryModal.publishDate}</span>
                  <span>•</span>
                  <span>{activeStoryModal.readTimeMinutes || 3} min read</span>
                  {activeStoryModal.views ? (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-gray-400" />
                        <span>{activeStoryModal.views} views</span>
                      </span>
                    </>
                  ) : null}
                  <div className="ml-auto">
                    {(() => {
                      const isLiked = likedPosts.has(activeStoryModal.id);
                      return (
                        <button
                          onClick={(e) => handleLike(e, activeStoryModal.id)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isLiked
                              ? 'bg-rose-950/60 border-rose-500/50 text-rose-400'
                              : 'bg-tartan-dark hover:bg-slate-700 text-gray-300 hover:text-rose-400 border-tartan-border'
                          }`}
                          title={isLiked ? 'Liked! Click to remove like' : 'Like this story'}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
                          <span>{activeStoryModal.likes || 0}</span>
                        </button>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Highland Event Highlights Card */}
              {(activeStoryModal.venueName || activeStoryModal.tartanChoice || (activeStoryModal.tunesPlayed && activeStoryModal.tunesPlayed.length > 0)) && (
                <div className="bg-gradient-to-r from-tartan-dark via-tartan-navy to-tartan-dark p-5 rounded-2xl border border-tartan-border shadow-lg space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-tartan-gold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Highland Performance Highlights &amp; Setup:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    {activeStoryModal.venueName && (
                      <div className="space-y-1">
                        <span className="text-gray-400 block text-[11px]">Castle / Venue:</span>
                        <div className="flex items-center gap-1.5 text-white font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-tartan-gold" />
                          <span>{activeStoryModal.venueName}</span>
                        </div>
                        {activeStoryModal.venueLocation && (
                          <span className="text-[11px] text-gray-400 block">{activeStoryModal.venueLocation}</span>
                        )}
                      </div>
                    )}

                    {activeStoryModal.tartanChoice && (
                      <div className="space-y-1">
                        <span className="text-gray-400 block text-[11px]">Tartan &amp; Attire Worn:</span>
                        <div className="flex items-center gap-1.5 text-white font-semibold">
                          <Shirt className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{activeStoryModal.tartanChoice}</span>
                        </div>
                      </div>
                    )}

                    {activeStoryModal.tunesPlayed && activeStoryModal.tunesPlayed.length > 0 && (
                      <div className="space-y-1 sm:col-span-1">
                        <span className="text-gray-400 block text-[11px]">Key Tunes Performed:</span>
                        <div className="flex flex-wrap gap-1">
                          {activeStoryModal.tunesPlayed.map(t => (
                            <span key={t} className="px-2 py-0.5 rounded bg-tartan-card text-[11px] text-tartan-gold border border-tartan-border">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Full Story Narrative Typography */}
              <div className="prose prose-invert max-w-none text-gray-200 text-sm sm:text-base leading-relaxed space-y-4 font-sans">
                {activeStoryModal.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Direct Booking Call-To-Action Banner */}
              <div className="bg-gradient-to-r from-tartan-navy via-tartan-card to-tartan-navy p-6 sm:p-8 rounded-3xl border border-tartan-gold/50 shadow-2xl text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-tartan-gold/10 text-tartan-gold flex items-center justify-center mx-auto border border-tartan-gold/30">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-xl mx-auto">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white font-serif">
                    Planning Your Own {activeStoryModal.category}?
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300">
                    Spud the Piper performs at castle weddings, elopements, and Highland events across Scotland and internationally. Lock in your date with a secure deposit.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
                  <Link
                    href={`/booking?service=${encodeURIComponent(activeStoryModal.category)}&venue=${encodeURIComponent(activeStoryModal.venueName || '')}`}
                    className="px-6 py-3 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl hover:brightness-110 active:scale-95 transition-all"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>Check Spud&apos;s Availability for Your Date</span>
                  </Link>

                  <a
                    href="tel:07793491367"
                    className="px-5 py-3 rounded-xl bg-tartan-dark hover:bg-slate-700 text-white border border-tartan-border text-xs font-semibold flex items-center gap-2 transition-all"
                  >
                    <span>Call / WhatsApp 07793 491367</span>
                  </a>
                </div>
              </div>

              {/* Social Share Engine at Bottom */}
              <div className="p-4 rounded-2xl bg-tartan-dark border border-tartan-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-gray-300 font-medium">
                  Share this story &amp; video with your friends and family:
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Like button in Story Modal Bottom */}
                  {(() => {
                    const isLiked = likedPosts.has(activeStoryModal.id);
                    return (
                      <button
                        onClick={(e) => handleLike(e, activeStoryModal.id)}
                        className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 shadow ${
                          isLiked
                            ? 'bg-rose-950/60 border-rose-500/50 text-rose-400'
                            : 'bg-tartan-card hover:bg-slate-700 text-gray-200 hover:text-rose-400 border-tartan-border'
                        }`}
                        title={isLiked ? 'Liked! Click to remove like' : 'Like this story'}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
                        <span>{activeStoryModal.likes || 0}</span>
                      </button>
                    );
                  })()}

                  <button
                    onClick={(e) => handleShareFacebook(e, activeStoryModal)}
                    className="px-3.5 py-2 rounded-xl bg-[#1877F2] text-white text-xs font-bold flex items-center gap-1.5 shadow"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>Facebook</span>
                  </button>

                  <button
                    onClick={(e) => handleShareWhatsApp(e, activeStoryModal)}
                    className="px-3.5 py-2 rounded-xl bg-[#25D366] text-white text-xs font-bold flex items-center gap-1.5 shadow"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                    </svg>
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={(e) => handleCopyLink(e, activeStoryModal)}
                    className="px-3.5 py-2 rounded-xl bg-tartan-card hover:bg-slate-700 text-gray-200 border border-tartan-border text-xs font-semibold flex items-center gap-1.5"
                  >
                    {copiedShareId === activeStoryModal.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      <LiveChatWidget />
      <Footer />
    </div>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-tartan-dark flex items-center justify-center text-tartan-gold">
        <div className="text-center space-y-3">
          <SpudHeritageLogo variant="icon" size="custom" className="w-16 h-16 mx-auto animate-pulse" />
          <p className="text-sm font-serif">Loading Spud&apos;s Highland Blog...</p>
        </div>
      </div>
    }>
      <BlogContent />
    </Suspense>
  );
}
