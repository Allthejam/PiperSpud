'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { initialPartners } from '@/lib/initialData';
import { PartnerItem } from '@/types/spud';
import { useApp } from '@/context/AppContext';
import { 
  Sparkles, 
  ExternalLink, 
  Search, 
  MapPin, 
  ShieldCheck, 
  Heart, 
  Tag, 
  ArrowRight,
  Send,
  Building,
  CheckCircle2,
  X,
  Share2,
  SlidersHorizontal,
  Compass,
  Award
} from 'lucide-react';

const CATEGORIES = [
  'All Partners & Apps',
  'Highland Attire & Kilts',
  'Scottish Community & Apps',
  'Estate & Geospatial Tech',
  'Castles & Historic Venues',
  'Wedding Suppliers & Film'
] as const;

export default function PartnersPage() {
  const { addNotification, sendChatMessage } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All Partners & Apps');
  const [searchQuery, setSearchQuery] = useState('');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  
  // Partner Application Form State
  const [appName, setAppName] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [category, setCategory] = useState('Scottish Community & Apps');
  const [proposal, setProposal] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const filteredPartners = initialPartners.filter((partner) => {
    const matchesCategory = selectedCategory === 'All Partners & Apps' || partner.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      partner.name.toLowerCase().includes(q) ||
      partner.tagline.toLowerCase().includes(q) ||
      partner.description.toLowerCase().includes(q) ||
      partner.location.toLowerCase().includes(q) ||
      partner.tags.some(t => t.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName || !contactEmail || !appUrl) return;

    // Send notification and chat message to Spud
    addNotification({
      title: `🤝 New Partner Application: ${appName}`,
      message: `${contactEmail} submitted a partnership request for category ${category}. Website: ${appUrl}`,
      type: 'system',
      actionUrl: '/admin'
    });

    sendChatMessage(
      `[Partner Application] Name: ${appName} | Website: ${appUrl} | Email: ${contactEmail} | Category: ${category} | Proposal: ${proposal}`,
      'client',
      undefined,
      appName,
      contactEmail
    );

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setIsApplyModalOpen(false);
      setAppName('');
      setAppUrl('');
      setContactEmail('');
      setProposal('');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-tartan-dark text-gray-100 flex flex-col font-sans selection:bg-tartan-gold selection:text-tartan-dark">
      <Navbar />

      <main className="flex-1">
        
        {/* ── TOP HERO HEADER ── */}
        <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-tartan-card via-tartan-dark to-tartan-dark border-b border-tartan-border">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,119,6,0.12),transparent_50%)] pointer-events-none" />
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tartan-navy/90 border border-tartan-accent/40 text-tartan-gold text-xs font-bold uppercase tracking-wider shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-tartan-gold" />
              <span>Trusted Scottish Ecosystem & Inlink Directory</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white font-serif tracking-tight leading-tight">
              Our Trusted Partners &amp; <br />
              <span className="text-gradient-gold">Recommended Scottish Apps</span>
            </h1>

            <p className="text-sm sm:text-base text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Explore Spud the Piper&apos;s verified network of Scottish sister ventures, master kiltmakers, historic castle wedding venues, award-winning photographers, and innovative mobile apps. Hand-picked for quality, authenticity, and Scottish heritage.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsApplyModalOpen(true)}
                className="px-6 py-3 rounded-2xl bg-gold-gradient text-tartan-dark font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
              >
                <Building className="w-4 h-4" />
                <span>Become a Featured Partner / App</span>
              </button>
              
              <Link
                href="/booking"
                className="px-6 py-3 rounded-2xl bg-tartan-navy hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-tartan-border/80 shadow-md transition-all flex items-center gap-2"
              >
                <span>Book Spud for Your Event</span>
                <ArrowRight className="w-4 h-4 text-tartan-gold" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── FILTERING & SEARCH BAR ── */}
        <section className="sticky top-16 z-30 bg-tartan-dark/95 backdrop-blur-md border-b border-tartan-border py-4 px-4 sm:px-6 lg:px-8 shadow-xl">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-gold-gradient text-tartan-dark shadow-md'
                        : 'bg-tartan-card hover:bg-tartan-navy text-gray-300 border border-tartan-border hover:text-white'
                    }`}
                  >
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72 shrink-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search partners, apps, venues..."
                className="w-full bg-tartan-card border border-tartan-border rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-tartan-gold"
              />
              <Search className="w-3.5 h-3.5 text-tartan-gold absolute left-3 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>
        </section>

        {/* ── PARTNER CARDS GRID ── */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          
          <div className="flex items-center justify-between mb-8 pb-3 border-b border-tartan-border/60">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white font-serif flex items-center gap-2">
                <Award className="w-5 h-5 text-tartan-gold" />
                <span>Featured Partners &amp; Cross-Platform Apps ({filteredPartners.length})</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Authentic Scottish suppliers, technology platforms, and sister ventures with verified reciprocal partnerships.
              </p>
            </div>
            
            <span className="text-xs text-tartan-gold bg-tartan-navy px-3 py-1 rounded-full border border-tartan-accent/40 font-bold hidden sm:inline-block">
              100% Scottish Heritage Verified
            </span>
          </div>

          {filteredPartners.length === 0 ? (
            <div className="bg-tartan-card rounded-3xl p-12 text-center border border-tartan-border max-w-lg mx-auto space-y-4">
              <div className="w-12 h-12 rounded-full bg-tartan-navy text-tartan-gold mx-auto flex items-center justify-center font-bold text-lg">
                🔍
              </div>
              <h3 className="text-base font-bold text-white font-serif">No partners found</h3>
              <p className="text-xs text-gray-400">
                No matching partners found for &quot;{searchQuery}&quot;. Try selecting a different category or clearing the search.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All Partners & Apps');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-tartan-navy text-tartan-gold rounded-xl border border-tartan-border text-xs font-bold hover:bg-slate-700"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPartners.map((partner) => (
                <div
                  key={partner.id}
                  className="bg-tartan-card rounded-3xl p-6 border border-tartan-border/80 hover:border-tartan-gold/60 transition-all shadow-xl hover:shadow-2xl flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition-colors" />

                  <div className="space-y-4 relative z-10">
                    
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-tartan-navy text-tartan-gold border border-tartan-accent/40">
                        {partner.category}
                      </span>
                      {partner.badge && (
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          {partner.badge}
                        </span>
                      )}
                    </div>

                    {/* Partner Name & Tagline */}
                    <div>
                      <h3 className="text-lg font-bold text-white font-serif group-hover:text-tartan-gold transition-colors leading-snug">
                        {partner.name}
                      </h3>
                      <p className="text-xs text-amber-300/90 font-medium mt-1 line-clamp-2">
                        {partner.tagline}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {partner.description}
                    </p>

                    {/* Special Perk for Spud Clients Pill */}
                    {partner.specialPerk && (
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 text-[11px] text-amber-300 flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-tartan-gold shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-tartan-gold block font-serif">Special Partnership Advantage:</strong>
                          <span>{partner.specialPerk}</span>
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {partner.tags.map((tag) => (
                        <span key={tag} className="text-[10px] text-gray-400 bg-tartan-navy/60 px-2 py-0.5 rounded-md border border-tartan-border/50">
                          #{tag}
                        </span>
                      ))}
                    </div>

                  </div>

                  {/* Bottom Location & Action Outlink */}
                  <div className="pt-5 mt-5 border-t border-tartan-border/60 flex items-center justify-between gap-3 relative z-10">
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-tartan-gold shrink-0" />
                      <span className="truncate max-w-[140px]">{partner.location}</span>
                    </span>

                    <a
                      href={partner.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs tracking-wider uppercase flex items-center gap-1.5 shadow hover:brightness-110 active:scale-95 transition-all"
                    >
                      <span>Visit Site / App</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                </div>
              ))}
            </div>
          )}

          {/* ── RECIPROCAL BACKLINK / PARTNER BANNER ── */}
          <div className="mt-16 bg-gradient-to-r from-tartan-navy via-tartan-card to-tartan-navy p-8 rounded-3xl border border-tartan-accent/50 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-bold text-tartan-gold uppercase tracking-wider flex items-center justify-center md:justify-start gap-1.5">
                <ShieldCheck className="w-4 h-4 text-green-400" />
                <span>Reciprocal SEO Inlinks &amp; Cross-Platform Synergy</span>
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white font-serif">
                Do you run a Scottish Wedding Venue, Highland Business, or App?
              </h3>
              <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
                We actively exchange verified backlinks and featured app promotions with high-quality Scottish partners, luxury castle venues, highland photographers, and tourism platforms.
              </p>
            </div>

            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="px-6 py-3.5 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl hover:brightness-110 active:scale-95 transition-all whitespace-nowrap shrink-0"
            >
              Apply for Partnership →
            </button>
          </div>

        </section>

      </main>

      {/* ── PARTNERSHIP APPLICATION MODAL ── */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-tartan-card border border-tartan-gold/50 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 relative">
            
            <button
              onClick={() => setIsApplyModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-tartan-navy text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-tartan-gold uppercase tracking-wider">
                Partnership &amp; Inlink Exchange
              </span>
              <h3 className="text-xl font-bold text-white font-serif">
                Join Spud the Piper&apos;s Partner Network
              </h3>
              <p className="text-xs text-gray-300">
                Submit your website, app, or venue to be featured in Spud&apos;s official partner directory.
              </p>
            </div>

            {isSubmitted ? (
              <div className="bg-emerald-950/60 border border-emerald-500/50 rounded-2xl p-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Application Received!</h4>
                <p className="text-xs text-gray-300">
                  Thank you! Spud has received your partnership proposal. We will review your website and reply shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Business / App Name *</label>
                  <input
                    type="text"
                    required
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    placeholder="e.g. Blair Castle & Gardens or KiltCraft"
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-tartan-gold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Website / App URL *</label>
                    <input
                      type="url"
                      required
                      value={appUrl}
                      onChange={(e) => setAppUrl(e.target.value)}
                      placeholder="https://yourwebsite.co.uk"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-tartan-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Contact Email *</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="contact@yourwebsite.co.uk"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-tartan-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-tartan-gold"
                  >
                    <option value="Highland Attire & Kilts">Highland Attire & Kilts</option>
                    <option value="Scottish Community & Apps">Scottish Community & Apps</option>
                    <option value="Estate & Geospatial Tech">Estate & Geospatial Tech</option>
                    <option value="Castles & Historic Venues">Castles & Historic Venues</option>
                    <option value="Wedding Suppliers & Film">Wedding Suppliers & Film</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Partnership Proposal / Exclusive Perk for Spud Clients</label>
                  <textarea
                    rows={3}
                    value={proposal}
                    onChange={(e) => setProposal(e.target.value)}
                    placeholder="Tell us about your service, where you will link back to spudthepiper.com, and any special perks for our couples..."
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-tartan-gold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gold-gradient text-tartan-dark font-extrabold uppercase tracking-wider text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Partnership Proposal</span>
                </button>
              </form>
            )}

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
