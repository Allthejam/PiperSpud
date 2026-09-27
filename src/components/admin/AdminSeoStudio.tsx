'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Search, 
  Globe, 
  Code, 
  CheckCircle2, 
  Sparkles, 
  Share2, 
  FileText, 
  Save,
  Copy,
  Smartphone,
  Monitor,
  Cloud,
  Upload,
  Trash2,
  ChevronDown,
  ExternalLink,
  Image as ImageIcon,
  Check,
  Layers
} from 'lucide-react';
import { uploadToStorage } from '@/lib/firebase';
import { formatOgImageToStandardDimensions } from '@/lib/imageOptimizer';

export const AdminSeoStudio: React.FC = () => {
  const { 
    seoPages, 
    getSeoForPage, 
    updatePageSeo, 
    syncAllToFirestore, 
    isSyncingFirestore 
  } = useApp();

  const [selectedPageId, setSelectedPageId] = useState('home');
  const [title, setTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [keywords, setKeywords] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [h1Tag, setH1Tag] = useState('');
  const [schemaType, setSchemaType] = useState('LocalBusiness');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop' | 'social'>('mobile');
  const [isSaved, setIsSaved] = useState(false);
  const [isUploadingOg, setIsUploadingOg] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);

  useEffect(() => {
    const pageConfig = getSeoForPage(selectedPageId);
    if (pageConfig) {
      setTitle(pageConfig.title);
      setMetaDesc(pageConfig.metaDescription);
      setKeywords(pageConfig.keywords.join(', '));
      setCanonicalUrl(pageConfig.canonicalUrl);
      setOgImage(pageConfig.ogImage);
      setH1Tag(pageConfig.h1);
      setSchemaType(pageConfig.schemaType);
    }
  }, [selectedPageId, getSeoForPage]);

  const handleSaveSeo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await updatePageSeo(selectedPageId, {
      title,
      metaDescription: metaDesc,
      keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
      canonicalUrl,
      ogImage,
      h1: h1Tag,
      schemaType
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handlePageSelect = (pageId: string) => {
    setSelectedPageId(pageId);
    const config = getSeoForPage(pageId);
    if (config) {
      setTitle(config.title);
      setMetaDesc(config.metaDescription);
      setKeywords(config.keywords.join(', '));
      setCanonicalUrl(config.canonicalUrl);
      setOgImage(config.ogImage);
      setH1Tag(config.h1);
      setSchemaType(config.schemaType);
    }
  };

  const handleOgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingOg(true);
      const optimizedFile = await formatOgImageToStandardDimensions(file);
      const uploadedUrl = await uploadToStorage(optimizedFile, 'seo_og_images');
      setOgImage(uploadedUrl);
    } catch (err) {
      console.warn('Could not upload OG image to storage:', err);
      // Fallback to local Data URL
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setOgImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingOg(false);
    }
  };

  // Generate dynamic Schema.org JSON-LD
  const generateSchemaJson = () => {
    const baseDomain = 'https://www.spudthepiper.com';
    const activeUrl = `${baseDomain}${selectedPageId === 'home' ? '' : '/' + selectedPageId}`;
    
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": selectedPageId === 'about' ? 'AboutPage' : selectedPageId === 'contact' ? 'ContactPage' : selectedPageId === 'faq' ? 'FAQPage' : 'ItemPage',
          "@id": `${activeUrl}#webpage`,
          "url": activeUrl,
          "name": title || "Spud the Piper",
          "description": metaDesc,
          "inLanguage": "en-GB",
          "isPartOf": {
            "@type": "WebSite",
            "@id": `${baseDomain}/#website`,
            "name": "Spud the Piper",
            "url": baseDomain
          }
        },
        {
          "@type": "MusicGroup",
          "@id": `${baseDomain}/#musicgroup`,
          "name": "Spud the Piper",
          "description": "Scotland's premier award-winning Highland Bagpiper for hire.",
          "url": baseDomain,
          "image": ogImage || "https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&q=80",
          "telephone": "+447793491367",
          "genre": ["Traditional Scottish", "Highland Bagpipe Music", "Celtic Folk"],
          "priceRange": "£220 - £650",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "GB",
            "addressRegion": "Scotland"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "5.0",
            "reviewCount": "120"
          }
        }
      ]
    };
  };

  const schemaJsonLd = generateSchemaJson();

  const handleCopySchema = () => {
    navigator.clipboard.writeText(JSON.stringify(schemaJsonLd, null, 2));
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  const activePageConfig = seoPages.find(p => p.pageId === selectedPageId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-tartan-card via-tartan-navy to-tartan-card border border-tartan-accent/40 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tartan-accent/20 border border-tartan-accent/40 text-tartan-gold text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Page Search Optimization & Social Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-white">
              Google SEO & Structured Data Studio
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
              Fine-tune Meta Tags, Google Search SERP previews, WhatsApp/Facebook OpenGraph cards, and Schema.org rich snippets across all website routes.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => syncAllToFirestore()}
              disabled={isSyncingFirestore}
              className="px-4 py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-600/80 text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50 shadow-md"
              title="Upload all pages directly to Firebase Firestore seo_pages collection"
            >
              <Cloud className={`w-4 h-4 text-emerald-400 ${isSyncingFirestore ? 'animate-spin' : ''}`} />
              <span>{isSyncingFirestore ? 'Syncing...' : 'Sync All Pages to Cloud'}</span>
            </button>

            <button
              type="button"
              onClick={handleSaveSeo}
              className="px-5 py-2.5 bg-gold-gradient text-tartan-dark font-extrabold text-xs rounded-xl shadow-lg hover:shadow-yellow-500/20 flex items-center gap-2 transition-transform active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{isSaved ? `Saved ${selectedPageId.toUpperCase()}!` : `Save ${selectedPageId.toUpperCase()} SEO`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Select Page Dropdown Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-tartan-card p-4 sm:px-6 rounded-2xl border border-tartan-border shadow-lg">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <label htmlFor="admin-seo-page-select" className="text-xs font-bold text-tartan-gold shrink-0 flex items-center gap-1.5 uppercase tracking-wider">
            <Globe className="w-4 h-4" />
            <span>Select Page to Edit:</span>
          </label>
          
          <div className="relative flex-1 max-w-md">
            <select
              id="admin-seo-page-select"
              value={selectedPageId}
              onChange={(e) => handlePageSelect(e.target.value)}
              className="w-full bg-tartan-navy text-white text-xs font-semibold py-2.5 px-4 rounded-xl border border-tartan-border focus:border-tartan-gold focus:outline-none appearance-none cursor-pointer pr-10 shadow-inner"
            >
              {seoPages.map((p) => (
                <option key={p.pageId} value={p.pageId} className="bg-tartan-card text-white py-1.5">
                  {p.pageName} ({p.path})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-tartan-gold">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <span className="text-xs text-gray-400">
            Active Route: <code className="text-tartan-gold bg-tartan-navy px-2 py-0.5 rounded-lg border border-tartan-border font-mono">{activePageConfig?.path || `/${selectedPageId}`}</code>
          </span>
        </div>
      </div>

      {/* Studio Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-xs">
        
        {/* Left Column: Form Settings */}
        <div className="lg:col-span-7 bg-tartan-card rounded-3xl p-6 sm:p-8 border border-tartan-border shadow-2xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-tartan-border">
            <span className="text-xs font-bold text-tartan-gold uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Meta Tags for: <span className="text-white normal-case font-mono">{activePageConfig?.path || `/${selectedPageId}`}</span></span>
            </span>
            <span className="text-[11px] text-gray-400 font-mono">
              Schema: {schemaType}
            </span>
          </div>

          <form onSubmit={handleSaveSeo} className="space-y-4">
            
            {/* Title Tag */}
            <div>
              <label className="block text-tartan-gold font-bold mb-1 flex items-center justify-between">
                <span>Google Title Tag (&lt;title&gt;)</span>
                <span className={`text-[10px] font-mono ${title.length <= 60 ? 'text-green-400' : 'text-amber-400'}`}>
                  {title.length} / 60 characters
                </span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Spud the Piper | Award-Winning Scottish Bagpiper"
                className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white font-medium focus:border-tartan-accent focus:outline-none text-xs"
              />
            </div>

            {/* Meta Description */}
            <div>
              <label className="block text-tartan-gold font-bold mb-1 flex items-center justify-between">
                <span>Google Meta Description (&lt;meta name=&quot;description&quot;&gt;)</span>
                <span className={`text-[10px] font-mono ${metaDesc.length <= 160 ? 'text-green-400' : 'text-amber-400'}`}>
                  {metaDesc.length} / 160 characters
                </span>
              </label>
              <textarea
                rows={3}
                value={metaDesc}
                onChange={(e) => setMetaDesc(e.target.value)}
                placeholder="Provide a compelling 150-160 character summary that entices clicks on Google search..."
                className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-3 text-white focus:border-tartan-accent focus:outline-none leading-relaxed text-xs"
              />
            </div>

            {/* H1 & Canonical URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-tartan-gold font-bold mb-1">Primary H1 Tag on Page</label>
                <input
                  type="text"
                  value={h1Tag}
                  onChange={(e) => setH1Tag(e.target.value)}
                  placeholder="Primary page title"
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white focus:border-tartan-accent focus:outline-none text-xs"
                />
              </div>
              <div>
                <label className="block text-tartan-gold font-bold mb-1">Canonical URL</label>
                <input
                  type="text"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder="https://www.spudthepiper.com/..."
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white focus:border-tartan-accent focus:outline-none text-xs"
                />
              </div>
            </div>

            {/* Focus Keywords */}
            <div>
              <label className="block text-tartan-gold font-bold mb-1">
                Target Search Keywords (Comma separated)
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g. Scottish Bagpiper, Wedding Piper Edinburgh, Castle Galas"
                className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white focus:border-tartan-accent focus:outline-none text-xs"
              />
            </div>

            {/* OpenGraph Social Share Image (og:image) Studio */}
            <div className="bg-tartan-navy/50 p-4 rounded-2xl border border-tartan-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-tartan-gold font-bold text-xs flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-tartan-gold" />
                    <span>Social Share Image (og:image)</span>
                  </label>
                  <p className="text-[10px] text-gray-400">
                    Shown when sharing on WhatsApp, Facebook, iMessage, and X (1200 × 630 px)
                  </p>
                </div>
                {ogImage && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600/40 font-mono">
                    Active Image Set
                  </span>
                )}
              </div>

              {/* Image Preview / Drop Zone */}
              <div className="relative aspect-[1.91/1] w-full rounded-xl overflow-hidden bg-tartan-dark border-2 border-dashed border-tartan-border group flex items-center justify-center">
                {ogImage ? (
                  <>
                    <img 
                      src={ogImage} 
                      alt="Social Preview" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                      <label className="cursor-pointer bg-tartan-gold text-tartan-dark font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 hover:brightness-110 shadow-lg">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingOg ? 'Uploading...' : 'Replace Image'}</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleOgImageUpload}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setOgImage('')}
                        className="bg-red-600/80 hover:bg-red-600 text-white p-1.5 rounded-lg text-xs flex items-center justify-center shadow-lg"
                        title="Remove Image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center p-6 text-center text-gray-400 hover:text-tartan-gold transition-colors w-full h-full">
                    <Upload className="w-8 h-8 mb-2 text-tartan-gold/70" />
                    <span className="font-semibold text-xs text-white">
                      {isUploadingOg ? 'Uploading to Firebase...' : 'Click to Upload Social Image'}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5">JPG, PNG, WebP (Max 5MB)</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleOgImageUpload}
                    />
                  </label>
                )}
              </div>

              {/* Direct URL input & Upload Button */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={ogImage}
                  onChange={(e) => setOgImage(e.target.value)}
                  placeholder="Paste image URL (https://...) or use Upload button"
                  className="flex-1 bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-white text-xs focus:border-tartan-accent focus:outline-none"
                />
                <label className="cursor-pointer bg-tartan-navy hover:bg-tartan-dark text-gray-200 hover:text-white border border-tartan-border rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-tartan-gold" />
                  <span>{isUploadingOg ? '...' : 'Upload'}</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleOgImageUpload}
                  />
                </label>
              </div>

              {/* Quick Scottish Presets */}
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider block mb-1.5">
                  Quick Scottish Presets for Spud:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { label: 'Feather Bonnet', url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&q=80' },
                    { label: 'Castle Wedding', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80' },
                    { label: 'Highland Sunset', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80' },
                    { label: 'Bagpipes Stage', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80' }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setOgImage(preset.url)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-medium border text-left truncate transition-colors ${
                        ogImage === preset.url 
                          ? 'bg-tartan-gold text-tartan-dark border-tartan-gold font-bold' 
                          : 'bg-tartan-dark/70 text-gray-300 hover:text-white border-tartan-border hover:bg-tartan-dark'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Form Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-yellow-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>{isSaved ? `Saved Changes to ${selectedPageId.toUpperCase()}!` : `Save ${selectedPageId.toUpperCase()} SEO`}</span>
              </button>
            </div>

          </form>
        </div>

        {/* Right Column: Multi-Device Simulator & Schema */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Live Simulator Card */}
          <div className="bg-tartan-card rounded-3xl p-6 border border-tartan-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-tartan-border">
              <h4 className="font-bold text-tartan-gold uppercase tracking-wider flex items-center gap-1.5 text-xs">
                <Search className="w-3.5 h-3.5" />
                <span>Live Search & Social Simulator</span>
              </h4>
              
              {/* Device Selector Tabs */}
              <div className="flex items-center bg-tartan-dark rounded-xl p-1 border border-tartan-border/80 text-[11px]">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                    previewDevice === 'mobile' 
                      ? 'bg-tartan-gold text-tartan-dark font-bold shadow-sm' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Mobile Phone Search Preview"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                    previewDevice === 'desktop' 
                      ? 'bg-tartan-gold text-tartan-dark font-bold shadow-sm' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Desktop PC Search Preview"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>PC</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('social')}
                  className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                    previewDevice === 'social' 
                      ? 'bg-tartan-gold text-tartan-dark font-bold shadow-sm' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="WhatsApp / Facebook Share Card Preview"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Social Card</span>
                </button>
              </div>
            </div>

            {/* 1. MOBILE PHONE PREVIEW */}
            {previewDevice === 'mobile' && (
              <div className="max-w-[340px] mx-auto bg-[#f8f9fa] text-gray-900 rounded-2xl border-4 border-slate-700 shadow-xl overflow-hidden font-sans">
                {/* Mobile Header Bar */}
                <div className="bg-white px-3 py-2 border-b border-gray-200 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <div className="flex-1 bg-gray-100 rounded-full px-2.5 py-1 text-[10px] text-gray-600 truncate flex items-center gap-1">
                    <Search className="w-2.5 h-2.5 text-gray-400 shrink-0" />
                    <span>google.co.uk/search?q=spud+the+piper</span>
                  </div>
                </div>

                {/* Mobile Google Result Card */}
                <div className="p-3 bg-white space-y-1.5">
                  <div className="flex items-center gap-2 text-[11px] text-gray-700">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-[10px] shrink-0 shadow-sm">
                      S
                    </span>
                    <div className="truncate text-[11px]">
                      <span className="font-semibold text-gray-900">Spud the Piper</span>
                      <span className="text-gray-500 text-[10px] block truncate">
                        spudthepiper.com › {selectedPageId === 'home' ? '' : selectedPageId}
                      </span>
                    </div>
                  </div>

                  {/* Title & Optional Rich Image Thumbnail */}
                  <div className="flex gap-2.5 items-start justify-between">
                    <div className="flex-1">
                      <h5 className="text-[15px] font-medium text-[#1a0dab] leading-snug line-clamp-2">
                        {title || 'Spud the Piper | Award-Winning Bagpiper'}
                      </h5>
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-[#e7711b]">
                        <span>★★★★★</span>
                        <span className="text-gray-600 font-medium text-[10px]">5.0 · 120 reviews</span>
                      </div>
                      <p className="text-[11px] text-[#4d5156] line-clamp-2 leading-relaxed mt-1">
                        {metaDesc || 'Scotland premier award-winning Highland Bagpiper for weddings, castle events, and private tours.'}
                      </p>
                    </div>

                    {ogImage && (
                      <img 
                        src={ogImage} 
                        alt="Mobile Thumbnail" 
                        className="w-16 h-16 rounded-xl object-cover border border-gray-200 shrink-0 shadow-sm"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2. DESKTOP PC PREVIEW */}
            {previewDevice === 'desktop' && (
              <div className="bg-white text-gray-900 p-4 rounded-xl border border-gray-200 shadow-sm text-left font-sans space-y-1">
                <div className="flex items-center gap-2 text-[11px] text-gray-600 mb-0.5">
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-[9px]">S</span>
                  <div className="truncate">
                    <span className="text-gray-800 font-medium">https://www.spudthepiper.com</span>
                    <span className="text-gray-500"> › {selectedPageId === 'home' ? '' : selectedPageId}</span>
                  </div>
                </div>
                <h5 className="text-[17px] font-normal text-[#1a0dab] hover:underline cursor-pointer leading-snug line-clamp-2">
                  {title || 'Page Title'}
                </h5>
                <div className="flex items-center gap-1 text-[11px] text-[#e7711b] py-0.5">
                  <span>★★★★★</span>
                  <span className="text-gray-600 font-medium">Rating: 5.0 · ‎120 reviews · Scottish Highland Piper</span>
                </div>
                <p className="text-[12px] text-[#4d5156] line-clamp-2 leading-relaxed">
                  {metaDesc || 'Meta description copy...'}
                </p>
              </div>
            )}

            {/* 3. SOCIAL MEDIA CARD PREVIEW */}
            {previewDevice === 'social' && (
              <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-lg text-left font-sans">
                <div className="aspect-[1.91/1] w-full bg-slate-800 relative overflow-hidden">
                  {ogImage ? (
                    <img 
                      src={ogImage} 
                      alt="Social Banner" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 text-xs gap-1">
                      <ImageIcon className="w-6 h-6 text-gray-600" />
                      <span>No OpenGraph image set yet</span>
                    </div>
                  )}
                  <span className="absolute top-2 right-2 bg-black/70 text-white text-[9px] px-2 py-0.5 rounded font-mono">
                    1200 × 630
                  </span>
                </div>
                <div className="p-3 bg-slate-950 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    SPUDTHEPIPER.COM
                  </span>
                  <h5 className="text-white font-bold text-xs line-clamp-1">
                    {title || 'Spud the Piper'}
                  </h5>
                  <p className="text-gray-300 text-[11px] line-clamp-2 leading-tight">
                    {metaDesc || 'Scotland\'s premier award-winning Highland Bagpiper.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Schema.org Structured Data Card */}
          <div className="bg-tartan-card rounded-3xl p-6 border border-tartan-border shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-tartan-border">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-tartan-gold" />
                <h4 className="font-bold text-white text-xs">Schema.org Structured Data (JSON-LD)</h4>
              </div>
              <button
                type="button"
                onClick={handleCopySchema}
                className="px-2.5 py-1 rounded-lg bg-tartan-navy hover:bg-slate-700 text-tartan-gold text-[11px] font-semibold border border-tartan-border flex items-center gap-1 transition-colors"
              >
                {copiedSchema ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSchema ? 'Copied!' : 'Copy Schema'}</span>
              </button>
            </div>

            <div className="bg-tartan-dark rounded-xl p-3 border border-tartan-border font-mono text-[11px] text-emerald-400 max-h-48 overflow-y-auto">
              <pre className="whitespace-pre-wrap">{JSON.stringify(schemaJsonLd, null, 2)}</pre>
            </div>
            <p className="text-[10px] text-gray-400">
              Automatically injected into the HTML &lt;head&gt; of <code className="text-tartan-gold font-mono">{activePageConfig?.path}</code> for Google Rich Results.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
