'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { BlogPost, BLOG_SERVICE_CATEGORIES } from '@/types/spud';
import { initialBlogPosts } from '@/lib/initialData';
import { uploadToStorage } from '@/lib/firebase';
import { 
  BookOpen, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  Loader2,
  Sparkles,
  Eye,
  ExternalLink,
  Play,
  Youtube,
  Share2,
  Copy,
  Calendar,
  MapPin,
  Shirt,
  Music,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Heart,
  Globe,
  Upload,
  Image as ImageIcon,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const clean = url.trim();
  const shortMatch = clean.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  const longMatch = clean.match(/(?:watch\?v=|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  if (longMatch) return longMatch[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) return clean;
  return null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function compressImageFile(file: File, maxWidth = 1200, maxHeight = 900, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export const AdminBlog: React.FC = () => {
  const { 
    blogPosts, 
    addBlogPost, 
    updateBlogPost, 
    deleteBlogPost, 
    togglePublishBlogPost,
    tunesList
  } = useApp();

  const currentPosts = blogPosts || [];

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<string>(BLOG_SERVICE_CATEGORIES[0]);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [formYoutubeUrl, setFormYoutubeUrl] = useState('');
  const [formFeaturedImageUrl, setFormFeaturedImageUrl] = useState('');
  const [formVenueName, setFormVenueName] = useState('');
  const [formVenueLocation, setFormVenueLocation] = useState('');
  const [formTartanChoice, setFormTartanChoice] = useState('Full No. 1 Dress (Feather Bonnet & Plaid)');
  const [formTunesPlayed, setFormTunesPlayed] = useState<string[]>([]);
  const [tuneInput, setTuneInput] = useState('');
  const [formPublishDate, setFormPublishDate] = useState(new Date().toISOString().split('T')[0]);
  const [formIsPublished, setFormIsPublished] = useState(true);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formAuthor, setFormAuthor] = useState('Spud The Piper');
  const [formReadTimeMinutes, setFormReadTimeMinutes] = useState(3);
  const [formTags, setFormTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [formViews, setFormViews] = useState<number>(0);
  const [formLikes, setFormLikes] = useState<number>(0);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);

  // Delete State
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Cover Photo Upload State & Handlers
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      alert('File size exceeds 25MB limit. Please choose a photo under 25MB.');
      return;
    }

    setIsUploadingCover(true);
    setErrorMessage(null);

    try {
      const cloudUrl = await uploadToStorage(file, 'blog_covers', 12000);
      setFormFeaturedImageUrl(cloudUrl);
    } catch (err: any) {
      console.warn('Direct cloud storage upload notice, optimizing image locally:', err);
      try {
        const compressed = await compressImageFile(file);
        setFormFeaturedImageUrl(compressed);
      } catch (readErr) {
        setErrorMessage('Failed to read image file. Please try another photo or enter an image URL.');
      }
    } finally {
      setIsUploadingCover(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    if (file.size > 25 * 1024 * 1024) {
      alert('File size exceeds 25MB limit. Please choose a photo under 25MB.');
      return;
    }

    setIsUploadingCover(true);
    setErrorMessage(null);
    try {
      const cloudUrl = await uploadToStorage(file, 'blog_covers', 12000);
      setFormFeaturedImageUrl(cloudUrl);
    } catch (err: any) {
      console.warn('Direct cloud storage upload notice, optimizing image locally:', err);
      try {
        const compressed = await compressImageFile(file);
        setFormFeaturedImageUrl(compressed);
      } catch (readErr) {
        setErrorMessage('Failed to process dropped image.');
      }
    } finally {
      setIsUploadingCover(false);
    }
  };

  // Derived YouTube ID for live preview in modal
  const liveYoutubeId = useMemo(() => {
    return extractYouTubeId(formYoutubeUrl);
  }, [formYoutubeUrl]);

  // Filtered Posts
  const filteredPosts = useMemo(() => {
    return currentPosts.filter(p => {
      if (statusFilter === 'published' && !p.isPublished) return false;
      if (statusFilter === 'draft' && p.isPublished) return false;
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchTitle = (p.title || '').toLowerCase().includes(q);
        const matchVenue = (p.venueName || '').toLowerCase().includes(q);
        const matchLocation = (p.venueLocation || '').toLowerCase().includes(q);
        const matchContent = (p.content || '').toLowerCase().includes(q);
        const matchTartan = (p.tartanChoice || '').toLowerCase().includes(q);
        const matchTunes = (p.tunesPlayed || []).some(t => t.toLowerCase().includes(q));
        if (!matchTitle && !matchVenue && !matchLocation && !matchContent && !matchTartan && !matchTunes) {
          return false;
        }
      }
      return true;
    });
  }, [currentPosts, statusFilter, categoryFilter, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const total = currentPosts.length;
    const published = currentPosts.filter(p => p.isPublished).length;
    const drafts = total - published;
    const withVideos = currentPosts.filter(p => p.youtubeId || p.youtubeUrl).length;
    const totalViews = currentPosts.reduce((acc, p) => acc + (p.views || 0), 0);
    return { total, published, drafts, withVideos, totalViews };
  }, [currentPosts]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingPostId(null);
    setFormTitle('');
    setFormSlug('');
    setFormSubtitle('');
    setFormExcerpt('');
    setFormContent('');
    setFormCategory(BLOG_SERVICE_CATEGORIES[0]);
    setIsCustomCategory(false);
    setCustomCategoryInput('');
    setFormYoutubeUrl('');
    setFormFeaturedImageUrl('');
    setFormVenueName('');
    setFormVenueLocation('');
    setFormTartanChoice('Full No. 1 Dress (Feather Bonnet & Plaid)');
    setFormTunesPlayed(['Highland Cathedral', 'Mairi\'s Wedding', 'Scotland the Brave']);
    setTuneInput('');
    setFormPublishDate(new Date().toISOString().split('T')[0]);
    setFormIsPublished(true);
    setFormIsFeatured(false);
    setFormAuthor('Spud The Piper');
    setFormReadTimeMinutes(3);
    setFormTags(['Castle Wedding', 'Highland Bagpipe', 'Scotland']);
    setTagInput('');
    setFormViews(0);
    setFormLikes(0);
    setShowUrlInput(false);
    setIsUploadingCover(false);
    setSuccessMessage(null);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: BlogPost) => {
    setEditingPostId(item.id);
    setFormTitle(item.title);
    setFormSlug(item.slug || slugify(item.title));
    setFormSubtitle(item.subtitle || '');
    setFormExcerpt(item.excerpt || '');
    setFormContent(item.content || '');
    
    const isKnown = (BLOG_SERVICE_CATEGORIES as readonly string[]).includes(item.category);
    if (isKnown) {
      setFormCategory(item.category);
      setIsCustomCategory(false);
      setCustomCategoryInput('');
    } else {
      setFormCategory('custom');
      setIsCustomCategory(true);
      setCustomCategoryInput(item.category);
    }

    setFormYoutubeUrl(item.youtubeUrl || (item.youtubeId ? `https://youtu.be/${item.youtubeId}` : ''));
    setFormFeaturedImageUrl(item.featuredImageUrl || '');
    setFormVenueName(item.venueName || '');
    setFormVenueLocation(item.venueLocation || '');
    setFormTartanChoice(item.tartanChoice || 'Full No. 1 Dress (Feather Bonnet & Plaid)');
    setFormTunesPlayed(item.tunesPlayed || []);
    setTuneInput('');
    setFormPublishDate(item.publishDate || new Date().toISOString().split('T')[0]);
    setFormIsPublished(Boolean(item.isPublished));
    setFormIsFeatured(Boolean(item.isFeatured));
    setFormAuthor(item.author || 'Spud The Piper');
    setFormReadTimeMinutes(item.readTimeMinutes || 3);
    setFormTags(item.tags || []);
    setTagInput('');
    setFormViews(item.views || 0);
    setFormLikes(item.likes || 0);
    setShowUrlInput(Boolean(item.featuredImageUrl && !item.featuredImageUrl.includes('firebasestorage')));
    setIsUploadingCover(false);
    setSuccessMessage(null);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  // Auto-generate slug when title changes in create mode
  const handleTitleChange = (val: string) => {
    setFormTitle(val);
    if (!editingPostId) {
      setFormSlug(slugify(val));
    }
  };

  // Add Tune Chip
  const handleAddTune = (tuneName: string) => {
    const trimmed = tuneName.trim();
    if (!trimmed) return;
    if (!formTunesPlayed.includes(trimmed)) {
      setFormTunesPlayed(prev => [...prev, trimmed]);
    }
    setTuneInput('');
  };

  // Remove Tune Chip
  const handleRemoveTune = (tuneName: string) => {
    setFormTunesPlayed(prev => prev.filter(t => t !== tuneName));
  };

  // Add Tag
  const handleAddTag = (tagName: string) => {
    const trimmed = tagName.trim();
    if (!trimmed) return;
    if (!formTags.includes(trimmed)) {
      setFormTags(prev => [...prev, trimmed]);
    }
    setTagInput('');
  };

  // Remove Tag
  const handleRemoveTag = (tagName: string) => {
    setFormTags(prev => prev.filter(t => t !== tagName));
  };

  // Submit Handler
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim() || isSaving) return;

    const finalCategory = isCustomCategory ? (customCategoryInput.trim() || 'Highland Stories') : formCategory;
    const finalSlug = (formSlug.trim() || slugify(formTitle)).toLowerCase();
    const ytId = extractYouTubeId(formYoutubeUrl);
    
    // Auto thumbnail fallback if no featured image given
    let finalImage = formFeaturedImageUrl.trim();
    if (!finalImage && ytId) {
      finalImage = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    }
    if (!finalImage) {
      finalImage = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=80';
    }

    const calculatedReadTime = Math.max(1, Math.ceil(formContent.split(/\s+/).length / 200));

    setIsSaving(true);
    setErrorMessage(null);

    try {
      if (editingPostId) {
        await updateBlogPost(editingPostId, {
          title: formTitle.trim(),
          slug: finalSlug,
          subtitle: formSubtitle.trim(),
          excerpt: formExcerpt.trim() || formContent.slice(0, 160).trim() + '...',
          content: formContent.trim(),
          category: finalCategory,
          isCustomCategory,
          youtubeUrl: formYoutubeUrl.trim() || undefined,
          youtubeId: ytId || undefined,
          featuredImageUrl: finalImage,
          venueName: formVenueName.trim() || undefined,
          venueLocation: formVenueLocation.trim() || undefined,
          tartanChoice: formTartanChoice.trim() || undefined,
          tunesPlayed: formTunesPlayed,
          author: formAuthor.trim() || 'Spud The Piper',
          publishDate: formPublishDate,
          isPublished: formIsPublished,
          isFeatured: formIsFeatured,
          readTimeMinutes: calculatedReadTime,
          tags: formTags,
          views: Math.max(0, Number(formViews) || 0),
          likes: Math.max(0, Number(formLikes) || 0)
        });
        setSuccessMessage('Story updated successfully!');
      } else {
        await addBlogPost({
          title: formTitle.trim(),
          slug: finalSlug,
          subtitle: formSubtitle.trim(),
          excerpt: formExcerpt.trim() || formContent.slice(0, 160).trim() + '...',
          content: formContent.trim(),
          category: finalCategory,
          isCustomCategory,
          youtubeUrl: formYoutubeUrl.trim() || undefined,
          youtubeId: ytId || undefined,
          featuredImageUrl: finalImage,
          venueName: formVenueName.trim() || undefined,
          venueLocation: formVenueLocation.trim() || undefined,
          tartanChoice: formTartanChoice.trim() || undefined,
          tunesPlayed: formTunesPlayed,
          author: formAuthor.trim() || 'Spud The Piper',
          publishDate: formPublishDate,
          isPublished: formIsPublished,
          isFeatured: formIsFeatured,
          readTimeMinutes: calculatedReadTime,
          tags: formTags,
          views: Math.max(0, Number(formViews) || 0),
          likes: Math.max(0, Number(formLikes) || 0)
        });
        setSuccessMessage('Story published successfully!');
      }

      setTimeout(() => {
        setIsModalOpen(false);
      }, 700);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to save story. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Handler
  const confirmDelete = async () => {
    if (!postToDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteBlogPost(postToDelete.id);
      setPostToDelete(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  // 1-Click Facebook Share Link Generator
  const handleShareToFacebook = (post: BlogPost) => {
    const postUrl = `https://spudthepiper.com/blog?story=${post.slug}`;
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
    window.open(fbUrl, '_blank', 'width=600,height=500');
  };

  // 1-Click WhatsApp Share Link Generator
  const handleShareToWhatsApp = (post: BlogPost) => {
    const postUrl = `https://spudthepiper.com/blog?story=${post.slug}`;
    const message = `Check out Spud the Piper's new blog story & video: "${post.title}" at ${post.venueName || 'Scotland'}! ${postUrl}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  // 1-Click Copy Public Blog URL & Facebook Caption
  const handleCopyShareLink = (post: BlogPost) => {
    const postUrl = `https://spudthepiper.com/blog?story=${post.slug}`;
    navigator.clipboard.writeText(postUrl);
    setCopiedShareId(post.id);
    setTimeout(() => {
      setCopiedShareId(null);
    }, 2500);
  };

  const handleCopyFacebookCaption = (post: BlogPost) => {
    const postUrl = `https://spudthepiper.com/blog?story=${post.slug}`;
    const caption = `🏴󠁧󠁢󠁳󠁣󠁴󠁿 New Story & Video from Spud the Piper! 🏴󠁧󠁢󠁳󠁣󠁴󠁿\n\n"${post.title}"\n${post.subtitle ? post.subtitle + '\n\n' : ''}${post.excerpt}\n\n👉 Watch the video and read the full story on my website:\n${postUrl}`;
    navigator.clipboard.writeText(caption);
    setCopiedShareId(`caption-${post.id}`);
    setTimeout(() => {
      setCopiedShareId(null);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-tartan-card via-tartan-navy to-tartan-dark p-6 sm:p-8 rounded-3xl border border-tartan-border shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tartan-gold/10 border border-tartan-gold/30 text-tartan-gold text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5 text-tartan-gold" />
            <span>Spud's Wedding & Highland Blog Studio</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-serif tracking-tight">
            Blog & Video Stories Hub
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            Publish wedding videos, Highland elopements, and bagpipe masterclass stories. Posts automatically distribute with 1-click sharing to Facebook, WhatsApp, and social media so all links drive visitors right back to <strong>spudthepiper.com</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap shrink-0">
          <Link
            href="/blog"
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-tartan-navy hover:bg-slate-700 text-gray-200 border border-tartan-border text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
          >
            <Eye className="w-3.5 h-3.5 text-tartan-gold" />
            <span>View Public Blog ↗</span>
          </Link>
          <button
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Write New Story</span>
          </button>
        </div>
      </div>

      {/* 2. Statistics Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-tartan-card border border-tartan-border shadow-lg space-y-1">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Stories</div>
          <div className="text-2xl font-black text-white font-serif">{stats.total}</div>
        </div>
        <div className="p-4 rounded-2xl bg-tartan-card border border-emerald-900/40 shadow-lg space-y-1">
          <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Published</div>
          <div className="text-2xl font-black text-emerald-400 font-serif">{stats.published}</div>
        </div>
        <div className="p-4 rounded-2xl bg-tartan-card border border-amber-900/40 shadow-lg space-y-1">
          <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Drafts</div>
          <div className="text-2xl font-black text-amber-400 font-serif">{stats.drafts}</div>
        </div>
        <div className="p-4 rounded-2xl bg-tartan-card border border-red-900/40 shadow-lg space-y-1">
          <div className="text-[11px] font-semibold text-red-400 uppercase tracking-wider">Video Vlogs</div>
          <div className="text-2xl font-black text-red-400 font-serif flex items-center gap-1.5">
            <Youtube className="w-5 h-5 inline text-red-500" />
            <span>{stats.withVideos}</span>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-tartan-card border border-tartan-gold/30 shadow-lg space-y-1 col-span-2 sm:col-span-1">
          <div className="text-[11px] font-semibold text-tartan-gold uppercase tracking-wider">Total Views</div>
          <div className="text-2xl font-black text-tartan-gold font-serif">{stats.totalViews.toLocaleString()}</div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-tartan-card border border-tartan-border shadow-xl flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search story, venue, tune, or tartan..."
            className="w-full pl-9.5 pr-4 py-2 bg-tartan-dark border border-tartan-border rounded-xl text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-tartan-accent"
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

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-tartan-accent"
          >
            <option value="all">All Categories</option>
            {BLOG_SERVICE_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Status Filter */}
          <div className="inline-flex rounded-xl bg-tartan-dark p-1 border border-tartan-border text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${statusFilter === 'all' ? 'bg-tartan-navy text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${statusFilter === 'published' ? 'bg-emerald-600 text-white shadow' : 'text-gray-400 hover:text-emerald-400'}`}
            >
              Published
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${statusFilter === 'draft' ? 'bg-amber-600 text-white shadow' : 'text-gray-400 hover:text-amber-400'}`}
            >
              Drafts
            </button>
          </div>
        </div>

      </div>

      {/* 4. Stories Cards Grid */}
      {filteredPosts.length === 0 ? (
        <div className="p-12 rounded-3xl bg-tartan-card border border-dashed border-tartan-border text-center space-y-4">
          <BookOpen className="w-12 h-12 text-gray-500 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-white font-serif">No stories found</h3>
            <p className="text-xs text-gray-400 mt-1">
              {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' 
                ? 'Try adjusting your search query or filter options.' 
                : 'Click "Write New Story" above to publish your first blog post and video vlog!'}
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-gold-gradient text-tartan-dark text-xs font-bold"
          >
            Write Story Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPosts.map((post) => {
            const hasVideo = Boolean(post.youtubeId || post.youtubeUrl);
            const thumbUrl = post.featuredImageUrl || (post.youtubeId ? `https://img.youtube.com/vi/${post.youtubeId}/hqdefault.jpg` : '');

            return (
              <div
                key={post.id}
                className="rounded-3xl bg-tartan-card border border-tartan-border shadow-xl hover:border-tartan-accent/60 transition-all flex flex-col overflow-hidden group"
              >
                {/* Card Thumbnail Header */}
                <div className="relative aspect-video bg-black overflow-hidden">
                  {thumbUrl ? (
                    <img 
                      src={thumbUrl} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-tartan-navy text-gray-500">
                      <BookOpen className="w-10 h-10" />
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-tartan-dark via-black/30 to-transparent" />

                  {/* Badges on Top */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-tartan-gold border border-tartan-gold/30">
                      {post.category}
                    </span>
                    
                    {/* Published Toggle */}
                    <button
                      onClick={() => togglePublishBlogPost(post.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 backdrop-blur-md shadow ${
                        post.isPublished 
                          ? 'bg-emerald-600/90 text-white hover:bg-emerald-500' 
                          : 'bg-amber-600/90 text-white hover:bg-amber-500'
                      }`}
                      title="Click to toggle Published / Draft"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span>{post.isPublished ? 'Published' : 'Draft'}</span>
                    </button>
                  </div>

                  {/* Video Play Badge */}
                  {hasVideo && (
                    <div className="absolute bottom-3 left-3 px-2 py-1 rounded-lg bg-red-600/90 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 shadow">
                      <Play className="w-3 h-3 fill-white" />
                      <span>YouTube Video Included</span>
                    </div>
                  )}

                  {/* Read Time */}
                  <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-gray-300 text-[10px] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-tartan-gold" />
                    <span>{post.readTimeMinutes || 3} min read</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[11px] text-gray-400">
                      <Calendar className="w-3 h-3 text-tartan-gold" />
                      <span>{post.publishDate}</span>
                      <span>•</span>
                      <Eye className="w-3 h-3 text-gray-400" />
                      <span>{post.views || 0} views</span>
                      <span>•</span>
                      <Heart className="w-3 h-3 text-rose-400" />
                      <span>{post.likes || 0}</span>
                    </div>

                    <h2 className="text-base font-bold text-white font-serif line-clamp-2 group-hover:text-tartan-gold transition-colors">
                      {post.title}
                    </h2>

                    {post.subtitle && (
                      <p className="text-xs text-tartan-gold/80 italic line-clamp-1">
                        {post.subtitle}
                      </p>
                    )}

                    <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed">
                      {post.excerpt || post.content}
                    </p>

                    {/* Venue & Tartan chips */}
                    <div className="pt-2 flex flex-wrap gap-1.5 text-[10px]">
                      {post.venueName && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-tartan-navy text-gray-200 border border-tartan-border">
                          <MapPin className="w-2.5 h-2.5 text-tartan-gold" />
                          <span className="truncate max-w-[140px]">{post.venueName}</span>
                        </span>
                      )}
                      {post.tartanChoice && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-tartan-dark text-gray-300 border border-tartan-border">
                          <Shirt className="w-2.5 h-2.5 text-emerald-400" />
                          <span className="truncate max-w-[120px]">{post.tartanChoice}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Social Distribution Hub & Actions */}
                  <div className="pt-4 border-t border-tartan-border/60 space-y-2.5">
                    
                    {/* 1-Click Social Sharing Engine for Spud */}
                    <div className="bg-tartan-dark/80 p-2 rounded-xl border border-tartan-border/50 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-gray-400 font-semibold px-1">
                        <span className="text-tartan-gold uppercase tracking-wider flex items-center gap-1">
                          <Share2 className="w-2.5 h-2.5" />
                          <span>Distribute & Lead Social Traffic to Site:</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5">
                        {/* Facebook Share */}
                        <button
                          onClick={() => handleShareToFacebook(post)}
                          className="py-1.5 px-2 rounded-lg bg-[#1877F2]/15 hover:bg-[#1877F2] text-[#1877F2] hover:text-white border border-[#1877F2]/30 text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                          title="Share to Facebook with direct link to your website"
                        >
                          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          <span>Facebook</span>
                        </button>

                        {/* WhatsApp Share */}
                        <button
                          onClick={() => handleShareToWhatsApp(post)}
                          className="py-1.5 px-2 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-white border border-[#25D366]/30 text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                          title="Send to WhatsApp contacts or groups"
                        >
                          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                          </svg>
                          <span>WhatsApp</span>
                        </button>

                        {/* Copy Link */}
                        <button
                          onClick={() => handleCopyShareLink(post)}
                          className="py-1.5 px-2 rounded-lg bg-tartan-navy hover:bg-slate-700 text-gray-200 border border-tartan-border text-[10px] font-semibold flex items-center justify-center gap-1 transition-all"
                          title="Copy public link to clipboard"
                        >
                          {copiedShareId === post.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-gray-400" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* 1-Click Copy Facebook Caption */}
                      <button
                        onClick={() => handleCopyFacebookCaption(post)}
                        className="w-full py-1 text-center text-[10px] text-gray-400 hover:text-tartan-gold underline flex items-center justify-center gap-1"
                      >
                        {copiedShareId === `caption-${post.id}` ? (
                          <span className="text-emerald-400 font-bold">✓ Copied ready-to-paste Facebook Caption & Link!</span>
                        ) : (
                          <span>Copy ready-to-paste Facebook Post text with Link</span>
                        )}
                      </button>
                    </div>

                    {/* Edit & Delete Controls */}
                    <div className="flex items-center justify-between pt-1">
                      <Link
                        href={`/blog?story=${post.slug}`}
                        target="_blank"
                        className="text-[11px] text-gray-400 hover:text-tartan-gold flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Preview on Site</span>
                      </Link>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(post)}
                          className="p-1.5 rounded-lg bg-tartan-navy hover:bg-slate-700 text-gray-300 hover:text-white border border-tartan-border text-xs transition-all"
                          title="Edit Story"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-tartan-gold" />
                        </button>
                        <button
                          onClick={() => setPostToDelete(post)}
                          className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/40 text-xs transition-all"
                          title="Delete Story"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Create / Edit Story Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-tartan-card border border-tartan-border rounded-3xl max-w-4xl w-full my-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-tartan-navy px-6 py-4 border-b border-tartan-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 text-tartan-gold">
                <BookOpen className="w-5 h-5 text-tartan-gold" />
                <div>
                  <h3 className="text-base font-bold text-white font-serif">
                    {editingPostId ? 'Edit Blog Story' : 'Create New Highland Story & Video Post'}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Connect your YouTube video, write the story, and configure event details
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-tartan-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-6 overflow-y-auto flex-1">
              
              {/* Feedback messages */}
              {successMessage && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}
              {errorMessage && (
                <div className="p-3 bg-rose-950/60 border border-rose-500/50 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Title & Slug */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label className="block text-xs font-semibold text-tartan-gold">
                    Story Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. A Misty Castle Ceremony: Piping at Eilean Donan Castle"
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-tartan-accent font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-300">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="e.g. eilean-donan-castle-wedding"
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-gray-300 text-xs focus:outline-none focus:border-tartan-accent font-mono"
                  />
                  <p className="text-[10px] text-gray-500">spudthepiper.com/blog?story={formSlug || 'slug'}</p>
                </div>
              </div>

              {/* Subtitle & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-300">
                    Subtitle / Catchphrase
                  </label>
                  <input
                    type="text"
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                    placeholder="e.g. Soulful bagpipes echoing across Loch Duich for a magical Scottish wedding"
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-tartan-accent"
                  />
                </div>

                {/* Category Selection */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-tartan-gold">
                    Piping Service / Topic Category *
                  </label>
                  <select
                    value={isCustomCategory ? 'custom' : formCategory}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setIsCustomCategory(true);
                      } else {
                        setIsCustomCategory(false);
                        setFormCategory(e.target.value);
                      }
                    }}
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-tartan-accent"
                  >
                    <optgroup label="Core Services & Packages">
                      {BLOG_SERVICE_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </optgroup>
                    <option value="custom">+ Other / Custom Topic Category...</option>
                  </select>

                  {isCustomCategory && (
                    <div className="pt-2">
                      <input
                        type="text"
                        required
                        value={customCategoryInput}
                        onChange={(e) => setCustomCategoryInput(e.target.value)}
                        placeholder="Type custom category (e.g. Spud's Video Vlogs, Bagpipe Tips...)"
                        className="w-full bg-tartan-dark border border-tartan-gold/60 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-tartan-gold"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* YouTube Video Link & Instant Live Player */}
              <div className="bg-tartan-dark/90 p-4 rounded-2xl border border-tartan-border/70 space-y-3">
                <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-wider">
                  <Youtube className="w-4 h-4" />
                  <span>YouTube Video Embed (Hub & Spoke Video Distribution)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-300">
                      YouTube Video Link or ID
                    </label>
                    <input
                      type="text"
                      value={formYoutubeUrl}
                      onChange={(e) => setFormYoutubeUrl(e.target.value)}
                      placeholder="e.g. https://youtu.be/38zXOmwZVBA or https://youtube.com/watch?v=..."
                      className="w-full bg-tartan-card border border-tartan-border rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-tartan-accent font-mono"
                    />
                    <p className="text-[10px] text-gray-400">
                      Spud can paste any YouTube URL (watch, shorts, youtu.be, or video ID). The player will embed automatically!
                    </p>

                    {/* Cover Image Upload (Google Cloud Storage Bucket) */}
                    <div className="pt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-gray-300">
                          Story Cover Image
                        </label>
                        {formFeaturedImageUrl && (
                          <button
                            type="button"
                            onClick={() => setFormFeaturedImageUrl('')}
                            className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove Cover</span>
                          </button>
                        )}
                      </div>

                      {/* Hidden File Input */}
                      <input
                        ref={coverFileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCoverFileUpload}
                      />

                      {/* Cover Photo Upload Card or Dropzone */}
                      {formFeaturedImageUrl ? (
                        <div className="relative rounded-2xl overflow-hidden border border-amber-500/50 bg-black/60 p-3 flex items-center gap-3.5 shadow-lg">
                          <div className="relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border border-tartan-border shadow bg-black/80">
                            <img
                              src={formFeaturedImageUrl}
                              alt="Cover thumbnail"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                              <span>Cover Photo Loaded</span>
                            </div>
                            <p className="text-[11px] text-gray-400 truncate">
                              Stored in Google Cloud Bucket • Ready for publishing
                            </p>
                            <div className="flex items-center gap-3 pt-0.5">
                              <button
                                type="button"
                                onClick={() => coverFileInputRef.current?.click()}
                                disabled={isUploadingCover}
                                className="text-xs font-bold text-amber-300 hover:text-amber-200 underline flex items-center gap-1 transition-colors disabled:opacity-50"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Change Photo</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
                          onDragLeave={() => setIsDraggingOver(false)}
                          onDrop={handleDrop}
                          onClick={() => coverFileInputRef.current?.click()}
                          className={`cursor-pointer rounded-2xl border-2 border-dashed p-4 sm:p-5 text-center transition-all ${
                            isDraggingOver
                              ? 'border-tartan-gold bg-amber-500/15 scale-[1.01]'
                              : 'border-tartan-border hover:border-amber-500/60 bg-tartan-card/70 hover:bg-tartan-card'
                          }`}
                        >
                          {isUploadingCover ? (
                            <div className="py-2 flex flex-col items-center justify-center gap-2">
                              <Loader2 className="w-6 h-6 animate-spin text-tartan-gold" />
                              <p className="text-xs font-bold text-amber-300">Uploading photo to Google Storage Bucket...</p>
                              <p className="text-[10px] text-gray-400">Storing safely in cloud storage</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-1.5">
                              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow">
                                <Upload className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-white">
                                  Click to upload Cover Photo from phone or computer
                                </p>
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                  or drag &amp; drop your image file here (JPEG, PNG, WebP)
                                </p>
                              </div>
                              {liveYoutubeId ? (
                                <p className="text-[10px] text-amber-400/90 bg-amber-950/40 px-3 py-1 rounded-full border border-amber-800/40 mt-1">
                                  ✨ Optional: If left blank, YouTube&apos;s HD video thumbnail will be used automatically
                                </p>
                              ) : (
                                <p className="text-[10px] text-gray-500 mt-0.5">
                                  (Optional: If left blank, a default Highland bagpipe banner will be used)
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Optional Expandable URL Input for Advanced Users */}
                      <div className="pt-0.5">
                        <button
                          type="button"
                          onClick={() => setShowUrlInput(!showUrlInput)}
                          className="text-[10px] text-gray-400 hover:text-gray-300 transition-colors flex items-center gap-1"
                        >
                          <span>{showUrlInput ? '− Hide direct image URL' : '+ Need to paste an image URL instead?'}</span>
                        </button>
                        {showUrlInput && (
                          <div className="mt-1.5 animate-in fade-in">
                            <input
                              type="text"
                              value={formFeaturedImageUrl}
                              onChange={(e) => setFormFeaturedImageUrl(e.target.value)}
                              placeholder="https://... direct image web link"
                              className="w-full bg-tartan-card border border-tartan-border rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-tartan-accent font-mono"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Live Video / Cover Preview Box */}
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-tartan-border bg-black shadow-inner flex items-center justify-center">
                    {liveYoutubeId ? (
                      <div className="relative w-full h-full">
                        <iframe
                          src={`https://www.youtube.com/embed/${liveYoutubeId}?rel=0`}
                          title="YouTube video preview"
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                        {formFeaturedImageUrl && (
                          <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-bold text-amber-300 flex items-center gap-1.5 pointer-events-none">
                            <ImageIcon className="w-3 h-3 text-amber-400" />
                            <span>Custom Cover Photo Loaded</span>
                          </div>
                        )}
                      </div>
                    ) : formFeaturedImageUrl ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={formFeaturedImageUrl} 
                          alt="Cover Preview" 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-bold text-amber-300 flex items-center gap-1.5">
                          <ImageIcon className="w-3 h-3 text-amber-400" />
                          <span>Cover Photo Preview</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-4 space-y-1 text-gray-500">
                        <Play className="w-8 h-8 mx-auto text-gray-600" />
                        <p className="text-[11px]">Upload a cover photo or paste YouTube video link</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Event Details: Venue, Location, Tartan */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-300">
                    Castle / Venue Name
                  </label>
                  <input
                    type="text"
                    value={formVenueName}
                    onChange={(e) => setFormVenueName(e.target.value)}
                    placeholder="e.g. Eilean Donan Castle"
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-tartan-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-300">
                    Location / Region
                  </label>
                  <input
                    type="text"
                    value={formVenueLocation}
                    onChange={(e) => setFormVenueLocation(e.target.value)}
                    placeholder="e.g. Dornie, Scottish Highlands"
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-tartan-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-300">
                    Tartan / Dress Worn
                  </label>
                  <select
                    value={formTartanChoice}
                    onChange={(e) => setFormTartanChoice(e.target.value)}
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-tartan-accent"
                  >
                    <option value="Full No. 1 Dress (Feather Bonnet & Plaid)">Full No. 1 Dress (Feather Bonnet & Plaid)</option>
                    <option value="Royal Stewart Tartan (Traditional Red)">Royal Stewart Tartan (Traditional Red)</option>
                    <option value="Black Watch Tartan (Military Green/Blue)">Black Watch Tartan (Military Green/Blue)</option>
                    <option value="Modern Day Highland Tweed Jacket">Modern Day Highland Tweed Jacket</option>
                    <option value="Isle of Skye Tartan (Purple/Heather/Green)">Isle of Skye Tartan (Purple/Heather/Green)</option>
                  </select>
                </div>
              </div>

              {/* Highlight Tunes Played */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-tartan-gold">
                  Key Bagpipe Tunes Played
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-tartan-dark border border-tartan-border min-h-[42px]">
                  {formTunesPlayed.map((t) => (
                    <span 
                      key={t} 
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-tartan-navy text-xs text-white border border-tartan-border"
                    >
                      <Music className="w-3 h-3 text-tartan-gold" />
                      <span>{t}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveTune(t)}
                        className="text-gray-400 hover:text-rose-400 ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                
                {/* Tune Add input & suggestions */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tuneInput}
                    onChange={(e) => setTuneInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTune(tuneInput);
                      }
                    }}
                    placeholder="Type tune name (e.g. Highland Cathedral) and press Add..."
                    className="flex-1 bg-tartan-dark border border-tartan-border rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-tartan-accent"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTune(tuneInput)}
                    className="px-3 py-1.5 bg-tartan-navy hover:bg-slate-700 text-gray-200 text-xs font-bold rounded-xl border border-tartan-border"
                  >
                    Add Tune
                  </button>
                </div>

                {/* Quick suggestions from tunesList */}
                <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-gray-400">
                  <span className="font-semibold text-gray-500">Quick add:</span>
                  {['Highland Cathedral', 'Mairi\'s Wedding', 'The Skye Boat Song', 'Scotland the Brave', 'Flower of Scotland', 'Auld Lang Syne'].map(sample => (
                    <button
                      key={sample}
                      type="button"
                      onClick={() => handleAddTune(sample)}
                      className="px-2 py-0.5 rounded bg-tartan-card hover:bg-tartan-gold/20 hover:text-tartan-gold border border-tartan-border transition-colors"
                    >
                      + {sample}
                    </button>
                  ))}
                </div>
              </div>

              {/* Story Excerpt */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-300">
                  Short Excerpt (Preview text for social media cards & cards)
                </label>
                <textarea
                  rows={2}
                  value={formExcerpt}
                  onChange={(e) => setFormExcerpt(e.target.value)}
                  placeholder="1-2 sentences summarizing the story..."
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-3 text-white text-xs focus:outline-none focus:border-tartan-accent leading-relaxed"
                />
              </div>

              {/* Full Story Content */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-tartan-gold">
                  Full Story & Narrative *
                </label>
                <textarea
                  required
                  rows={8}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Write the full story of the day: arrival, the atmosphere, guest reactions, tunes played, and funny or touching moments..."
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-3.5 text-white text-xs focus:outline-none focus:border-tartan-accent leading-relaxed font-sans"
                />
              </div>

              {/* Publish Settings: Status, Featured, Date, Author */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-tartan-dark/60 border border-tartan-border">
                
                {/* Publish Date */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-gray-300">
                    Publish Date
                  </label>
                  <input
                    type="date"
                    value={formPublishDate}
                    onChange={(e) => setFormPublishDate(e.target.value)}
                    className="w-full bg-tartan-card border border-tartan-border rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-tartan-accent"
                  />
                </div>

                {/* Author */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-gray-300">
                    Author
                  </label>
                  <input
                    type="text"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    className="w-full bg-tartan-card border border-tartan-border rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-tartan-accent"
                  />
                </div>

                {/* Published Checkbox */}
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formIsPublished}
                      onChange={(e) => setFormIsPublished(e.target.checked)}
                      className="w-4 h-4 rounded text-tartan-gold focus:ring-tartan-gold bg-tartan-card border-tartan-border"
                    />
                    <span className="text-xs font-semibold text-white">Publish to Live Site</span>
                  </label>
                </div>

                {/* Featured on Hero Checkbox */}
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formIsFeatured}
                      onChange={(e) => setFormIsFeatured(e.target.checked)}
                      className="w-4 h-4 rounded text-tartan-gold focus:ring-tartan-gold bg-tartan-card border-tartan-border"
                    />
                    <span className="text-xs font-semibold text-tartan-gold">Pin to Hero Spotlight</span>
                  </label>
                </div>

              </div>

              {/* Engagement Stats Calibration (Views & Likes Reset) */}
              <div className="p-3.5 rounded-2xl bg-tartan-dark/70 border border-tartan-border/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-tartan-gold">
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Story Engagement Stats (Views &amp; Likes)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setFormViews(0); setFormLikes(0); }}
                    className="text-[10px] text-gray-400 hover:text-amber-400 font-bold underline transition-colors"
                  >
                    Reset Stats to 0
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold text-gray-300">
                      Views Count
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formViews}
                      onChange={(e) => setFormViews(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full bg-tartan-card border border-tartan-border rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-tartan-accent font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold text-gray-300">
                      Likes Count
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formLikes}
                      onChange={(e) => setFormLikes(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full bg-tartan-card border border-tartan-border rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-tartan-accent font-mono"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 leading-tight">
                  Manually adjust or reset views and likes. (Views are tracked on spudthepiper.com and are not connected to YouTube).
                </p>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-tartan-border flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-tartan-navy hover:bg-slate-700 text-gray-300 text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Story...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingPostId ? 'Update Story' : 'Publish Story'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 6. Delete Confirmation Modal */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-tartan-card border border-rose-900/60 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/60 text-rose-400 flex items-center justify-center mx-auto border border-rose-800/40">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white font-serif">Delete Blog Story?</h3>
              <p className="text-xs text-gray-300">
                Are you sure you want to permanently delete <strong>&ldquo;{postToDelete.title}&rdquo;</strong>?
              </p>
            </div>
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPostToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-tartan-navy hover:bg-slate-700 text-gray-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg flex items-center justify-center gap-1.5"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
