'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
  Edit3, 
  X, 
  Check, 
  Image as ImageIcon, 
  Camera, 
  Search, 
  LayoutDashboard, 
  LogOut, 
  Sparkles, 
  Type, 
  Globe, 
  Code, 
  Copy, 
  Save, 
  Smartphone, 
  Monitor 
} from 'lucide-react';
import { EditableCmsBlock } from '@/types/spud';

export const VisualPencilOverlay: React.FC = () => {
  const pathname = usePathname();
  const { 
    isMounted,
    isAdminLoggedIn, 
    isVisualEditMode, 
    toggleVisualEditMode, 
    editingBlock, 
    setEditingBlock, 
    updateCmsBlock,
    seoPages,
    getSeoForPage,
    updatePageSeo,
    activeSeoDrawerPageId,
    openSeoDrawer,
    closeSeoDrawer,
    logoutAdmin 
  } = useApp();

  // Element Edit State
  const [textContent, setTextContent] = useState('');
  const [altText, setAltText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [buttonColor, setButtonColor] = useState('');
  const [tagType, setTagType] = useState<EditableCmsBlock['tag']>('p');

  // Page SEO Studio Modal State
  const [selectedPageId, setSelectedPageId] = useState<string>('home');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [seoH1, setSeoH1] = useState('');
  const [seoCanonical, setSeoCanonical] = useState('');
  const [seoOgImage, setSeoOgImage] = useState('');
  const [seoSchemaType, setSeoSchemaType] = useState('LocalBusiness');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  // Derive current page ID from URL pathname
  const currentPageId = pathname === '/' ? 'home' : pathname.replace(/^\//, '');

  // Sync editing block when opened
  useEffect(() => {
    if (editingBlock) {
      setTextContent(editingBlock.content || '');
      setAltText(editingBlock.altText || '');
      setImageUrl(editingBlock.imageUrl || '');
      setLinkUrl(editingBlock.linkUrl || '');
      setButtonColor(editingBlock.buttonColor || '');
      setTagType(editingBlock.tag || 'p');
    }
  }, [editingBlock]);

  // When SEO modal is triggered, initialize selected page and form fields
  useEffect(() => {
    if (activeSeoDrawerPageId) {
      setSelectedPageId(activeSeoDrawerPageId);
      const pageConfig = getSeoForPage(activeSeoDrawerPageId);
      if (pageConfig) {
        setSeoTitle(pageConfig.title);
        setSeoDesc(pageConfig.metaDescription);
        setSeoKeywords(pageConfig.keywords.join(', '));
        setSeoH1(pageConfig.h1);
        setSeoCanonical(pageConfig.canonicalUrl);
        setSeoOgImage(pageConfig.ogImage);
        setSeoSchemaType(pageConfig.schemaType);
      }
    }
  }, [activeSeoDrawerPageId, getSeoForPage]);

  if (!isMounted || !isAdminLoggedIn) return null;

  const handleSaveElement = () => {
    if (!editingBlock) return;
    updateCmsBlock(editingBlock.id, textContent, altText, imageUrl, tagType, linkUrl, buttonColor);
    setEditingBlock(null);
  };

  const handleSavePageSeo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updatePageSeo(selectedPageId, {
      title: seoTitle,
      metaDescription: seoDesc,
      keywords: seoKeywords.split(',').map(k => k.trim()).filter(Boolean),
      h1: seoH1,
      canonicalUrl: seoCanonical,
      ogImage: seoOgImage,
      schemaType: seoSchemaType
    });
    setIsSavedSuccess(true);
    setTimeout(() => setIsSavedSuccess(false), 2000);
  };

  const handlePageSelect = (pageId: string) => {
    setSelectedPageId(pageId);
    const config = getSeoForPage(pageId);
    if (config) {
      setSeoTitle(config.title);
      setSeoDesc(config.metaDescription);
      setSeoKeywords(config.keywords.join(', '));
      setSeoH1(config.h1);
      setSeoCanonical(config.canonicalUrl);
      setSeoOgImage(config.ogImage);
      setSeoSchemaType(config.schemaType);
    }
  };

  const handleSimulateCamera = () => {
    const stockPipes = [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1000&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&q=80',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1000&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000&q=80'
    ];
    setImageUrl(stockPipes[Math.floor(Math.random() * stockPipes.length)]);
  };

  // Build dynamic Schema.org JSON-LD for the selected page
  const generateSchemaJson = () => {
    const baseDomain = 'https://www.spudthepiper.co.uk';
    const activeUrl = `${baseDomain}/${selectedPageId === 'home' ? '' : selectedPageId}`;
    
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": selectedPageId === 'about' ? 'AboutPage' : selectedPageId === 'contact' ? 'ContactPage' : selectedPageId === 'faq' ? 'FAQPage' : 'ItemPage',
          "@id": `${activeUrl}#webpage`,
          "url": activeUrl,
          "name": seoTitle,
          "description": seoDesc,
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
          "image": seoOgImage || "https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&q=80",
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

  const schemaJsonObj = generateSchemaJson();
  const activeCurrentSeo = getSeoForPage(currentPageId);

  return (
    <>
      {/* 1. TOP ADMIN MASTER BAR */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-tartan-dark via-tartan-navy to-tartan-card border-b border-tartan-accent/40 px-4 py-2 text-white shadow-2xl flex items-center justify-between flex-wrap gap-2 text-xs md:text-sm">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping"></span>
          <span className="font-bold text-tartan-gold tracking-wide flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-tartan-gold" />
            Spud Admin Mode
          </span>
          <span className="hidden sm:inline-block text-[11px] text-gray-400 border-l border-slate-700 pl-2">
            Page: <span className="text-white font-mono">{pathname}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          {/* Visual In-Page Edit Toggle */}
          <button
            onClick={toggleVisualEditMode}
            className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-all text-xs ${
              isVisualEditMode 
                ? 'bg-tartan-gold text-tartan-dark ring-2 ring-yellow-300 shadow-md font-bold' 
                : 'bg-slate-800 text-gray-200 hover:bg-slate-700 border border-slate-600'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isVisualEditMode ? 'Pencil Edit: ON' : 'Enable Pencil Edit'}</span>
          </button>

          {/* Quick Page SEO & Schema Modal Trigger */}
          <button
            onClick={() => openSeoDrawer(currentPageId)}
            className="px-3 py-1.5 rounded-md bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-blue-100 border border-blue-600 font-semibold flex items-center gap-1.5 transition-all text-xs shadow"
          >
            <Search className="w-3.5 h-3.5 text-blue-300" />
            <span>SEO & Schema Studio</span>
          </button>

          <a
            href="/admin"
            className="px-3 py-1.5 rounded-md bg-tartan-accent/20 hover:bg-tartan-accent/30 text-tartan-goldLight border border-tartan-accent/50 font-semibold flex items-center gap-1.5 transition-colors text-xs"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Back Office CRM</span>
          </a>

          <button
            onClick={logoutAdmin}
            className="px-2.5 py-1.5 rounded-md bg-red-900/40 hover:bg-red-800 text-red-200 border border-red-700 font-medium flex items-center gap-1 transition-colors text-xs"
            title="Log Out Admin"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* 2. BOTTOM FLOATING PAGE SEO DOCK (Visible on all live public pages when admin logged in) */}
      <div className="fixed bottom-4 left-4 z-40 bg-tartan-card/95 backdrop-blur-md border border-tartan-accent/60 rounded-2xl p-3 shadow-2xl flex items-center gap-3 text-xs max-w-md animate-in slide-in-from-bottom duration-200">
        <div className="p-2 rounded-xl bg-tartan-navy border border-tartan-border text-tartan-gold">
          <Globe className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-tartan-navy text-tartan-gold border border-tartan-border">
              Page SEO
            </span>
            <span className="text-white font-semibold truncate">{activeCurrentSeo.pageName}</span>
          </div>
          <p className="text-[11px] text-gray-400 truncate mt-0.5" title={activeCurrentSeo.title}>
            &lt;title&gt;: {activeCurrentSeo.title}
          </p>
        </div>
        <button
          onClick={() => openSeoDrawer(currentPageId)}
          className="px-3 py-1.5 bg-gold-gradient text-tartan-dark font-bold text-xs rounded-xl shadow hover:brightness-110 flex items-center gap-1 shrink-0"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Edit SEO</span>
        </button>
      </div>

      {/* 3. ELEMENT PENCIL & HEADING/TAG MODAL */}
      {editingBlock && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-tartan-card border border-tartan-accent/50 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-tartan-navy px-6 py-4 border-b border-tartan-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-tartan-accent/20 text-tartan-gold">
                  {editingBlock.tag === 'image' ? <ImageIcon className="w-5 h-5" /> : <Type className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Visual Content & Heading/SEO Tag Editor</h3>
                  <p className="text-xs text-tartan-muted">Element ID: <span className="text-tartan-gold font-mono">{editingBlock.id}</span></p>
                </div>
              </div>
              <button
                onClick={() => setEditingBlock(null)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-sm">
              {editingBlock.tag === 'image' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1.5">
                      Image URL (High-Res CDN or Local Path)
                    </label>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-tartan-dark border border-tartan-border rounded-lg px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSimulateCamera}
                      className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium flex items-center gap-2 border border-slate-700"
                    >
                      <Camera className="w-4 h-4 text-tartan-gold" />
                      <span>Choose High-Res Bagpipe Photo</span>
                    </button>
                  </div>

                  {imageUrl && (
                    <div className="mt-2 p-2 rounded-lg bg-tartan-dark border border-tartan-border/60">
                      <p className="text-xs text-tartan-muted mb-1 font-semibold">Image Preview:</p>
                      <img src={imageUrl} alt="Preview" className="w-full h-40 object-cover rounded-md" />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1.5">
                      SEO Image Alt Tag (Crucial for Google Image Search)
                    </label>
                    <input
                      type="text"
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      placeholder="e.g. Spud the Piper playing Highland Cathedral at Edinburgh Castle"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-lg px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">Include keywords like Scottish Bagpiper, wedding venue, or event type for Google indexing.</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1.5 flex items-center justify-between">
                      <span>Semantic HTML / Heading Tag</span>
                      <span className="text-[10px] text-gray-400">Controls SEO structure hierarchy</span>
                    </label>
                    <select
                      value={tagType}
                      onChange={(e) => setTagType(e.target.value as any)}
                      className="w-full bg-tartan-dark border border-tartan-border rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-tartan-accent font-semibold"
                    >
                      <option value="h1">H1 Tag (Primary Page Title - 1 per page recommended)</option>
                      <option value="h2">H2 Tag (Major Section Header)</option>
                      <option value="h3">H3 Tag (Sub-section Header)</option>
                      <option value="h4">H4 Tag (Feature / Card Box Title)</option>
                      <option value="h5">H5 Tag (Minor Heading)</option>
                      <option value="h6">H6 Tag (Small Heading)</option>
                      <option value="p">P Tag (Paragraph / Body Copy)</option>
                      <option value="span">Span Tag (Inline Text / Badge)</option>
                      <option value="a">A Tag (Hyperlink / Action Link)</option>
                      <option value="blockquote">Blockquote (Testimonial Quote)</option>
                      <option value="button">Button (Call To Action Link/Button)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1.5">
                      Element Text Content
                    </label>
                    <textarea
                      rows={4}
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      className="w-full bg-tartan-dark border border-tartan-border rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent text-sm"
                      placeholder="Enter copy..."
                    />
                  </div>

                  {/* Link Mapping Destination */}
                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1.5 flex items-center justify-between">
                      <span>Action Link / URL Mapping (Optional)</span>
                      <span className="text-[10px] text-gray-400">e.g. #booking, /services, tel:07793491367</span>
                    </label>
                    <input
                      type="text"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="e.g. #booking, /tunes, https://facebook.com/spudthepiper/, tel:07793491367"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-lg px-3.5 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent text-xs"
                    />
                  </div>

                  {/* Button Color & Styling Preset */}
                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1.5">
                      Button / Highlight Color Scheme
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { label: 'Gold Gradient', val: 'bg-gold-gradient text-tartan-dark font-extrabold' },
                        { label: 'Royal Blue', val: 'bg-blue-600 hover:bg-blue-500 text-white font-bold' },
                        { label: 'Tartan Navy', val: 'bg-tartan-navy hover:bg-slate-700 text-white font-bold' },
                        { label: 'Emerald Green', val: 'bg-emerald-600 hover:bg-emerald-500 text-white font-bold' },
                        { label: 'Crimson Tartan', val: 'bg-red-700 hover:bg-red-600 text-white font-bold' },
                        { label: 'Dark Slate Glass', val: 'bg-slate-900/90 text-gray-200 border border-slate-700 font-bold' },
                        { label: 'Gold Outline', val: 'border border-tartan-accent text-tartan-gold bg-transparent font-bold' },
                        { label: 'Default / None', val: '' }
                      ].map(preset => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setButtonColor(preset.val)}
                          className={`p-2 rounded-lg text-[11px] text-center border transition-all ${
                            buttonColor === preset.val
                              ? 'border-tartan-gold ring-2 ring-tartan-gold/50 bg-tartan-dark font-bold text-white'
                              : 'border-tartan-border bg-tartan-navy/60 text-gray-300 hover:border-gray-500'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-tartan-navy px-6 py-4 border-t border-tartan-border flex items-center justify-between">
              <button
                type="button"
                onClick={() => setEditingBlock(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveElement}
                className="px-5 py-2 rounded-lg bg-tartan-gold hover:bg-yellow-400 text-tartan-dark font-extrabold text-xs flex items-center gap-1.5 shadow-lg transition-transform active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Save to Live Site</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. COMPREHENSIVE MULTI-PAGE GOOGLE SEO & STRUCTURED DATA STUDIO MODAL */}
      {activeSeoDrawerPageId && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-tartan-card border border-tartan-accent/60 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="bg-tartan-navy px-6 py-4 border-b border-tartan-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold shadow">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-serif flex items-center gap-2">
                    <span>Google SEO & Structured Data Studio</span>
                    <span className="text-xs bg-tartan-dark text-tartan-gold font-mono px-2 py-0.5 rounded-full border border-tartan-border">
                      All 14 Pages Enabled
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400">Tune Meta Tags, SERP Snippets, OpenGraph Cards, and Schema.org for every page on the site</p>
                </div>
              </div>

              <button
                onClick={closeSeoDrawer}
                className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Page Tabs Bar */}
            <div className="bg-tartan-dark px-6 py-2.5 border-b border-tartan-border/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-bold text-tartan-gold shrink-0 uppercase tracking-wider">
                Select Page:
              </span>
              {seoPages.map((p) => {
                const isActive = p.pageId === selectedPageId;
                return (
                  <button
                    key={p.pageId}
                    type="button"
                    onClick={() => handlePageSelect(p.pageId)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                      isActive 
                        ? 'bg-tartan-gold text-tartan-dark shadow-md font-bold' 
                        : 'bg-tartan-navy/70 text-gray-300 hover:text-white hover:bg-tartan-navy border border-tartan-border/40'
                    }`}
                  >
                    <span>{p.pageName}</span>
                    <span className="text-[10px] opacity-70 font-mono">({p.path})</span>
                  </button>
                );
              })}
            </div>

            {/* Studio Content Grid */}
            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
              
              {/* Left Column: Form Controls */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* Title */}
                <div>
                  <label className="block text-tartan-gold font-bold mb-1 flex items-center justify-between">
                    <span>Google Title Tag (&lt;title&gt;)</span>
                    <span className={`text-[10px] font-mono ${seoTitle.length <= 60 ? 'text-green-400' : 'text-amber-400'}`}>
                      {seoTitle.length} / 60 characters
                    </span>
                  </label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="e.g. Spud the Piper | Award-Winning Scottish Bagpiper"
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white font-medium focus:border-tartan-accent focus:outline-none"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-tartan-gold font-bold mb-1 flex items-center justify-between">
                    <span>Google Meta Description (&lt;meta name=&quot;description&quot;&gt;)</span>
                    <span className={`text-[10px] font-mono ${seoDesc.length <= 160 ? 'text-green-400' : 'text-amber-400'}`}>
                      {seoDesc.length} / 160 characters
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    value={seoDesc}
                    onChange={(e) => setSeoDesc(e.target.value)}
                    placeholder="Provide a compelling 150-160 character summary that entices clicks on Google search..."
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-3 text-white focus:border-tartan-accent focus:outline-none leading-relaxed"
                  />
                </div>

                {/* H1 & Canonical URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-tartan-gold font-bold mb-1">Primary H1 Tag on Page</label>
                    <input
                      type="text"
                      value={seoH1}
                      onChange={(e) => setSeoH1(e.target.value)}
                      placeholder="Primary page title"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white focus:border-tartan-accent focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-tartan-gold font-bold mb-1">Canonical URL</label>
                    <input
                      type="text"
                      value={seoCanonical}
                      onChange={(e) => setSeoCanonical(e.target.value)}
                      placeholder="https://www.spudthepiper.co.uk/..."
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white focus:border-tartan-accent focus:outline-none"
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
                    value={seoKeywords}
                    onChange={(e) => setSeoKeywords(e.target.value)}
                    placeholder="e.g. Scottish Bagpiper, Wedding Piper Edinburgh, Castle Galas"
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white focus:border-tartan-accent focus:outline-none"
                  />
                </div>

                {/* Social Share OG Image */}
                <div>
                  <label className="block text-tartan-gold font-bold mb-1">OpenGraph Social Share Image (og:image)</label>
                  <input
                    type="text"
                    value={seoOgImage}
                    onChange={(e) => setSeoOgImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white focus:border-tartan-accent focus:outline-none"
                  />
                </div>

              </div>

              {/* Right Column: Live Google & Social Preview & Schema */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Google SERP Card */}
                <div className="bg-tartan-navy/60 rounded-2xl p-4 border border-tartan-border space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-tartan-gold uppercase tracking-wider flex items-center gap-1.5 text-xs">
                      <Search className="w-3.5 h-3.5" />
                      <span>Live Google Search Simulator</span>
                    </h4>
                    <div className="flex items-center gap-1 bg-tartan-dark rounded-lg p-1 border border-tartan-border/80">
                      <button
                        type="button"
                        onClick={() => setPreviewDevice('desktop')}
                        className={`p-1 rounded ${previewDevice === 'desktop' ? 'bg-tartan-accent/30 text-tartan-gold' : 'text-gray-400'}`}
                        title="Desktop Preview"
                      >
                        <Monitor className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewDevice('mobile')}
                        className={`p-1 rounded ${previewDevice === 'mobile' ? 'bg-tartan-accent/30 text-tartan-gold' : 'text-gray-400'}`}
                        title="Mobile Preview"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Google Snippet Box */}
                  <div className="bg-white text-gray-900 p-4 rounded-xl border border-gray-200 shadow-sm text-left font-sans">
                    <div className="flex items-center gap-2 text-[11px] text-gray-600 mb-1">
                      <span className="w-4 h-4 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-[9px]">S</span>
                      <div className="truncate">
                        <span className="text-gray-800 font-medium">spudthepiper.co.uk</span>
                        <span className="text-gray-500"> › {selectedPageId === 'home' ? '' : selectedPageId}</span>
                      </div>
                    </div>
                    <h5 className="text-[15px] font-medium text-[#1a0dab] hover:underline cursor-pointer leading-snug line-clamp-2">
                      {seoTitle || 'Page Title'}
                    </h5>
                    <p className="text-[12px] text-[#4d5156] line-clamp-2 leading-relaxed mt-1">
                      {seoDesc || 'Meta description copy...'}
                    </p>
                    <div className="mt-2 pt-1 border-t border-gray-100 flex items-center gap-1 text-[11px] text-[#e7711b]">
                      <span>★★★★★</span>
                      <span className="text-gray-600 font-medium">5.0 · 120 verified reviews · Bagpiper</span>
                    </div>
                  </div>
                </div>

                {/* Schema.org Structured Data */}
                <div className="bg-tartan-navy/60 rounded-2xl p-4 border border-tartan-border space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-tartan-gold uppercase tracking-wider flex items-center gap-1.5 text-xs">
                      <Code className="w-3.5 h-3.5" />
                      <span>Schema.org JSON-LD</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(schemaJsonObj, null, 2));
                        alert('Schema JSON-LD copied to clipboard!');
                      }}
                      className="text-[11px] text-gray-300 hover:text-white flex items-center gap-1 bg-tartan-dark px-2.5 py-1 rounded-lg border border-tartan-border"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="bg-tartan-dark p-3 rounded-xl border border-tartan-border/80 max-h-40 overflow-y-auto font-mono text-[10px] text-green-300 no-scrollbar">
                    <pre>{JSON.stringify(schemaJsonObj, null, 2)}</pre>
                  </div>
                </div>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-tartan-navy px-6 py-4 border-t border-tartan-border flex items-center justify-between">
              <div className="text-xs text-gray-400">
                {isSavedSuccess && (
                  <span className="text-green-400 font-bold flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Saved {selectedPageId.toUpperCase()} SEO configuration!
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={closeSeoDrawer}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSavePageSeo}
                  className="px-6 py-2.5 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs flex items-center gap-2 shadow-lg hover:brightness-110 active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Save {selectedPageId.toUpperCase()} SEO</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
