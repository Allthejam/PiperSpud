'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LiveChatWidget } from '@/components/LiveChatWidget';
import { VisualPencilOverlay } from '@/components/VisualPencilOverlay';
import { EditableElement } from '@/components/EditableElement';
import { initialPartners } from '@/lib/initialData';
import { PartnerItem } from '@/types/spud';
import { useApp } from '@/context/AppContext';
import { 
  Sparkles, 
  ExternalLink, 
  Search, 
  MapPin, 
  ShieldCheck, 
  Tag, 
  ArrowRight,
  Send,
  Building,
  CheckCircle2,
  X,
  SlidersHorizontal,
  Award,
  Plus,
  Edit3,
  Trash2,
  Check,
  RefreshCw,
  Globe,
  Image as ImageIcon,
  Gift,
  ArrowUpRight,
  Shield
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
  const { 
    partners, 
    addPartner, 
    updatePartner, 
    deletePartner, 
    isAdminLoggedIn, 
    isVisualEditMode,
    toggleVisualEditMode,
    addNotification, 
    sendChatMessage 
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All Partners & Apps');
  const [searchQuery, setSearchQuery] = useState('');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  
  // Admin Partner Edit/Add Modal State
  const [isAdminEditModalOpen, setIsAdminEditModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<PartnerItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const [partnerFormData, setPartnerFormData] = useState<Partial<PartnerItem>>({
    name: '',
    tagline: '',
    category: 'Scottish Community & Apps',
    description: '',
    websiteUrl: 'https://',
    logoUrl: '',
    heroImageUrl: '',
    location: 'Scotland, UK',
    badge: 'Verified Partner',
    specialPerk: '',
    isFeatured: false,
    reciprocalBacklink: true,
    tags: []
  });
  const [tagsInput, setTagsInput] = useState('');

  // Partner Application Form State
  const [appName, setAppName] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [category, setCategory] = useState('Scottish Community & Apps');
  const [proposal, setProposal] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const currentPartnersList = (partners && partners.length > 0) ? partners : initialPartners;

  const filteredPartners = currentPartnersList.filter((partner) => {
    const matchesCategory = selectedCategory === 'All Partners & Apps' || partner.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      partner.name.toLowerCase().includes(q) ||
      partner.tagline.toLowerCase().includes(q) ||
      partner.description.toLowerCase().includes(q) ||
      partner.location.toLowerCase().includes(q) ||
      partner.tags?.some(t => t.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  const handleOpenAddPartner = () => {
    setEditingPartner(null);
    setPartnerFormData({
      name: '',
      tagline: '',
      category: 'Scottish Community & Apps',
      description: '',
      websiteUrl: 'https://',
      logoUrl: '',
      heroImageUrl: '',
      location: 'Scotland, UK',
      badge: 'Verified Partner',
      specialPerk: '',
      isFeatured: false,
      reciprocalBacklink: true,
      tags: ['Scottish Tech', 'Community']
    });
    setTagsInput('Scottish Tech, Community');
    setIsAdminEditModalOpen(true);
  };

  const handleOpenEditPartner = (partner: PartnerItem) => {
    setEditingPartner(partner);
    setPartnerFormData({ ...partner });
    setTagsInput((partner.tags || []).join(', '));
    setIsAdminEditModalOpen(true);
  };

  const handleDeletePartner = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from the Partners directory?`)) {
      await deletePartner(id);
      setSaveSuccessMsg(`Removed "${name}" from the partner directory.`);
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    }
  };

  const handleSavePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerFormData.name || !partnerFormData.websiteUrl) {
      alert('Please provide partner name and website URL.');
      return;
    }

    setIsSaving(true);
    const parsedTags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const payload = {
      name: partnerFormData.name,
      tagline: partnerFormData.tagline || '',
      category: (partnerFormData.category || 'Scottish Community & Apps') as PartnerItem['category'],
      description: partnerFormData.description || '',
      websiteUrl: partnerFormData.websiteUrl,
      logoUrl: partnerFormData.logoUrl || '',
      heroImageUrl: partnerFormData.heroImageUrl || '',
      location: partnerFormData.location || 'Scotland, UK',
      badge: partnerFormData.badge || 'Verified Partner',
      specialPerk: partnerFormData.specialPerk || '',
      isFeatured: Boolean(partnerFormData.isFeatured),
      reciprocalBacklink: Boolean(partnerFormData.reciprocalBacklink),
      tags: parsedTags.length > 0 ? parsedTags : ['Scotland', 'Partner']
    };

    if (editingPartner) {
      await updatePartner(editingPartner.id, payload);
      setSaveSuccessMsg(`Successfully updated "${payload.name}"!`);
    } else {
      await addPartner(payload);
      setSaveSuccessMsg(`Successfully created partner card "${payload.name}"!`);
    }

    setIsSaving(false);
    setIsAdminEditModalOpen(false);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

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
    <div className="min-h-screen bg-tartan-dark text-gray-100 flex flex-col font-sans selection:bg-tartan-gold selection:text-tartan-dark relative">
      <VisualPencilOverlay />
      <Navbar />

      <main className="flex-1">
        
        {/* ── TOP HERO HEADER ── */}
        <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-tartan-card via-tartan-dark to-tartan-dark border-b border-tartan-border">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,119,6,0.12),transparent_50%)] pointer-events-none" />
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tartan-navy/90 border border-tartan-accent/40 text-tartan-gold text-xs font-bold uppercase tracking-wider shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-tartan-gold" />
              <EditableElement
                id="partners-badge-label"
                label="Partners Badge Label"
                section="partners-header"
                tag="span"
                defaultContent="Trusted Scottish Ecosystem & Inlink Directory"
              />
            </div>

            <EditableElement
              id="partners-hero-title"
              label="Partners Hero Main Heading"
              section="partners-header"
              tag="h1"
              defaultContent="Our Trusted Partners & Recommended Scottish Apps"
              className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white font-serif tracking-tight leading-tight"
            />

            <EditableElement
              id="partners-hero-subtitle"
              label="Partners Hero Description Subtitle"
              section="partners-header"
              tag="p"
              defaultContent="Explore Spud the Piper's verified network of Scottish sister ventures, master kiltmakers, historic castle wedding venues, award-winning photographers, and innovative mobile apps. Hand-picked for quality, authenticity, and Scottish heritage."
              className="text-sm sm:text-base text-gray-300 max-w-3xl mx-auto leading-relaxed"
            />

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

        {/* ── ADMIN LIVE CONTROLS BAR (Visible when Admin is Logged In) ── */}
        {isAdminLoggedIn && (
          <section className="bg-gradient-to-r from-amber-950/80 via-tartan-card to-amber-950/80 border-b border-tartan-gold/40 py-3 px-4 sm:px-6 lg:px-8 shadow-2xl">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-tartan-gold text-tartan-dark flex items-center justify-center font-bold">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-tartan-gold uppercase tracking-wider">
                      Admin Partner Controls Active
                    </span>
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Live Editing
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-300">
                    You can add, edit, and delete partner cards in real-time. Changes instantly sync to the database.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleOpenAddPartner}
                  className="flex-1 sm:flex-none px-4 py-2 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Partner Card</span>
                </button>

                <button
                  onClick={toggleVisualEditMode}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    isVisualEditMode 
                      ? 'bg-tartan-gold text-tartan-dark border-tartan-gold shadow-md' 
                      : 'bg-tartan-navy text-gray-300 border-tartan-border hover:text-white'
                  }`}
                  title="Toggle Visual Pencil Outlines"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{isVisualEditMode ? 'Pencils ON' : 'Pencils OFF'}</span>
                </button>

                <Link
                  href="/admin"
                  className="px-3.5 py-2 rounded-xl bg-tartan-navy hover:bg-slate-700 text-gray-300 hover:text-white text-xs font-bold border border-tartan-border flex items-center gap-1.5 transition-colors"
                >
                  <span>Back Office</span>
                  <ExternalLink className="w-3.5 h-3.5 text-tartan-gold" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── NOTIFICATION SUCCESS BANNER ── */}
        {saveSuccessMsg && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-lg animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{saveSuccessMsg}</span>
            </div>
          </div>
        )}

        {/* ── FILTERING & SEARCH BAR ── */}
        <section className="sticky top-16 z-30 bg-tartan-dark/95 backdrop-blur-md border-b border-tartan-border py-4 px-4 sm:px-6 lg:px-8 shadow-xl">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Category Dropdown Selector */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <label htmlFor="partner-category-select" className="text-xs font-bold text-tartan-gold uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5 shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filter By Category:</span>
              </label>

              <div className="relative w-full sm:w-72">
                <select
                  id="partner-category-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-tartan-card border border-tartan-gold/60 text-white font-bold text-xs rounded-xl px-4 py-2.5 pr-9 appearance-none focus:outline-none focus:ring-2 focus:ring-tartan-accent/50 shadow-md cursor-pointer hover:border-tartan-gold transition-colors"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-tartan-dark text-gray-100 font-semibold py-1">
                      {cat}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-tartan-gold">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72 shrink-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search partners, apps, venues..."
                className="w-full bg-tartan-card border border-tartan-border rounded-xl pl-9 pr-8 py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-tartan-gold shadow-inner"
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
            
            <div className="flex items-center gap-2">
              {isAdminLoggedIn && (
                <button
                  onClick={handleOpenAddPartner}
                  className="px-3.5 py-1.5 rounded-xl bg-tartan-navy hover:bg-slate-700 text-tartan-gold text-xs font-bold border border-tartan-accent/40 flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Partner</span>
                </button>
              )}
              <span className="text-xs text-tartan-gold bg-tartan-navy px-3 py-1 rounded-full border border-tartan-accent/40 font-bold hidden sm:inline-block">
                100% Scottish Heritage Verified
              </span>
            </div>
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
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setSelectedCategory('All Partners & Apps');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-tartan-navy text-tartan-gold rounded-xl border border-tartan-border text-xs font-bold hover:bg-slate-700"
                >
                  Clear Filters
                </button>
                {isAdminLoggedIn && (
                  <button
                    onClick={handleOpenAddPartner}
                    className="px-4 py-2 bg-gold-gradient text-tartan-dark font-extrabold text-xs rounded-xl shadow hover:brightness-110"
                  >
                    + Add New Partner
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPartners.map((partner) => (
                <div
                  key={partner.id}
                  className={`bg-tartan-card rounded-3xl p-6 border transition-all shadow-xl hover:shadow-2xl flex flex-col justify-between group relative overflow-hidden ${
                    isAdminLoggedIn ? 'border-tartan-accent/40 hover:border-tartan-gold' : 'border-tartan-border/80 hover:border-tartan-gold/60'
                  }`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition-colors" />

                  <div className="space-y-4 relative z-10">
                    
                    {/* Top Badges & Admin In-Page Controls */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-tartan-navy text-tartan-gold border border-tartan-accent/40">
                          {partner.category}
                        </span>
                        {partner.badge && (
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            {partner.badge}
                          </span>
                        )}
                      </div>

                      {/* In-Page Quick Edit & Delete for Admin */}
                      {isAdminLoggedIn && (
                        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-tartan-gold/40 shadow-inner">
                          <button
                            onClick={() => handleOpenEditPartner(partner)}
                            className="p-1.5 rounded-lg bg-tartan-navy hover:bg-tartan-gold hover:text-tartan-dark text-tartan-gold transition-all"
                            title="Edit this partner card"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePartner(partner.id, partner.name)}
                            className="p-1.5 rounded-lg bg-tartan-navy hover:bg-rose-900 text-rose-300 transition-all"
                            title="Delete this partner card"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Partner Name & Tagline */}
                    <div>
                      <h3 className="text-lg font-bold text-white font-serif group-hover:text-tartan-gold transition-colors leading-snug flex items-center justify-between">
                        <span>{partner.name}</span>
                        {partner.isFeatured && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            Featured
                          </span>
                        )}
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
                      {partner.tags?.map((tag) => (
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

      {/* ── ADMIN ADD / EDIT PARTNER CARD MODAL ── */}
      {isAdminEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-tartan-card rounded-3xl border border-tartan-gold/50 max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-tartan-border pb-4">
              <div className="flex items-center gap-2.5">
                <Building className="w-5 h-5 text-tartan-gold" />
                <h2 className="text-xl font-bold text-white font-serif">
                  {editingPartner ? `Edit Partner: ${editingPartner.name}` : 'Add New Partner Card'}
                </h2>
              </div>
              <button
                onClick={() => setIsAdminEditModalOpen(false)}
                className="p-1.5 rounded-xl bg-tartan-dark hover:bg-slate-700 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePartner} className="space-y-4">
              
              {/* Partner Name & Tagline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-tartan-gold">
                    Partner / App Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={partnerFormData.name || ''}
                    onChange={(e) => setPartnerFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Kilt in a Box"
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-tartan-accent"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-tartan-gold">
                    Category *
                  </label>
                  <select
                    value={partnerFormData.category || 'Scottish Community & Apps'}
                    onChange={(e) => setPartnerFormData(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-tartan-accent"
                  >
                    {CATEGORIES.filter(c => c !== 'All Partners & Apps').map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tagline */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-tartan-gold">
                  Tagline / Short Pitch
                </label>
                <input
                  type="text"
                  value={partnerFormData.tagline || ''}
                  onChange={(e) => setPartnerFormData(prev => ({ ...prev, tagline: e.target.value }))}
                  placeholder="e.g. Traditional & modern Highland dress hire with direct doorstep courier dispatch across Scotland"
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-tartan-accent"
                />
              </div>

              {/* Website URL & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-tartan-gold">
                    Official Website URL *
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      required
                      value={partnerFormData.websiteUrl || ''}
                      onChange={(e) => setPartnerFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                      placeholder="https://example.com"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-tartan-accent"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-tartan-gold">
                    Location / Headquarters
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={partnerFormData.location || ''}
                      onChange={(e) => setPartnerFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g. Edinburgh / Highlands, Scotland"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-tartan-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Logo URL & Hero Image URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-tartan-gold">
                    Logo Image URL (Optional)
                  </label>
                  <div className="relative">
                    <ImageIcon className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={partnerFormData.logoUrl || ''}
                      onChange={(e) => setPartnerFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
                      placeholder="https://.../logo.png"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-tartan-accent"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-tartan-gold">
                    Hero / Preview Image URL (Optional)
                  </label>
                  <div className="relative">
                    <ImageIcon className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={partnerFormData.heroImageUrl || ''}
                      onChange={(e) => setPartnerFormData(prev => ({ ...prev, heroImageUrl: e.target.value }))}
                      placeholder="https://.../preview.jpg"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-tartan-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Badge & Special Perk */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-tartan-gold">
                    Trust Badge Label
                  </label>
                  <input
                    type="text"
                    value={partnerFormData.badge || ''}
                    onChange={(e) => setPartnerFormData(prev => ({ ...prev, badge: e.target.value }))}
                    placeholder="e.g. Verified Partner, Official App, VIP Member"
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-tartan-accent"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-tartan-gold">
                    Special Client Perk / Offer (Optional)
                  </label>
                  <input
                    type="text"
                    value={partnerFormData.specialPerk || ''}
                    onChange={(e) => setPartnerFormData(prev => ({ ...prev, specialPerk: e.target.value }))}
                    placeholder="e.g. 10% discount on kilt hire for Spud's clients"
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-tartan-accent"
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-tartan-gold">
                  Search & SEO Tags (Comma-separated)
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="e.g. Highland Attire, Tartan Hire, Scottish Community, Geospatial"
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-tartan-accent"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-tartan-gold">
                  Full Partner Description
                </label>
                <textarea
                  rows={4}
                  value={partnerFormData.description || ''}
                  onChange={(e) => setPartnerFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the partner service, apps, specializations, and how they help couples or clients in Scotland..."
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-tartan-accent leading-relaxed"
                />
              </div>

              {/* Toggles */}
              <div className="p-4 rounded-2xl bg-tartan-dark border border-tartan-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(partnerFormData.isFeatured)}
                    onChange={(e) => setPartnerFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="w-4 h-4 rounded text-tartan-gold accent-tartan-gold"
                  />
                  <span className="text-xs text-white font-semibold">Mark as Featured Partner</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(partnerFormData.reciprocalBacklink)}
                    onChange={(e) => setPartnerFormData(prev => ({ ...prev, reciprocalBacklink: e.target.checked }))}
                    className="w-4 h-4 rounded text-tartan-gold accent-tartan-gold"
                  />
                  <span className="text-xs text-white font-semibold">Reciprocal Backlink Active</span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-tartan-border">
                <button
                  type="button"
                  onClick={() => setIsAdminEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-tartan-navy text-gray-300 hover:text-white border border-tartan-border text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-7 py-2.5 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{editingPartner ? 'Save Changes' : 'Create Partner Card'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

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
      <LiveChatWidget />
    </div>
  );
}
