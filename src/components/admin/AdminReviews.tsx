'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { uploadToStorage } from '@/lib/firebase';
import { 
  Star, 
  CheckCircle, 
  XCircle, 
  Award, 
  Sparkles, 
  Trash2, 
  MapPin, 
  Upload, 
  Camera, 
  Edit2, 
  Plus, 
  X, 
  Loader2,
  Cloud,
  MessageSquare,
  MessageCircle,
  Reply,
  Check
} from 'lucide-react';
import { Review } from '@/types/spud';

export const AdminReviews: React.FC = () => {
  const { reviews, approveReview, rejectReview, toggleFeatureReview, updateReview, respondToReview, deleteReview, submitReview } = useApp();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Partial<Review> | null>(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Spud Response Modal State
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [respondingReview, setRespondingReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState('');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  const pendingReviews = reviews.filter(r => r.status === 'pending');
  const approvedReviews = reviews.filter(r => r.status === 'approved');

  const handleOpenEdit = (rev: Review) => {
    setEditingReview({ ...rev });
    setEditPhotoPreview(rev.photoUrl || null);
    setSelectedPhotoFile(null);
    setIsEditModalOpen(true);
  };

  const handleOpenNew = () => {
    setEditingReview({
      authorName: '',
      eventType: 'Wedding Ceremony',
      location: 'Scotland',
      rating: 5,
      comment: '',
      photoUrl: '',
      status: 'approved',
      isFeatured: true
    });
    setEditPhotoPreview(null);
    setSelectedPhotoFile(null);
    setIsEditModalOpen(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      alert('Photo is larger than 25MB. Please choose a smaller image.');
      return;
    }

    setSelectedPhotoFile(file);
    setEditPhotoPreview(URL.createObjectURL(file));
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview || !editingReview.authorName || !editingReview.comment) return;

    setIsSaving(true);
    try {
      let finalPhotoUrl = editingReview.photoUrl || '';

      if (selectedPhotoFile) {
        finalPhotoUrl = await uploadToStorage(selectedPhotoFile, 'reviews_photos');
      }

      if (editingReview.id) {
        await updateReview(editingReview.id, {
          authorName: editingReview.authorName,
          eventType: editingReview.eventType,
          location: editingReview.location,
          rating: editingReview.rating,
          comment: editingReview.comment,
          photoUrl: finalPhotoUrl || undefined,
          isFeatured: editingReview.isFeatured
        });
      } else {
        submitReview({
          authorName: editingReview.authorName,
          eventType: editingReview.eventType || 'Wedding Ceremony',
          location: editingReview.location || 'Scotland',
          rating: editingReview.rating || 5,
          comment: editingReview.comment,
          photoUrl: finalPhotoUrl || undefined
        });
      }

      setIsEditModalOpen(false);
      setEditingReview(null);
      setEditPhotoPreview(null);
      setSelectedPhotoFile(null);
    } catch (err: any) {
      alert(`Error saving testimonial: ${err?.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenResponse = (rev: Review) => {
    setRespondingReview(rev);
    setResponseText(rev.spudResponse || '');
    setIsResponseModalOpen(true);
  };

  const handleSaveResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!respondingReview) return;

    setIsSubmittingResponse(true);
    try {
      await respondToReview(respondingReview.id, responseText);
      setIsResponseModalOpen(false);
      setRespondingReview(null);
      setResponseText('');
    } catch (err: any) {
      alert(`Error saving response: ${err?.message || err}`);
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  const handleRemoveResponse = async (revId: string) => {
    if (!confirm('Remove Spud\'s response from this review?')) return;
    try {
      await respondToReview(revId, '');
      if (respondingReview && respondingReview.id === revId) {
        setIsResponseModalOpen(false);
        setRespondingReview(null);
        setResponseText('');
      }
    } catch (err: any) {
      alert(`Error removing response: ${err?.message || err}`);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-tartan-card p-6 rounded-3xl border border-tartan-border shadow-xl">
        <div>
          <h2 className="text-2xl font-bold text-white font-serif">Review Moderation & Google Trust Engine</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Moderate incoming client testimonials, upload client wedding photos, and feature top reviews on the homepage carousel
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2.5 bg-gold-gradient text-tartan-dark font-extrabold text-xs rounded-xl shadow-lg hover:brightness-110 flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Testimonial</span>
        </button>
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
          <span className="text-xs text-gray-400">Reviews submitted via public website with photos</span>
        </div>

        {pendingReviews.length === 0 ? (
          <div className="p-8 text-center bg-tartan-dark/60 rounded-2xl border border-tartan-border text-xs text-gray-400">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <span>No pending reviews awaiting approval. All testimonials are moderated!</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pendingReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-tartan-dark rounded-2xl p-5 border border-yellow-800/60 space-y-3 flex flex-col justify-between overflow-hidden relative"
              >
                {/* Attached Photo */}
                {rev.photoUrl && (
                  <div className="h-44 w-full -mx-5 -mt-5 mb-3 overflow-hidden relative bg-black/75 flex items-center justify-center">
                    <img 
                      src={rev.photoUrl} 
                      alt="" 
                      aria-hidden="true" 
                      className="absolute inset-0 w-full h-full object-cover blur-xl opacity-35 scale-110 pointer-events-none" 
                    />
                    <img 
                      src={rev.photoUrl} 
                      alt={rev.authorName} 
                      className="w-full h-full object-contain relative z-10 p-1" 
                    />
                    <div className="absolute top-2 left-2 z-20 bg-black/60 backdrop-blur-sm text-yellow-300 text-[10px] font-bold px-2 py-0.5 rounded border border-yellow-500/40 flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      <span>Client Photo Attached</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-yellow-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400" />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-yellow-400 bg-yellow-950 px-2 py-0.5 rounded border border-yellow-800">
                      Awaiting Spud's Approval
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white font-serif">{rev.authorName}</h4>
                  <p className="text-xs text-tartan-gold">{rev.eventType} • {rev.location}</p>
                  <p className="text-xs text-gray-300 italic">&quot;{rev.comment}&quot;</p>

                  {/* Spud Response if already drafted */}
                  {rev.spudResponse && (
                    <div className="mt-2 p-2.5 rounded-xl bg-tartan-navy/90 border border-tartan-gold/30 text-xs">
                      <div className="flex items-center justify-between text-tartan-gold font-bold mb-1">
                        <span className="flex items-center gap-1.5 text-[11px]">
                          <Reply className="w-3 h-3 text-tartan-gold" /> Response from Spud
                        </span>
                        {rev.spudResponseDate && (
                          <span className="text-[9px] text-gray-400 font-normal">{rev.spudResponseDate}</span>
                        )}
                      </div>
                      <p className="text-gray-300 italic text-[11px] leading-relaxed">&quot;{rev.spudResponse}&quot;</p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-tartan-border flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(rev)}
                      className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 flex items-center gap-1 text-xs"
                      title="Edit review or replace photo"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleOpenResponse(rev)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                        rev.spudResponse
                          ? 'bg-tartan-gold/20 text-tartan-gold border border-tartan-gold/40 hover:bg-tartan-gold/30'
                          : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10'
                      }`}
                      title={rev.spudResponse ? "Edit Spud's response" : "Add Spud's response"}
                    >
                      <Reply className="w-3 h-3" />
                      <span>{rev.spudResponse ? 'Edit Reply' : 'Reply'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
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
                      <span>Approve & Publish</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Approved Reviews List */}
      <div className="bg-tartan-card rounded-3xl p-6 sm:p-8 border border-tartan-border shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white font-serif">
            Published Testimonials on Public Site ({approvedReviews.length})
          </h3>
          <span className="text-xs text-tartan-gold font-semibold">
            ★ Featured reviews appear on the 3D home carousel
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {approvedReviews.map((rev) => (
            <div
              key={rev.id}
              className={`bg-tartan-dark rounded-2xl p-5 border flex flex-col justify-between space-y-4 shadow-lg overflow-hidden ${
                rev.isFeatured ? 'border-tartan-gold ring-1 ring-tartan-gold/40' : 'border-tartan-border'
              }`}
            >
              {/* Photo if present */}
              {rev.photoUrl && (
                <div className="h-44 w-full -mx-5 -mt-5 mb-2 overflow-hidden relative bg-black/75 flex items-center justify-center">
                  <img 
                    src={rev.photoUrl} 
                    alt="" 
                    aria-hidden="true" 
                    className="absolute inset-0 w-full h-full object-cover blur-xl opacity-35 scale-110 pointer-events-none" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-tartan-dark to-transparent pointer-events-none" />
                  <img 
                    src={rev.photoUrl} 
                    alt={rev.authorName} 
                    className="w-full h-full object-contain relative z-10 p-1" 
                  />
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-yellow-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400" />
                    ))}
                  </div>
                  {rev.isFeatured && (
                    <span className="text-[10px] font-bold text-tartan-gold bg-tartan-navy px-2 py-0.5 rounded border border-tartan-accent/40">
                      ★ Featured on Carousel
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-200 leading-relaxed italic">&quot;{rev.comment}&quot;</p>

                {/* Spud Response Box */}
                {rev.spudResponse && (
                  <div className="mt-2.5 p-3 rounded-xl bg-tartan-navy/90 border border-tartan-gold/30 text-xs">
                    <div className="flex items-center justify-between text-tartan-gold font-bold mb-1">
                      <span className="flex items-center gap-1.5">
                        <Reply className="w-3.5 h-3.5 text-tartan-gold" /> Response from Spud
                      </span>
                      {rev.spudResponseDate && (
                        <span className="text-[10px] text-gray-400 font-normal">{rev.spudResponseDate}</span>
                      )}
                    </div>
                    <p className="text-gray-300 italic text-xs leading-relaxed">&quot;{rev.spudResponse}&quot;</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-tartan-border flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{rev.authorName}</h4>
                  <p className="text-[10px] text-gray-400 truncate">{rev.eventType}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleOpenResponse(rev)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                      rev.spudResponse
                        ? 'bg-tartan-gold/20 text-tartan-gold border border-tartan-gold/40 hover:bg-tartan-gold/30'
                        : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10'
                    }`}
                    title={rev.spudResponse ? "Edit Spud's response" : "Add Spud's response"}
                  >
                    <Reply className="w-3.5 h-3.5" />
                    <span>{rev.spudResponse ? 'Edit Reply' : 'Reply'}</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(rev)}
                    className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/10"
                    title="Edit review & photos"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Delete testimonial from ${rev.authorName}?`)) {
                        deleteReview(rev.id);
                      }
                    }}
                    className="p-1.5 text-red-400 hover:text-red-300 rounded hover:bg-red-500/10"
                    title="Delete review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

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
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Add or Edit Review & Photos */}
      {isEditModalOpen && editingReview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-tartan-card border border-tartan-accent/50 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            
            <div className="bg-tartan-navy px-6 py-4 border-b border-tartan-border flex items-center justify-between shrink-0">
              <h3 className="text-base font-bold text-white font-serif flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-tartan-gold" />
                <span>{editingReview.id ? 'Edit Testimonial & Photos' : 'Create New Testimonial'}</span>
              </h3>
              <button 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingReview(null);
                }} 
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="p-6 space-y-4 overflow-y-auto">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-tartan-gold mb-1">Author Name *</label>
                  <input
                    type="text"
                    required
                    value={editingReview.authorName || ''}
                    onChange={(e) => setEditingReview(prev => prev ? { ...prev, authorName: e.target.value } : null)}
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-tartan-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-tartan-gold mb-1">Occasion / Event *</label>
                  <input
                    type="text"
                    required
                    value={editingReview.eventType || ''}
                    onChange={(e) => setEditingReview(prev => prev ? { ...prev, eventType: e.target.value } : null)}
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-tartan-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-tartan-gold mb-1">Venue / Location</label>
                  <input
                    type="text"
                    value={editingReview.location || ''}
                    onChange={(e) => setEditingReview(prev => prev ? { ...prev, location: e.target.value } : null)}
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-tartan-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-tartan-gold mb-1">Star Rating (1 - 5)</label>
                  <select
                    value={editingReview.rating || 5}
                    onChange={(e) => setEditingReview(prev => prev ? { ...prev, rating: Number(e.target.value) } : null)}
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-tartan-accent"
                  >
                    <option value={5}>★★★★★ (5 Stars - Excellent)</option>
                    <option value={4}>★★★★☆ (4 Stars - Great)</option>
                    <option value={3}>★★★☆☆ (3 Stars - Good)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-tartan-gold mb-1">Testimonial Quote *</label>
                <textarea
                  rows={4}
                  required
                  value={editingReview.comment || ''}
                  onChange={(e) => setEditingReview(prev => prev ? { ...prev, comment: e.target.value } : null)}
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-3 text-white text-xs focus:outline-none focus:border-tartan-accent leading-relaxed"
                />
              </div>

              {/* Photo Upload / URL Management */}
              <div>
                <label className="block text-xs font-semibold text-tartan-gold mb-1">
                  Client Wedding / Event Photo
                </label>

                {editPhotoPreview ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-tartan-gold/50 h-36 w-full mb-2">
                    <img src={editPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setEditPhotoPreview(null);
                        setEditingReview(prev => prev ? { ...prev, photoUrl: '' } : null);
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-500 text-white rounded-full shadow"
                      title="Remove photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-tartan-border hover:border-tartan-accent rounded-2xl p-4 text-center cursor-pointer transition relative bg-tartan-dark/50 mb-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="flex flex-col items-center gap-1.5 text-gray-400">
                      <Upload className="w-6 h-6 text-tartan-gold" />
                      <span className="text-xs font-bold text-white">Upload New Event Photo</span>
                      <span className="text-[10px] text-gray-500">Supports JPEG, PNG, WebP up to 5MB</span>
                    </div>
                  </div>
                )}

                {/* Or Direct Image URL input */}
                <input
                  type="url"
                  value={editingReview.photoUrl || ''}
                  onChange={(e) => {
                    const url = e.target.value;
                    setEditingReview(prev => prev ? { ...prev, photoUrl: url } : null);
                    setEditPhotoPreview(url || null);
                  }}
                  placeholder="Or paste image URL (https://...)"
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-tartan-accent"
                />
              </div>

              {/* Featured toggle checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featured-check"
                  checked={editingReview.isFeatured ?? true}
                  onChange={(e) => setEditingReview(prev => prev ? { ...prev, isFeatured: e.target.checked } : null)}
                  className="rounded text-tartan-gold focus:ring-tartan-accent w-4 h-4"
                />
                <label htmlFor="featured-check" className="text-xs font-semibold text-gray-300 cursor-pointer">
                  Feature on Homepage 3D Carousel
                </label>
              </div>

              <div className="pt-3 border-t border-tartan-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingReview(null);
                  }}
                  className="px-4 py-2 bg-slate-800 text-gray-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gold-gradient text-tartan-dark font-extrabold text-xs rounded-xl shadow-lg hover:brightness-110"
                >
                  Save Testimonial
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modal: Spud's Response to Review */}
      {isResponseModalOpen && respondingReview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-tartan-card border border-tartan-gold/40 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col">
            <div className="bg-tartan-navy px-6 py-4 border-b border-tartan-border flex items-center justify-between">
              <h3 className="text-base font-bold text-white font-serif flex items-center gap-2">
                <Reply className="w-5 h-5 text-tartan-gold" />
                <span>Respond as Spud the Piper</span>
              </h3>
              <button
                onClick={() => {
                  setIsResponseModalOpen(false);
                  setRespondingReview(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResponse} className="p-6 space-y-4">
              {/* Original Review snippet */}
              <div className="bg-tartan-dark/70 p-3.5 rounded-xl border border-tartan-border/60 text-xs">
                <div className="flex items-center justify-between text-gray-400 mb-1">
                  <span className="font-bold text-white">{respondingReview.authorName}</span>
                  <span>{respondingReview.eventType}</span>
                </div>
                <p className="text-gray-300 italic">&quot;{respondingReview.comment}&quot;</p>
              </div>

              {/* Quick Scottish Gratitude Chips */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-tartan-gold mb-2">
                  Quick Scottish Templates
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    {
                      label: 'Wedding Blessing',
                      text: 'Thank you so much! It was an absolute honour and pleasure piping for your magical wedding day. Wishing you both a lifetime of happiness!'
                    },
                    {
                      label: 'Event Thanks',
                      text: 'Slàinte mhath! Thank you for the wonderful words. Loved bringing the skirl of the pipes to such a fantastic gathering.'
                    },
                    {
                      label: 'Heartfelt Gratitude',
                      text: 'Thank you for having me! Sharing Scotland’s heritage and music with lovely people like you is why I love piping.'
                    }
                  ].map(chip => (
                    <button
                      type="button"
                      key={chip.label}
                      onClick={() => setResponseText(chip.text)}
                      className="px-2.5 py-1 bg-tartan-navy hover:bg-tartan-gold/20 border border-tartan-border hover:border-tartan-gold/50 rounded-lg text-[11px] text-gray-200 hover:text-tartan-gold transition"
                    >
                      + {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Response Textarea */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Your Public Response
                </label>
                <textarea
                  rows={4}
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Write a personal, warm Scottish reply to this client..."
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-3 text-white text-xs focus:outline-none focus:border-tartan-gold leading-relaxed"
                  required
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  This reply will display under their review on the public website with an official &quot;Response from Spud the Piper&quot; badge.
                </p>
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-tartan-border flex items-center justify-between">
                {respondingReview.spudResponse ? (
                  <button
                    type="button"
                    onClick={() => handleRemoveResponse(respondingReview.id)}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Response</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsResponseModalOpen(false);
                      setRespondingReview(null);
                    }}
                    className="px-4 py-2 bg-slate-800 text-gray-300 rounded-xl text-xs font-semibold hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingResponse || !responseText.trim()}
                    className="px-5 py-2.5 bg-gold-gradient text-tartan-dark font-extrabold text-xs rounded-xl shadow-lg hover:brightness-110 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isSubmittingResponse ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Publish Response</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
