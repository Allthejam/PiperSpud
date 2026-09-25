'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Sparkles, 
  Heart, 
  Flame, 
  Castle, 
  GraduationCap, 
  Users, 
  ExternalLink, 
  Check, 
  Star, 
  Clock, 
  Music, 
  Tag, 
  Search,
  CheckCircle2,
  X,
  Upload,
  Cloud,
  ChevronRight
} from 'lucide-react';
import { ServicePackage, ServiceItineraryStep } from '@/types/spud';
import Link from 'next/link';

const getServiceIcon = (iconName?: string) => {
  switch (iconName) {
    case 'Heart': return Heart;
    case 'Flame': return Flame;
    case 'Castle': return Castle;
    case 'GraduationCap': return GraduationCap;
    case 'Users': return Users;
    case 'Music': return Music;
    case 'Star': return Star;
    case 'Sparkles':
    default: return Sparkles;
  }
};

export const AdminServices: React.FC = () => {
  const { 
    services, 
    createService, 
    updateService, 
    deleteService, 
    syncAllToFirestore, 
    isSyncingFirestore 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingService, setEditingService] = useState<ServicePackage | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formTagline, setFormTagline] = useState('');
  const [formPriceEstimate, setFormPriceEstimate] = useState('');
  const [formBasePrice, setFormBasePrice] = useState<number>(350);
  const [formDepositAmount, setFormDepositAmount] = useState<number>(80);
  const [formDepositText, setFormDepositText] = useState('£80 Deposit');
  const [formIcon, setFormIcon] = useState('Sparkles');
  const [formPopularBadge, setFormPopularBadge] = useState(false);
  const [formBadgeText, setFormBadgeText] = useState('Most Requested');
  const [formHeroImage, setFormHeroImage] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formFullDescription, setFormFullDescription] = useState('');
  const [formFeaturesText, setFormFeaturesText] = useState('');
  const [formTunesText, setFormTunesText] = useState('');
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formSeoDesc, setFormSeoDesc] = useState('');

  const openEditModal = (service: ServicePackage) => {
    setEditingService(service);
    setIsCreatingNew(false);
    setFormTitle(service.title);
    setFormSlug(service.slug);
    setFormTagline(service.tagline);
    setFormPriceEstimate(service.priceEstimate);
    setFormBasePrice(service.basePrice || 350);
    setFormDepositAmount(service.depositAmount || 80);
    setFormDepositText(service.deposit);
    setFormIcon(service.icon || 'Sparkles');
    setFormPopularBadge(!!service.popularBadge);
    setFormBadgeText(service.badgeText || 'Most Requested');
    setFormHeroImage(service.heroImage || '');
    setFormDescription(service.description);
    setFormFullDescription(service.fullDescription || service.description);
    setFormFeaturesText(service.features.join('\n'));
    setFormTunesText((service.recommendedTunes || []).join('\n'));
    setFormSeoTitle(service.seoTitle || '');
    setFormSeoDesc(service.seoDescription || '');
  };

  const openCreateModal = () => {
    setEditingService(null);
    setIsCreatingNew(true);
    setFormTitle('');
    setFormSlug('');
    setFormTagline('');
    setFormPriceEstimate('From £350');
    setFormBasePrice(350);
    setFormDepositAmount(80);
    setFormDepositText('£80 Deposit');
    setFormIcon('Sparkles');
    setFormPopularBadge(false);
    setFormBadgeText('New Package');
    setFormHeroImage('https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&q=80');
    setFormDescription('');
    setFormFullDescription('');
    setFormFeaturesText('Ceremonial Highland Entrance\nFull Number 1 Kilt Regalia\nPersonal Scottish Tune Requests\nSouvenir Photo Session');
    setFormTunesText('Highland Cathedral\nScotland the Brave\nAuld Lang Syne');
    setFormSeoTitle('');
    setFormSeoDesc('');
  };

  const handleTitleChange = (val: string) => {
    setFormTitle(val);
    if (isCreatingNew) {
      // Auto-generate slug
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setFormSlug(generatedSlug);
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const features = formFeaturesText.split('\n').map(f => f.trim()).filter(Boolean);
    const recommendedTunes = formTunesText.split('\n').map(t => t.trim()).filter(Boolean);

    const packageData: Omit<ServicePackage, 'id'> = {
      title: formTitle,
      slug: formSlug || formTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      tagline: formTagline,
      priceEstimate: formPriceEstimate,
      basePrice: Number(formBasePrice) || 350,
      depositAmount: Number(formDepositAmount) || 80,
      deposit: formDepositText,
      icon: formIcon,
      popularBadge: formPopularBadge,
      badgeText: formBadgeText,
      heroImage: formHeroImage,
      description: formDescription,
      fullDescription: formFullDescription || formDescription,
      features,
      recommendedTunes,
      seoTitle: formSeoTitle || `${formTitle} | Spud the Piper Scotland`,
      seoDescription: formSeoDesc || formDescription
    };

    if (isCreatingNew) {
      await createService(packageData);
    } else if (editingService) {
      await updateService(editingService.id, packageData);
    }

    setEditingService(null);
    setIsCreatingNew(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to remove the service "${title}"?`)) {
      await deleteService(id);
    }
  };

  const filteredServices = services.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-serif">Services, Experiences & Package Studio</h2>
          <p className="text-xs text-gray-400">Manage all public booking categories, pricing tiers, deposits, and SEO landing pages</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => syncAllToFirestore()}
            disabled={isSyncingFirestore}
            className="px-4 py-2 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-600 rounded-xl text-xs font-bold flex items-center gap-2 shadow transition-all disabled:opacity-50"
          >
            <Cloud className={`w-4 h-4 text-emerald-400 ${isSyncingFirestore ? 'animate-spin' : ''}`} />
            <span>{isSyncingFirestore ? 'Syncing...' : 'Sync to Firebase'}</span>
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:brightness-110 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Service</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-tartan-card rounded-2xl p-4 border border-tartan-border flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search services by title, tagline, or URL slug..."
            className="w-full bg-tartan-dark border border-tartan-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
        </div>

        <span className="text-xs text-tartan-gold font-bold bg-tartan-navy px-3 py-1.5 rounded-xl border border-tartan-border shrink-0">
          {services.length} Active Packages
        </span>
      </div>

      {/* Services Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredServices.map((service) => {
          const Icon = getServiceIcon(service.icon);
          const detailUrl = `/services/${service.slug || service.id}`;

          return (
            <div
              key={service.id}
              className={`bg-tartan-card rounded-3xl p-6 border shadow-2xl flex flex-col justify-between space-y-5 relative overflow-hidden transition-all ${
                service.popularBadge 
                  ? 'border-tartan-gold ring-1 ring-tartan-gold/40' 
                  : 'border-tartan-border hover:border-tartan-accent/50'
              }`}
            >
              {/* Badge */}
              {service.popularBadge && (
                <div className="absolute top-0 right-0 bg-gold-gradient text-tartan-dark text-[10px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow">
                  {service.badgeText || "Most Requested"}
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-tartan-navy flex items-center justify-center text-tartan-gold border border-tartan-accent/30 shadow-inner shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-white font-serif truncate">{service.title}</h3>
                    <p className="text-xs text-tartan-gold truncate">{service.tagline}</p>
                  </div>
                </div>

                {/* Slug and Pricing Row */}
                <div className="grid grid-cols-2 gap-2 bg-tartan-dark/80 p-3 rounded-xl border border-tartan-border/60 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Page URL Slug:</span>
                    <span className="text-gray-300 font-mono text-[11px] truncate block">/services/{service.slug}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Pricing & Deposit:</span>
                    <span className="text-white font-bold">{service.priceEstimate} ({service.deposit})</span>
                  </div>
                </div>

                <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                  {service.description}
                </p>

                {/* Features count */}
                <div className="flex items-center gap-2 text-[11px] text-gray-400">
                  <span className="bg-tartan-navy px-2.5 py-0.5 rounded-full border border-tartan-border text-tartan-gold font-semibold">
                    {service.features.length} Features Included
                  </span>
                  {service.recommendedTunes && (
                    <span className="bg-tartan-navy px-2.5 py-0.5 rounded-full border border-tartan-border text-gray-300">
                      {service.recommendedTunes.length} Sample Tunes
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-tartan-border/60 flex items-center justify-between gap-3">
                <Link
                  href={detailUrl}
                  target="_blank"
                  className="px-3 py-1.5 rounded-xl bg-tartan-navy hover:bg-slate-800 text-tartan-gold text-xs font-bold border border-tartan-border flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Live Page</span>
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(service)}
                    className="p-2 rounded-xl bg-blue-900/40 hover:bg-blue-800 text-blue-200 border border-blue-700 text-xs font-bold transition-all flex items-center gap-1"
                    title="Edit Service Package"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDelete(service.id, service.title)}
                    className="p-2 rounded-xl bg-red-900/40 hover:bg-red-800 text-red-200 border border-red-700 text-xs font-bold transition-all"
                    title="Delete Service Package"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT SERVICE MODAL */}
      {(isCreatingNew || editingService) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-tartan-card border border-tartan-accent/50 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between pb-4 border-b border-tartan-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-tartan-navy text-tartan-gold border border-tartan-accent/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-serif">
                    {isCreatingNew ? 'Create New Service Package' : `Edit: ${editingService?.title}`}
                  </h3>
                  <p className="text-xs text-tartan-gold">Configures public pricing card and dedicated SEO landing page</p>
                </div>
              </div>

              <button
                onClick={() => { setEditingService(null); setIsCreatingNew(false); }}
                className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              
              {/* Row 1: Title & URL Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-tartan-gold mb-1">
                    Service Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Scottish Castle & Highland Weddings"
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-tartan-gold mb-1">
                    Page URL Slug (/services/...) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="e.g. highland-castle-weddings"
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 font-mono focus:outline-none focus:border-tartan-accent"
                  />
                </div>
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-xs font-bold text-tartan-gold mb-1">
                  Tagline / Catchphrase *
                </label>
                <input
                  type="text"
                  required
                  value={formTagline}
                  onChange={(e) => setFormTagline(e.target.value)}
                  placeholder="e.g. The complete romantic ceremony & reception musical experience"
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent"
                />
              </div>

              {/* Row 2: Pricing, Base Price & Deposit */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-tartan-gold mb-1">
                    Display Price Estimate *
                  </label>
                  <input
                    type="text"
                    required
                    value={formPriceEstimate}
                    onChange={(e) => setFormPriceEstimate(e.target.value)}
                    placeholder="e.g. From £320 - £480"
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-tartan-gold mb-1">
                    Base Booking Total (£) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formBasePrice}
                    onChange={(e) => setFormBasePrice(Number(e.target.value))}
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-tartan-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-tartan-gold mb-1">
                    Deposit Amount (£) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formDepositAmount}
                    onChange={(e) => {
                      setFormDepositAmount(Number(e.target.value));
                      setFormDepositText(`£${e.target.value} Deposit`);
                    }}
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-tartan-accent"
                  />
                </div>
              </div>

              {/* Row 3: Icon & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold text-tartan-gold mb-1">
                    Package Icon
                  </label>
                  <select
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-tartan-accent"
                  >
                    <option value="Sparkles">Sparkles (General / Experience)</option>
                    <option value="Heart">Heart (Weddings)</option>
                    <option value="Flame">Flame (Funerals / Memorials)</option>
                    <option value="Castle">Castle (Galas / Corporate)</option>
                    <option value="GraduationCap">Graduation Cap (Tuition)</option>
                    <option value="Users">Users (Parties / Birthdays)</option>
                    <option value="Music">Music (Tunes / Concerts)</option>
                    <option value="Star">Star (VIP Special)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="popularCheck"
                    checked={formPopularBadge}
                    onChange={(e) => setFormPopularBadge(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                  />
                  <label htmlFor="popularCheck" className="text-xs text-gray-300 font-bold cursor-pointer">
                    Show Popular Pill Badge
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-tartan-gold mb-1">
                    Badge Text
                  </label>
                  <input
                    type="text"
                    disabled={!formPopularBadge}
                    value={formBadgeText}
                    onChange={(e) => setFormBadgeText(e.target.value)}
                    placeholder="Most Requested"
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent disabled:opacity-40"
                  />
                </div>
              </div>

              {/* Hero Image */}
              <div>
                <label className="block text-xs font-bold text-tartan-gold mb-1">
                  Hero Image URL
                </label>
                <input
                  type="text"
                  value={formHeroImage}
                  onChange={(e) => setFormHeroImage(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent"
                />
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-bold text-tartan-gold mb-1">
                  Card Short Summary Description *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Concise summary shown on the main /services page and homepage cards..."
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-3.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent"
                />
              </div>

              {/* Full Description */}
              <div>
                <label className="block text-xs font-bold text-tartan-gold mb-1">
                  Dedicated Page In-Depth Story / Full Description
                </label>
                <textarea
                  rows={4}
                  value={formFullDescription}
                  onChange={(e) => setFormFullDescription(e.target.value)}
                  placeholder="Detailed multi-paragraph description shown on the dedicated service landing page..."
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-3.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent"
                />
              </div>

              {/* Inclusions / Features List (1 per line) */}
              <div>
                <label className="block text-xs font-bold text-tartan-gold mb-1">
                  Package Inclusions & Features (Enter 1 per line) *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formFeaturesText}
                  onChange={(e) => setFormFeaturesText(e.target.value)}
                  placeholder="Enter each feature on a new line..."
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-3.5 text-xs text-white placeholder-gray-500 font-mono focus:outline-none focus:border-tartan-accent"
                />
              </div>

              {/* Recommended Sample Tunes (1 per line) */}
              <div>
                <label className="block text-xs font-bold text-tartan-gold mb-1">
                  Recommended Sample Tunes (Enter 1 per line)
                </label>
                <textarea
                  rows={3}
                  value={formTunesText}
                  onChange={(e) => setFormTunesText(e.target.value)}
                  placeholder="Highland Cathedral&#10;Scotland the Brave&#10;Auld Lang Syne"
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-3.5 text-xs text-white placeholder-gray-500 font-mono focus:outline-none focus:border-tartan-accent"
                />
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-4 border-t border-tartan-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setEditingService(null); setIsCreatingNew(false); }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-gray-300 hover:bg-slate-700 text-xs font-bold transition-all"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 flex items-center gap-2 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>{isCreatingNew ? 'Create & Publish Package' : 'Save Package Updates'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
