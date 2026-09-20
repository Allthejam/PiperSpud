'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Star, CheckCircle, XCircle, Award, Sparkles, Trash2, MapPin } from 'lucide-react';
import { Review } from '@/types/spud';

export const AdminReviews: React.FC = () => {
  const { reviews, approveReview, rejectReview, toggleFeatureReview } = useApp();

  const pendingReviews = reviews.filter(r => r.status === 'pending');
  const approvedReviews = reviews.filter(r => r.status === 'approved');

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white font-serif">Review Moderation & Google Trust Engine</h2>
        <p className="text-xs text-gray-400">Review incoming testimonials from clients, approve for public display, and mark featured reviews</p>
      </div>

      {/* Pending Reviews Moderation Queue */}
      <div className="bg-tartan-card rounded-3xl p-6 sm:p-8 border border-tartan-border shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-400 animate-ping"></span>
            <h3 className="text-lg font-bold text-white font-serif">
              Pending Moderation Queue ({pendingReviews.length})
            </h3>
          </div>
          <span className="text-xs text-gray-400">Reviews submitted via public website</span>
        </div>

        {pendingReviews.length === 0 ? (
          <div className="p-8 text-center bg-tartan-dark/60 rounded-2xl border border-tartan-border text-xs text-gray-400">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <span>No pending reviews awaiting approval. All testimonials are moderated!</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-tartan-dark rounded-2xl p-5 border border-yellow-800/60 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-yellow-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400" />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-yellow-400 bg-yellow-950 px-2 py-0.5 rounded border border-yellow-800">
                      Awaiting Spud\'s Review
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white font-serif">{rev.authorName}</h4>
                  <p className="text-xs text-tartan-gold">{rev.eventType} • {rev.location}</p>
                  <p className="text-xs text-gray-300 italic">&quot;{rev.comment}&quot;</p>
                </div>

                <div className="pt-3 border-t border-tartan-border flex items-center justify-end gap-2">
                  <button
                    onClick={() => rejectReview(rev.id)}
                    className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-300 rounded-xl text-xs font-semibold border border-red-800 flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => approveReview(rev.id)}
                    className="px-4 py-1.5 bg-green-700 hover:bg-green-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve & Publish to Site</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Approved Reviews List */}
      <div className="bg-tartan-card rounded-3xl p-6 sm:p-8 border border-tartan-border shadow-2xl space-y-6">
        <h3 className="text-lg font-bold text-white font-serif">
          Published Testimonials on Public Site ({approvedReviews.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {approvedReviews.map((rev) => (
            <div
              key={rev.id}
              className={`bg-tartan-dark rounded-2xl p-5 border flex flex-col justify-between space-y-4 shadow-lg ${
                rev.isFeatured ? 'border-tartan-gold ring-1 ring-tartan-gold/40' : 'border-tartan-border'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-yellow-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400" />
                    ))}
                  </div>
                  {rev.isFeatured && (
                    <span className="text-[10px] font-bold text-tartan-gold bg-tartan-navy px-2 py-0.5 rounded border border-tartan-accent/40">
                      ★ Featured on Homepage
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-200 leading-relaxed italic">&quot;{rev.comment}&quot;</p>
              </div>

              <div className="pt-3 border-t border-tartan-border flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">{rev.authorName}</h4>
                  <p className="text-[10px] text-gray-400">{rev.eventType}</p>
                </div>

                <button
                  onClick={() => toggleFeatureReview(rev.id)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                    rev.isFeatured 
                      ? 'bg-tartan-accent text-tartan-dark border-yellow-300' 
                      : 'bg-tartan-navy text-gray-300 hover:text-white border-tartan-border'
                  }`}
                >
                  {rev.isFeatured ? 'Featured' : 'Make Featured'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
