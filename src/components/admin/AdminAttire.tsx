'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { AttireItem } from '@/types/spud';
import { initialAttires } from '@/lib/initialData';
import { uploadToStorage } from '@/lib/firebase';
import { 
  Shirt, 
  Plus, 
  Edit3, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Check, 
  X, 
  Upload, 
  Palette, 
  CheckCircle2, 
  AlertTriangle,
  Loader2,
  Calendar,
  Sparkles,
  Eye,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

const PRESET_TARTAN_COLORS = [
  '#991B1B', // Deep Crimson
  '#DC2626', // Bright Red
  '#1E3A8A', // Highland Navy
  '#1D4ED8', // Royal Blue
  '#064E3B', // Black Watch Forest Green
  '#15803D', // Emerald Tartan
  '#6B21A8', // Isle of Skye Purple
  '#D4AF37', // Gold
  '#F59E0B', // Amber
  '#78716C', // Day Tweed Slate
  '#334155', // Charcoal Grey
  '#000000'  // Formal Black
];

export const AdminAttire: React.FC = () => {
  const { 
    attires, 
    addAttire, 
    updateAttire, 
    deleteAttire, 
    reorderAttires 
  } = useApp();

  const currentAttiresList = (attires && attires.length > 0) ? attires : initialAttires;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAttireId, setEditingAttireId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formTagline, setFormTagline] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formBestFor, setFormBestFor] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formColors, setFormColors] = useState<string[]>(['#991B1B', '#1E3A8A', '#D4AF37']);
  const [colorInput, setColorInput] = useState('#15803D');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Delete State
  const [attireToDelete, setAttireToDelete] = useState<AttireItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Preview selection
  const [previewId, setPreviewId] = useState<string>(currentAttiresList[0]?.id || 'no1');
  const previewAttire = currentAttiresList.find(a => a.id === previewId) || currentAttiresList[0];

  const handleOpenAddModal = () => {
    setEditingAttireId(null);
    setFormName('');
    setFormTitle('');
    setFormTagline('');
    setFormDescription('');
    setFormBestFor('Scottish Castle Weddings, Ceremonies & VIP State Galas');
    setFormImageUrl('/og-image.png');
    setFormColors(['#991B1B', '#1E3A8A', '#D4AF37']);
    setSuccessMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: AttireItem) => {
    setEditingAttireId(item.id);
    setFormName(item.name);
    setFormTitle(item.title);
    setFormTagline(item.tagline);
    setFormDescription(item.description);
    setFormBestFor(item.bestFor);
    setFormImageUrl(item.imageUrl || '/og-image.png');
    setFormColors(item.colorScheme && item.colorScheme.length > 0 ? [...item.colorScheme] : ['#991B1B', '#1E3A8A']);
    setSuccessMessage(null);
    setIsModalOpen(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      alert('Photo is too large. Please select an image under 25MB.');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const downloadUrl = await uploadToStorage(file, 'attires');
      if (downloadUrl) {
        setFormImageUrl(downloadUrl);
      }
    } catch (err: any) {
      console.error('Error uploading attire image:', err);
      alert(`Photo upload failed: ${err?.message || err}`);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleAddColor = (hex: string) => {
    if (!formColors.includes(hex) && formColors.length < 6) {
      setFormColors([...formColors, hex]);
    }
  };

  const handleRemoveColor = (indexToRemove: number) => {
    if (formColors.length > 1) {
      setFormColors(formColors.filter((_, idx) => idx !== indexToRemove));
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formName.trim() || isSaving) return;

    setIsSaving(true);
    try {
      if (editingAttireId) {
        await updateAttire(editingAttireId, {
          name: formName.trim(),
          title: formTitle.trim(),
          tagline: formTagline.trim(),
          description: formDescription.trim(),
          bestFor: formBestFor.trim(),
          imageUrl: formImageUrl.trim() || '/og-image.png',
          colorScheme: formColors
        });
        setSuccessMessage('Attire updated successfully!');
      } else {
        const newId = await addAttire({
          name: formName.trim(),
          title: formTitle.trim(),
          tagline: formTagline.trim(),
          description: formDescription.trim(),
          bestFor: formBestFor.trim(),
          imageUrl: formImageUrl.trim() || '/og-image.png',
          colorScheme: formColors
        });
        setPreviewId(newId);
        setSuccessMessage('New Highland Attire style created!');
      }

      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMessage(null);
      }, 1200);
    } catch (err: any) {
      alert(`Error saving attire: ${err?.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index <= 0) return;
    const reordered = [...currentAttiresList];
    const temp = reordered[index - 1];
    reordered[index - 1] = reordered[index];
    reordered[index] = temp;
    await reorderAttires(reordered);
  };

  const handleMoveDown = async (index: number) => {
    if (index >= currentAttiresList.length - 1) return;
    const reordered = [...currentAttiresList];
    const temp = reordered[index + 1];
    reordered[index + 1] = reordered[index];
    reordered[index] = temp;
    await reorderAttires(reordered);
  };

  const handleConfirmDelete = async () => {
    if (!attireToDelete || isDeleting) return;
    if (currentAttiresList.length <= 1) {
      alert('You must have at least one active Highland Dress option.');
      setAttireToDelete(null);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAttire(attireToDelete.id);
      if (previewId === attireToDelete.id) {
        const remaining = currentAttiresList.filter(a => a.id !== attireToDelete.id);
        if (remaining.length > 0) {
          setPreviewId(remaining[0].id);
        }
      }
      setAttireToDelete(null);
    } catch (err: any) {
      alert(`Error deleting attire: ${err?.message || err}`);
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
            <Shirt className="w-4 h-4" />
            <span>Tartan & Highland Regalia Management</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-serif">
            Tartan & Attire Studio
          </h1>
          <p className="text-xs sm:text-sm text-gray-300">
            Add, edit, reorder, and remove Highland dress options. All changes update the public Tartan Studio, Home Page showcase, and client booking dropdown in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/attire"
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
            <span>Add New Attire</span>
          </button>
        </div>
      </div>

      {/* Grid: List + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Attire List & Sorting */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <span>Highland Dress Styles ({currentAttiresList.length})</span>
            <span>Ordering & Actions</span>
          </div>

          {currentAttiresList.map((item, idx) => {
            const isSelected = previewId === item.id;

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
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-tartan-border shrink-0 bg-black/40">
                    <img 
                      src={item.imageUrl || '/og-image.png'} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex -space-x-1 shrink-0">
                        {(item.colorScheme || []).map((c, i) => (
                          <span
                            key={i}
                            className="w-3 h-3 rounded-full border border-black/40"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <h4 className="text-sm font-bold text-white font-serif truncate">
                        {item.title}
                      </h4>
                    </div>

                    <p className="text-xs text-tartan-gold truncate font-medium">
                      Booking Label: &ldquo;{item.name}&rdquo;
                    </p>

                    <p className="text-[11px] text-gray-400 truncate">
                      {item.tagline || item.description}
                    </p>
                  </div>
                </div>

                {/* Actions & Reorder Buttons */}
                <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {/* Reorder Up/Down */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveUp(idx)}
                      className="p-1 rounded bg-tartan-dark hover:bg-tartan-navy text-gray-400 hover:text-white disabled:opacity-20 transition"
                      title="Move up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === currentAttiresList.length - 1}
                      onClick={() => handleMoveDown(idx)}
                      className="p-1 rounded bg-tartan-dark hover:bg-tartan-navy text-gray-400 hover:text-white disabled:opacity-20 transition"
                      title="Move down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(item)}
                    className="p-2 rounded-xl bg-tartan-navy hover:bg-tartan-accent/40 text-tartan-gold border border-tartan-border hover:border-tartan-gold transition shadow-sm"
                    title="Edit Attire Details"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => setAttireToDelete(item)}
                    className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-800/60 transition shadow-sm"
                    title="Remove Attire"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Client Preview Showcase */}
        <div className="lg:col-span-5 bg-tartan-card rounded-3xl p-6 border border-tartan-accent/40 shadow-2xl space-y-4 sticky top-20">
          <div className="flex items-center justify-between pb-3 border-b border-tartan-border">
            <span className="text-xs font-bold text-tartan-gold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Live Website Preview</span>
            </span>
            <span className="text-[11px] text-gray-400 font-mono">
              ID: {previewAttire?.id}
            </span>
          </div>

          {previewAttire && (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-tartan-border h-64 bg-black/40">
                <img 
                  src={previewAttire.imageUrl || '/og-image.png'} 
                  alt={previewAttire.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 z-10">
                  <span className="text-xs font-bold text-white bg-tartan-red/90 px-3 py-1 rounded-full border border-red-400 shadow-md">
                    {previewAttire.name}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-tartan-gold bg-tartan-navy px-2 py-0.5 rounded border border-tartan-accent/40">
                    Ideal Matching
                  </span>
                  <div className="flex -space-x-1">
                    {(previewAttire.colorScheme || []).map((c, i) => (
                      <span
                        key={i}
                        className="w-3.5 h-3.5 rounded-full border border-black/40"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white font-serif">
                  {previewAttire.title}
                </h3>

                <p className="text-xs text-gray-300 leading-relaxed">
                  {previewAttire.description}
                </p>

                <div className="pt-1">
                  <span className="text-[10px] text-tartan-gold font-bold uppercase tracking-wider">
                    Recommended For:
                  </span>
                  <p className="text-xs text-white bg-tartan-dark/80 p-2 rounded-lg border border-tartan-border mt-1">
                    {previewAttire.bestFor}
                  </p>
                </div>
              </div>

              {/* Booking form simulator */}
              <div className="pt-3 border-t border-tartan-border space-y-2">
                <span className="text-[11px] text-gray-400 font-semibold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-tartan-gold" />
                  <span>How it appears in the Booking Calendar:</span>
                </span>
                <div className="p-3 bg-tartan-dark rounded-xl border border-tartan-border text-xs text-white font-medium flex items-center justify-between">
                  <span>{previewAttire.name} ({previewAttire.title})</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ================= MODAL: ADD / EDIT ATTIRE ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-tartan-card border border-tartan-gold/50 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 max-h-[92vh] flex flex-col">
            
            <div className="bg-tartan-navy px-6 py-4 border-b border-tartan-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 text-tartan-gold">
                <Shirt className="w-5 h-5 text-tartan-gold" />
                <div>
                  <h3 className="text-base font-bold text-white font-serif">
                    {editingAttireId ? 'Edit Highland Attire Style' : 'Add New Highland Attire Style'}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Syncs with Tartan Studio, Home Page, and Booking Form
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
                    Your updates have been committed to the database and synced across the site.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-tartan-gold mb-1">
                        Attire Name / Booking Label *
                      </label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="e.g. Royal Stewart Tartan (Traditional Red)"
                        className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-tartan-accent font-medium"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">
                        Exact label shown in the booking date form.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-tartan-gold mb-1">
                        Full Display Title / Heading *
                      </label>
                      <input
                        type="text"
                        required
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="e.g. Royal Stewart Highland Dress"
                        className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-tartan-accent font-medium"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">
                        Main title shown in the Tartan Studio showcase.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1">
                      Short Tagline
                    </label>
                    <input
                      type="text"
                      value={formTagline}
                      onChange={(e) => setFormTagline(e.target.value)}
                      placeholder="e.g. The iconic traditional Scottish monarch tartan"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-tartan-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1">
                      Full Regalia & Attire Description *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Details of the kilt tartan, jacket type, sporran, feather bonnet, spats, shoulder plaid, etc."
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-3 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-tartan-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1">
                      Recommended For / Best Occasion
                    </label>
                    <input
                      type="text"
                      value={formBestFor}
                      onChange={(e) => setFormBestFor(e.target.value)}
                      placeholder="e.g. Traditional Castle Weddings, Burns Suppers & Hogmanay"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-tartan-accent"
                    />
                  </div>

                  {/* Swatch Colors */}
                  <div className="bg-tartan-dark/70 p-4 rounded-2xl border border-tartan-border space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-tartan-gold flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5" />
                        <span>Tartan Swatch Colors ({formColors.length}/6)</span>
                      </label>
                      <span className="text-[10px] text-gray-400">Click swatch chip to remove</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {formColors.map((hex, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleRemoveColor(idx)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-tartan-navy border border-tartan-border cursor-pointer hover:border-rose-500 text-xs group"
                        >
                          <span className="w-3.5 h-3.5 rounded-full border border-black/40" style={{ backgroundColor: hex }} />
                          <span className="font-mono text-[11px] text-gray-300 group-hover:text-rose-300">{hex}</span>
                          <X className="w-3 h-3 text-gray-500 group-hover:text-rose-400" />
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-tartan-border/60 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] text-gray-400">Presets:</span>
                        {PRESET_TARTAN_COLORS.map((hex) => (
                          <button
                            key={hex}
                            type="button"
                            onClick={() => handleAddColor(hex)}
                            className="w-5 h-5 rounded-full border border-black/40 hover:scale-125 transition-transform"
                            style={{ backgroundColor: hex }}
                            title={`Add preset ${hex}`}
                          />
                        ))}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={colorInput}
                          onChange={(e) => setColorInput(e.target.value)}
                          className="w-7 h-7 bg-transparent cursor-pointer rounded border border-tartan-border"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddColor(colorInput)}
                          className="px-2.5 py-1 bg-tartan-navy hover:bg-tartan-accent/40 text-tartan-gold text-[11px] font-bold rounded-lg border border-tartan-border"
                        >
                          + Add Color
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Photo Upload */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-tartan-gold">
                      Attire Showcase Photograph
                    </label>

                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                      {formImageUrl && (
                        <div className="w-20 h-20 rounded-xl overflow-hidden border border-tartan-gold/50 shrink-0 bg-black/40">
                          <img src={formImageUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div className="flex-1 w-full space-y-2">
                        <input
                          type="text"
                          value={formImageUrl}
                          onChange={(e) => setFormImageUrl(e.target.value)}
                          placeholder="Image URL or upload a photo below"
                          className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-tartan-accent"
                        />

                        <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-tartan-navy hover:bg-tartan-accent/30 text-tartan-gold text-xs font-bold rounded-xl border border-tartan-border cursor-pointer transition shadow-sm">
                          {isUploadingPhoto ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Uploading Photo to Cloud...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload Photo from Device</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploadingPhoto}
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
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
                          <span>{editingAttireId ? 'Save Attire Changes' : 'Create & Sync Attire'}</span>
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
      {attireToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-tartan-card border border-rose-500/60 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/80 text-rose-400 border border-rose-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white font-serif">Remove Highland Attire?</h3>
              <p className="text-xs text-gray-300">
                Are you sure you want to remove <strong className="text-white">&quot;{attireToDelete.title}&quot;</strong> ({attireToDelete.name})?
              </p>
              <p className="text-[11px] text-rose-300 pt-1">
                This will remove it from the Tartan Studio and the client booking dropdown.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setAttireToDelete(null)}
                className="flex-1 py-2.5 bg-tartan-navy hover:bg-slate-700 text-gray-300 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-rose-700 hover:bg-rose-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
