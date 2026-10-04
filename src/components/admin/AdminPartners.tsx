'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { PartnerItem } from '@/types/spud';
import { 
  Building, 
  Plus, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Search, 
  Sparkles, 
  Check, 
  X, 
  ShieldCheck, 
  MapPin, 
  Tag, 
  Globe, 
  Image as ImageIcon, 
  Award,
  Link2,
  Gift,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';

const CATEGORIES = [
  'All Categories',
  'Highland Attire & Kilts',
  'Scottish Community & Apps',
  'Estate & Geospatial Tech',
  'Castles & Historic Venues',
  'Wedding Suppliers & Film'
] as const;

export const AdminPartners: React.FC = () => {
  const { partners, addPartner, updatePartner, deletePartner } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<PartnerItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<PartnerItem>>({
    name: '',
    tagline: '',
    category: 'Scottish Community & Apps',
    description: '',
    websiteUrl: '',
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

  const filteredPartners = (partners || []).filter(partner => {
    const matchesCategory = selectedCategory === 'All Categories' || partner.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      partner.name.toLowerCase().includes(q) ||
      partner.tagline.toLowerCase().includes(q) ||
      partner.description.toLowerCase().includes(q) ||
      partner.location.toLowerCase().includes(q) ||
      partner.tags?.some(t => t.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingPartner(null);
    setFormData({
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
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (partner: PartnerItem) => {
    setEditingPartner(partner);
    setFormData({
      ...partner
    });
    setTagsInput((partner.tags || []).join(', '));
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from the Partners directory?`)) {
      deletePartner(id);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.websiteUrl) {
      alert('Please provide at least a Partner Name and Website URL.');
      return;
    }

    setIsSaving(true);

    const parsedTags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const payload = {
      name: formData.name,
      tagline: formData.tagline || '',
      category: (formData.category || 'Scottish Community & Apps') as PartnerItem['category'],
      description: formData.description || '',
      websiteUrl: formData.websiteUrl,
      logoUrl: formData.logoUrl || '',
      heroImageUrl: formData.heroImageUrl || '',
      location: formData.location || 'Scotland, UK',
      badge: formData.badge || 'Verified Partner',
      specialPerk: formData.specialPerk || '',
      isFeatured: Boolean(formData.isFeatured),
      reciprocalBacklink: Boolean(formData.reciprocalBacklink),
      tags: parsedTags.length > 0 ? parsedTags : ['Scotland', 'Partner']
    };

    if (editingPartner) {
      await updatePartner(editingPartner.id, payload);
    } else {
      await addPartner(payload);
    }

    setIsSaving(false);
    setIsEditModalOpen(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Header Banner */}
      <div className="bg-tartan-card rounded-3xl p-6 sm:p-8 border border-tartan-border shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tartan-accent/15 text-tartan-gold text-xs font-bold border border-tartan-accent/30">
            <Building className="w-4 h-4 text-tartan-gold" />
            <span>Scottish Ecosystem &amp; Backlinks Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif">
            Our Partners &amp; Ecosystem Manager
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-2xl leading-relaxed">
            Manage recommended Scottish suppliers, ecosystem apps (Kilt in a Box, My Community Hub, geomapping), castles, and verified wedding partners. Changes sync live to <a href="/partners" target="_blank" className="text-tartan-gold hover:underline">/partners</a> and the database.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-3 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Partner Card</span>
        </button>
      </div>

      {/* Save Notification */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-green-950/60 border border-green-500/50 flex items-center justify-between text-green-300 text-xs sm:text-sm font-semibold shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <Check className="w-5 h-5 text-green-400" />
            <span>Partner card successfully updated and published to the live directory!</span>
          </div>
          <a
            href="/partners"
            target="_blank"
            className="underline hover:text-white text-xs flex items-center gap-1"
          >
            <span>View /partners</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Search & Category Filter Bar */}
      <div className="bg-tartan-dark p-4 sm:p-5 rounded-2xl border border-tartan-border flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search partners, apps, tags, locations..."
            className="w-full bg-tartan-card border border-tartan-border rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent transition-colors"
          />
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs text-gray-400 font-semibold whitespace-nowrap">Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full md:w-auto bg-tartan-card border border-tartan-border rounded-xl px-4 py-2 text-xs text-tartan-gold font-bold focus:outline-none focus:border-tartan-accent cursor-pointer"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat} className="bg-tartan-card text-white">
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPartners.map((partner) => (
          <div
            key={partner.id}
            className="bg-tartan-card rounded-3xl border border-tartan-border p-6 flex flex-col justify-between space-y-4 hover:border-tartan-accent/50 transition-all shadow-xl group relative overflow-hidden"
          >
            {/* Top Row: Category badge & Actions */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-tartan-accent/15 text-tartan-gold border border-tartan-accent/30">
                  {partner.category}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(partner)}
                    className="p-2 rounded-xl bg-tartan-navy hover:bg-slate-700 text-gray-300 hover:text-white border border-tartan-border text-xs transition-all shadow"
                    title="Edit Partner Card"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-tartan-gold" />
                  </button>
                  <button
                    onClick={() => handleDelete(partner.id, partner.name)}
                    className="p-2 rounded-xl bg-tartan-navy hover:bg-red-950/60 text-gray-300 hover:text-red-400 border border-tartan-border text-xs transition-all shadow"
                    title="Delete Partner Card"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Partner Name & Tagline */}
              <div className="flex items-center gap-3 mb-2">
                {partner.logoUrl ? (
                  <img
                    src={partner.logoUrl}
                    alt={partner.name}
                    className="w-12 h-12 rounded-2xl object-cover bg-tartan-dark border border-tartan-border shrink-0"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-tartan-navy border border-tartan-accent/30 flex items-center justify-center text-tartan-gold font-serif font-bold text-lg shrink-0">
                    {partner.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="text-base font-bold text-white font-serif group-hover:text-tartan-gold transition-colors">
                    {partner.name}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-1">{partner.tagline}</p>
                </div>
              </div>

              {/* Location & Badge */}
              <div className="flex items-center gap-2 flex-wrap text-[11px] text-gray-400 mb-3">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-tartan-gold" />
                  <span>{partner.location}</span>
                </span>
                {partner.badge && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                    {partner.badge}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed mb-4">
                {partner.description}
              </p>

              {/* Special Perk if any */}
              {partner.specialPerk && (
                <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 mb-3">
                  <Gift className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-[11px] line-clamp-1 font-semibold">{partner.specialPerk}</span>
                </div>
              )}

              {/* Tags */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {(partner.tags || []).slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-tartan-dark text-gray-400 border border-slate-800">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-tartan-border/50 flex items-center justify-between">
              <a
                href={partner.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-tartan-gold font-bold hover:underline flex items-center gap-1"
              >
                <span>Visit Official Site</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>

              {partner.isFeatured && (
                <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Featured</span>
                </span>
              )}
            </div>
          </div>
        ))}

        {filteredPartners.length === 0 && (
          <div className="col-span-full p-12 bg-tartan-dark rounded-3xl border border-dashed border-tartan-border text-center space-y-3">
            <Building className="w-12 h-12 text-gray-500 mx-auto" />
            <h3 className="text-base font-bold text-white">No partner cards found</h3>
            <p className="text-xs text-gray-400">Try adjusting your search query or category filter above.</p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-tartan-accent text-tartan-dark font-bold text-xs rounded-xl shadow hover:brightness-110 transition-all inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Partner Card</span>
            </button>
          </div>
        )}
      </div>

      {/* Edit / Add Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-tartan-card rounded-3xl border border-tartan-border max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-tartan-border pb-4">
              <div className="flex items-center gap-2.5">
                <Building className="w-5 h-5 text-tartan-gold" />
                <h2 className="text-xl font-bold text-white font-serif">
                  {editingPartner ? `Edit Partner: ${editingPartner.name}` : 'Add New Partner Card'}
                </h2>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-xl bg-tartan-dark hover:bg-slate-700 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              
              {/* Partner Name & Tagline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-tartan-gold">
                    Partner / App Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Kilt in a Box"
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-tartan-accent"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-tartan-gold">
                    Category *
                  </label>
                  <select
                    value={formData.category || 'Scottish Community & Apps'}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-tartan-accent"
                  >
                    {CATEGORIES.filter(c => c !== 'All Categories').map(cat => (
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
                  value={formData.tagline || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
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
                      value={formData.websiteUrl || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
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
                      value={formData.location || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
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
                      value={formData.logoUrl || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
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
                      value={formData.heroImageUrl || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, heroImageUrl: e.target.value }))}
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
                    value={formData.badge || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value }))}
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
                    value={formData.specialPerk || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialPerk: e.target.value }))}
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
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the partner service, apps, specializations, and how they help couples or clients in Scotland..."
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-tartan-accent leading-relaxed"
                />
              </div>

              {/* Toggles */}
              <div className="p-4 rounded-2xl bg-tartan-dark border border-tartan-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.isFeatured)}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="w-4 h-4 rounded text-tartan-gold accent-tartan-gold"
                  />
                  <span className="text-xs text-white font-semibold">Mark as Featured Partner</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.reciprocalBacklink)}
                    onChange={(e) => setFormData(prev => ({ ...prev, reciprocalBacklink: e.target.checked }))}
                    className="w-4 h-4 rounded text-tartan-gold accent-tartan-gold"
                  />
                  <span className="text-xs text-white font-semibold">Reciprocal Backlink Active</span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-tartan-border">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
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

    </div>
  );
};
