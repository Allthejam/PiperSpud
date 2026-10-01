'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { GalleryItem } from '@/types/spud';
import { uploadToStorage } from '@/lib/firebase';
import { 
  Camera, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Upload, 
  Link as LinkIcon, 
  Calendar, 
  Building2, 
  MapPin, 
  Star, 
  X, 
  Save, 
  Check, 
  Image as ImageIcon,
  ExternalLink,
  Sparkles,
  Filter,
  Loader2,
  Cloud
} from 'lucide-react';

const COMMON_EVENT_TYPES = [
  'Castle Wedding',
  'Highland Gathering',
  'Highland Bagpipe Experience',
  'VIP Civic & Banquet',
  'Corporate Gala & Dinner',
  'Destination Elopement',
  'Burns Night Supper',
  'Memorial & Celebration of Life',
  'Birthday & Anniversary'
];

export const AdminGallery: React.FC = () => {
  const { galleryItems, addGalleryItem, updateGalleryItem, deleteGalleryItem } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formMartOrVenue, setFormMartOrVenue] = useState('');
  const [formEventType, setFormEventType] = useState('Castle Wedding');
  const [formLocation, setFormLocation] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formImageUrl, setFormImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [imageUploadMode, setImageUploadMode] = useState<'upload' | 'url'>('upload');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  // Stats
  const totalCount = galleryItems.length;
  const featuredCount = galleryItems.filter(g => g.isFeatured).length;
  const venueSet = new Set(galleryItems.map(g => g.martOrVenueName).filter(Boolean));

  // Filtered Items
  const filteredItems = galleryItems.filter(item => {
    const matchesType = filterType === 'all' || item.eventType === filterType;
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = !q || (
      item.title.toLowerCase().includes(q) ||
      (item.martOrVenueName && item.martOrVenueName.toLowerCase().includes(q)) ||
      (item.location && item.location.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q))
    );
    return matchesType && matchesSearch;
  });

  const handleOpenAddModal = () => {
    setEditingItemId(null);
    setFormTitle('');
    setFormMartOrVenue('');
    setFormEventType('Castle Wedding');
    setFormLocation('');
    setFormDescription('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormImageUrl('');
    setSelectedFile(null);
    setFormIsFeatured(false);
    setImageUploadMode('upload');
    setUploadStatus('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: GalleryItem) => {
    setEditingItemId(item.id);
    setFormTitle(item.title);
    setFormMartOrVenue(item.martOrVenueName || '');
    setFormEventType(item.eventType || 'Castle Wedding');
    setFormLocation(item.location || '');
    setFormDescription(item.description || '');
    setFormDate(item.date || new Date().toISOString().split('T')[0]);
    setFormImageUrl(item.imageUrl || '');
    setSelectedFile(null);
    setFormIsFeatured(!!item.isFeatured);
    setImageUploadMode('url');
    setUploadStatus('');
    setIsModalOpen(true);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        alert('File size exceeds 25MB limit. Please choose a photo under 25MB.');
        return;
      }
      setSelectedFile(file);
      // Instant local preview
      setFormImageUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Please enter a title for the photo.');
      return;
    }
    if (!formImageUrl.trim() && !selectedFile) {
      alert('Please select a photo to upload or enter an image URL.');
      return;
    }

    setIsSaving(true);
    try {
      let finalImageUrl = formImageUrl.trim();

      // If user selected a local file, upload to Firebase Storage Bucket
      if (selectedFile) {
        setUploadStatus('Uploading photo to Firebase Storage Bucket...');
        finalImageUrl = await uploadToStorage(selectedFile, 'gallery_photos');
      }

      if (editingItemId) {
        setUploadStatus('Updating gallery record...');
        await updateGalleryItem(editingItemId, {
          title: formTitle.trim(),
          martOrVenueName: formMartOrVenue.trim(),
          eventType: formEventType,
          location: formLocation.trim(),
          description: formDescription.trim(),
          date: formDate,
          imageUrl: finalImageUrl,
          isFeatured: formIsFeatured
        });
      } else {
        setUploadStatus('Publishing to cloud gallery...');
        await addGalleryItem({
          title: formTitle.trim(),
          martOrVenueName: formMartOrVenue.trim(),
          eventType: formEventType,
          location: formLocation.trim(),
          description: formDescription.trim(),
          date: formDate,
          imageUrl: finalImageUrl,
          isFeatured: formIsFeatured
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(`Error saving photo: ${err?.message || err}`);
    } finally {
      setIsSaving(false);
      setUploadStatus('');
    }
  };

  const handleDeleteItem = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete the photo "${title}" from the gallery?`)) {
      await deleteGalleryItem(id);
    }
  };

  const handleToggleFeatured = async (item: GalleryItem) => {
    await updateGalleryItem(item.id, { isFeatured: !item.isFeatured });
  };

  const mockItemIds = ['gal-1', 'gal-2', 'gal-3', 'gal-4', 'gal-5', 'gal-6', 'gal-7', 'gal-8'];
  const hasDemoMockups = galleryItems.some(g => mockItemIds.includes(g.id));

  const handlePurgeAllDemoMockups = async () => {
    if (confirm("Delete all 8 initial placeholder demo mockups from the database? Spud's custom uploaded photos will stay untouched.")) {
      for (const id of mockItemIds) {
        await deleteGalleryItem(id);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Stats Banner */}
      <div className="bg-gradient-to-r from-tartan-card via-tartan-navy to-tartan-dark p-6 rounded-2xl border border-tartan-border shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-tartan-gold" />
              <h2 className="text-xl font-bold text-white font-serif tracking-wide">
                Photo Gallery Manager
              </h2>
            </div>
            <p className="text-xs text-gray-300">
              Upload and manage Scottish venue photos, castle weddings, mart names, locations, and event dates for the public gallery.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {hasDemoMockups && (
              <button
                onClick={handlePurgeAllDemoMockups}
                className="px-3.5 py-2 rounded-xl bg-rose-950/70 border border-rose-600/40 text-rose-300 hover:text-white hover:bg-rose-900 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Remove all initial demo placeholder photos"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Purge Demo Mockups</span>
              </button>
            )}

            <a
              href="/gallery"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-tartan-dark border border-tartan-border text-gray-300 hover:text-white hover:border-tartan-gold text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-tartan-gold" />
              <span>View Live Public Gallery</span>
            </a>

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add / Upload Photo</span>
            </button>
          </div>
        </div>

        {/* Quick Stat Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-5 mt-5 border-t border-tartan-border/60">
          <div className="p-3 rounded-xl bg-tartan-dark/70 border border-tartan-border">
            <div className="text-[10px] uppercase font-bold text-gray-400">Total Photos</div>
            <div className="text-lg font-bold text-white font-serif">{totalCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-tartan-dark/70 border border-tartan-border">
            <div className="text-[10px] uppercase font-bold text-gray-400">Featured on Top</div>
            <div className="text-lg font-bold text-tartan-gold font-serif">{featuredCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-tartan-dark/70 border border-tartan-border col-span-2 sm:col-span-1">
            <div className="text-[10px] uppercase font-bold text-gray-400">Castles & Mart Venues</div>
            <div className="text-lg font-bold text-emerald-400 font-serif">{venueSet.size}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search gallery by mart name, venue, location, title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-tartan-navy/90 border border-tartan-border rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-tartan-gold"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-3.5 h-3.5 text-tartan-gold" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-tartan-navy/90 border border-tartan-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-tartan-gold cursor-pointer"
          >
            <option value="all">All Event Categories</option>
            {COMMON_EVENT_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Gallery Photos Grid in Admin */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-tartan-navy/40 rounded-2xl border border-dashed border-tartan-border p-8 space-y-3">
          <Camera className="w-10 h-10 text-gray-500 mx-auto opacity-50" />
          <p className="text-xs text-gray-400 font-medium">No photos found matching your search.</p>
          <button
            onClick={handleOpenAddModal}
            className="px-3.5 py-1.5 bg-tartan-accent text-white text-xs font-semibold rounded-lg hover:bg-tartan-gold hover:text-tartan-dark"
          >
            Upload First Photo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-tartan-navy rounded-xl overflow-hidden border border-tartan-border hover:border-tartan-gold/40 shadow-md flex flex-col justify-between transition-all"
            >
              {/* Photo Thumbnail */}
              <div className="relative aspect-[16/9] w-full bg-slate-900 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Event Type Badge */}
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 rounded-full bg-black/80 text-[10px] font-bold text-tartan-gold border border-tartan-gold/30">
                    {item.eventType}
                  </span>
                </div>

                {/* Featured Badge Button */}
                <button
                  onClick={() => handleToggleFeatured(item)}
                  title={item.isFeatured ? 'Featured on homepage/top' : 'Click to feature'}
                  className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all ${
                    item.isFeatured 
                      ? 'bg-yellow-500/90 text-black shadow-md ring-1 ring-yellow-300' 
                      : 'bg-black/60 text-gray-400 hover:text-yellow-400'
                  }`}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                </button>

                {/* Date overlay */}
                {item.date && (
                  <div className="absolute bottom-2 right-2">
                    <span className="px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-medium text-gray-200 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-tartan-gold" />
                      {item.date}
                    </span>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  {item.martOrVenueName && (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-tartan-gold">
                      <Building2 className="w-3 h-3 shrink-0" />
                      <span className="truncate">{item.martOrVenueName}</span>
                    </div>
                  )}

                  <h4 className="text-sm font-bold text-white font-serif line-clamp-1">
                    {item.title}
                  </h4>

                  {item.location && (
                    <div className="flex items-center gap-1 text-[11px] text-gray-300">
                      <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                  )}

                  {item.description && (
                    <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed pt-1">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 mt-2 border-t border-tartan-border/60 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-gray-500 font-mono">
                    ID: {item.id}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1.5 rounded-lg bg-tartan-dark hover:bg-tartan-accent text-gray-300 hover:text-white transition-colors"
                      title="Edit photo details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id, item.title)}
                      className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/80 text-rose-300 hover:text-white transition-colors"
                      title="Delete photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Photo Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-tartan-card max-w-2xl w-full rounded-2xl border border-tartan-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-tartan-dark via-tartan-navy to-tartan-dark border-b border-tartan-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-tartan-gold" />
                <h3 className="text-base font-bold text-white font-serif">
                  {editingItemId ? 'Edit Gallery Photo' : 'Upload New Gallery Photo'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveItem} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* Photo Upload / URL Toggle */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-200">
                    Photo Image Source <span className="text-rose-400">*</span>
                  </label>
                  <div className="flex items-center gap-1 bg-tartan-dark p-0.5 rounded-lg border border-tartan-border text-[11px]">
                    <button
                      type="button"
                      onClick={() => setImageUploadMode('upload')}
                      className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                        imageUploadMode === 'upload' ? 'bg-tartan-accent text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Upload className="w-3 h-3 inline mr-1" />
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUploadMode('url')}
                      className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                        imageUploadMode === 'url' ? 'bg-tartan-accent text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <LinkIcon className="w-3 h-3 inline mr-1" />
                      Image URL
                    </button>
                  </div>
                </div>

                {imageUploadMode === 'upload' ? (
                  <div className="border-2 border-dashed border-tartan-border/80 hover:border-tartan-gold/60 rounded-xl p-4 text-center cursor-pointer bg-tartan-dark/50 transition-colors relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload className="w-6 h-6 text-tartan-gold mx-auto mb-1.5" />
                    <p className="text-xs text-white font-medium">Click or Drag & Drop image here</p>
                    <p className="text-[10px] text-gray-400">Supports high-res mobile photos JPG, PNG, WebP up to 25MB</p>
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-[10px] text-emerald-300 font-medium">
                      <Cloud className="w-3 h-3 text-emerald-400" />
                      <span>Direct Firebase Storage Bucket Upload</span>
                    </div>
                  </div>
                ) : (
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... or image link"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-gold"
                  />
                )}

                {/* Upload Status Alert */}
                {isSaving && uploadStatus && (
                  <div className="p-3 rounded-xl bg-tartan-dark border border-tartan-gold/40 flex items-center gap-2.5 text-xs text-tartan-gold animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-tartan-gold shrink-0" />
                    <span>{uploadStatus}</span>
                  </div>
                )}

                {/* Live Image Preview */}
                {formImageUrl && (
                  <div className="relative aspect-[16/9] w-full max-h-48 rounded-xl overflow-hidden border border-tartan-border bg-black mt-2">
                    <img
                      src={formImageUrl}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormImageUrl('');
                        setSelectedFile(null);
                      }}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/70 hover:bg-rose-900 text-white text-xs"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Title & Mart / Venue Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-200">
                    Photo Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Stirling Castle Grand Entrance"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-gold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-200">
                    Mart / Venue Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Stirling Castle Great Hall, Dingwall Mart..."
                    value={formMartOrVenue}
                    onChange={(e) => setFormMartOrVenue(e.target.value)}
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-gold"
                  />
                </div>
              </div>

              {/* Event Type & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-200">
                    Event Type / Category
                  </label>
                  <select
                    value={formEventType}
                    onChange={(e) => setFormEventType(e.target.value)}
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-tartan-gold cursor-pointer"
                  >
                    {COMMON_EVENT_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-200">
                    Event Date (for public sorting)
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-tartan-gold"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-200">
                  Location (Town, Region, Castle)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Stirling, Scotland or Aviemore, Highlands"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-gold"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-200">
                  Description / Story
                </label>
                <textarea
                  rows={3}
                  placeholder="Share a short note about the performance, Highland attire worn, crowd reactions, or tunes played..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-gold"
                />
              </div>

              {/* Featured Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featured-check"
                  checked={formIsFeatured}
                  onChange={(e) => setFormIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded border-tartan-border text-tartan-gold focus:ring-tartan-gold accent-tartan-gold cursor-pointer"
                />
                <label htmlFor="featured-check" className="text-xs text-gray-300 font-medium cursor-pointer">
                  Feature this photo prominently on public gallery top
                </label>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-tartan-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-tartan-dark border border-tartan-border text-gray-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : (editingItemId ? 'Update Photo' : 'Publish to Gallery')}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
