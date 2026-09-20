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
  Cloud
} from 'lucide-react';

export const AdminSeoStudio: React.FC = () => {
  const { seoPages, getSeoForPage, updatePageSeo, syncAllToFirestore, isSyncingFirestore } = useApp();

  const [selectedPageId, setSelectedPageId] = useState('home');
  const [title, setTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [keywords, setKeywords] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [h1Tag, setH1Tag] = useState('');
  const [schemaType, setSchemaType] = useState('LocalBusiness');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [isSaved, setIsSaved] = useState(false);

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

  const handleSaveSeo = async (e: React.FormEvent) => {
    e.preventDefault();
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

  // Generate dynamic Schema.org JSON-LD
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
          "name": title,
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

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-serif flex items-center gap-2">
            <span>Google SEO & Structured Data Studio</span>
            <span className="text-xs bg-tartan-navy text-tartan-gold font-mono px-2.5 py-1 rounded-full border border-tartan-border">
              All 14 Pages
            </span>
          </h2>
          <p className="text-xs text-gray-400">Manage page meta tags, OpenGraph social previews, H1 hierarchy, and Schema.org rich snippets for all website routes</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => syncAllToFirestore()}
            disabled={isSyncingFirestore}
            className="px-4 py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-600 text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50 shadow"
            title="Upload all 14 pages directly to Firebase Firestore seo_pages collection"
          >
            <Cloud className={`w-4 h-4 text-emerald-400 ${isSyncingFirestore ? 'animate-spin' : ''}`} />
            <span>{isSyncingFirestore ? 'Syncing to Cloud...' : 'Sync All 14 Pages to Firebase'}</span>
          </button>

          <button
            onClick={handleSaveSeo}
            className="px-5 py-2.5 bg-gold-gradient text-tartan-dark font-extrabold text-xs rounded-xl shadow-lg hover:brightness-110 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaved ? `Saved ${selectedPageId.toUpperCase()} to Firebase!` : `Save ${selectedPageId.toUpperCase()} SEO`}</span>
          </button>
        </div>
      </div>

      {/* Page Tabs */}
      <div className="bg-tartan-card p-3 rounded-2xl border border-tartan-border flex items-center gap-2 overflow-x-auto no-scrollbar shadow-lg">
        <span className="text-[11px] font-bold text-tartan-gold shrink-0 uppercase tracking-wider pl-1">
          Select Page:
        </span>
        {seoPages.map((p) => {
          const isActive = p.pageId === selectedPageId;
          return (
            <button
              key={p.pageId}
              type="button"
              onClick={() => handlePageSelect(p.pageId)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                isActive 
                  ? 'bg-tartan-gold text-tartan-dark shadow-md font-bold' 
                  : 'bg-tartan-dark/80 text-gray-300 hover:text-white hover:bg-tartan-navy border border-tartan-border/60'
              }`}
            >
              <span>{p.pageName}</span>
              <span className="text-[10px] opacity-70 font-mono">({p.path})</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Form Settings */}
        <div className="lg:col-span-7 bg-tartan-card rounded-3xl p-6 sm:p-8 border border-tartan-border shadow-2xl space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-tartan-border">
            <span className="text-xs font-bold text-tartan-gold uppercase tracking-wider">
              Editing SEO for: <span className="text-white normal-case font-mono">/{selectedPageId === 'home' ? '' : selectedPageId}</span>
            </span>
          </div>

          <form onSubmit={handleSaveSeo} className="space-y-4 text-xs">
            
            <div>
              <label className="block text-tartan-gold font-bold mb-1.5 flex items-center justify-between">
                <span>Page Title Tag (&lt;title&gt;)</span>
                <span className={`text-[10px] ${title.length <= 60 ? 'text-green-400' : 'text-amber-400'}`}>
                  {title.length} / 60 characters
                </span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white font-medium focus:border-tartan-accent"
              />
            </div>

            <div>
              <label className="block text-tartan-gold font-bold mb-1.5 flex items-center justify-between">
                <span>Meta Description (&lt;meta name=&quot;description&quot;&gt;)</span>
                <span className={`text-[10px] ${metaDesc.length <= 160 ? 'text-green-400' : 'text-amber-400'}`}>
                  {metaDesc.length} / 160 characters
                </span>
              </label>
              <textarea
                rows={3}
                value={metaDesc}
                onChange={(e) => setMetaDesc(e.target.value)}
                className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-3 text-white focus:border-tartan-accent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-tartan-gold font-bold mb-1.5">Primary H1 Heading</label>
                <input
                  type="text"
                  value={h1Tag}
                  onChange={(e) => setH1Tag(e.target.value)}
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white focus:border-tartan-accent"
                />
              </div>
              <div>
                <label className="block text-tartan-gold font-bold mb-1.5">Canonical URL</label>
                <input
                  type="text"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white focus:border-tartan-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-tartan-gold font-bold mb-1.5">
                Target SEO Search Keywords (Comma separated)
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white focus:border-tartan-accent"
              />
            </div>

            <div>
              <label className="block text-tartan-gold font-bold mb-1.5">Social Share OpenGraph Image (og:image)</label>
              <input
                type="text"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white focus:border-tartan-accent"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-gold-gradient text-tartan-dark font-extrabold rounded-xl shadow hover:brightness-110 active:scale-98"
              >
                Apply SEO & Meta Updates for {selectedPageId.toUpperCase()}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Google Search & OpenGraph Live Preview */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Google Search Result Mockup */}
          <div className="bg-tartan-card rounded-3xl p-6 border border-tartan-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-tartan-gold uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-4 h-4" />
                <span>Live Google Search Snippet Preview</span>
              </h3>
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

            {/* Google SERP Box */}
            <div className="bg-white text-gray-900 p-4 rounded-2xl border border-gray-300 space-y-1.5 shadow-sm text-left">
              <div className="flex items-center gap-2 text-[11px] text-gray-600">
                <span className="w-4 h-4 rounded-full bg-yellow-500 text-white font-bold flex items-center justify-center text-[9px]">S</span>
                <span>spudthepiper.co.uk › {selectedPageId === 'home' ? '' : selectedPageId}</span>
              </div>
              <h4 className="text-base font-medium text-[#1a0dab] hover:underline cursor-pointer line-clamp-1">
                {title || 'Page Title'}
              </h4>
              <p className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
                {metaDesc || 'Page meta description...'}
              </p>
              <div className="pt-1 flex items-center gap-1 text-[11px] text-[#e7711b]">
                <span>★★★★★</span>
                <span className="text-gray-600">Rating: 5.0 · 120 reviews · Scottish Bagpiper</span>
              </div>
            </div>
          </div>

          {/* Schema.org Structured Data Viewer */}
          <div className="bg-tartan-card rounded-3xl p-6 border border-tartan-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-tartan-gold uppercase tracking-wider flex items-center gap-1.5">
                <Code className="w-4 h-4" />
                <span>Schema.org JSON-LD ({selectedPageId.toUpperCase()})</span>
              </h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(schemaJsonLd, null, 2));
                  alert('Schema JSON-LD copied to clipboard!');
                }}
                className="text-[11px] text-gray-300 hover:text-white flex items-center gap-1 bg-tartan-dark px-2.5 py-1 rounded-lg border border-tartan-border"
              >
                <Copy className="w-3 h-3" />
                <span>Copy JSON</span>
              </button>
            </div>

            <div className="bg-tartan-dark p-3.5 rounded-2xl border border-tartan-border/80 max-h-48 overflow-y-auto text-[11px] font-mono text-green-300 no-scrollbar">
              <pre>{JSON.stringify(schemaJsonLd, null, 2)}</pre>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
