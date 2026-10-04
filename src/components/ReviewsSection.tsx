'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Star, 
  Quote, 
  MessageSquarePlus, 
  CheckCircle, 
  Award, 
  MapPin, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Upload,
  Image as ImageIcon,
  X,
  LayoutGrid,
  Sliders,
  Camera,
  Loader2
} from 'lucide-react';
import { Review } from '@/types/spud';
import { EditableElement } from './EditableElement';
import { uploadToStorage } from '@/lib/firebase';

export const ReviewsSection: React.FC = () => {
  const { reviews, submitReview, socialLinks } = useApp();

  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [eventType, setEventType] = useState('Wedding Ceremony');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Filter approved reviews for public view
  const approvedReviews = reviews.filter(r => r.status === 'approved');

  // Auto-play Right-to-Left carousel effect
  useEffect(() => {
    if (!isAutoPlaying || approvedReviews.length <= 1 || viewMode !== 'carousel') return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % approvedReviews.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [isAutoPlaying, approvedReviews.length, viewMode]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + approvedReviews.length) % approvedReviews.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % approvedReviews.length);
  };

  // Image Upload handler for client review submission
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      alert('Photo file is too large. Please select an image under 25MB.');
      return;
    }

    setSelectedFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName || !comment || isSubmitting) return;

    setIsSubmitting(true);
    try {
      let finalPhoto = photoUrl || undefined;

      if (selectedFile) {
        finalPhoto = await uploadToStorage(selectedFile, 'reviews_photos');
      }

      submitReview({
        authorName,
        eventType,
        rating,
        comment,
        location: location || 'Scotland',
        photoUrl: finalPhoto
      });

      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setIsModalOpen(false);
        setAuthorName('');
        setComment('');
        setLocation('');
        setPhotoUrl('');
        setPhotoPreview(null);
        setSelectedFile(null);
      }, 2000);
    } catch (err: any) {
      alert(`Error uploading testimonial photo: ${err?.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper indices for carousel (center, left, right)
  const total = approvedReviews.length;
  const prevIndex = (currentIndex - 1 + total) % total;
  const nextIndex = (currentIndex + 1) % total;

  return (
    <section id="reviews" className="py-20 bg-tartan-dark relative overflow-hidden">
      
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-tartan-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tartan-accent/15 border border-tartan-accent/40 text-tartan-gold text-xs font-semibold">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 shrink-0" />
              <EditableElement
                id="reviews-header-badge"
                tag="span"
                defaultContent="Verified Client Testimonials & Experiences"
                label="Reviews Header Badge"
                section="reviews"
              />
            </div>
            <EditableElement
              id="reviews-header-title"
              tag="h2"
              defaultContent="Loved by Couples & Families Worldwide"
              className="text-3xl sm:text-5xl font-extrabold text-white font-serif tracking-tight"
              label="Reviews Header Title"
              section="reviews"
            />
            <EditableElement
              id="reviews-header-desc"
              tag="p"
              defaultContent="Read genuine reviews and client wedding photos from couples, castle venues, and event planners who experienced Spud's bagpipe magic firsthand."
              className="text-sm sm:text-base text-gray-300"
              label="Reviews Header Description"
              section="reviews"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* View Mode Toggle */}
            <div className="bg-tartan-navy p-1 rounded-xl border border-tartan-border flex items-center gap-1 text-xs">
              <button
                onClick={() => setViewMode('carousel')}
                className={`px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition ${
                  viewMode === 'carousel' 
                    ? 'bg-tartan-gold text-tartan-dark shadow' 
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Interactive 3D Carousel View"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Carousel</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition ${
                  viewMode === 'grid' 
                    ? 'bg-tartan-gold text-tartan-dark shadow' 
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Full Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
            </div>

            {Boolean((socialLinks?.trustpilot ?? '').trim() && !socialLinks?.hiddenPlatforms?.trustpilot) && (
              <a
                href={(socialLinks?.trustpilot ?? '').trim()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 hover:border-emerald-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all shrink-0 hover:scale-105 group"
              >
                <svg className="w-4 h-4 fill-[#00b67a]" viewBox="0 0 24 24">
                  <path d="M12 0l3.708 7.514 8.292 1.206-6 5.849 1.416 8.257L12 18.927l-7.416 3.9 1.416-8.257-6-5.849 8.292-1.206z"/>
                </svg>
                <span>Trustpilot (5.0 ★)</span>
              </a>
            )}

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider shadow-xl hover:brightness-110 flex items-center justify-center gap-2 transition-all shrink-0 hover:scale-105"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Share Experience & Photos</span>
            </button>
          </div>
        </div>

        {/* Trustpilot Banner Bar */}
        {Boolean((socialLinks?.trustpilot ?? '').trim() && !socialLinks?.hiddenPlatforms?.trustpilot) && (
          <div className="mb-10 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-tartan-card to-emerald-950/30 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#00b67a]/20 border border-[#00b67a]/40 text-[#00b67a] shrink-0">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0l3.708 7.514 8.292 1.206-6 5.849 1.416 8.257L12 18.927l-7.416 3.9 1.416-8.257-6-5.849 8.292-1.206z"/>
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white text-sm">Trustpilot & Google Trust Engine:</span>
                  <span className="text-emerald-400 font-extrabold text-sm">5.0 / 5.0 (Excellent)</span>
                  <div className="flex text-[#00b67a] text-xs">★★★★★</div>
                </div>
                <p className="text-[11px] text-gray-400">
                  100% verified customer ratings, real wedding photographs, and independent client feedback.
                </p>
              </div>
            </div>

            <a
              href={(socialLinks?.trustpilot ?? '').trim()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-[#00b67a] hover:bg-emerald-500 text-tartan-dark font-extrabold text-xs tracking-wider transition-all flex items-center gap-1.5 shrink-0 shadow"
            >
              <span>See Verified Reviews</span>
              <span>→</span>
            </a>
          </div>
        )}

        {/* ================= CAROUSEL VIEW (Right-to-Left with Center Enlarged) ================= */}
        {viewMode === 'carousel' && approvedReviews.length > 0 && (
          <div 
            className="relative my-8"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            {/* Desktop 3-Card Carousel Track */}
            <div className="hidden md:grid md:grid-cols-12 gap-6 items-center min-h-[460px]">
              
              {/* Left Card (Previous) */}
              <div 
                onClick={handlePrev}
                className="col-span-3 opacity-50 hover:opacity-90 scale-90 hover:scale-95 transition-all duration-500 cursor-pointer bg-tartan-card rounded-3xl p-5 border border-tartan-border shadow-lg flex flex-col justify-between h-[390px] overflow-hidden"
              >
                {approvedReviews[prevIndex]?.photoUrl && (
                  <div className="h-28 w-full -mx-5 -mt-5 mb-3 overflow-hidden rounded-t-3xl relative">
                    <img 
                      src={approvedReviews[prevIndex].photoUrl} 
                      alt={approvedReviews[prevIndex].authorName}
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-tartan-card to-transparent" />
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex text-yellow-400 text-xs">
                    {[...Array(approvedReviews[prevIndex]?.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-300 italic line-clamp-4">
                    "{approvedReviews[prevIndex]?.comment}"
                  </p>
                </div>
                <div className="pt-3 border-t border-tartan-border">
                  <h4 className="text-xs font-bold text-white">{approvedReviews[prevIndex]?.authorName}</h4>
                  <p className="text-[10px] text-tartan-gold">{approvedReviews[prevIndex]?.eventType}</p>
                </div>
              </div>

              {/* Center Card (ACTIVE & ENLARGED) */}
              <div className="col-span-6 scale-105 z-20 transition-all duration-500 bg-gradient-to-b from-tartan-card via-tartan-navy to-tartan-dark rounded-3xl p-7 border-2 border-tartan-gold ring-4 ring-tartan-gold/20 shadow-2xl shadow-tartan-gold/10 flex flex-col justify-between min-h-[470px] relative overflow-hidden animate-in fade-in zoom-in-95">
                
                {/* Background Watermark Quote */}
                <Quote className="absolute top-4 right-4 w-24 h-24 text-tartan-gold/10 pointer-events-none" />

                {/* Optional Client Photo Banner */}
                {approvedReviews[currentIndex]?.photoUrl && (
                  <div className="h-44 w-full -mx-7 -mt-7 mb-4 overflow-hidden rounded-t-3xl relative group">
                    <img 
                      src={approvedReviews[currentIndex].photoUrl} 
                      alt={approvedReviews[currentIndex].authorName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-tartan-card via-transparent to-black/30" />
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-tartan-gold text-[10px] font-bold px-2.5 py-1 rounded-full border border-tartan-gold/40 flex items-center gap-1.5 shadow">
                      <Camera className="w-3 h-3" />
                      <span>Client Experience Photo</span>
                    </div>
                  </div>
                )}

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-yellow-400">
                      {[...Array(approvedReviews[currentIndex]?.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400" />
                      ))}
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-tartan-dark bg-gold-gradient px-2.5 py-1 rounded-full shadow">
                      Verified Client
                    </span>
                  </div>

                  <p className="text-sm sm:text-base text-gray-100 leading-relaxed italic font-serif">
                    &quot;{approvedReviews[currentIndex]?.comment}&quot;
                  </p>
                </div>

                {/* Author Info */}
                <div className="mt-6 pt-4 border-t border-tartan-border/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gold-gradient flex items-center justify-center text-tartan-dark font-serif font-extrabold text-base shadow-lg">
                      {approvedReviews[currentIndex]?.authorName?.slice(0, 1) || '★'}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white font-serif">{approvedReviews[currentIndex]?.authorName}</h4>
                      <p className="text-xs text-tartan-gold font-medium">{approvedReviews[currentIndex]?.eventType}</p>
                      {approvedReviews[currentIndex]?.location && (
                        <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-tartan-gold" />
                          <span>{approvedReviews[currentIndex]?.location}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="text-[11px] text-gray-400 font-mono">
                    {approvedReviews[currentIndex]?.date}
                  </span>
                </div>

              </div>

              {/* Right Card (Next) */}
              <div 
                onClick={handleNext}
                className="col-span-3 opacity-50 hover:opacity-90 scale-90 hover:scale-95 transition-all duration-500 cursor-pointer bg-tartan-card rounded-3xl p-5 border border-tartan-border shadow-lg flex flex-col justify-between h-[390px] overflow-hidden"
              >
                {approvedReviews[nextIndex]?.photoUrl && (
                  <div className="h-28 w-full -mx-5 -mt-5 mb-3 overflow-hidden rounded-t-3xl relative">
                    <img 
                      src={approvedReviews[nextIndex].photoUrl} 
                      alt={approvedReviews[nextIndex].authorName}
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-tartan-card to-transparent" />
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex text-yellow-400 text-xs">
                    {[...Array(approvedReviews[nextIndex]?.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-300 italic line-clamp-4">
                    "{approvedReviews[nextIndex]?.comment}"
                  </p>
                </div>
                <div className="pt-3 border-t border-tartan-border">
                  <h4 className="text-xs font-bold text-white">{approvedReviews[nextIndex]?.authorName}</h4>
                  <p className="text-[10px] text-tartan-gold">{approvedReviews[nextIndex]?.eventType}</p>
                </div>
              </div>

            </div>

            {/* Mobile Single Card View */}
            <div className="md:hidden">
              <div className="bg-gradient-to-b from-tartan-card to-tartan-navy rounded-3xl p-6 border-2 border-tartan-gold shadow-2xl relative overflow-hidden">
                {approvedReviews[currentIndex]?.photoUrl && (
                  <div className="h-44 w-full -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-3xl relative">
                    <img 
                      src={approvedReviews[currentIndex].photoUrl} 
                      alt={approvedReviews[currentIndex].authorName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-tartan-card to-transparent" />
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-yellow-400">
                      {[...Array(approvedReviews[currentIndex]?.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400" />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-tartan-gold bg-tartan-navy px-2 py-0.5 rounded border border-tartan-accent/40">
                      Verified
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-200 italic leading-relaxed font-serif">
                    &quot;{approvedReviews[currentIndex]?.comment}&quot;
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-tartan-border flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold-gradient flex items-center justify-center text-tartan-dark font-bold text-xs">
                    {approvedReviews[currentIndex]?.authorName?.slice(0, 1) || '★'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{approvedReviews[currentIndex]?.authorName}</h4>
                    <p className="text-[11px] text-tartan-gold">{approvedReviews[currentIndex]?.eventType}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Arrows & Dot Indicators */}
            <div className="flex items-center justify-between mt-6 max-w-sm mx-auto">
              <button
                onClick={handlePrev}
                className="w-10 h-10 rounded-full bg-tartan-navy hover:bg-tartan-accent hover:text-tartan-dark text-white border border-tartan-border flex items-center justify-center transition shadow-lg"
                title="Previous Testimonial"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Dots */}
              <div className="flex items-center gap-2">
                {approvedReviews.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2.5 rounded-full transition-all ${
                      idx === currentIndex 
                        ? 'w-8 bg-tartan-gold shadow-md' 
                        : 'w-2.5 bg-gray-600 hover:bg-gray-400'
                    }`}
                    title={`Go to testimonial ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="w-10 h-10 rounded-full bg-tartan-navy hover:bg-tartan-accent hover:text-tartan-dark text-white border border-tartan-border flex items-center justify-center transition shadow-lg"
                title="Next Testimonial"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

          </div>
        )}

        {/* ================= FULL GRID VIEW ================= */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in">
            {approvedReviews.map((rev: Review) => (
              <div
                key={rev.id}
                className={`bg-tartan-card rounded-3xl p-6 border flex flex-col justify-between shadow-xl relative overflow-hidden transition-all group ${
                  rev.isFeatured 
                    ? 'border-tartan-gold ring-1 ring-tartan-gold/40' 
                    : 'border-tartan-border/70 hover:border-tartan-accent/50'
                }`}
              >
                {/* Review Photo if uploaded */}
                {rev.photoUrl && (
                  <div className="h-36 w-full -mx-6 -mt-6 mb-4 overflow-hidden relative">
                    <img 
                      src={rev.photoUrl} 
                      alt={rev.authorName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-tartan-card to-transparent" />
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-yellow-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-yellow-400" />
                      ))}
                    </div>
                    {rev.isFeatured && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-tartan-gold bg-tartan-navy px-2 py-0.5 rounded border border-tartan-accent/30">
                        Featured
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-gray-200 leading-relaxed italic">
                    &quot;{rev.comment}&quot;
                  </p>
                </div>

                {/* Author Footer */}
                <div className="mt-6 pt-4 border-t border-tartan-border/60 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-tartan-accent to-amber-700 flex items-center justify-center text-tartan-dark font-serif font-bold text-xs shrink-0">
                    {rev.authorName.slice(0, 1)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white font-serif truncate">{rev.authorName}</h4>
                    <p className="text-[10px] text-tartan-gold truncate">{rev.eventType}</p>
                    {rev.location && (
                      <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 text-tartan-muted shrink-0" />
                        <span className="truncate">{rev.location}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Leave a Review with Photo Upload */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-tartan-card border border-tartan-accent/50 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col">
              
              <div className="bg-tartan-navy px-6 py-4 border-b border-tartan-border flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-tartan-gold">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <h3 className="text-base font-bold text-white font-serif">Share Your Experience & Photos</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>

              {isSubmitted ? (
                <div className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-900/60 text-green-400 border border-green-500 mx-auto flex items-center justify-center">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-white font-serif">Thank You for Your Review!</h4>
                  <p className="text-xs text-gray-300">
                    Your testimonial and photos have been submitted to Spud's Back Office for moderation and will appear on the live site carousel shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                  
                  {/* Star selector */}
                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1">Your Star Rating *</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((starVal) => (
                        <button
                          key={starVal}
                          type="button"
                          onClick={() => setRating(starVal)}
                          className="p-1 text-2xl focus:outline-none"
                        >
                          <Star className={`w-6 h-6 ${starVal <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                        </button>
                      ))}
                      <span className="text-xs text-gray-300 ml-2 font-bold">{rating} Stars</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-tartan-gold mb-1">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="e.g. Fiona & Callum"
                        className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-tartan-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-tartan-gold mb-1">Occasion / Event</label>
                      <input
                        type="text"
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                        placeholder="e.g. Castle Wedding"
                        className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-tartan-accent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1">Venue / City</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Stirling Castle, Scotland"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-tartan-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1">Your Review / Experience *</label>
                    <textarea
                      rows={3}
                      required
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="How was Spud's piping, presence, and performance on your special day?"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-3 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-tartan-accent"
                    />
                  </div>

                  {/* Photo Upload Dropzone */}
                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1">
                      Upload Event Photo (Optional)
                    </label>
                    
                    {photoPreview ? (
                      <div className="relative rounded-2xl overflow-hidden border-2 border-tartan-gold/50 h-36 w-full">
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoPreview(null);
                            setPhotoUrl('');
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-500 text-white rounded-full shadow"
                          title="Remove photo"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-tartan-border hover:border-tartan-accent rounded-2xl p-4 text-center cursor-pointer transition relative bg-tartan-dark/50">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <div className="flex flex-col items-center gap-1.5 text-gray-400">
                          <Upload className="w-6 h-6 text-tartan-gold" />
                          <span className="text-xs font-bold text-white">Click or Drag to Upload Photo</span>
                          <span className="text-[10px] text-gray-500">Attach wedding, piper, or party photos (JPEG, PNG, WebP)</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 bg-slate-800 text-gray-300 rounded-xl text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-gold-gradient text-tartan-dark font-extrabold text-xs rounded-xl shadow-lg hover:brightness-110"
                    >
                      Submit Review & Photos
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
