'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { VideoItem } from '@/types/spud';
import { initialVideos } from '@/lib/initialData';
import { 
  Video, 
  Plus, 
  Edit3, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Check, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  Loader2,
  Sparkles,
  Eye,
  ExternalLink,
  Play,
  Youtube
} from 'lucide-react';
import Link from 'next/link';

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const clean = url.trim();
  // Standard short url youtu.be/ID
  const shortMatch = clean.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  // Standard watch?v=ID or shorts/ID or embed/ID
  const longMatch = clean.match(/(?:watch\?v=|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  if (longMatch) return longMatch[1];

  // If user passed bare 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) return clean;

  return null;
}

export const AdminVideos: React.FC = () => {
  const { 
    videos, 
    addVideo, 
    updateVideo, 
    deleteVideo, 
    reorderVideos 
  } = useApp();

  const currentVideosList = (videos && videos.length > 0) ? videos : initialVideos;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<VideoItem['category']>('Introductions & Speaking');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Delete State
  const [videoToDelete, setVideoToDelete] = useState<VideoItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Preview selection
  const [previewId, setPreviewId] = useState<string>(currentVideosList[0]?.id || 'vid-spud-intro');
  const previewVideo = currentVideosList.find(v => v.id === previewId) || currentVideosList[0];

  const handleOpenAddModal = () => {
    setEditingVideoId(null);
    setFormTitle('');
    setFormUrl('');
    setFormDescription('');
    setFormCategory('Introductions & Speaking');
    setFormIsFeatured(currentVideosList.length === 0);
    setSuccessMessage(null);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: VideoItem) => {
    setEditingVideoId(item.id);
    setFormTitle(item.title);
    setFormUrl(item.youtubeUrl);
    setFormDescription(item.description);
    setFormCategory(item.category);
    setFormIsFeatured(Boolean(item.isFeatured));
    setSuccessMessage(null);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formUrl.trim() || isSaving) return;

    const ytId = extractYouTubeId(formUrl);
    if (!ytId) {
      setErrorMessage('Please enter a valid YouTube link (e.g. https://youtu.be/38zXOmwZVBA or https://youtube.com/watch?v=...)');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      if (editingVideoId) {
        await updateVideo(editingVideoId, {
          title: formTitle.trim(),
          youtubeUrl: formUrl.trim(),
          youtubeId: ytId,
          description: formDescription.trim(),
          category: formCategory,
          isFeatured: formIsFeatured
        });
        setSuccessMessage('Video updated successfully!');
      } else {
        const newId = await addVideo({
          title: formTitle.trim(),
          youtubeUrl: formUrl.trim(),
          youtubeId: ytId,
          description: formDescription.trim(),
          category: formCategory,
          isFeatured: formIsFeatured
        });
        setPreviewId(newId);
        setSuccessMessage('New YouTube video added to showcase!');
      }

      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMessage(null);
      }, 1200);
    } catch (err: any) {
      alert(`Error saving video: ${err?.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index <= 0) return;
    const reordered = [...currentVideosList];
    const temp = reordered[index - 1];
    reordered[index - 1] = reordered[index];
    reordered[index] = temp;
    await reorderVideos(reordered);
  };

  const handleMoveDown = async (index: number) => {
    if (index >= currentVideosList.length - 1) return;
    const reordered = [...currentVideosList];
    const temp = reordered[index + 1];
    reordered[index + 1] = reordered[index];
    reordered[index] = temp;
    await reorderVideos(reordered);
  };

  const handleConfirmDelete = async () => {
    if (!videoToDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteVideo(videoToDelete.id);
      if (previewId === videoToDelete.id) {
        const remaining = currentVideosList.filter(v => v.id !== videoToDelete.id);
        if (remaining.length > 0) {
          setPreviewId(remaining[0].id);
        }
      }
      setVideoToDelete(null);
    } catch (err: any) {
      alert(`Error deleting video: ${err?.message || err}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="bg-tartan-card border border-tartan-border rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tartan-gold/10 border border-tartan-gold/30 text-tartan-gold text-xs font-semibold">
            <Youtube className="w-4 h-4 text-red-500" />
            <span>YouTube Video & Stories Showcase</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-serif">
            Meet Spud The Piper • Video Hub
          </h1>
          <p className="text-xs sm:text-sm text-gray-300">
            Add YouTube videos of Spud speaking, introducing himself, playing the Great Highland Bagpipe, and sharing Scottish castle stories. All changes sync in real-time to the public <strong>/meet-spud</strong> page.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/meet-spud"
            target="_blank"
            className="px-4 py-2.5 bg-tartan-navy hover:bg-slate-700 text-gray-200 text-xs font-bold rounded-xl border border-tartan-border flex items-center gap-1.5 transition"
          >
            <Eye className="w-4 h-4 text-tartan-gold" />
            <span>View Public Page</span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </Link>

          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:brightness-110 flex items-center gap-2 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add YouTube Video</span>
          </button>
        </div>
      </div>

      {/* Grid: List + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Video List & Sorting */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <span>Showcase Videos ({currentVideosList.length})</span>
            <span>Ordering & Actions</span>
          </div>

          {currentVideosList.map((item, idx) => {
            const isSelected = previewId === item.id;
            const thumbUrl = `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`;

            return (
              <div
                key={item.id}
                onClick={() => setPreviewId(item.id)}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-pointer ${
                  isSelected
                    ? 'bg-tartan-navy/90 border-tartan-gold ring-1 ring-tartan-gold/50 shadow-lg'
                    : 'bg-tartan-card border-tartan-border hover:border-slate-600'
                }`}
              >
                {/* Thumb + Details */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="relative w-24 h-16 rounded-xl overflow-hidden border border-tartan-border shrink-0 bg-black/60 group">
                    <img 
                      src={thumbUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Play className="w-5 h-5 text-white/90 fill-white/80" />
                    </div>
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-white truncate font-serif">
                        {item.title}
                      </h4>
                      {item.isFeatured && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Hero Player
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-tartan-gold font-medium">
                      {item.category}
                    </p>
                    <p className="text-xs text-gray-400 line-clamp-1">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Actions & Ordering */}
                <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <div className="flex flex-col gap-0.5 mr-1">
                    <button
                      type="button"
                      onClick={() => handleMoveUp(idx)}
                      disabled={idx === 0}
                      className="p-1 rounded hover:bg-tartan-accent/30 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Move up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveDown(idx)}
                      disabled={idx === currentVideosList.length - 1}
                      className="p-1 rounded hover:bg-tartan-accent/30 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Move down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(item)}
                    className="p-2 rounded-xl bg-tartan-navy hover:bg-tartan-accent/40 text-gray-300 hover:text-white border border-tartan-border transition shadow-sm"
                    title="Edit Video"
                  >
                    <Edit3 className="w-4 h-4 text-tartan-gold" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setVideoToDelete(item)}
                    className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-800/60 transition shadow-sm"
                    title="Remove Video"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Preview Panel */}
        <div className="lg:col-span-5 bg-tartan-card rounded-3xl p-6 border border-tartan-accent/40 shadow-2xl space-y-4 sticky top-20">
          <div className="flex items-center justify-between pb-3 border-b border-tartan-border">
            <span className="text-xs font-bold text-tartan-gold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Live Video Preview</span>
            </span>
            <span className="text-[11px] text-gray-400 font-mono">
              ID: {previewVideo?.youtubeId}
            </span>
          </div>

          {previewVideo && (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-tartan-border aspect-video bg-black shadow-inner">
                <iframe
                  src={`https://www.youtube.com/embed/${previewVideo.youtubeId}?rel=0`}
                  title={previewVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold text-tartan-gold bg-tartan-navy px-2.5 py-1 rounded-lg border border-tartan-accent/40">
                    {previewVideo.category}
                  </span>
                  {previewVideo.isFeatured && (
                    <span className="text-[11px] font-extrabold text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-600/40">
                      ★ Hero Showcase Player
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white font-serif">
                  {previewVideo.title}
                </h3>

                <p className="text-xs text-gray-300 leading-relaxed bg-tartan-dark/70 p-3 rounded-xl border border-tartan-border/60">
                  {previewVideo.description || 'No description provided.'}
                </p>

                <div className="pt-2 flex items-center justify-between text-xs text-gray-400">
                  <a
                    href={previewVideo.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-tartan-gold hover:underline"
                  >
                    <span>Watch directly on YouTube</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(previewVideo)}
                    className="text-gray-300 hover:text-white underline text-xs"
                  >
                    Edit details
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ================= MODAL: ADD / EDIT VIDEO ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-tartan-card border border-tartan-gold/50 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 max-h-[92vh] flex flex-col">
            
            <div className="bg-tartan-navy px-6 py-4 border-b border-tartan-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 text-tartan-gold">
                <Youtube className="w-5 h-5 text-red-500" />
                <div>
                  <h3 className="text-base font-bold text-white font-serif">
                    {editingVideoId ? 'Edit Video Details' : 'Add New YouTube Video'}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Paste any YouTube URL — ID is automatically extracted
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 overflow-y-auto">
              
              {successMessage ? (
                <div className="p-8 text-center space-y-4 animate-in fade-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500 mx-auto flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-white font-serif">{successMessage}</h4>
                  <p className="text-xs text-gray-300">
                    Video synchronized to the Meet Spud showcase in real-time.
                  </p>
                </div>
              ) : (
                <>
                  {errorMessage && (
                    <div className="p-3 bg-rose-950/80 border border-rose-600 rounded-xl text-rose-300 text-xs">
                      {errorMessage}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1">
                      YouTube Video Link or URL *
                    </label>
                    <input
                      type="text"
                      required
                      value={formUrl}
                      onChange={(e) => setFormUrl(e.target.value)}
                      placeholder="e.g. https://youtu.be/38zXOmwZVBA or https://youtube.com/watch?v=..."
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-tartan-accent font-medium font-mono"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      Accepts shorts, watch URLs, youtu.be shares, or bare 11-character video IDs.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1">
                      Video Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g. Spud The Piper Introduces the Highland Pipes"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-tartan-accent font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1">
                      Video Category *
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-tartan-accent font-medium"
                    >
                      <option value="Introductions & Speaking">Introductions & Speaking</option>
                      <option value="Live Castle Piping">Live Castle Piping</option>
                      <option value="Traditions & Stories">Traditions & Stories</option>
                      <option value="Weddings & Celebrations">Weddings & Celebrations</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1">
                      Description / Story
                    </label>
                    <textarea
                      rows={3}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="What is Spud talking about or playing in this video?"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-3 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-tartan-accent"
                    />
                  </div>

                  <div className="bg-tartan-dark/60 p-3.5 rounded-xl border border-tartan-border flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isFeaturedVideo"
                      checked={formIsFeatured}
                      onChange={(e) => setFormIsFeatured(e.target.checked)}
                      className="rounded border-slate-700 bg-tartan-dark text-tartan-gold focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="isFeaturedVideo" className="text-xs text-gray-200 cursor-pointer">
                      <strong className="text-white">Feature as Hero Video</strong> — Display prominently at the top of the Meet Spud page
                    </label>
                  </div>

                  <div className="pt-4 border-t border-tartan-border flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2.5 bg-tartan-navy hover:bg-slate-700 text-gray-300 rounded-xl text-xs font-semibold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2.5 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:brightness-110 flex items-center gap-2 transition"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>{editingVideoId ? 'Save Video Changes' : 'Add to Showcase'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE CONFIRMATION ================= */}
      {videoToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-tartan-card border border-rose-500/60 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/80 text-rose-400 border border-rose-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white font-serif">Remove Video?</h3>
              <p className="text-xs text-gray-300">
                Are you sure you want to remove <strong className="text-white">&quot;{videoToDelete.title}&quot;</strong>?
              </p>
              <p className="text-[11px] text-rose-300 pt-1">
                This will remove it from the Meet Spud public video gallery.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setVideoToDelete(null)}
                className="px-4 py-2.5 bg-tartan-navy hover:bg-slate-700 text-gray-300 rounded-xl text-xs font-semibold transition"
              >
                Keep Video
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-1.5 transition"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Remove Video</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
