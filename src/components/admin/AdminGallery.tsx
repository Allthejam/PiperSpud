'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { GalleryItem, SocialPost } from '@/types/spud';
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
  Image as ImageIcon,
  ExternalLink,
  Filter,
  Loader2,
  Cloud,
  LayoutGrid,
  Grid,
  Table as TableIcon,
  List as ListIcon,
  Eye,
  SlidersHorizontal,
  ArrowUpDown,
  Heart,
  Flame,
  Share2,
  Send,
  Sparkles,
  CheckCircle2,
  MessageSquare,
  Music,
  Pin
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

type ViewMode = 'cards' | 'thumbnails' | 'table' | 'list';

export const AdminGallery: React.FC = () => {
  const { galleryItems, addGalleryItem, updateGalleryItem, deleteGalleryItem, createSocialPost } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState<'likes-desc' | 'date-desc' | 'date-asc' | 'title-asc' | 'venue-asc'>('likes-desc');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  // Preview Lightbox for Admin
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Share to /social Feed Modal State
  const [sharingItem, setSharingItem] = useState<GalleryItem | null>(null);
  const [shareTitle, setShareTitle] = useState('');
  const [shareCategory, setShareCategory] = useState<'Weddings' | 'Castle Galas' | 'Tune Requests' | 'Highland Stories' | 'Tuition & Tips'>('Weddings');
  const [shareLocation, setShareLocation] = useState('');
  const [shareTune, setShareTune] = useState('');
  const [shareContent, setShareContent] = useState('');
  const [shareIsPinned, setShareIsPinned] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccessToast, setShareSuccessToast] = useState(false);

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
  const [formLikes, setFormLikes] = useState<number>(0);
  const [imageUploadMode, setImageUploadMode] = useState<'upload' | 'url'>('upload');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  // Stats
  const totalCount = galleryItems.length;
  const featuredCount = galleryItems.filter(g => g.isFeatured).length;
  const totalLikes = galleryItems.reduce((acc, g) => acc + (typeof g.likes === 'number' ? g.likes : 0), 0);
  const venueSet = new Set(galleryItems.map(g => g.martOrVenueName).filter(Boolean));

  // Filtered & Sorted Items
  const filteredItems = galleryItems
    .filter(item => {
      const matchesType = filterType === 'all' || item.eventType === filterType;
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q || (
        item.title.toLowerCase().includes(q) ||
        (item.martOrVenueName && item.martOrVenueName.toLowerCase().includes(q)) ||
        (item.location && item.location.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
      return matchesType && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'likes-desc') {
        const likesA = typeof a.likes === 'number' ? a.likes : 0;
        const likesB = typeof b.likes === 'number' ? b.likes : 0;
        if (likesB !== likesA) return likesB - likesA;
        return (b.date || '').localeCompare(a.date || '');
      } else if (sortBy === 'date-desc') {
        return (b.date || '').localeCompare(a.date || '');
      } else if (sortBy === 'date-asc') {
        return (a.date || '').localeCompare(b.date || '');
      } else if (sortBy === 'title-asc') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'venue-asc') {
        return (a.martOrVenueName || '').localeCompare(b.martOrVenueName || '');
      }
      return 0;
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
    setFormLikes(0);
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
    setFormLikes(typeof item.likes === 'number' ? item.likes : 0);
    setImageUploadMode('url');
    setUploadStatus('');
    setIsModalOpen(true);
  };

  // Open Share to Social Modal
  const handleOpenShareModal = (item: GalleryItem) => {
    setSharingItem(item);
    setShareTitle(item.title);
    
    // Map event type to social category
    let cat: 'Weddings' | 'Castle Galas' | 'Tune Requests' | 'Highland Stories' | 'Tuition & Tips' = 'Weddings';
    if (item.eventType.toLowerCase().includes('castle') || item.eventType.toLowerCase().includes('gala') || item.eventType.toLowerCase().includes('civic') || item.eventType.toLowerCase().includes('corporate')) {
      cat = 'Castle Galas';
    } else if (item.eventType.toLowerCase().includes('highland') || item.eventType.toLowerCase().includes('burns') || item.eventType.toLowerCase().includes('memorial') || item.eventType.toLowerCase().includes('experience')) {
      cat = 'Highland Stories';
    }
    setShareCategory(cat);
    
    const locParts = [item.martOrVenueName, item.location].filter(Boolean);
    setShareLocation(locParts.join(', '));
    setShareTune('Highland Cathedral');
    setShareContent(item.description || `Special piping performance at ${locParts.join(', ') || item.title}! Masterful Great Highland Bagpipe tunes, authentic Highland attire, and unforgettable Scottish celebration.`);
    setShareIsPinned(false);
  };

  // Publish to /social Feed
  const handlePublishToSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharingItem) return;
    if (!shareContent.trim()) {
      alert('Please enter a story or caption for the social feed post.');
      return;
    }

    setIsSharing(true);
    try {
      await createSocialPost({
        postType: 'feed',
        title: shareTitle.trim() || sharingItem.title,
        authorName: 'Spud the Piper',
        authorRole: 'Spud the Piper',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80',
        content: shareContent.trim(),
        imageUrl: sharingItem.imageUrl,
        eventLocation: shareLocation.trim() || undefined,
        region: sharingItem.location || undefined,
        category: shareCategory,
        tunePlayed: shareTune.trim() || undefined,
        tags: [
          `#${(shareCategory || 'ScottishPiping').replace(/\s+/g, '')}`,
          '#SpudThePiper',
          '#HighlandBagpiper',
          ...(sharingItem.martOrVenueName ? [`#${sharingItem.martOrVenueName.replace(/[^a-zA-Z0-9]/g, '')}`] : [])
        ]
      });

      setSharingItem(null);
      setShareSuccessToast(true);
      setTimeout(() => setShareSuccessToast(false), 5000);
    } catch (err: any) {
      alert(`Error publishing to social page: ${err?.message || err}`);
    } finally {
      setIsSharing(false);
    }
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
          isFeatured: formIsFeatured,
          likes: Number(formLikes) || 0
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
          isFeatured: formIsFeatured,
          likes: Number(formLikes) || 0
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
      
      {/* Toast Notification for Social Share */}
      {shareSuccessToast && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 shadow-2xl flex items-center justify-between gap-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">Successfully Published to /social Feed!</p>
              <p className="text-[11px] text-emerald-300">Your photo and story are now live for fans and clients to like and comment.</p>
            </div>
          </div>
          <Link
            href="/social"
            target="_blank"
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold flex items-center gap-1 shrink-0 transition-colors"
          >
            <span>View Feed</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      )}

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
              Upload Scottish venue photos, manage gallery content, and 1-click share real performance photos directly to the public <strong>/social</strong> community feed!
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

            <Link
              href="/social"
              target="_blank"
              className="px-3.5 py-2 rounded-xl bg-tartan-dark border border-tartan-border text-gray-300 hover:text-white hover:border-tartan-gold text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>View /social Feed</span>
            </Link>

            <a
              href="/gallery"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-tartan-dark border border-tartan-border text-gray-300 hover:text-white hover:border-tartan-gold text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-tartan-gold" />
              <span>View Public Gallery</span>
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-5 border-t border-tartan-border/60">
          <div className="p-3 rounded-xl bg-tartan-dark/70 border border-tartan-border">
            <div className="text-[10px] uppercase font-bold text-gray-400">Total Photos</div>
            <div className="text-lg font-bold text-white font-serif">{totalCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-tartan-dark/70 border border-tartan-border">
            <div className="text-[10px] uppercase font-bold text-gray-400">Featured on Top</div>
            <div className="text-lg font-bold text-tartan-gold font-serif">{featuredCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-tartan-dark/70 border border-tartan-border">
            <div className="text-[10px] uppercase font-bold text-gray-400">Visitor Likes</div>
            <div className="text-lg font-bold text-rose-400 font-serif flex items-center gap-1">
              <Heart className="w-4 h-4 fill-rose-400" />
              <span>{totalLikes}</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-tartan-dark/70 border border-tartan-border">
            <div className="text-[10px] uppercase font-bold text-gray-400">Castles & Marts</div>
            <div className="text-lg font-bold text-emerald-400 font-serif">{venueSet.size}</div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Category, Sort & VIEW MODES Switcher */}
      <div className="bg-tartan-navy/80 p-4 rounded-2xl border border-tartan-border shadow-md space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, venue / mart, location, story..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-tartan-dark border border-tartan-border rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-tartan-gold"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters & Sorting */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 bg-tartan-dark px-3 py-1.5 rounded-xl border border-tartan-border">
              <Filter className="w-3.5 h-3.5 text-tartan-gold shrink-0" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer pr-1"
              >
                <option value="all" className="bg-tartan-dark text-white">All Categories ({galleryItems.length})</option>
                {COMMON_EVENT_TYPES.map(t => {
                  const count = galleryItems.filter(g => g.eventType === t).length;
                  return (
                    <option key={t} value={t} className="bg-tartan-dark text-white">
                      {t} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-tartan-dark px-3 py-1.5 rounded-xl border border-tartan-border">
              <ArrowUpDown className="w-3.5 h-3.5 text-tartan-gold shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer pr-1"
              >
                <option value="likes-desc" className="bg-tartan-dark text-white">🔥 Most Popular (Most Liked)</option>
                <option value="date-desc" className="bg-tartan-dark text-white">Newest Date First</option>
                <option value="date-asc" className="bg-tartan-dark text-white">Oldest Date First</option>
                <option value="title-asc" className="bg-tartan-dark text-white">Title (A-Z)</option>
                <option value="venue-asc" className="bg-tartan-dark text-white">Venue / Mart (A-Z)</option>
              </select>
            </div>

            {/* View Mode Toggle Button Group */}
            <div className="flex items-center bg-tartan-dark p-1 rounded-xl border border-tartan-border shadow-inner">
              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'cards'
                    ? 'bg-gold-gradient text-tartan-dark shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Cards View (Detailed visual cards)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>

              <button
                onClick={() => setViewMode('thumbnails')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'thumbnails'
                    ? 'bg-gold-gradient text-tartan-dark shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Thumbnails Grid (Dense photo catalog)"
              >
                <Grid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Thumbnails</span>
              </button>

              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'table'
                    ? 'bg-gold-gradient text-tartan-dark shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Table View (Data spreadsheet style with quick actions)"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>

              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'list'
                    ? 'bg-gold-gradient text-tartan-dark shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Detailed List View (Horizontal row cards)"
              >
                <ListIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>

          </div>

        </div>

        {/* Results summary bar */}
        <div className="flex items-center justify-between text-[11px] text-gray-400 px-1 pt-1 border-t border-tartan-border/40">
          <span>
            Showing <strong className="text-white">{filteredItems.length}</strong> of {galleryItems.length} items
          </span>
          <span className="capitalize text-tartan-gold">
            Current View: <strong>{viewMode}</strong> {sortBy === 'likes-desc' && '(Sorted by Likes)'}
          </span>
        </div>
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-tartan-navy/40 rounded-2xl border border-dashed border-tartan-border p-8 space-y-3">
          <Camera className="w-10 h-10 text-gray-500 mx-auto opacity-50" />
          <p className="text-xs text-gray-400 font-medium">No photos found matching your search or filters.</p>
          <div className="flex items-center justify-center gap-3">
            {(searchTerm || filterType !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                }}
                className="px-3.5 py-1.5 bg-tartan-dark border border-tartan-border text-gray-300 text-xs font-semibold rounded-lg hover:text-white"
              >
                Clear Filters
              </button>
            )}
            <button
              onClick={handleOpenAddModal}
              className="px-3.5 py-1.5 bg-gold-gradient text-tartan-dark text-xs font-bold rounded-lg hover:brightness-110 shadow-md"
            >
              Upload First Photo
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* ========================================================= */}
          {/* 1. CARDS VIEW (Rich Card Grid)                             */}
          {/* ========================================================= */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-tartan-navy rounded-2xl overflow-hidden border border-tartan-border hover:border-tartan-gold/50 shadow-lg flex flex-col justify-between transition-all group"
                >
                  {/* Photo Thumbnail */}
                  <div className="relative aspect-[16/9] w-full bg-slate-900 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    
                    {/* Event Type Badge */}
                    <div className="absolute top-2 left-2 z-10">
                      <span className="px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-bold text-tartan-gold border border-tartan-gold/30 shadow-md">
                        {item.eventType}
                      </span>
                    </div>

                    {/* Likes Badge on Top Right */}
                    <div className="absolute top-2 right-10 z-10">
                      <span className="px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-bold text-rose-300 border border-rose-500/30 flex items-center gap-1 shadow-md">
                        <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />
                        {typeof item.likes === 'number' ? item.likes : 0}
                      </span>
                    </div>

                    {/* Quick Preview Button */}
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 z-10"
                      title="Click to view full photo preview"
                    >
                      <span className="px-3 py-1.5 rounded-full bg-tartan-dark/90 border border-tartan-gold text-tartan-gold text-xs font-bold flex items-center gap-1.5 shadow-xl">
                        <Eye className="w-3.5 h-3.5" />
                        Quick Preview
                      </span>
                    </button>

                    {/* Featured Badge Button */}
                    <button
                      onClick={() => handleToggleFeatured(item)}
                      title={item.isFeatured ? 'Featured (Click to unfeature)' : 'Click to feature on top'}
                      className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all z-20 ${
                        item.isFeatured 
                          ? 'bg-yellow-500/95 text-black shadow-md ring-2 ring-yellow-300' 
                          : 'bg-black/60 text-gray-400 hover:text-yellow-400'
                      }`}
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </button>

                    {/* Date overlay */}
                    {item.date && (
                      <div className="absolute bottom-2 right-2 z-10">
                        <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-medium text-gray-200 flex items-center gap-1 border border-white/10">
                          <Calendar className="w-3 h-3 text-tartan-gold" />
                          {item.date}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      {item.martOrVenueName && (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-tartan-gold">
                          <Building2 className="w-3 h-3 shrink-0" />
                          <span className="truncate">{item.martOrVenueName}</span>
                        </div>
                      )}

                      <h4 className="text-sm font-bold text-white font-serif line-clamp-1 group-hover:text-tartan-gold transition-colors">
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

                    {/* Actions & Share button */}
                    <div className="pt-3 mt-2 border-t border-tartan-border/60 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 font-mono truncate max-w-[80px]">
                          ID: {item.id}
                        </span>
                        <span className="text-[10px] text-rose-400 font-semibold flex items-center gap-0.5">
                          <Heart className="w-3 h-3 fill-rose-400" />
                          {typeof item.likes === 'number' ? item.likes : 0}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Share to Social Feed Button */}
                        <button
                          onClick={() => handleOpenShareModal(item)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 hover:text-white transition-colors text-xs font-semibold flex items-center gap-1"
                          title="Share to /social feed for public interaction"
                        >
                          <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Share</span>
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 rounded-lg bg-tartan-dark hover:bg-tartan-accent text-gray-300 hover:text-white transition-colors text-xs font-medium border border-tartan-border"
                          title="Edit photo details"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-tartan-gold" />
                        </button>

                        <button
                          onClick={() => handleDeleteItem(item.id, item.title)}
                          className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900 text-rose-300 hover:text-white transition-colors border border-rose-800/40"
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

          {/* ========================================================= */}
          {/* 2. THUMBNAILS GRID VIEW (Dense Photo Grid)                 */}
          {/* ========================================================= */}
          {viewMode === 'thumbnails' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-slate-900 border border-tartan-border hover:border-tartan-gold shadow-md transition-all hover:scale-[1.02]"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none">
                    {item.isFeatured ? (
                      <span className="p-1 rounded-md bg-yellow-500 text-black shadow-md">
                        <Star className="w-3 h-3 fill-current" />
                      </span>
                    ) : <span />}

                    <div className="flex items-center gap-1">
                      {typeof item.likes === 'number' && item.likes > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-bold text-rose-300 backdrop-blur-sm flex items-center gap-0.5">
                          <Heart className="w-2.5 h-2.5 fill-rose-400 text-rose-400" />
                          {item.likes}
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-bold text-tartan-gold backdrop-blur-sm truncate max-w-[80px]">
                        {item.eventType}
                      </span>
                    </div>
                  </div>

                  {/* Full Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/30 opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-rose-300 font-bold flex items-center gap-1">
                        <Heart className="w-3 h-3 fill-rose-400" />
                        {typeof item.likes === 'number' ? item.likes : 0}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenShareModal(item)}
                          className="p-1 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 hover:text-white"
                          title="Share to /social"
                        >
                          <Share2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleToggleFeatured(item)}
                          className={`p-1 rounded-md transition-colors ${
                            item.isFeatured ? 'bg-yellow-500 text-black' : 'bg-black/60 text-gray-300 hover:text-yellow-400'
                          }`}
                          title={item.isFeatured ? 'Unfeature' : 'Feature'}
                        >
                          <Star className="w-3 h-3 fill-current" />
                        </button>
                        <button
                          onClick={() => setPreviewItem(item)}
                          className="p-1 rounded-md bg-black/60 text-gray-300 hover:text-white"
                          title="Quick View"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h5 className="text-[11px] font-bold text-white font-serif line-clamp-1">
                        {item.title}
                      </h5>
                      {item.martOrVenueName && (
                        <p className="text-[10px] text-tartan-gold font-medium truncate">
                          {item.martOrVenueName}
                        </p>
                      )}
                      {item.date && (
                        <p className="text-[9px] text-gray-400">
                          {item.date}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-white/10 mt-1">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="px-2 py-0.5 rounded bg-tartan-accent hover:bg-tartan-gold hover:text-tartan-dark text-[10px] font-bold text-white transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id, item.title)}
                          className="p-1 rounded text-rose-400 hover:text-rose-200 hover:bg-rose-950/60 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. TABLE VIEW (Structured Admin Spreadsheet Table)         */}
          {/* ========================================================= */}
          {viewMode === 'table' && (
            <div className="bg-tartan-navy rounded-2xl border border-tartan-border shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-tartan-card border-b border-tartan-border text-gray-400 text-[11px] uppercase tracking-wider font-bold">
                      <th className="py-3 px-4 w-16 text-center">Photo</th>
                      <th className="py-3 px-4">Title & Description</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Venue / Mart</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-center w-20">Likes</th>
                      <th className="py-3 px-4 text-center w-20">Featured</th>
                      <th className="py-3 px-4 text-right w-36">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-tartan-border/60">
                    {filteredItems.map((item) => (
                      <tr 
                        key={item.id}
                        className="hover:bg-tartan-dark/70 transition-colors group"
                      >
                        {/* Thumbnail */}
                        <td className="py-2.5 px-4">
                          <button
                            onClick={() => setPreviewItem(item)}
                            className="relative w-12 h-12 rounded-lg overflow-hidden border border-tartan-border hover:border-tartan-gold block bg-black shadow-sm group-hover:scale-105 transition-transform"
                            title="Click to preview"
                          >
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                              <Eye className="w-3 h-3 text-white" />
                            </div>
                          </button>
                        </td>

                        {/* Title & Story */}
                        <td className="py-2.5 px-4 max-w-xs">
                          <div className="font-bold text-white text-xs font-serif group-hover:text-tartan-gold transition-colors">
                            {item.title}
                          </div>
                          {item.description && (
                            <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                              {item.description}
                            </p>
                          )}
                          <span className="text-[9px] text-gray-500 font-mono">
                            ID: {item.id}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md bg-black/60 border border-tartan-border text-[10px] font-bold text-tartan-gold">
                            {item.eventType}
                          </span>
                        </td>

                        {/* Mart / Venue */}
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          {item.martOrVenueName ? (
                            <div className="flex items-center gap-1.5 font-medium text-gray-200">
                              <Building2 className="w-3.5 h-3.5 text-tartan-gold shrink-0" />
                              <span>{item.martOrVenueName}</span>
                            </div>
                          ) : (
                            <span className="text-gray-500 italic">—</span>
                          )}
                        </td>

                        {/* Location */}
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          {item.location ? (
                            <div className="flex items-center gap-1 text-gray-300">
                              <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                              <span>{item.location}</span>
                            </div>
                          ) : (
                            <span className="text-gray-500 italic">—</span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="py-2.5 px-4 whitespace-nowrap text-gray-300 font-mono text-[11px]">
                          {item.date || '—'}
                        </td>

                        {/* Likes Count Column */}
                        <td className="py-2.5 px-4 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-950/60 border border-rose-500/30 text-[11px] font-bold text-rose-300">
                            <Heart className="w-3 h-3 fill-rose-400" />
                            {typeof item.likes === 'number' ? item.likes : 0}
                          </span>
                        </td>

                        {/* Featured Star Toggle */}
                        <td className="py-2.5 px-4 text-center">
                          <button
                            onClick={() => handleToggleFeatured(item)}
                            className={`p-1.5 rounded-lg transition-all ${
                              item.isFeatured 
                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/40 hover:bg-yellow-500/40' 
                                : 'text-gray-600 hover:text-yellow-400 hover:bg-white/5'
                            }`}
                            title={item.isFeatured ? 'Featured (Click to unfeature)' : 'Click to feature'}
                          >
                            <Star className={`w-4 h-4 ${item.isFeatured ? 'fill-current' : ''}`} />
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Share to Social */}
                            <button
                              onClick={() => handleOpenShareModal(item)}
                              className="px-2 py-1 rounded-lg bg-emerald-950/50 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 hover:text-white transition-colors text-xs font-semibold flex items-center gap-1"
                              title="Share to /social Feed"
                            >
                              <Share2 className="w-3 h-3 text-emerald-400" />
                              <span className="text-[10px]">Share</span>
                            </button>

                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className="p-1.5 rounded-lg bg-tartan-dark hover:bg-tartan-accent text-gray-300 hover:text-white transition-colors border border-tartan-border"
                              title="Edit photo details"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-tartan-gold" />
                            </button>

                            <button
                              onClick={() => handleDeleteItem(item.id, item.title)}
                              className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900 text-rose-300 hover:text-white transition-colors border border-rose-800/40"
                              title="Delete photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. DETAILED LIST VIEW (Horizontal Rows)                    */}
          {/* ========================================================= */}
          {viewMode === 'list' && (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-tartan-navy rounded-2xl border border-tartan-border hover:border-tartan-gold/50 shadow-md p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all group"
                >
                  {/* Left: Image Thumbnail */}
                  <div className="flex items-start sm:items-center gap-3.5 w-full sm:w-auto">
                    <div 
                      onClick={() => setPreviewItem(item)}
                      className="relative w-28 h-20 sm:w-32 sm:h-22 rounded-xl overflow-hidden bg-slate-900 border border-tartan-border hover:border-tartan-gold shrink-0 cursor-pointer shadow-md"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                      {item.isFeatured && (
                        <div className="absolute top-1 left-1 p-0.5 rounded bg-yellow-500 text-black shadow">
                          <Star className="w-2.5 h-2.5 fill-current" />
                        </div>
                      )}
                    </div>

                    {/* Middle: Details */}
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full bg-black/60 border border-tartan-gold/30 text-[10px] font-bold text-tartan-gold">
                          {item.eventType}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-rose-950/60 border border-rose-500/30 text-[10px] font-bold text-rose-300 flex items-center gap-1">
                          <Heart className="w-2.5 h-2.5 fill-rose-400" />
                          {typeof item.likes === 'number' ? item.likes : 0} likes
                        </span>
                        {item.date && (
                          <span className="text-[10px] text-gray-400 flex items-center gap-1 font-mono">
                            <Calendar className="w-3 h-3 text-tartan-gold" />
                            {item.date}
                          </span>
                        )}
                        <span className="text-[9px] text-gray-500 font-mono">
                          ID: {item.id}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white font-serif group-hover:text-tartan-gold transition-colors truncate">
                        {item.title}
                      </h4>

                      <div className="flex items-center gap-3 flex-wrap text-xs text-gray-300">
                        {item.martOrVenueName && (
                          <div className="flex items-center gap-1 font-semibold text-tartan-gold text-[11px]">
                            <Building2 className="w-3 h-3 shrink-0" />
                            <span>{item.martOrVenueName}</span>
                          </div>
                        )}
                        {item.location && (
                          <div className="flex items-center gap-1 text-gray-300 text-[11px]">
                            <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                            <span>{item.location}</span>
                          </div>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-[11px] text-gray-400 line-clamp-1 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Quick Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-tartan-border/50 shrink-0">
                    <button
                      onClick={() => handleOpenShareModal(item)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Share to /social feed"
                    >
                      <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Share to Social</span>
                    </button>

                    <button
                      onClick={() => handleToggleFeatured(item)}
                      className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        item.isFeatured
                          ? 'bg-yellow-500/20 text-yellow-400 border-yellow-400/40'
                          : 'bg-tartan-dark text-gray-400 border-tartan-border hover:text-yellow-400'
                      }`}
                      title={item.isFeatured ? 'Featured on top' : 'Feature on top'}
                    >
                      <Star className={`w-3.5 h-3.5 ${item.isFeatured ? 'fill-current' : ''}`} />
                      <span className="text-[11px]">{item.isFeatured ? 'Featured' : 'Feature'}</span>
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="px-3 py-1.5 rounded-xl bg-tartan-dark hover:bg-tartan-accent border border-tartan-border text-gray-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-tartan-gold" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDeleteItem(item.id, item.title)}
                      className="p-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900 border border-rose-800/40 text-rose-300 hover:text-white transition-colors"
                      title="Delete photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ========================================================= */}
      {/* QUICK LIGHTBOX PREVIEW MODAL FOR ADMIN                    */}
      {/* ========================================================= */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative max-w-4xl w-full bg-tartan-card rounded-2xl border border-tartan-border overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-4 bg-tartan-dark/90 border-b border-tartan-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-black/80 text-[10px] font-bold text-tartan-gold border border-tartan-gold/30">
                  {previewItem.eventType}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-950/80 text-[10px] font-bold text-rose-300 border border-rose-500/30 flex items-center gap-1">
                  <Heart className="w-3 h-3 fill-rose-400" />
                  {typeof previewItem.likes === 'number' ? previewItem.likes : 0} likes
                </span>
                <h3 className="text-sm font-bold text-white font-serif truncate">
                  {previewItem.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* HD Image */}
            <div className="relative max-h-[65vh] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={previewItem.imageUrl}
                alt={previewItem.title}
                className="max-h-[65vh] w-auto max-w-full object-contain"
              />
            </div>

            {/* Info Footer */}
            <div className="p-4 bg-tartan-dark border-t border-tartan-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                {previewItem.martOrVenueName && (
                  <div className="text-xs font-bold text-tartan-gold flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{previewItem.martOrVenueName}</span>
                    {previewItem.location && <span className="text-gray-400">({previewItem.location})</span>}
                  </div>
                )}
                {previewItem.description && (
                  <p className="text-xs text-gray-300 max-w-xl">
                    {previewItem.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  onClick={() => {
                    const it = previewItem;
                    setPreviewItem(null);
                    handleOpenShareModal(it);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share to /social</span>
                </button>

                <button
                  onClick={() => {
                    const it = previewItem;
                    setPreviewItem(null);
                    handleOpenEditModal(it);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-gold-gradient text-tartan-dark font-bold text-xs flex items-center gap-1.5 hover:brightness-110 shadow-md"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Photo</span>
                </button>

                <button
                  onClick={() => setPreviewItem(null)}
                  className="px-3 py-1.5 rounded-xl bg-tartan-navy border border-tartan-border text-gray-300 text-xs font-semibold hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SHARE GALLERY PHOTO TO /SOCIAL FEED MODAL                 */}
      {/* ========================================================= */}
      {sharingItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-tartan-card max-w-2xl w-full rounded-3xl border border-tartan-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-emerald-950 via-tartan-navy to-tartan-dark border-b border-tartan-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-serif">
                    Share Photo to Live Social Feed
                  </h3>
                  <p className="text-[11px] text-emerald-300">
                    Publish this performance photo directly to the public <strong>/social</strong> page for community discussion and likes.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSharingItem(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handlePublishToSocial} className="p-5 sm:p-6 space-y-4 max-h-[78vh] overflow-y-auto">
              
              {/* Photo Preview Strip */}
              <div className="p-3 rounded-2xl bg-tartan-dark/80 border border-tartan-border flex items-center gap-3.5">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-black shrink-0 border border-tartan-border">
                  <img
                    src={sharingItem.imageUrl}
                    alt={sharingItem.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-black/60 text-[10px] font-bold text-tartan-gold border border-tartan-gold/30">
                      {sharingItem.eventType}
                    </span>
                    {sharingItem.date && (
                      <span className="text-[10px] text-gray-400 font-mono">
                        {sharingItem.date}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-white truncate font-serif">
                    {sharingItem.title}
                  </h4>
                  <p className="text-[11px] text-gray-400 truncate">
                    {sharingItem.martOrVenueName || sharingItem.location}
                  </p>
                </div>
              </div>

              {/* Post Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-200">
                    Post Headline / Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={shareTitle}
                    onChange={(e) => setShareTitle(e.target.value)}
                    required
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-200">
                    Social Feed Category
                  </label>
                  <select
                    value={shareCategory}
                    onChange={(e) => setShareCategory(e.target.value as any)}
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 cursor-pointer"
                  >
                    <option value="Weddings">Weddings</option>
                    <option value="Castle Galas">Castle Galas</option>
                    <option value="Highland Stories">Highland Stories</option>
                    <option value="Tune Requests">Tune Requests</option>
                    <option value="Tuition & Tips">Tuition & Tips</option>
                  </select>
                </div>
              </div>

              {/* Location & Tune Played */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-200 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>Venue Location Tag</span>
                  </label>
                  <input
                    type="text"
                    value={shareLocation}
                    onChange={(e) => setShareLocation(e.target.value)}
                    placeholder="e.g. Stirling Castle, Scotland"
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-200 flex items-center gap-1">
                    <Music className="w-3.5 h-3.5 text-tartan-gold" />
                    <span>Featured Tune Played</span>
                  </label>
                  <input
                    type="text"
                    value={shareTune}
                    onChange={(e) => setShareTune(e.target.value)}
                    placeholder="e.g. Highland Cathedral or Scotland the Brave"
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Story / Post Caption Content */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-200">
                  Feed Story & Caption <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={4}
                  value={shareContent}
                  onChange={(e) => setShareContent(e.target.value)}
                  required
                  placeholder="Tell your fans and followers about the event, the crowd reaction, Highland attire worn..."
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400"
                />
              </div>

              {/* Author Preview Note */}
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-300">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>This post will be published under <strong>Spud the Piper (Verified Author)</strong> with public comments and likes enabled on <strong>/social</strong>.</span>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-tartan-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSharingItem(null)}
                  className="px-4 py-2 rounded-xl bg-tartan-dark border border-tartan-border text-gray-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSharing}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 disabled:opacity-50 transition-all"
                >
                  {isSharing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Publish to /social</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADD / EDIT PHOTO MODAL                                    */}
      {/* ========================================================= */}
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
                    Event Date (for sorting)
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-tartan-gold"
                  />
                </div>
              </div>

              {/* Location & Likes Count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-200 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                    <span>Visitor Likes Count</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formLikes}
                    onChange={(e) => setFormLikes(parseInt(e.target.value) || 0)}
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-gold"
                  />
                </div>
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
