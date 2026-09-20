'use client';

import React, { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { Review } from '@/types/spud';

export const ReviewsSection: React.FC = () => {
  const { reviews, submitReview, socialLinks } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [eventType, setEventType] = useState('Wedding Ceremony');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Filter approved reviews for public view
  const approvedReviews = reviews.filter(r => r.status === 'approved');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName || !comment) return;

    submitReview({
      authorName,
      eventType,
      rating,
      comment,
      location: location || 'Scotland',
      photoUrl: photoUrl || undefined
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setIsModalOpen(false);
      setAuthorName('');
      setComment('');
      setLocation('');
      setPhotoUrl('');
    }, 2000);
  };

  return (
    <section id="reviews" className="py-20 bg-tartan-dark relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tartan-accent/15 border border-tartan-accent/40 text-tartan-gold text-xs font-semibold">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>Verified Client Testimonials</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-serif tracking-tight">
              Loved by Couples & Families Worldwide
            </h2>
            <p className="text-sm sm:text-base text-gray-300">
              Read genuine reviews from wedding couples, castle venues, and event planners who experienced Spud\'s bagpipe magic firsthand.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <a
              href={socialLinks?.trustpilot || 'https://www.trustpilot.com/review/spudthepiper.co.uk'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 hover:border-emerald-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all shrink-0 hover:scale-105 group"
            >
              <svg className="w-4 h-4 fill-[#00b67a]" viewBox="0 0 24 24">
                <path d="M12 0l3.708 7.514 8.292 1.206-6 5.849 1.416 8.257L12 18.927l-7.416 3.9 1.416-8.257-6-5.849 8.292-1.206z"/>
              </svg>
              <span>Review on Trustpilot</span>
            </a>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3.5 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider shadow-xl hover:brightness-110 flex items-center justify-center gap-2 transition-all shrink-0 hover:scale-105"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Leave a Direct Review</span>
            </button>
          </div>
        </div>

        {/* Trustpilot Banner Bar */}
        <div className="mb-10 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-tartan-card to-emerald-950/30 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#00b67a]/20 border border-[#00b67a]/40 text-[#00b67a]">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12 0l3.708 7.514 8.292 1.206-6 5.849 1.416 8.257L12 18.927l-7.416 3.9 1.416-8.257-6-5.849 8.292-1.206z"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">Trustpilot Rating:</span>
                <span className="text-emerald-400 font-extrabold text-sm">5.0 / 5.0 (Excellent)</span>
                <div className="flex text-[#00b67a] text-xs">★★★★★</div>
              </div>
              <p className="text-[11px] text-gray-400">
                Spud the Piper is rated Excellent based on independent verified customer reviews on Trustpilot.
              </p>
            </div>
          </div>

          <a
            href={socialLinks?.trustpilot || 'https://www.trustpilot.com/review/spudthepiper.co.uk'}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-[#00b67a] hover:bg-emerald-500 text-tartan-dark font-extrabold text-xs tracking-wider transition-all flex items-center gap-1.5 shrink-0 shadow"
          >
            <span>See Trustpilot Profile</span>
            <span>→</span>
          </a>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {approvedReviews.map((rev: Review) => (
            <div
              key={rev.id}
              className={`bg-tartan-card rounded-3xl p-6 border flex flex-col justify-between shadow-xl relative overflow-hidden transition-all ${
                rev.isFeatured 
                  ? 'border-tartan-gold ring-1 ring-tartan-gold/40' 
                  : 'border-tartan-border/70 hover:border-tartan-accent/50'
              }`}
            >
              <Quote className="absolute top-3 right-3 w-16 h-16 text-tartan-accent/5 pointer-events-none" />

              <div className="space-y-4">
                {/* Rating stars */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-yellow-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400" />
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
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-tartan-accent to-amber-700 flex items-center justify-center text-tartan-dark font-serif font-bold text-sm">
                  {rev.authorName.slice(0, 1)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-serif">{rev.authorName}</h4>
                  <p className="text-[11px] text-tartan-gold">{rev.eventType}</p>
                  {rev.location && (
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-tartan-muted" />
                      <span>{rev.location}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Leave a Review */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-tartan-card border border-tartan-accent/50 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
              <div className="bg-tartan-navy px-6 py-4 border-b border-tartan-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-tartan-gold">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <h3 className="text-base font-bold text-white font-serif">Leave a Review for Spud</h3>
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
                    Your testimonial has been submitted to Spud\'s Back Office for moderation and will appear on the live site shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                      placeholder="e.g. Edinburgh Castle, Scotland"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-tartan-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1">Your Review / Experience *</label>
                    <textarea
                      rows={4}
                      required
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="How was Spud's piping, presence, and performance on the day?"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-3 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-tartan-accent"
                    />
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
                      className="px-5 py-2.5 bg-gold-gradient text-tartan-dark font-extrabold text-xs rounded-xl shadow-lg"
                    >
                      Submit Review
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
