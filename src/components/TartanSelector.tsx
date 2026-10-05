'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { AttireItem } from '@/types/spud';
import { initialAttires } from '@/lib/initialData';
import { uploadToStorage } from '@/lib/firebase';
import { 
  Sparkles, 
  Check, 
  Shirt, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Upload, 
  Palette, 
  CheckCircle2, 
  AlertTriangle,
  Loader2,
  Calendar
} from 'lucide-react';
import { EditableElement } from './EditableElement';

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

export const TartanSelector: React.FC = () => {
  const { 
    attires, 
    addAttire, 
    updateAttire, 
    deleteAttire, 
    isAdminLoggedIn, 
    isVisualEditMode 
  } = useApp();

  const currentAttiresList = (attires && attires.length > 0) ? attires : initialAttires;

  const [selectedId, setSelectedId] = useState<string>(currentAttiresList[0]?.id || 'no1');

  // Keep selectedId valid
  useEffect(() => {
    if (currentAttiresList.length > 0) {
      const exists = currentAttiresList.some(a => a.id === selectedId);
      if (!exists) {
        setSelectedId(currentAttiresList[0].id);
      }
    }
  }, [currentAttiresList, selectedId]);

  const selectedTartan = currentAttiresList.find(a => a.id === selectedId) || currentAttiresList[0];

  // Modal State for Add / Edit
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

  // Delete Confirmation State
  const [attireToDelete, setAttireToDelete] = useState<AttireItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const canManage = Boolean(isAdminLoggedIn || isVisualEditMode);

  // Open modal for Adding New
  const handleOpenAddModal = () => {
    setEditingAttireId(null);
    setFormName('');
    setFormTitle('');
    setFormTagline('');
    setFormDescription('');
    setFormBestFor('Scottish Castle Weddings, Celebrations & VIP Galas');
    setFormImageUrl('/og-image.png');
    setFormColors(['#991B1B', '#1E3A8A', '#D4AF37']);
    setSuccessMessage(null);
    setIsModalOpen(true);
  };

  // Open modal for Editing Existing
  const handleOpenEditModal = (item: AttireItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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

  // Photo upload handler
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

  // Add, edit, remove, or clear swatch colors
  const handleAddColor = (hex: string) => {
    if (formColors.length < 8 && !formColors.includes(hex)) {
      setFormColors([...formColors, hex]);
    }
  };

  const handleUpdateColor = (indexToUpdate: number, newHex: string) => {
    setFormColors(prev => prev.map((c, i) => i === indexToUpdate ? newHex : c));
  };

  const handleRemoveColor = (indexToRemove: number) => {
    setFormColors(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleClearAllColors = () => {
    setFormColors([]);
  };

  // Submit Add or Edit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formName.trim() || isSaving) return;

    setIsSaving(true);
    try {
      if (editingAttireId) {
        // Update
        await updateAttire(editingAttireId, {
          name: formName.trim(),
          title: formTitle.trim(),
          tagline: formTagline.trim(),
          description: formDescription.trim(),
          bestFor: formBestFor.trim(),
          imageUrl: formImageUrl.trim() || '/og-image.png',
          colorScheme: formColors
        });
        setSuccessMessage('Attire updated and synced with booking forms!');
      } else {
        // Create new
        const newId = await addAttire({
          name: formName.trim(),
          title: formTitle.trim(),
          tagline: formTagline.trim(),
          description: formDescription.trim(),
          bestFor: formBestFor.trim(),
          imageUrl: formImageUrl.trim() || '/og-image.png',
          colorScheme: formColors
        });
        setSelectedId(newId);
        setSuccessMessage('New Highland Attire style added and synced with booking forms!');
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

  // Delete Attire
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
      if (selectedId === attireToDelete.id) {
        const remaining = currentAttiresList.filter(a => a.id !== attireToDelete.id);
        if (remaining.length > 0) {
          setSelectedId(remaining[0].id);
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
    <section id="attire" className="py-20 bg-tartan-navy relative border-y border-tartan-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tartan-accent/15 border border-tartan-accent/40 text-tartan-gold text-xs font-semibold">
            <Shirt className="w-4 h-4 shrink-0" />
            <EditableElement
              id="tartan-header-badge"
              tag="span"
              defaultContent="Highland Dress & Tartan Studio"
              label="Tartan Header Badge"
              section="attire"
            />
          </div>
          <EditableElement
            id="tartan-header-title"
            tag="h2"
            defaultContent="Customize Spud's Attire for Your Occasion"
            className="text-3xl sm:text-5xl font-extrabold text-white font-serif tracking-tight"
            label="Tartan Header Title"
            section="attire"
          />
          <EditableElement
            id="tartan-header-desc"
            tag="p"
            defaultContent="Every event is unique. Select your preferred Highland dress to perfectly complement your wedding colors, bridal theme, or ceremony atmosphere."
            className="text-base text-gray-300"
            label="Tartan Header Description"
            section="attire"
          />
        </div>

        {/* Admin Quick Action Banner when logged in or in visual edit mode */}
        {canManage && (
          <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-tartan-card to-amber-950/30 border border-tartan-gold/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-tartan-gold/20 border border-tartan-gold/40 text-tartan-gold shrink-0">
                <Shirt className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">Tartan & Attire Studio Controls</span>
                  <span className="bg-tartan-gold/20 text-tartan-gold text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-tartan-gold/40">
                    Live Sync Active
                  </span>
                </div>
                <p className="text-xs text-gray-300">
                  {currentAttiresList.length} Highland Dress styles active. All additions and removals automatically sync with the home page and booking forms.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="w-full sm:w-auto px-4 py-2.5 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:brightness-110 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 text-tartan-dark" />
                <span>Add New Attire Style</span>
              </button>
            </div>
          </div>
        )}

        {/* Interactive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Tartan Selection List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1 mb-1">
              <span className="text-xs font-bold text-tartan-gold uppercase tracking-wider">
                Select Attire Style ({currentAttiresList.length})
              </span>
              {canManage && (
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="text-xs text-tartan-gold hover:text-white flex items-center gap-1 font-semibold transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Option</span>
                </button>
              )}
            </div>

            {currentAttiresList.map((tartan) => {
              const isSelected = selectedTartan?.id === tartan.id;

              return (
                <div
                  key={tartan.id}
                  onClick={() => setSelectedId(tartan.id)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border flex items-center justify-between gap-3 group relative ${
                    isSelected
                      ? 'bg-tartan-card border-tartan-gold ring-2 ring-tartan-gold/40 shadow-xl'
                      : 'bg-tartan-dark/70 border-tartan-border/70 hover:bg-tartan-card/80'
                  }`}
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Swatch chips (only if colors exist) */}
                      {tartan.colorScheme && tartan.colorScheme.length > 0 && (
                        <div className="flex -space-x-1 shrink-0" title={`Color scheme: ${tartan.colorScheme.join(', ')}`}>
                          {tartan.colorScheme.map((color, idx) => (
                            <span
                              key={idx}
                              className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-sm shrink-0"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      )}
                      <EditableElement
                        id={`tartan-${tartan.id}-list-title`}
                        tag="span"
                        defaultContent={tartan.title}
                        className={`text-sm font-bold font-serif truncate ${isSelected ? 'text-tartan-gold' : 'text-white'}`}
                        label={`${tartan.title} List Title`}
                        section="attire"
                      />
                    </div>
                    <EditableElement
                      id={`tartan-${tartan.id}-list-tagline`}
                      tag="p"
                      defaultContent={tartan.tagline}
                      className="text-xs text-gray-400 line-clamp-1"
                      label={`${tartan.title} List Tagline`}
                      section="attire"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Admin Edit & Delete buttons */}
                    {canManage && (
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                        <button
                          type="button"
                          onClick={(e) => handleOpenEditModal(tartan, e)}
                          className="p-1.5 rounded-lg bg-tartan-navy hover:bg-tartan-accent/40 text-gray-300 hover:text-white border border-tartan-border transition shadow-sm"
                          title="Edit Attire Style"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-tartan-gold" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAttireToDelete(tartan);
                          }}
                          className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-800/60 transition shadow-sm"
                          title="Remove Attire Option"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition ${
                      isSelected ? 'bg-tartan-gold text-tartan-dark border-yellow-300 font-bold' : 'border-slate-600 text-transparent'
                    }`}>
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Large Preview Showcase Card */}
          {selectedTartan && (
            <div className="lg:col-span-7 bg-tartan-card rounded-3xl p-6 sm:p-8 border border-tartan-accent/40 shadow-2xl relative overflow-hidden">
              
              {/* Header inside preview if admin */}
              {canManage && (
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-tartan-border/60">
                  <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-tartan-gold" />
                    <span>Selected: {selectedTartan.title}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(selectedTartan)}
                      className="px-2.5 py-1 text-xs font-bold text-tartan-gold bg-tartan-navy hover:bg-tartan-dark rounded-lg border border-tartan-gold/40 flex items-center gap-1 transition"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Attire</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttireToDelete(selectedTartan)}
                      className="px-2.5 py-1 text-xs font-bold text-rose-300 bg-rose-950/60 hover:bg-rose-900 rounded-lg border border-rose-800/60 flex items-center gap-1 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                
                {/* Left Side: Uploadable & Editable Photo */}
                <div className="relative rounded-2xl overflow-hidden border border-tartan-border shadow-inner group">
                  <EditableElement
                    id={`tartan-${selectedTartan.id}-photo`}
                    isImage={true}
                    defaultImageUrl={selectedTartan.imageUrl || '/og-image.png'}
                    defaultAlt={`Spud the Piper in ${selectedTartan.title}`}
                    className="w-full h-72 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                    label={`${selectedTartan.title} Photo`}
                    section="attire"
                  />
                  <div className="absolute bottom-2 left-2 z-20 pointer-events-none">
                    <span className="text-xs font-bold text-white bg-tartan-red/90 px-3 py-1 rounded-full border border-red-400 shadow-md">
                      <EditableElement
                        id={`tartan-${selectedTartan.id}-badge`}
                        tag="span"
                        defaultContent={selectedTartan.name}
                        label={`${selectedTartan.title} Badge`}
                        section="attire"
                      />
                    </span>
                  </div>
                </div>

                {/* Right Side: Details & Copy */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="inline-block px-2.5 py-1 rounded-md bg-tartan-navy text-tartan-gold text-xs font-semibold border border-tartan-accent/30">
                      <EditableElement
                        id={`tartan-${selectedTartan.id}-tag-label`}
                        tag="span"
                        defaultContent="Ideal Matching"
                        label={`${selectedTartan.title} Tag Label`}
                        section="attire"
                      />
                    </div>
                    {/* Swatches in preview (only if colors exist) */}
                    {selectedTartan.colorScheme && selectedTartan.colorScheme.length > 0 && (
                      <div className="flex -space-x-1 items-center" title={`Color scheme: ${selectedTartan.colorScheme.join(', ')}`}>
                        {selectedTartan.colorScheme.map((color, idx) => (
                          <span
                            key={idx}
                            className="w-4 h-4 rounded-full border border-black/50 shadow-sm"
                            style={{ backgroundColor: color }}
                            title={`Color swatch: ${color}`}
                          />
                        ))}
                      </div>
                    )}
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(selectedTartan)}
                        className="text-[11px] text-gray-400 hover:text-tartan-gold flex items-center gap-1 transition underline decoration-dotted ml-1"
                        title="Edit or remove color schemes for this attire"
                      >
                        <Palette className="w-3 h-3 text-tartan-gold" />
                        <span>{selectedTartan.colorScheme && selectedTartan.colorScheme.length > 0 ? 'Edit/Remove Colors' : '+ Add Color Scheme'}</span>
                      </button>
                    )}
                  </div>
                  
                  <EditableElement
                    id={`tartan-${selectedTartan.id}-title`}
                    tag="h3"
                    defaultContent={selectedTartan.title}
                    className="text-2xl font-bold text-white font-serif"
                    label={`${selectedTartan.title} Heading`}
                    section="attire"
                  />

                  <EditableElement
                    id={`tartan-${selectedTartan.id}-desc`}
                    tag="p"
                    defaultContent={selectedTartan.description}
                    className="text-xs text-gray-300 leading-relaxed"
                    label={`${selectedTartan.title} Description`}
                    section="attire"
                  />

                  <div className="pt-2">
                    <EditableElement
                      id={`tartan-${selectedTartan.id}-rec-header`}
                      tag="p"
                      defaultContent="Recommended For:"
                      className="text-xs text-tartan-gold font-bold uppercase tracking-wider mb-1"
                      label={`${selectedTartan.title} Recommended Header`}
                      section="attire"
                    />
                    <EditableElement
                      id={`tartan-${selectedTartan.id}-bestfor`}
                      tag="p"
                      defaultContent={selectedTartan.bestFor}
                      className="text-xs text-white font-medium bg-tartan-dark/80 p-2.5 rounded-lg border border-tartan-border/60"
                      label={`${selectedTartan.title} Recommended For`}
                      section="attire"
                    />
                  </div>

                  <div className="pt-2">
                    <a
                      href="#booking"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs tracking-wider uppercase shadow-md hover:brightness-110 transition-all text-center"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Select this Attire in Booking Form</span>
                    </a>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

      {/* ================= MODAL: ADD / EDIT ATTIRE STYLE ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-tartan-card border border-tartan-gold/50 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-tartan-navy px-6 py-4 border-b border-tartan-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 text-tartan-gold">
                <Shirt className="w-5 h-5 text-tartan-gold" />
                <div>
                  <h3 className="text-base font-bold text-white font-serif">
                    {editingAttireId ? 'Edit Highland Attire Style' : 'Add New Highland Attire & Tartan Style'}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Automatically updates the live Studio and booking form dropdowns
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

            {/* Modal Form Content */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 overflow-y-auto">
              
              {successMessage ? (
                <div className="p-8 text-center space-y-4 animate-in fade-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500 mx-auto flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-white font-serif">{successMessage}</h4>
                  <p className="text-xs text-gray-300">
                    Your changes have been saved to the database and synchronized across the website.
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
                        This is the option clients select on the booking calendar.
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
                        The large header shown in the Tartan Studio showcase.
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
                      placeholder="Describe the jacket (Prince Charlie, Argyle, Tweed), sporran, feather bonnet, spats, shoulder plaid, dirk, etc."
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
                      placeholder="e.g. Traditional Castle Weddings, Burns Suppers & State Galas"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-tartan-accent"
                    />
                  </div>

                  {/* Tartan Color Swatches */}
                  <div className="bg-tartan-dark/70 p-4 rounded-2xl border border-tartan-border space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <label className="text-xs font-semibold text-tartan-gold flex items-center gap-1.5">
                          <Palette className="w-3.5 h-3.5" />
                          <span>Tartan Swatch Colors ({formColors.length}/8)</span>
                        </label>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Click color circle to edit, type a hex code, click &times; to delete, or remove all.
                        </p>
                      </div>

                      {formColors.length > 0 ? (
                        <button
                          type="button"
                          onClick={handleClearAllColors}
                          className="px-2.5 py-1 text-[11px] font-bold text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 rounded-lg flex items-center gap-1 transition shadow-sm"
                          title="Remove all colors so no color swatches are displayed"
                        >
                          <Trash2 className="w-3 h-3 text-rose-400" />
                          <span>Remove All Colors</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-gray-400 italic">No color scheme (swatches hidden)</span>
                      )}
                    </div>

                    {/* Active Colors with inline picker and direct editing */}
                    {formColors.length > 0 ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        {formColors.map((hex, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-tartan-navy border border-tartan-border hover:border-tartan-gold transition shadow-sm"
                          >
                            <input
                              type="color"
                              value={hex}
                              onChange={(e) => handleUpdateColor(idx, e.target.value)}
                              className="w-5 h-5 rounded-full border border-black/40 cursor-pointer bg-transparent p-0"
                              title="Click to edit this color"
                            />
                            <input
                              type="text"
                              value={hex}
                              onChange={(e) => handleUpdateColor(idx, e.target.value)}
                              className="w-16 bg-transparent font-mono text-[11px] text-white focus:outline-none"
                              placeholder="#000000"
                              title="Type hex color code"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveColor(idx)}
                              className="p-0.5 text-gray-400 hover:text-rose-400 rounded transition ml-1"
                              title="Remove this color"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-tartan-navy/50 border border-dashed border-tartan-border text-center">
                        <p className="text-xs text-gray-300 font-medium">
                          No colors assigned. This attire will be displayed cleanly without color chips.
                        </p>
                        <p className="text-[11px] text-tartan-gold mt-1">
                          Click any preset below or use the color picker if you wish to add colors.
                        </p>
                      </div>
                    )}

                    {/* Add Custom / Preset Colors */}
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

                  {/* Photo Upload & Image URL */}
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

                  {/* Form Actions */}
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

    </section>
  );
};
