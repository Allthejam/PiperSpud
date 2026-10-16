'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LiveChatWidget } from '@/components/LiveChatWidget';
import { VisualPencilOverlay } from '@/components/VisualPencilOverlay';
import { EditableElement } from '@/components/EditableElement';
import { 
  Heart, 
  Flame, 
  Castle, 
  Users, 
  GraduationCap, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Music,
  Clock,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Star,
  Play,
  Square,
  Volume2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Share2,
  Image as ImageIcon,
  CheckCircle2,
  Reply,
  ZoomIn,
  X,
  Quote,
  ChevronLeft
} from 'lucide-react';
import { ServicePackage, Review } from '@/types/spud';

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

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { 
    services, 
    reviews, 
    playTune, 
    stopTune, 
    currentPlayingTune, 
    tunesList,
    pricingConfig 
  } = useApp();

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [popoutReview, setPopoutReview] = useState<Review | null>(null);

  // Smart slug resolution: support /services/service-1, custom slugs, IDs, and legacy URL patterns
  const service = (() => {
    if (!services || services.length === 0) return null;
    
    // 1. Direct match by slug or id
    const direct = services.find(s => s.slug === slug || s.id === slug);
    if (direct) return direct;

    // 2. Numbered index matching (e.g. "service-1" -> index 0)
    const indexMatch = slug?.match(/^service-(\d+)$/i);
    if (indexMatch) {
      const idx = parseInt(indexMatch[1], 10) - 1;
      if (services[idx]) return services[idx];
    }

    // 3. Fallback matching for semantic words (e.g. "elopement", "experience", "wedding", "funeral", "burns", "corporate", "party")
    const keyword = slug?.toLowerCase() || '';
    const keywordMatch = services.find(s => 
      s.title.toLowerCase().includes(keyword) || 
      keyword.includes(s.title.toLowerCase().slice(0, 5)) ||
      s.slug.toLowerCase().includes(keyword)
    );
    if (keywordMatch) return keywordMatch;

    return services[0];
  })();

  const Icon = getServiceIcon(service?.icon);

  if (!service) {
    return (
      <div className="min-h-screen bg-tartan-dark flex flex-col items-center justify-center p-4 text-white">
        <Navbar />
        <div className="text-center space-y-4 py-24">
          <h1 className="text-3xl font-bold font-serif">Service Package Not Found</h1>
          <p className="text-gray-400">The requested piping package could not be located.</p>
          <Link href="/services" className="px-6 py-3 rounded-xl bg-gold-gradient text-tartan-dark font-bold text-xs uppercase tracking-wider inline-block">
            View All Services
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Filter reviews relevant to this event type
  const relevantReviews = reviews.filter(r => 
    r.eventType.toLowerCase().includes(service.title.toLowerCase().slice(0, 8)) ||
    r.comment.toLowerCase().includes(service.title.toLowerCase().slice(0, 6))
  );

  // Fallback to featured reviews if no exact match
  const displayReviews = relevantReviews.length > 0 ? relevantReviews : reviews.slice(0, 2);

  const bookingUrl = `/booking?service=${encodeURIComponent(service.title)}`;

  // Dynamic Schema.org JSON-LD for this service
  const schemaJson = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.title,
    "provider": {
      "@type": "LocalBusiness",
      "name": "Spud the Piper",
      "image": service.heroImage || "https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&q=80",
      "telephone": "+44 7798 123456",
      "priceRange": "££",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Edinburgh",
        "addressCountry": "GB"
      }
    },
    "description": service.fullDescription || service.description,
    "offers": {
      "@type": "Offer",
      "price": service.basePrice || 280,
      "priceCurrency": "GBP",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <div className="min-h-screen bg-tartan-dark flex flex-col relative">
      <VisualPencilOverlay />
      <Navbar />

      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />

      {/* 1. BREADCRUMBS & HERO BANNER */}
      <section className="relative pt-10 pb-16 bg-gradient-to-b from-tartan-card via-tartan-navy to-tartan-dark border-b border-tartan-border overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-80 bg-tartan-accent/10 blur-3xl pointer-events-none rounded-full"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
          
          {/* Breadcrumbs Navigation */}
          <nav className="flex items-center gap-2 text-xs text-gray-400">
            <Link href="/" className="hover:text-tartan-gold transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <Link href="/services" className="hover:text-tartan-gold transition-colors">Services</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-tartan-gold font-semibold truncate">{service.title}</span>
          </nav>

          {/* Hero Content Two-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Headings, Badge, & Inclusions */}
            <div className="lg:col-span-7 space-y-5">
              
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="p-2 rounded-xl bg-tartan-navy border border-tartan-accent/30 text-tartan-gold shadow-inner">
                  <Icon className="w-5 h-5" />
                </div>
                {service.popularBadge && (
                  <span className="bg-gold-gradient text-tartan-dark text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                    {service.badgeText || "Most Requested"}
                  </span>
                )}
                <span className="text-xs text-gray-300 font-medium bg-tartan-dark/70 px-3 py-1 rounded-full border border-tartan-border">
                  Instant Availability & Online Hold
                </span>
              </div>

              <EditableElement
                id={`${service.id}-page-h1`}
                tag="h1"
                defaultContent={service.title}
                className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white font-serif tracking-tight leading-tight"
                label={`${service.title} Main H1`}
                section="service-detail"
              />

              <EditableElement
                id={`${service.id}-page-tagline`}
                tag="p"
                defaultContent={service.tagline}
                className="text-base sm:text-lg text-tartan-gold font-medium italic"
                label={`${service.title} Sub-Tagline`}
                section="service-detail"
              />

              <EditableElement
                id={`${service.id}-page-full-desc`}
                tag="p"
                defaultContent={service.fullDescription || service.description}
                className="text-sm sm:text-base text-gray-300 leading-relaxed"
                label={`${service.title} Full Description`}
                section="service-detail"
              />

              {/* Pricing & Deposit Card */}
              <div className="bg-tartan-card/95 p-5 rounded-2xl border border-tartan-accent/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                    {pricingConfig?.hidePrices ? 'Pricing & Quote:' : 'Package Estimate:'}
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white font-serif">
                    {pricingConfig?.hidePrices ? (pricingConfig.poaLabel || 'Price on Application') : service.priceEstimate}
                  </div>
                  <p className="text-[11px] text-tartan-gold font-semibold mt-0.5">
                    {pricingConfig?.hidePrices 
                      ? (pricingConfig.poaDescription || 'Bespoke quote calculated based on your date, venue & requirements')
                      : `${service.deposit} required upon booking approval`}
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Link
                    href={bookingUrl}
                    className="w-full sm:w-auto px-6 py-3.5 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:brightness-110 flex items-center justify-center gap-2 transition-all"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Check Dates & Inquire</span>
                  </Link>
                </div>
              </div>

            </div>

            {/* Right Column: Hero Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border-2 border-tartan-accent/40 shadow-2xl group bg-tartan-card">
                <EditableElement
                  id={`${service.id}-page-hero-img`}
                  isImage={true}
                  defaultImageUrl={service.heroImage || "https://images.unsplash.com/photo-1544816155-12df9643f363?w=1000&q=80"}
                  defaultAlt={service.title}
                  className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                  label={`${service.title} Hero Photo`}
                  section="service-detail"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                  <div className="flex items-center gap-2 text-white text-xs font-bold bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 w-fit">
                    <ShieldCheck className="w-4 h-4 text-tartan-gold" />
                    <span>Full Highland Ceremonial Regalia Included</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. ITINERARY & "WHAT TO EXPECT ON THE DAY" */}
      {service.itinerary && service.itinerary.length > 0 && (
        <section className="py-20 bg-tartan-navy/60 relative border-b border-tartan-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tartan-accent/15 border border-tartan-accent/40 text-tartan-gold text-xs font-semibold">
                <Clock className="w-4 h-4" />
                <span>Performance Breakdown</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-serif tracking-tight">
                What to Expect on the Day
              </h2>
              <p className="text-xs sm:text-sm text-gray-300">
                A seamless, stress-free schedule orchestrated with precision and authentic Scottish hospitality.
              </p>
            </div>

            {/* Step-by-Step Timeline Cards */}
            <div className="space-y-4">
              {service.itinerary.map((step, idx) => (
                <div 
                  key={idx}
                  className="bg-tartan-card rounded-2xl p-6 border border-tartan-border/80 hover:border-tartan-gold/50 shadow-xl transition-all flex flex-col sm:flex-row sm:items-center gap-5 group"
                >
                  <div className="shrink-0 w-full sm:w-44">
                    <span className="inline-block px-3 py-1 rounded-xl bg-tartan-dark border border-tartan-border text-tartan-gold font-mono text-xs font-bold">
                      {step.stepOrTime}
                    </span>
                  </div>
                  <div className="space-y-1 flex-1">
                    <h3 className="text-base font-bold text-white group-hover:text-tartan-gold transition-colors font-serif">
                      {step.title}
                    </h3>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* 3. COMPLETE INCLUSIONS & FEATURES */}
      <section className="py-20 bg-tartan-dark relative border-b border-tartan-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tartan-accent/15 border border-tartan-accent/40 text-tartan-gold text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Full Inclusions</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-serif tracking-tight">
              Everything Included in Your Package
            </h2>
            <p className="text-xs sm:text-sm text-gray-300">
              No hidden fees, no travel surprises. Guaranteed masterclass performance with full highland dress.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {service.features.map((feature, idx) => (
              <div 
                key={idx}
                className="bg-tartan-card rounded-2xl p-5 border border-tartan-border flex items-start gap-3.5 shadow"
              >
                <div className="p-2 rounded-xl bg-tartan-navy text-tartan-gold border border-tartan-accent/30 shrink-0 mt-0.5">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-white">
                    {feature}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. RECOMMENDED TUNES PLAYLIST & SOUND SAMPLER */}
      {service.recommendedTunes && service.recommendedTunes.length > 0 && (
        <section className="py-20 bg-tartan-navy/70 relative border-b border-tartan-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tartan-accent/15 border border-tartan-accent/40 text-tartan-gold text-xs font-semibold">
                <Music className="w-4 h-4" />
                <span>Audio Preview</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-serif tracking-tight">
                Signature Repertoire for This Occasion
              </h2>
              <p className="text-xs sm:text-sm text-gray-300">
                Click any tune below to hear a live bagpipe audio preview performed by Spud.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {service.recommendedTunes.map((tuneTitle, idx) => {
                const isPlaying = currentPlayingTune === tuneTitle;

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isPlaying 
                        ? 'bg-tartan-navy border-tartan-gold ring-1 ring-tartan-gold/50 shadow-lg'
                        : 'bg-tartan-card border-tartan-border/80 hover:border-tartan-accent/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2.5 rounded-xl border ${isPlaying ? 'bg-amber-500 text-tartan-dark border-amber-400' : 'bg-tartan-dark text-tartan-gold border-tartan-border'}`}>
                        <Music className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{tuneTitle}</h4>
                        <span className="text-[10px] text-gray-400">Traditional Bagpipe</span>
                      </div>
                    </div>

                    <button
                      onClick={() => isPlaying ? stopTune() : playTune(tuneTitle)}
                      className={`p-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        isPlaying 
                          ? 'bg-red-900/40 text-red-300 border border-red-700 hover:bg-red-800' 
                          : 'bg-gold-gradient text-tartan-dark shadow hover:brightness-110'
                      }`}
                      title={isPlaying ? 'Stop Audio' : 'Play Sample'}
                    >
                      {isPlaying ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    </button>
                  </div>
                );
              })}
            </div>

          </div>
        </section>
      )}

      {/* 5. PHOTO GALLERY */}
      {service.galleryImages && service.galleryImages.length > 0 && (
        <section className="py-20 bg-tartan-dark relative border-b border-tartan-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tartan-accent/15 border border-tartan-accent/40 text-tartan-gold text-xs font-semibold">
                <ImageIcon className="w-4 h-4" />
                <span>Visual Moments</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-serif tracking-tight">
                Photo Gallery & Live Atmosphere
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {service.galleryImages.map((imgUrl, idx) => (
                <div key={idx} className="relative rounded-2xl overflow-hidden border border-tartan-border shadow-xl group h-64 bg-tartan-card">
                  <EditableElement
                    id={`${service.id}-gallery-${idx}`}
                    isImage={true}
                    defaultImageUrl={imgUrl}
                    defaultAlt={`${service.title} photo ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    label={`${service.title} Gallery Image ${idx + 1}`}
                    section="service-gallery"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-[11px] text-white font-semibold">Spud the Piper live on location</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* 6. VERIFIED REVIEWS */}
      {displayReviews.length > 0 && (
        <section className="py-20 bg-tartan-card relative border-b border-tartan-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tartan-accent/15 border border-tartan-accent/40 text-tartan-gold text-xs font-semibold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>Verified Client Reviews</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-serif tracking-tight">
                What Clients Say About This Package
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayReviews.map((rev) => (
                <div key={rev.id} className="bg-tartan-dark rounded-3xl p-6 border border-tartan-border/80 shadow-xl space-y-4 overflow-hidden">
                  {/* Photo if present */}
                  {rev.photoUrl && (
                    <div 
                      onClick={() => setPopoutReview(rev)}
                      className="h-44 sm:h-52 w-full -mx-6 -mt-6 mb-3 overflow-hidden relative cursor-pointer bg-black/75 flex items-center justify-center group select-none"
                      title="Click to view full photo and story"
                    >
                      <img 
                        src={rev.photoUrl} 
                        alt="" 
                        aria-hidden="true" 
                        className="absolute inset-0 w-full h-full object-cover blur-xl opacity-35 scale-110 pointer-events-none" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-tartan-card via-black/10 to-black/30 pointer-events-none" />
                      <img 
                        src={rev.photoUrl} 
                        alt={rev.authorName}
                        className="w-full h-full object-contain relative z-10 p-1 group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2.5 right-2.5 z-20 opacity-0 group-hover:opacity-100 bg-black/80 backdrop-blur-md text-tartan-gold text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-tartan-gold/40 flex items-center gap-1 shadow transition-all">
                        <ZoomIn className="w-3 h-3" />
                        <span>Pop Out</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[11px] text-gray-400">{rev.date}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-300 italic leading-relaxed">
                    &ldquo;{rev.comment}&rdquo;
                  </p>

                  {/* Spud Response if available */}
                  {rev.spudResponse && (
                    <div className="p-3 rounded-xl bg-tartan-navy/90 border border-tartan-gold/30 text-xs">
                      <div className="flex items-center justify-between text-tartan-gold font-bold text-[11px] mb-1">
                        <span className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-gold-gradient text-tartan-dark flex items-center justify-center text-[9px] font-black">S</span>
                          <Reply className="w-3 h-3 text-tartan-gold" />
                          Response from Spud
                        </span>
                        {rev.spudResponseDate && (
                          <span className="text-[9px] text-gray-400 font-normal">
                            {rev.spudResponseDate}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-300 italic leading-relaxed pl-5">
                        &ldquo;{rev.spudResponse}&rdquo;
                      </p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-tartan-border flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">{rev.authorName}</p>
                      <p className="text-[11px] text-tartan-gold">{rev.eventType}</p>
                    </div>
                    {rev.location && (
                      <span className="text-[10px] text-gray-400 bg-tartan-navy px-2.5 py-1 rounded-full border border-tartan-border">
                        {rev.location}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* 7. SERVICE SPECIFIC FAQS */}
      {service.faqs && service.faqs.length > 0 && (
        <section className="py-20 bg-tartan-dark relative border-b border-tartan-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tartan-accent/15 border border-tartan-accent/40 text-tartan-gold text-xs font-semibold">
                <HelpCircle className="w-4 h-4" />
                <span>Frequently Asked Questions</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-serif tracking-tight">
                Package Questions & Answers
              </h2>
            </div>

            <div className="space-y-3">
              {service.faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;

                return (
                  <div key={idx} className="bg-tartan-card rounded-2xl border border-tartan-border overflow-hidden shadow">
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-tartan-navy/50 transition-colors"
                    >
                      <span className="text-sm font-bold text-white font-serif">{faq.question}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-tartan-gold" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-xs text-gray-300 leading-relaxed border-t border-tartan-border/60 pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </section>
      )}

      {/* 8. BOTTOM STICKY CONVERSION BAR */}
      <section className="py-16 bg-gradient-to-r from-tartan-navy via-tartan-card to-tartan-dark border-t border-tartan-border text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-serif">
            Ready to Lock In Your Date for {service.title}?
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto">
            Check open slots on Spud\'s calendar and place a provisional hold in under 60 seconds.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href={bookingUrl}
              className="px-8 py-4 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-2xl hover:brightness-110 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book {service.title} Now</span>
            </Link>
            <Link
              href="/services"
              className="px-6 py-4 bg-tartan-dark hover:bg-slate-800 text-gray-300 font-bold text-xs uppercase tracking-wider rounded-xl border border-tartan-border flex items-center gap-2"
            >
              <span>Explore Other Packages</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Fullscreen Photo & Review Pop-Out Lightbox */}
      {popoutReview && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setPopoutReview(null)}
        >
          <div 
            className="bg-tartan-card border-2 border-tartan-gold/50 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col md:flex-row relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button */}
            <button 
              onClick={() => setPopoutReview(null)}
              className="absolute top-3 right-3 z-30 p-2.5 rounded-full bg-black/80 hover:bg-red-600 text-white border border-white/20 transition shadow-xl"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Photo Side */}
            <div className="md:w-3/5 bg-black/90 flex items-center justify-center relative min-h-[300px] sm:min-h-[400px] p-4 overflow-hidden border-b md:border-b-0 md:border-r border-tartan-border select-none">
              {popoutReview.photoUrl ? (
                <>
                  <img 
                    src={popoutReview.photoUrl} 
                    alt="" 
                    aria-hidden="true" 
                    className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-35 scale-125 pointer-events-none"
                  />
                  <img 
                    src={popoutReview.photoUrl} 
                    alt={popoutReview.authorName} 
                    className="max-h-[55vh] md:max-h-[80vh] w-auto max-w-full object-contain relative z-10 rounded-2xl shadow-2xl border border-white/10"
                  />
                </>
              ) : null}
            </div>

            {/* Review & Story Side */}
            <div className="md:w-2/5 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-[80vh] space-y-6 bg-gradient-to-b from-tartan-card to-tartan-navy">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2 pr-10 md:pr-0">
                  <div className="flex items-center gap-1 text-yellow-400">
                    {[...Array(popoutReview.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-tartan-dark bg-gold-gradient px-2.5 py-1 rounded-full shadow">
                    Verified Client
                  </span>
                </div>

                <div className="relative">
                  <Quote className="w-8 h-8 text-tartan-gold/20 -mb-2" />
                  <p className="text-sm sm:text-base text-gray-100 italic font-serif leading-relaxed">
                    &ldquo;{popoutReview.comment}&rdquo;
                  </p>
                </div>

                {popoutReview.spudResponse && (
                  <div className="p-4 rounded-2xl bg-tartan-navy/95 border border-tartan-gold/40 shadow-inner space-y-1.5">
                    <div className="flex items-center justify-between text-tartan-gold font-bold text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-gold-gradient text-tartan-dark flex items-center justify-center text-[9px] font-black">S</span>
                        Response from Spud
                      </span>
                      {popoutReview.spudResponseDate && (
                        <span className="text-[10px] text-gray-400 font-mono">{popoutReview.spudResponseDate}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-200 italic leading-relaxed pl-5">
                      &ldquo;{popoutReview.spudResponse}&rdquo;
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-tartan-border/80 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gold-gradient flex items-center justify-center text-tartan-dark font-serif font-extrabold text-sm shadow shrink-0">
                    {popoutReview.authorName?.slice(0, 1) || '★'}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white font-serif truncate">{popoutReview.authorName}</h4>
                    <p className="text-xs text-tartan-gold font-medium truncate">{popoutReview.eventType}</p>
                    {popoutReview.location && (
                      <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 text-tartan-gold shrink-0" />
                        <span className="truncate">{popoutReview.location}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                  <span className="font-mono text-[11px]">{popoutReview.date}</span>
                  <button
                    onClick={() => setPopoutReview(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition text-xs border border-white/10"
                  >
                    Close (Esc)
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      <Footer />
      <LiveChatWidget />
    </div>
  );
}
