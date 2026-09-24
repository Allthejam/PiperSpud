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
  Monitor,
  Upload,
  Database,
  Cloud,
  RefreshCw,
  Move,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Sliders,
  Eye,
  Grid
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
    isSyncingFirestore,
    syncAllToFirestore,
    logoutAdmin 
  } = useApp();

  // Element Edit State
  const [textContent, setTextContent] = useState('');
  const [altText, setAltText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [buttonColor, setButtonColor] = useState('');
  const [tagType, setTagType] = useState<EditableCmsBlock['tag']>('p');

  // Image Framing, Panning & Zoom State
  const [imageFit, setImageFit] = useState<'cover' | 'contain' | 'fill' | 'none'>('cover');
  const [imagePositionX, setImagePositionX] = useState<number>(50);
  const [imagePositionY, setImagePositionY] = useState<number>(50);
  const [imageScale, setImageScale] = useState<number>(1.0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; startPosX: number; startPosY: number } | null>(null);

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
      setImageFit(editingBlock.imageFit || 'cover');
      setImagePositionX(editingBlock.imagePositionX !== undefined ? editingBlock.imagePositionX : 50);
      setImagePositionY(editingBlock.imagePositionY !== undefined ? editingBlock.imagePositionY : 50);
      setImageScale(editingBlock.imageScale !== undefined ? editingBlock.imageScale : 1.0);
    }
  }, [editingBlock]);

  // Interactive Pan & Drag Handlers for Image Preview
  const handlePreviewMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      startPosX: imagePositionX,
      startPosY: imagePositionY,
    });
  };

  const handlePreviewMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStart) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    // Dragging shifts the position smoothly
    const newPosX = Math.max(0, Math.min(100, Math.round(dragStart.startPosX - (deltaX / 2.5))));
    const newPosY = Math.max(0, Math.min(100, Math.round(dragStart.startPosY - (deltaY / 2.5))));
    setImagePositionX(newPosX);
    setImagePositionY(newPosY);
  };

  const handlePreviewMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const handlePreviewWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.08 : -0.08;
    setImageScale(prev => Math.max(0.5, Math.min(3.0, Number((prev + zoomDelta).toFixed(2)))));
  };

  const handlePresetPosition = (posX: number, posY: number) => {
    setImagePositionX(posX);
    setImagePositionY(posY);
  };

  const handleResetFraming = () => {
    setImageFit('cover');
    setImagePositionX(50);
    setImagePositionY(50);
    setImageScale(1.0);
  };

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
    updateCmsBlock(
      editingBlock.id, 
      textContent, 
      altText, 
      imageUrl, 
      tagType, 
      linkUrl, 
      buttonColor,
      imageFit,
      imagePositionX,
      imagePositionY,
      imageScale
    );
    setEditingBlock(null);
  };

  const handleSavePageSeo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await updatePageSeo(selectedPageId, {
      title: seoTitle,
      metaDescription: seoDesc,
      keywords: seoKeywords.split(',').map(k => k.trim()).filter(Boolean),
      h1: seoH1,
      canonicalUrl: seoCanonical,
      ogImage: seoOgImage,
      schemaType: seoSchemaType
    });
    setIsSavedSuccess(true);
    setTimeout(() => setIsSavedSuccess(false), 3000);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
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

          {/* Cloud Database Sync */}
          <button
            onClick={() => syncAllToFirestore()}
            disabled={isSyncingFirestore}
            className="px-3 py-1.5 rounded-md bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-600 font-semibold flex items-center gap-1.5 transition-all text-xs shadow disabled:opacity-50"
            title="Push all collections (SEO pages, tunes, blocks) directly to Firebase Cloud Firestore"
          >
            <Cloud className={`w-3.5 h-3.5 text-emerald-400 ${isSyncingFirestore ? 'animate-spin' : ''}`} />
            <span>{isSyncingFirestore ? 'Syncing...' : 'Sync to Firebase'}</span>
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

                  <div className="flex items-center gap-3 flex-wrap">
                    <label className="cursor-pointer px-3.5 py-2 rounded-lg bg-gold-gradient text-tartan-dark text-xs font-extrabold flex items-center gap-2 shadow-md hover:brightness-110 transition-all">
                      <Upload className="w-4 h-4" />
                      <span>Upload Photo from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={handleSimulateCamera}
                      className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium flex items-center gap-2 border border-slate-700 transition-all"
                    >
                      <Camera className="w-4 h-4 text-tartan-gold" />
                      <span>Choose Sample Piping Photo</span>
                    </button>
                  </div>

                  {imageUrl && (
                    <div className="space-y-4 p-4 rounded-xl bg-tartan-dark/95 border border-tartan-border">
                      {/* Header with quick tip */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Move className="w-4 h-4 text-tartan-gold" />
                          <span className="text-xs font-bold text-white">Interactive Framing, Pan & Zoom Studio</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleResetFraming}
                          className="text-[11px] text-tartan-gold hover:text-yellow-300 font-semibold flex items-center gap-1 transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset</span>
                        </button>
                      </div>

                      {/* 1. Interactive Preview Canvas with Mouse Drag and Scroll Zoom */}
                      <div 
                        onMouseDown={handlePreviewMouseDown}
                        onMouseMove={handlePreviewMouseMove}
                        onMouseUp={handlePreviewMouseUp}
                        onMouseLeave={handlePreviewMouseUp}
                        onWheel={handlePreviewWheel}
                        className={`relative w-full h-56 rounded-xl overflow-hidden bg-slate-950 border-2 ${isDragging ? 'border-tartan-gold cursor-grabbing' : 'border-tartan-accent/60 cursor-grab'} select-none flex items-center justify-center`}
                        title="Click and drag to slide image position. Scroll mouse wheel to zoom in/out."
                      >
                        {/* Center Guides */}
                        <div className="absolute inset-0 pointer-events-none border border-white/10 grid grid-cols-3 grid-rows-3 z-10 opacity-30">
                          <div className="border-r border-b border-white/10"></div>
                          <div className="border-r border-b border-white/10"></div>
                          <div className="border-b border-white/10"></div>
                          <div className="border-r border-b border-white/10"></div>
                          <div className="border-r border-b border-white/10"></div>
                          <div className="border-b border-white/10"></div>
                          <div className="border-r border-white/10"></div>
                          <div className="border-r border-white/10"></div>
                          <div></div>
                        </div>

                        {/* Image Layer */}
                        <img 
                          src={imageUrl} 
                          alt="Framing Preview" 
                          draggable={false}
                          className="w-full h-full pointer-events-none transition-transform duration-75"
                          style={{
                            objectFit: imageFit as any,
                            objectPosition: `${imagePositionX}% ${imagePositionY}%`,
                            transform: `scale(${imageScale})`,
                            transformOrigin: `${imagePositionX}% ${imagePositionY}%`
                          }}
                        />

                        {/* Drag / Zoom Overlay Badge */}
                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2 pointer-events-none z-20">
                          <div className="px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-white text-[10px] font-semibold border border-white/20 flex items-center gap-1.5 shadow-lg">
                            <Move className="w-3 h-3 text-tartan-gold" />
                            <span>Drag to Slide • Scroll to Zoom</span>
                          </div>

                          <div className="px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-tartan-gold text-[10px] font-mono font-bold border border-tartan-accent/40 shadow-lg">
                            Zoom: {Math.round(imageScale * 100)}% • Pos: {imagePositionX}%, {imagePositionY}%
                          </div>
                        </div>
                      </div>

                      {/* 2. Fit Mode Selector */}
                      <div>
                        <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                          Frame Fit Mode
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setImageFit('cover')}
                            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                              imageFit === 'cover'
                                ? 'bg-gold-gradient text-tartan-dark shadow-md'
                                : 'bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                            }`}
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>Fill Frame (Cover)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setImageFit('contain')}
                            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                              imageFit === 'contain'
                                ? 'bg-gold-gradient text-tartan-dark shadow-md'
                                : 'bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                            }`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Best Fit (Entire Photo)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setImageFit('fill')}
                            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                              imageFit === 'fill'
                                ? 'bg-gold-gradient text-tartan-dark shadow-md'
                                : 'bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                            }`}
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Stretch (Fill)</span>
                          </button>
                        </div>
                      </div>

                      {/* 3. Zoom Controls */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
                          <span className="flex items-center gap-1 text-tartan-gold">
                            <ZoomIn className="w-3.5 h-3.5" />
                            <span>Zoom / Scale Factor</span>
                          </span>
                          <span className="text-white font-mono">{Math.round(imageScale * 100)}%</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setImageScale(prev => Math.max(0.5, Number((prev - 0.1).toFixed(2))))}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                            title="Zoom Out"
                          >
                            <ZoomOut className="w-4 h-4" />
                          </button>
                          <input
                            type="range"
                            min="0.5"
                            max="3.0"
                            step="0.05"
                            value={imageScale}
                            onChange={(e) => setImageScale(parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                          />
                          <button
                            type="button"
                            onClick={() => setImageScale(prev => Math.min(3.0, Number((prev + 0.1).toFixed(2))))}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                            title="Zoom In"
                          >
                            <ZoomIn className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* 4. Fine Position Sliders & 9-Point Alignment Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-1">
                        {/* Position Sliders */}
                        <div className="sm:col-span-8 space-y-3">
                          {/* Horizontal Pan (X) */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-gray-300">
                              <span>Horizontal Pan (Left ⟷ Right):</span>
                              <span className="text-tartan-gold font-mono">{imagePositionX}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={imagePositionX}
                              onChange={(e) => setImagePositionX(parseInt(e.target.value, 10))}
                              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                          </div>

                          {/* Vertical Pan (Y) */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-gray-300">
                              <span>Vertical Pan (Top ⟷ Bottom):</span>
                              <span className="text-tartan-gold font-mono">{imagePositionY}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={imagePositionY}
                              onChange={(e) => setImagePositionY(parseInt(e.target.value, 10))}
                              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                          </div>
                        </div>

                        {/* 9-Point Quick Focus Grid */}
                        <div className="sm:col-span-4 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                          <span className="text-[10px] font-bold text-gray-400 block text-center uppercase tracking-wider">
                            Focal Alignment
                          </span>
                          <div className="grid grid-cols-3 gap-1">
                            {[
                              { label: '↖', x: 0, y: 0, tip: 'Top Left' },
                              { label: '⬆', x: 50, y: 0, tip: 'Top (Face/Feather Bonnet)' },
                              { label: '↗', x: 100, y: 0, tip: 'Top Right' },
                              { label: '⬅', x: 0, y: 50, tip: 'Center Left' },
                              { label: '⏺', x: 50, y: 50, tip: 'Center' },
                              { label: '➡', x: 100, y: 50, tip: 'Center Right' },
                              { label: '↙', x: 0, y: 100, tip: 'Bottom Left' },
                              { label: '⬇', x: 50, y: 100, tip: 'Bottom (Kilt/Pipes)' },
                              { label: '↘', x: 100, y: 100, tip: 'Bottom Right' },
                            ].map((pos) => {
                              const isActive = imagePositionX === pos.x && imagePositionY === pos.y;
                              return (
                                <button
                                  key={pos.label}
                                  type="button"
                                  onClick={() => handlePresetPosition(pos.x, pos.y)}
                                  title={pos.tip}
                                  className={`h-7 rounded-md text-xs font-bold transition-all flex items-center justify-center ${
                                    isActive
                                      ? 'bg-tartan-gold text-tartan-dark shadow font-extrabold'
                                      : 'bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-white'
                                  }`}
                                >
                                  {pos.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
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
                      <option value="div">Div Tag (Block Container / Stat Number)</option>
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
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5 animate-pulse">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Saved {selectedPageId.toUpperCase()} to Cloud Firestore Database & Synced!</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => syncAllToFirestore()}
                  disabled={isSyncingFirestore}
                  className="px-4 py-2.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 text-emerald-200 border border-emerald-600 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
                  title="Upload all 14 pages to Firebase Firestore seo_pages collection"
                >
                  <Cloud className={`w-3.5 h-3.5 text-emerald-400 ${isSyncingFirestore ? 'animate-spin' : ''}`} />
                  <span>{isSyncingFirestore ? 'Syncing...' : 'Sync All 14 Pages to Cloud'}</span>
                </button>
                <button
                  type="button"
                  onClick={closeSeoDrawer}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 text-xs font-semibold"
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
