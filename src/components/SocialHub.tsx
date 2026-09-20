'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Users, 
  Heart, 
  MessageCircle, 
  Share2, 
  Send, 
  Camera, 
  Pin, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Calendar,
  Search, 
  Filter,
  MapPin,
  Music,
  PlusCircle,
  Tag,
  Trash2,
  Award,
  Castle,
  X,
  Check,
  Flame,
  Globe,
  HelpCircle,
  MessageSquare,
  Volume2,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  CornerDownRight,
  BookOpen,
  MessageSquarePlus,
  ThumbsUp,
  Image as ImageIcon,
  Smile,
  MoreHorizontal,
  Play,
  Square,
  ExternalLink,
  ShieldCheck,
  Sparkle,
  Upload
} from 'lucide-react';
import { SocialPost, ForumCategoryItem } from '@/types/spud';
import { EmojiBar } from '@/components/EmojiBar';
import { uploadToStorage } from '@/lib/firebase';

const getCategoryIcon = (iconName?: string) => {
  switch (iconName) {
    case 'Music': return Music;
    case 'Castle': return Castle;
    case 'Volume2': return Volume2;
    case 'Globe': return Globe;
    case 'Flame': return Flame;
    case 'Award': return Award;
    case 'MessageSquare':
    default: return MessageSquare;
  }
};

export const SocialHub: React.FC = () => {
  const { 
    socialPosts, 
    createSocialPost, 
    likeSocialPost, 
    addCommentToPost, 
    togglePinPost,
    deleteSocialPost,
    isAdminLoggedIn,
    playTune,
    stopTune,
    currentPlayingTune,
    forumCategories
  } = useApp();

  // Active View Tab: 'feed' (Timeline Stream) or 'forum' (Q&A Forum)
  const [activeTab, setActiveTab] = useState<'feed' | 'forum'>('feed');

  // Search & Topic Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedForumTopic, setSelectedForumTopic] = useState<string>('All');
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [visibleFeedCount, setVisibleFeedCount] = useState<number>(5);

  // Textarea Refs for Smart Cursor Emoji Insertion
  const feedTextareaRef = useRef<HTMLTextAreaElement>(null);
  const threadReplyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const forumModalTextareaRef = useRef<HTMLTextAreaElement>(null);

  const insertEmojiIntoField = (
    emoji: string,
    currentText: string,
    setText: React.Dispatch<React.SetStateAction<string>>,
    textareaRef?: React.RefObject<HTMLTextAreaElement>
  ) => {
    if (textareaRef && textareaRef.current) {
      const el = textareaRef.current;
      const start = el.selectionStart ?? currentText.length;
      const end = el.selectionEnd ?? currentText.length;
      const newVal = currentText.substring(0, start) + emoji + currentText.substring(end);
      setText(newVal);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 10);
    } else {
      setText(prev => prev + (prev.length > 0 && !prev.endsWith(' ') ? ' ' : '') + emoji);
    }
  };

  // Thread Detail Quick Reply State
  const [threadReplyText, setThreadReplyText] = useState('');
  const [threadReplyAuthor, setThreadReplyAuthor] = useState('');
  const [threadReplyRole, setThreadReplyRole] = useState<string>('Bride/Groom');
  const [threadReplyCustomRole, setThreadReplyCustomRole] = useState('');

  // Post Image Zoom Modal
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);

  // Social Feed Composer State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [composerText, setComposerText] = useState('');
  const [composerLocation, setComposerLocation] = useState('');
  const [composerTune, setComposerTune] = useState('');
  const [composerImage, setComposerImage] = useState('');
  const [composerAuthorName, setComposerAuthorName] = useState('');
  const [composerAuthorRole, setComposerAuthorRole] = useState<string>('Bride/Groom');
  const [customRoleText, setCustomRoleText] = useState('');
  const [isComposerExpanded, setIsComposerExpanded] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Forum Modal
  const [isForumModalOpen, setIsForumModalOpen] = useState(false);
  const [forumTitle, setForumTitle] = useState('');
  const [forumTopic, setForumTopic] = useState<string>('Wedding Music & Entrance');
  const [forumContent, setForumContent] = useState('');
  const [forumAuthorName, setForumAuthorName] = useState('');
  const [forumAuthorRole, setForumAuthorRole] = useState<string>('Bride/Groom');
  const [customForumRoleText, setCustomForumRoleText] = useState('');

  // Comments State
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [commentAuthorNames, setCommentAuthorNames] = useState<{ [postId: string]: string }>({});
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  // Category Statistics for Traditional Forum Directory
  const categoryStats = useMemo(() => {
    const list = forumCategories && forumCategories.length > 0 ? forumCategories : [];
    return list.map(cat => {
      const postsInCat = socialPosts.filter(
        p => (p.postType === 'forum' || Boolean(p.forumTopic) || p.id.startsWith('forum-')) &&
             p.forumTopic === cat.topicName
      );
      const totalReplies = postsInCat.reduce((acc, p) => acc + (p.comments?.length || 0), 0);
      const latestPost = postsInCat.length > 0 ? postsInCat[0] : null;

      return {
        ...cat,
        icon: getCategoryIcon(cat.iconName),
        topicsCount: postsInCat.length,
        repliesCount: totalReplies,
        latestPost
      };
    });
  }, [forumCategories, socialPosts]);

  // Active Forum Thread for Detail View
  const activeThread = useMemo(() => {
    if (!activeThreadId) return null;
    return socialPosts.find(p => p.id === activeThreadId) || null;
  }, [socialPosts, activeThreadId]);

  // Feed Posts (Real-time Timeline Stream)
  const feedPosts = useMemo(() => {
    return socialPosts
      .filter(p => p.postType === 'feed' || (!p.postType && !p.forumTopic && !p.id.startsWith('forum-')))
      .filter(post => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          post.content.toLowerCase().includes(q) ||
          (post.eventLocation && post.eventLocation.toLowerCase().includes(q)) ||
          (post.tunePlayed && post.tunePlayed.toLowerCase().includes(q)) ||
          post.authorName.toLowerCase().includes(q) ||
          (post.tags && post.tags.some(t => t.toLowerCase().includes(q)))
        );
      });
  }, [socialPosts, searchQuery]);

  // Forum Posts (Highland Discussions & Q&A)
  const forumPosts = useMemo(() => {
    return socialPosts
      .filter(p => p.postType === 'forum' || Boolean(p.forumTopic) || p.id.startsWith('forum-'))
      .filter(post => {
        const matchesTopic = selectedForumTopic === 'All' || post.forumTopic === selectedForumTopic;
        const matchesQuery = !searchQuery.trim() ||
          (post.title && post.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
          post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (post.eventLocation && post.eventLocation.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesTopic && matchesQuery;
      });
  }, [socialPosts, selectedForumTopic, searchQuery]);

  // Handle Image File Selection with Firebase Storage & base64 fallback
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsComposerExpanded(true);
      setIsUploadingImage(true);

      try {
        // Attempt cloud upload to Firebase Storage
        const cloudUrl = await uploadToStorage(file, 'social_uploads');
        setComposerImage(cloudUrl);
      } catch (uploadErr) {
        console.warn('Firebase Storage upload, falling back to local data URL:', uploadErr);
        // Fallback to local FileReader data URL
        const reader = new FileReader();
        reader.onloadend = () => {
          setComposerImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  // Handle Feed Post Submit
  const handlePublishFeedPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerText.trim()) return;

    const matched = composerText.match(/#[a-zA-Z0-9_]+/g);
    const extractedTags: string[] = matched ? Array.from(matched) : [];
    if (composerLocation && !extractedTags.some(t => t.toLowerCase().includes('castle'))) {
      extractedTags.push(`#${composerLocation.split(',')[0].replace(/[^a-zA-Z0-9]/g, '')}`);
    }

    const finalAuthorName = composerAuthorName.trim() || (isAdminLoggedIn ? 'Spud the Piper' : 'Anonymous');
    const finalAuthorRole = isAdminLoggedIn 
      ? 'Spud the Piper' 
      : (composerAuthorRole === 'Other' ? (customRoleText.trim() || 'Guest') : (composerAuthorRole as any));

    createSocialPost({
      postType: 'feed',
      content: composerText.trim(),
      authorName: finalAuthorName,
      authorRole: finalAuthorRole,
      eventLocation: composerLocation.trim() || undefined,
      tunePlayed: composerTune.trim() || undefined,
      imageUrl: composerImage.trim() || undefined,
      tags: extractedTags.length > 0 ? extractedTags : undefined
    });

    setComposerText('');
    setComposerLocation('');
    setComposerTune('');
    setComposerImage('');
    setComposerAuthorName('');
    setCustomRoleText('');
    setComposerAuthorRole('Bride/Groom');
    setIsComposerExpanded(false);
  };

  // Handle Forum Question Submit
  const handlePublishForumQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminLoggedIn && !forumAuthorName.trim()) {
      alert('Please enter your name to start a topic.');
      return;
    }
    if (!forumTitle.trim()) {
      alert('Please enter a discussion title.');
      return;
    }
    if (!forumContent.trim()) {
      alert('Please enter details and context for your topic.');
      return;
    }
    if (forumAuthorRole === 'Other' && !customForumRoleText.trim()) {
      alert('Please specify your role or relation.');
      return;
    }

    const finalForumAuthorName = isAdminLoggedIn ? 'Spud the Piper' : forumAuthorName.trim();
    const finalForumAuthorRole = isAdminLoggedIn 
      ? 'Spud the Piper' 
      : (forumAuthorRole === 'Other' ? (customForumRoleText.trim() || 'Guest') : (forumAuthorRole as any));

    createSocialPost({
      postType: 'forum',
      title: forumTitle.trim(),
      forumTopic,
      content: forumContent.trim(),
      authorName: finalForumAuthorName,
      authorRole: finalForumAuthorRole
    });

    setForumTitle('');
    setForumContent('');
    setForumAuthorName('');
    setCustomForumRoleText('');
    setForumAuthorRole('Bride/Groom');
    setIsForumModalOpen(false);
    if (forumTopic) {
      setSelectedForumTopic(forumTopic);
      setActiveThreadId(null);
    }
  };

  // Thread Detail Reply Submit
  const handleThreadReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThreadId) return;

    if (!isAdminLoggedIn && !threadReplyAuthor.trim()) {
      alert('Please enter your name to post a reply.');
      return;
    }
    if (!threadReplyText.trim()) {
      alert('Please write your reply.');
      return;
    }
    if (threadReplyRole === 'Other' && !threadReplyCustomRole.trim()) {
      alert('Please specify your role or relation.');
      return;
    }

    const finalAuthor = isAdminLoggedIn ? 'Spud the Piper' : threadReplyAuthor.trim();
    const finalRole = isAdminLoggedIn
      ? 'Spud the Piper'
      : (threadReplyRole === 'Other' ? (threadReplyCustomRole.trim() || 'Guest') : threadReplyRole);

    addCommentToPost(activeThreadId, threadReplyText.trim(), finalAuthor, finalRole);
    setThreadReplyText('');
    setThreadReplyAuthor('');
    setThreadReplyCustomRole('');
    setThreadReplyRole('Bride/Groom');
  };

  // Comment Submit
  const handleCommentSubmit = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;
    const author = commentAuthorNames[postId]?.trim() || (isAdminLoggedIn ? 'Spud the Piper' : 'Anonymous');

    addCommentToPost(postId, text.trim(), author, isAdminLoggedIn ? 'Spud the Piper' : 'Guest');
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  const handleSharePost = (postId: string) => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/social#${postId}` : '';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedPostId(postId);
      setTimeout(() => setCopiedPostId(null), 2500);
    }
  };

  return (
    <section id="social" className="py-8 bg-tartan-card/50 relative border-b border-tartan-border">
      
      {/* Schema.org Discussion Graph */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "DiscussionForumPosting",
            "name": "Spud the Piper - Highland Social Timeline & Forum",
            "url": "https://www.spudthepiper.co.uk/social",
            "description": "Real-time social timeline and discussion forum for Spud the Piper Scottish performances worldwide.",
            "author": {
              "@type": "MusicGroup",
              "name": "Spud the Piper"
            }
          })
        }}
      />

      {/* EXPANSIVE FLUID CONTAINER - FULL SCREEN REACTIVE & MOBILE FRIENDLY */}
      <div className="w-full max-w-[1650px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-8">
        
        {/* Main Tab Switcher & Action Bar - Expansive Width */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-tartan-dark/95 p-4 sm:p-5 rounded-3xl border border-tartan-border shadow-2xl backdrop-blur-md">
          
          <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start w-full lg:w-auto">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-6 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 ${
                activeTab === 'feed'
                  ? 'bg-gold-gradient text-tartan-dark shadow-lg scale-105'
                  : 'text-gray-300 hover:text-white hover:bg-tartan-navy border border-transparent hover:border-tartan-border'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>📱 Live Highland Feed</span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-tartan-dark/30 text-current font-bold">
                {feedPosts.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('forum')}
              className={`px-6 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 ${
                activeTab === 'forum'
                  ? 'bg-gold-gradient text-tartan-dark shadow-lg scale-105'
                  : 'text-gray-300 hover:text-white hover:bg-tartan-navy border border-transparent hover:border-tartan-border'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>💬 Piping & Venue Forum</span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-tartan-dark/30 text-current font-bold">
                {forumPosts.length}
              </span>
            </button>
          </div>

          {/* Quick Search & Fast Actions */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-96">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search feed, tunes, castles, couples..."
                className="w-full bg-tartan-navy border border-tartan-border rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-400 focus:outline-none focus:border-tartan-accent transition-colors"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {activeTab === 'forum' && isAdminLoggedIn && (
              <button
                onClick={() => setIsForumModalOpen(true)}
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow hover:brightness-110 active:scale-95 shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Start Discussion</span>
              </button>
            )}
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* VIEW 1: FULL-WIDTH UNIFIED SOCIAL MEDIA TIMELINE FEED             */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {activeTab === 'feed' && (
          <div className="w-full space-y-6 animate-in fade-in duration-200">
            
            {/* Unified Feed Stream Container (Single continuous timeline, not floating cards) */}
            <div className="w-full bg-tartan-dark/95 rounded-3xl border border-tartan-border shadow-2xl divide-y divide-tartan-border/70 overflow-hidden">
              
              {/* 1. TOP TIMELINE COMPOSER */}
              <div className="p-5 sm:p-7 bg-gradient-to-b from-tartan-navy/40 to-transparent space-y-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-tartan-accent via-amber-500 to-amber-700 flex items-center justify-center text-tartan-dark font-serif font-bold text-lg shrink-0 shadow-lg">
                    {isAdminLoggedIn ? 'S' : 'H'}
                  </div>
                  <div
                    onClick={() => setIsComposerExpanded(true)}
                    className="flex-1 bg-tartan-navy hover:bg-slate-800 border border-tartan-border rounded-2xl px-5 py-3.5 text-xs sm:text-sm text-gray-300 cursor-pointer transition-all flex items-center justify-between shadow-inner"
                  >
                    <span className="font-medium truncate">
                      {isAdminLoggedIn 
                        ? "What's happening on the pipes today, Spud? Share photos, events, or tune updates..." 
                        : "Share a wedding memory, gig photo, tune request, or message for Spud..."}
                    </span>
                    <Camera className="w-5 h-5 text-tartan-gold shrink-0 ml-2" />
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center justify-around pt-3 border-t border-tartan-border/50 text-xs sm:text-sm font-semibold text-gray-300">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageFileChange}
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setIsComposerExpanded(true);
                      fileInputRef.current?.click();
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-tartan-navy transition-colors text-green-400"
                  >
                    <ImageIcon className="w-4 h-4 text-green-400" />
                    <span>Upload Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsComposerExpanded(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-tartan-navy transition-colors text-tartan-gold"
                  >
                    <MapPin className="w-4 h-4 text-tartan-gold" />
                    <span>Tag Location</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsComposerExpanded(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-tartan-navy transition-colors text-amber-400"
                  >
                    <Music className="w-4 h-4 text-amber-400" />
                    <span>Tag Tune</span>
                  </button>
                </div>

                {/* Expanded Form */}
                {isComposerExpanded && (
                  <form onSubmit={handlePublishFeedPost} className="pt-4 border-t border-tartan-border space-y-4 text-xs sm:text-sm animate-in fade-in">
                    
                    {/* Name & Role */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-400 text-xs font-semibold mb-1">Your Name</label>
                        <input
                          type="text"
                          value={composerAuthorName}
                          onChange={(e) => setComposerAuthorName(e.target.value)}
                          placeholder={isAdminLoggedIn ? 'Spud the Piper (Official)' : 'Your Name (defaults to Anonymous)'}
                          className="w-full bg-tartan-navy border border-tartan-border rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-400 text-xs font-semibold mb-1">Your Role / Relation</label>
                        <select
                          value={composerAuthorRole}
                          onChange={(e) => setComposerAuthorRole(e.target.value)}
                          className="w-full bg-tartan-navy border border-tartan-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-tartan-accent"
                        >
                          <option value="Bride/Groom">Bride / Groom</option>
                          <option value="Client">Corporate / Event Host</option>
                          <option value="Guest">Wedding / Event Guest</option>
                          <option value="Student">Piping Student</option>
                          <option value="Fan">Highland Enthusiast / Fan</option>
                          <option value="Other">Other (Specify below...)</option>
                          {isAdminLoggedIn && <option value="Spud the Piper">Spud the Piper (Official)</option>}
                        </select>
                      </div>
                    </div>

                    {/* Custom Role Input if 'Other' selected */}
                    {composerAuthorRole === 'Other' && (
                      <div className="animate-in fade-in">
                        <label className="block text-tartan-gold text-xs font-semibold mb-1">Specify Your Role / Relation *</label>
                        <input
                          type="text"
                          required
                          value={customRoleText}
                          onChange={(e) => setCustomRoleText(e.target.value)}
                          placeholder="e.g. Mother of the Bride, Best Man, Venue Manager, Friend"
                          className="w-full bg-tartan-navy border border-tartan-accent/60 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent"
                        />
                      </div>
                    )}

                    {/* Post Textarea */}
                    <div className="space-y-2">
                      <label className="block text-gray-400 text-xs font-semibold mb-1">Your Message / Story *</label>
                      <textarea
                        ref={feedTextareaRef}
                        rows={3}
                        required
                        value={composerText}
                        onChange={(e) => setComposerText(e.target.value)}
                        placeholder="Write your update... (e.g. Spud played Highland Cathedral as we walked down the aisle at Dundas Castle!)"
                        className="w-full bg-tartan-navy border border-tartan-border rounded-2xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent leading-relaxed"
                      />
                      <EmojiBar
                        onSelectEmoji={(emoji) => insertEmojiIntoField(emoji, composerText, setComposerText, feedTextareaRef)}
                        label="Add Emojis & 3D Stickers:"
                      />
                    </div>

                    {/* Location & Tune Tags */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-400 text-xs font-semibold mb-1">Venue / Location</label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-tartan-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={composerLocation}
                            onChange={(e) => setComposerLocation(e.target.value)}
                            placeholder="e.g. Dundas Castle, Edinburgh"
                            className="w-full bg-tartan-navy border border-tartan-border rounded-xl pl-10 pr-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-400 text-xs font-semibold mb-1">Special Tune</label>
                        <div className="relative">
                          <Music className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={composerTune}
                            onChange={(e) => setComposerTune(e.target.value)}
                            placeholder="e.g. Highland Cathedral"
                            className="w-full bg-tartan-navy border border-tartan-border rounded-xl pl-10 pr-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Photo Upload Box / Preview */}
                    <div>
                      <label className="block text-gray-400 text-xs font-semibold mb-1">Attached Photo</label>
                      {composerImage ? (
                        <div className="relative rounded-2xl overflow-hidden border border-tartan-accent/50 bg-black/60 flex items-center justify-center group p-2">
                          <img src={composerImage} alt="Upload preview" className="max-h-64 rounded-xl object-contain" />
                          <button
                            type="button"
                            onClick={() => setComposerImage('')}
                            className="absolute top-4 right-4 bg-red-600/90 hover:bg-red-600 text-white p-2 rounded-full shadow-xl transition-all"
                            title="Remove Photo"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-tartan-border hover:border-tartan-gold rounded-2xl p-5 text-center cursor-pointer transition-all bg-tartan-navy/30 hover:bg-tartan-navy/60 flex flex-col items-center justify-center gap-2 group"
                        >
                          <div className="w-10 h-10 rounded-full bg-tartan-navy border border-tartan-border flex items-center justify-center text-tartan-gold group-hover:scale-110 transition-transform">
                            <Upload className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm text-gray-200 font-bold block">
                              Click to choose photo from your device
                            </span>
                            <span className="text-[11px] text-gray-400">
                              Upload wedding photos, castle selfies, or event snaps (JPG, PNG, WEBP)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-tartan-border">
                      <button
                        type="button"
                        onClick={() => setIsComposerExpanded(false)}
                        className="text-gray-400 hover:text-white px-3 py-1.5"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-gold-gradient text-tartan-dark font-extrabold uppercase rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all"
                      >
                        Post to Feed 🚀
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* 2. CONTINUOUS TIMELINE ENTRIES (Flowing stream with clean dividers) */}
              {feedPosts.slice(0, visibleFeedCount).map((post: SocialPost) => {
                const isSpud = post.authorRole === 'Spud the Piper';
                const isPlayingThisTune = currentPlayingTune === post.tunePlayed;

                return (
                  <article
                    key={post.id}
                    id={post.id}
                    className="p-5 sm:p-8 hover:bg-white/[0.015] transition-colors space-y-4"
                  >
                    {/* Post Top Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3.5">
                        {/* Avatar */}
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-tartan-accent via-amber-500 to-amber-700 shadow">
                            <img
                              src={post.authorAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80'}
                              alt={post.authorName}
                              className="w-full h-full rounded-full object-cover"
                            />
                          </div>
                          {isSpud && (
                            <div className="absolute -bottom-1 -right-1 bg-amber-400 text-tartan-dark rounded-full p-0.5 shadow">
                              <CheckCircle2 className="w-3.5 h-3.5 fill-amber-400 text-tartan-dark" />
                            </div>
                          )}
                        </div>

                        {/* Author Info */}
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="text-base sm:text-lg font-bold text-white font-serif">
                              {post.authorName}
                            </span>
                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                              isSpud 
                                ? 'bg-tartan-accent/20 text-tartan-gold border border-tartan-accent/40' 
                                : 'bg-slate-800 text-gray-300'
                            }`}>
                              {post.authorRole}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5 flex-wrap">
                            <span>{post.timestamp}</span>
                            <span>•</span>
                            <Globe className="w-3.5 h-3.5 text-gray-500" />
                            {post.eventLocation && (
                              <>
                                <span>•</span>
                                <span className="text-tartan-gold font-medium flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-tartan-gold shrink-0" />
                                  <span>{post.eventLocation}</span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Admin Controls */}
                      {isAdminLoggedIn && (
                        <div className="flex items-center gap-1">
                          {togglePinPost && (
                            <button
                              onClick={() => togglePinPost(post.id)}
                              className="p-2 text-gray-400 hover:text-tartan-gold rounded-xl hover:bg-tartan-navy"
                              title="Pin / Unpin"
                            >
                              📌
                            </button>
                          )}
                          {deleteSocialPost && (
                            <button
                              onClick={() => deleteSocialPost(post.id)}
                              className="p-2 text-red-400 hover:text-red-300 rounded-xl hover:bg-tartan-navy"
                              title="Delete Post"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Post Text Content */}
                    <div>
                      <p className="text-base sm:text-lg text-gray-100 leading-relaxed whitespace-pre-line">
                        {post.content}
                      </p>

                      {/* Attached Audio Player */}
                      {post.tunePlayed && (
                        <div className="mt-3.5 flex items-center justify-between p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs sm:text-sm">
                          <div className="flex items-center gap-2 text-amber-300 font-medium">
                            <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
                            <span className="font-mono font-bold">🎵 Featured Tune: {post.tunePlayed}</span>
                          </div>
                          <button
                            onClick={() => {
                              if (isPlayingThisTune) {
                                stopTune();
                              } else {
                                playTune(post.tunePlayed || 'Highland Cathedral');
                              }
                            }}
                            className="px-4 py-2 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs flex items-center gap-1.5 shadow hover:scale-105 transition-all"
                          >
                            {isPlayingThisTune ? (
                              <>
                                <Square className="w-3.5 h-3.5 fill-current" />
                                <span>Stop</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Play Sample</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Full-Width Attached Photo */}
                    {post.imageUrl && (
                      <div 
                        onClick={() => setZoomedImageUrl(post.imageUrl || null)}
                        className="cursor-pointer rounded-2xl overflow-hidden bg-black/50 border border-tartan-border relative group max-h-[650px]"
                      >
                        <img
                          src={post.imageUrl}
                          alt={post.eventLocation || 'Spud the Piper Performance'}
                          className="w-full h-full object-cover max-h-[650px] group-hover:scale-101 transition-transform duration-500"
                        />
                        <div className="absolute bottom-3 right-3 bg-black/80 px-3.5 py-1.5 rounded-xl text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 backdrop-blur-md">
                          <Camera className="w-4 h-4 text-tartan-gold" />
                          <span>View Full Screen</span>
                        </div>
                      </div>
                    )}

                    {/* Social Stats Line */}
                    <div className="pt-2 flex items-center justify-between text-xs sm:text-sm text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs">
                          🥃
                        </span>
                        <span className="font-semibold text-gray-300">{post.likes} Slàinte Cheers</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span>{post.comments?.length || 0} comments</span>
                      </div>
                    </div>

                    {/* Social Interaction Buttons */}
                    <div className="pt-2 grid grid-cols-3 gap-2 text-xs sm:text-sm font-bold text-gray-300 border-t border-tartan-border/50">
                      <button
                        onClick={() => likeSocialPost(post.id)}
                        className={`py-2.5 rounded-2xl flex items-center justify-center gap-2 transition-all ${
                          post.likedByMe 
                            ? 'text-amber-400 bg-amber-950/40 font-extrabold' 
                            : 'hover:bg-tartan-navy text-gray-300'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${post.likedByMe ? 'fill-amber-400 text-amber-400' : 'text-gray-400'}`} />
                        <span>Slàinte 🥃</span>
                      </button>

                      <button
                        onClick={() => {
                          const input = document.getElementById(`comment-input-${post.id}`);
                          input?.focus();
                        }}
                        className="py-2.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-tartan-navy transition-colors text-gray-300"
                      >
                        <MessageCircle className="w-4 h-4 text-tartan-gold" />
                        <span>Comment</span>
                      </button>

                      <button
                        onClick={() => handleSharePost(post.id)}
                        className="py-2.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-tartan-navy transition-colors text-gray-300"
                      >
                        {copiedPostId === post.id ? (
                          <>
                            <Check className="w-4 h-4 text-green-400" />
                            <span className="text-green-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-4 h-4 text-tartan-gold" />
                            <span>Share</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Comments Thread */}
                    <div className="p-4 sm:p-6 rounded-2xl bg-tartan-navy/50 border border-tartan-border/50 space-y-4">
                      {/* Comments List */}
                      {post.comments && post.comments.length > 0 && (
                        <div className="space-y-3">
                          {post.comments.map((comment) => {
                            const isSpudComment = comment.authorName === 'Spud the Piper' || comment.authorRole === 'Spud the Piper';

                            return (
                              <div key={comment.id} className="flex items-start gap-3 text-xs sm:text-sm">
                                <div className="w-8 h-8 rounded-full bg-slate-800 border border-tartan-border flex items-center justify-center text-tartan-gold font-bold text-xs shrink-0 mt-0.5">
                                  {comment.authorName.slice(0, 1)}
                                </div>
                                <div className={`p-3.5 rounded-2xl flex-1 ${
                                  isSpudComment 
                                    ? 'bg-tartan-navy border border-tartan-accent/50' 
                                    : 'bg-slate-800/80 border border-slate-700/50'
                                }`}>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-white">{comment.authorName}</span>
                                    {isSpudComment && (
                                      <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/30">
                                        Spud (Official)
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-gray-200 mt-1.5 leading-relaxed">{comment.content}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Comment Input */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={commentAuthorNames[post.id] || ''}
                          onChange={(e) => setCommentAuthorNames({ ...commentAuthorNames, [post.id]: e.target.value })}
                          placeholder={isAdminLoggedIn ? 'Spud the Piper' : 'Your Name'}
                          className="w-28 sm:w-40 bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent"
                        />
                        <input
                          id={`comment-input-${post.id}`}
                          type="text"
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                          placeholder="Write a public comment..."
                          className="flex-1 bg-tartan-dark border border-tartan-border rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCommentSubmit(post.id);
                          }}
                        />
                        <button
                          onClick={() => handleCommentSubmit(post.id)}
                          className="p-3 bg-gold-gradient text-tartan-dark rounded-xl shadow hover:brightness-110 active:scale-95 transition-all shrink-0"
                          title="Send Comment"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}

              {/* Pagination / See More Button */}
              {feedPosts.length > visibleFeedCount ? (
                <div className="p-6 sm:p-8 bg-tartan-navy/40 text-center border-t border-tartan-border/60">
                  <button
                    onClick={() => setVisibleFeedCount(prev => prev + 5)}
                    className="inline-flex items-center gap-3 px-8 py-3.5 bg-gold-gradient text-tartan-dark font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-xl hover:brightness-110 hover:scale-105 active:scale-95 transition-all"
                  >
                    <span>See More Posts ({feedPosts.length - visibleFeedCount} remaining)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : feedPosts.length > 5 ? (
                <div className="p-5 bg-tartan-navy/20 text-center border-t border-tartan-border/40 text-xs text-gray-400 font-medium flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span>You are all caught up with all {feedPosts.length} Scottish memories & updates!</span>
                </div>
              ) : null}
            </div>

            {/* 3 HIGHLAND HIGHLIGHT BOXES AT THE BOTTOM OF SOCIAL FEED */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              
              {/* Box 1: 40+ Years Scottish Heritage */}
              <div className="bg-gradient-to-br from-tartan-dark to-tartan-navy/90 rounded-3xl p-6 sm:p-7 border border-tartan-border shadow-xl hover:border-tartan-gold/50 transition-all group flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-tartan-gold group-hover:scale-110 transition-transform">
                      <Award className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-950/40 px-3 py-1 rounded-full border border-amber-800/40">
                      ★ 5.0 Star Rated
                    </span>
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-white group-hover:text-tartan-gold transition-colors">
                      40+ Years Heritage
                    </h3>
                    <p className="text-xs text-tartan-gold font-medium mt-0.5">
                      1,000+ Celebrations & Royal Galas
                    </p>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Spud brings four decades of authentic Great Highland Bagpipe mastery in full traditional No. 1 ceremonial dress for weddings, memorials, and VIP gatherings.
                  </p>
                </div>
                <div className="pt-5 mt-4 border-t border-tartan-border/50 flex items-center gap-2 text-[11px] text-gray-400 font-medium">
                  <ShieldCheck className="w-4 h-4 text-green-400 shrink-0" />
                  <span>Verified Scottish Piping Excellence</span>
                </div>
              </div>

              {/* Box 2: Featured Worldwide & Castle Venues */}
              <div className="bg-gradient-to-br from-tartan-dark to-tartan-navy/90 rounded-3xl p-6 sm:p-7 border border-tartan-border shadow-xl hover:border-tartan-gold/50 transition-all group flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-tartan-gold group-hover:scale-110 transition-transform">
                      <Castle className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-tartan-gold bg-tartan-gold/10 px-3 py-1 rounded-full border border-tartan-gold/20">
                      Worldwide
                    </span>
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-white group-hover:text-tartan-gold transition-colors">
                      Iconic Venues & Tours
                    </h3>
                    <p className="text-xs text-tartan-gold font-medium mt-0.5">
                      Castles, Highlands & International
                    </p>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Regular performer at Edinburgh Castle, Dundas Castle, Isle of Skye, New York City Tartan Week on 5th Avenue, Geneva & Paris destination events.
                  </p>
                </div>
                <div className="pt-5 mt-4 border-t border-tartan-border/50 flex flex-wrap gap-1.5">
                  {['Edinburgh Castle', 'Dundas Castle', 'NYC Tartan Week', 'Isle of Skye'].map((v) => (
                    <span key={v} className="text-[10px] bg-slate-800/80 text-gray-300 px-2.5 py-1 rounded-lg border border-slate-700/60 font-medium">
                      📍 {v}
                    </span>
                  ))}
                </div>
              </div>

              {/* Box 3: Fast-Track VIP Booking */}
              <div className="bg-gradient-to-br from-tartan-dark to-tartan-navy/90 rounded-3xl p-6 sm:p-7 border border-amber-500/40 shadow-xl hover:border-tartan-gold transition-all group flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-tartan-gold group-hover:scale-110 transition-transform">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-green-400 bg-green-950/40 px-3 py-1 rounded-full border border-green-800/40">
                      ● Booking 2026/2027
                    </span>
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-white group-hover:text-tartan-gold transition-colors">
                      Plan Your Celebration
                    </h3>
                    <p className="text-xs text-tartan-gold font-medium mt-0.5">
                      Direct Consultation with Spud
                    </p>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Check live date availability for your wedding, gala, or special event. Instant quote generator and bespoke Highland music consultation.
                  </p>
                </div>
                <div className="pt-5 mt-4 border-t border-tartan-border/50 relative z-10">
                  <a
                    href="#booking"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all"
                  >
                    <span>Check Live Availability</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* VIEW 2: TRADITIONAL HIGHLAND PIPING & VENUE FORUM                  */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {activeTab === 'forum' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* ── FORUM TOP BREADCRUMB NAVIGATION & ACTIONS BAR ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-tartan-dark/95 p-5 rounded-3xl border border-tartan-border shadow-xl backdrop-blur-md">
              
              {/* Breadcrumb Trail */}
              <nav className="flex items-center gap-2 text-xs sm:text-sm flex-wrap text-gray-400">
                <button
                  onClick={() => {
                    setSelectedForumTopic('All');
                    setActiveThreadId(null);
                  }}
                  className={`font-bold transition-colors flex items-center gap-1.5 ${
                    selectedForumTopic === 'All' && !activeThreadId
                      ? 'text-tartan-gold'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-tartan-gold" />
                  <span>Forum Categories</span>
                </button>

                {selectedForumTopic !== 'All' && (
                  <>
                    <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />
                    <button
                      onClick={() => setActiveThreadId(null)}
                      className={`font-bold transition-colors ${
                        !activeThreadId ? 'text-tartan-gold' : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      {selectedForumTopic}
                    </button>
                  </>
                )}

                {activeThread && (
                  <>
                    <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />
                    <span className="text-white font-semibold truncate max-w-[200px] sm:max-w-md">
                      {activeThread.title}
                    </span>
                  </>
                )}
              </nav>

              {/* Forum Top Action Buttons */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                {activeThreadId ? (
                  <button
                    onClick={() => setActiveThreadId(null)}
                    className="px-4 py-2 bg-tartan-navy hover:bg-slate-800 text-gray-300 hover:text-white rounded-xl border border-tartan-border/60 text-xs font-bold transition-all flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Topics</span>
                  </button>
                ) : selectedForumTopic !== 'All' ? (
                  <button
                    onClick={() => setSelectedForumTopic('All')}
                    className="px-4 py-2 bg-tartan-navy hover:bg-slate-800 text-gray-300 hover:text-white rounded-xl border border-tartan-border/60 text-xs font-bold transition-all flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>All Categories</span>
                  </button>
                ) : null}

                {isAdminLoggedIn ? (
                  <button
                    onClick={() => {
                      if (selectedForumTopic !== 'All') {
                        setForumTopic(selectedForumTopic as any);
                      }
                      setIsForumModalOpen(true);
                    }}
                    className="px-6 py-2.5 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 shrink-0 ml-auto sm:ml-0"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Start Discussion (Spud)</span>
                  </button>
                ) : selectedForumTopic !== 'All' && !activeThreadId ? (
                  <button
                    onClick={() => {
                      setForumTopic(selectedForumTopic as any);
                      setIsForumModalOpen(true);
                    }}
                    className="px-6 py-2.5 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 shrink-0 ml-auto sm:ml-0"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Start Topic in this Category</span>
                  </button>
                ) : selectedForumTopic === 'All' && !activeThreadId ? (
                  <div className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-tartan-navy/60 border border-tartan-border text-xs text-gray-400 font-medium">
                    <BookOpen className="w-3.5 h-3.5 text-tartan-gold" />
                    <span>Select a category board below to start a topic</span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* ═════════════════════════════════════════════════════════════ */}
            {/* SUB-VIEW 1: THREAD DETAIL VIEW & REPLIES STREAM               */}
            {/* ═════════════════════════════════════════════════════════════ */}
            {activeThreadId && activeThread ? (
              <div className="space-y-6 animate-in fade-in">
                
                {/* Thread Header Banner */}
                <div className="bg-tartan-dark rounded-3xl p-6 sm:p-8 border border-tartan-border shadow-xl space-y-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-tartan-navy text-tartan-gold border border-tartan-accent/40">
                      {activeThread.forumTopic || 'General Piping'}
                    </span>
                    {activeThread.eventLocation && (
                      <span className="text-[11px] text-gray-300 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700/60 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-tartan-gold" />
                        <span>{activeThread.eventLocation}</span>
                      </span>
                    )}
                  </div>
                  
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white leading-snug">
                    {activeThread.title}
                  </h1>

                  <div className="flex items-center gap-4 text-xs text-gray-400 pt-1 flex-wrap">
                    <span>Started by <strong className="text-white">{activeThread.authorName}</strong></span>
                    <span>•</span>
                    <span>{activeThread.timestamp}</span>
                    <span>•</span>
                    <span className="text-tartan-gold font-semibold">{activeThread.comments?.length || 0} Replies</span>
                    <span>•</span>
                    <span>{activeThread.likes} Helpful Reactions</span>
                  </div>
                </div>

                {/* POST #1: ORIGINAL POST (Question / Discussion Starter) */}
                <div className="bg-tartan-dark/95 rounded-3xl border border-tartan-border shadow-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-tartan-navy/60 to-transparent px-6 py-3.5 border-b border-tartan-border/70 flex items-center justify-between text-xs text-gray-400 font-semibold">
                    <span className="text-tartan-gold font-bold uppercase tracking-wider">Original Post #1 (Topic Starter)</span>
                    <span>{activeThread.timestamp}</span>
                  </div>

                  <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-6">
                    {/* Author Box */}
                    <div className="md:w-56 shrink-0 flex md:flex-col items-center md:items-start gap-4 p-4 rounded-2xl bg-tartan-navy/50 border border-tartan-border/50">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-tartan-accent via-amber-500 to-amber-700 flex items-center justify-center text-tartan-dark font-serif font-bold text-xl shrink-0 shadow-lg">
                        {activeThread.authorRole === 'Spud the Piper' ? 'S' : activeThread.authorName.slice(0, 1)}
                      </div>
                      <div className="space-y-1">
                        <div className="font-bold text-white text-base">{activeThread.authorName}</div>
                        <div className="text-[11px] font-semibold text-tartan-gold bg-tartan-dark px-2.5 py-0.5 rounded-md border border-tartan-border inline-block">
                          {activeThread.authorRole}
                        </div>
                        <div className="text-[11px] text-gray-400">Thread Starter</div>
                      </div>
                    </div>

                    {/* Post Content & Actions */}
                    <div className="flex-1 space-y-6 flex flex-col justify-between">
                      <div className="text-sm sm:text-base text-gray-200 leading-relaxed space-y-4 whitespace-pre-wrap">
                        {activeThread.content}
                      </div>

                      <div className="pt-4 border-t border-tartan-border/50 flex items-center justify-between flex-wrap gap-3">
                        <button
                          onClick={() => likeSocialPost(activeThread.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            activeThread.likedByMe
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-500'
                              : 'bg-tartan-navy hover:bg-slate-800 text-gray-300 border border-tartan-border/60'
                          }`}
                        >
                          <ThumbsUp className={`w-4 h-4 ${activeThread.likedByMe ? 'fill-amber-400' : ''}`} />
                          <span>{activeThread.likes} Helpful / Slàinte 🥃</span>
                        </button>

                        <button
                          onClick={() => {
                            const el = document.getElementById('thread-reply-box');
                            el?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 bg-tartan-navy hover:bg-slate-800 text-gray-300 hover:text-white rounded-xl border border-tartan-border/60 text-xs font-bold transition-all"
                        >
                          <MessageCircle className="w-4 h-4 text-tartan-gold" />
                          <span>Reply to Thread</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SPUD'S VERIFIED EXPERT ANSWER HIGHLIGHT BANNER */}
                {activeThread.comments?.some(c => c.authorName === 'Spud the Piper' || c.authorRole === 'Spud the Piper') && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-950/40 to-amber-500/10 border border-amber-500/40 flex items-center gap-3 text-amber-300 text-xs sm:text-sm font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 fill-amber-400 shrink-0" />
                    <span>This discussion contains verified expert advice from <strong>Spud the Piper (Official)</strong>.</span>
                  </div>
                )}

                {/* SEQUENTIAL REPLIES STREAM (Post #2, #3, #4...) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-lg font-bold text-white font-serif flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-tartan-gold" />
                      <span>Replies ({activeThread.comments?.length || 0})</span>
                    </h3>
                  </div>

                  {(!activeThread.comments || activeThread.comments.length === 0) ? (
                    <div className="text-center py-12 bg-tartan-dark rounded-3xl border border-tartan-border/60 space-y-2">
                      <p className="text-sm text-gray-400">No replies yet on this topic.</p>
                      <p className="text-xs text-tartan-gold font-medium">Be the first to share an answer or advice below!</p>
                    </div>
                  ) : (
                    activeThread.comments.map((comment, index) => {
                      const isSpud = comment.authorName === 'Spud the Piper' || comment.authorRole === 'Spud the Piper';

                      return (
                        <div
                          key={comment.id}
                          className={`rounded-3xl border shadow-xl overflow-hidden transition-all ${
                            isSpud
                              ? 'bg-gradient-to-b from-tartan-dark to-tartan-navy/90 border-tartan-accent/60 shadow-amber-950/20'
                              : 'bg-tartan-dark/90 border-tartan-border/70'
                          }`}
                        >
                          {/* Post Header */}
                          <div className={`px-6 py-3 border-b flex items-center justify-between text-xs ${
                            isSpud
                              ? 'bg-amber-500/15 border-amber-500/30 text-amber-300 font-bold'
                              : 'bg-tartan-navy/40 border-tartan-border/60 text-gray-400'
                          }`}>
                            <div className="flex items-center gap-2">
                              <span>Post #{index + 2}</span>
                              {isSpud && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-tartan-dark font-extrabold text-[10px] uppercase tracking-wider">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Official Piper Answer</span>
                                </span>
                              )}
                            </div>
                            <span>{new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>

                          {/* Post Body */}
                          <div className="p-6 sm:p-7 flex flex-col md:flex-row gap-6">
                            {/* Author Column */}
                            <div className="md:w-48 shrink-0 flex md:flex-col items-center md:items-start gap-3 p-3.5 rounded-2xl bg-tartan-navy/30 border border-tartan-border/40">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                                isSpud ? 'bg-gold-gradient text-tartan-dark' : 'bg-slate-800 text-tartan-gold'
                              }`}>
                                {isSpud ? 'S' : comment.authorName.slice(0, 1)}
                              </div>
                              <div>
                                <div className="font-bold text-white text-sm">{comment.authorName}</div>
                                <div className="text-[10px] text-gray-300 bg-slate-800/80 px-2 py-0.5 rounded mt-0.5 inline-block">
                                  {comment.authorRole || (isSpud ? 'Spud the Piper' : 'Community Member')}
                                </div>
                              </div>
                            </div>

                            {/* Reply Text */}
                            <div className="flex-1 text-xs sm:text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                              {comment.content}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* RICH THREAD REPLY COMPOSER */}
                <div id="thread-reply-box" className="bg-tartan-dark rounded-3xl p-6 sm:p-8 border border-tartan-border shadow-2xl space-y-4">
                  <div className="flex items-center gap-2 text-white font-serif font-bold text-lg">
                    <CornerDownRight className="w-5 h-5 text-tartan-gold" />
                    <span>Post a Reply to this Discussion</span>
                  </div>

                  <form onSubmit={handleThreadReplySubmit} className="space-y-4 text-xs sm:text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-tartan-gold text-xs font-semibold mb-1">Your Full Name *</label>
                        <input
                          type="text"
                          required
                          value={threadReplyAuthor}
                          onChange={(e) => setThreadReplyAuthor(e.target.value)}
                          placeholder={isAdminLoggedIn ? 'Spud the Piper' : 'Your Full Name *'}
                          className="w-full bg-tartan-navy border border-tartan-border rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent"
                        />
                      </div>

                      <div>
                        <label className="block text-tartan-gold text-xs font-semibold mb-1">Your Role / Relation *</label>
                        <select
                          value={threadReplyRole}
                          onChange={(e) => setThreadReplyRole(e.target.value)}
                          className="w-full bg-tartan-navy border border-tartan-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-tartan-accent"
                        >
                          <option value="Bride/Groom">Bride / Groom</option>
                          <option value="Client">Corporate / Event Host</option>
                          <option value="Guest">Wedding / Event Guest</option>
                          <option value="Student">Piping Student</option>
                          <option value="Fan">Highland Enthusiast / Fan</option>
                          <option value="Other">Other (Specify below...)</option>
                          {isAdminLoggedIn && <option value="Spud the Piper">Spud the Piper (Official)</option>}
                        </select>
                      </div>
                    </div>

                    {threadReplyRole === 'Other' && (
                      <div className="animate-in fade-in">
                        <label className="block text-tartan-gold text-xs font-semibold mb-1">Specify Your Role / Relation *</label>
                        <input
                          type="text"
                          required
                          value={threadReplyCustomRole}
                          onChange={(e) => setThreadReplyCustomRole(e.target.value)}
                          placeholder="e.g. Castle Wedding Coordinator, Best Man, Musician"
                          className="w-full bg-tartan-navy border border-tartan-accent/60 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="block text-tartan-gold text-xs font-semibold mb-1">Your Reply / Advice *</label>
                      <textarea
                        ref={threadReplyTextareaRef}
                        rows={4}
                        required
                        value={threadReplyText}
                        onChange={(e) => setThreadReplyText(e.target.value)}
                        placeholder="Write your constructive response, answer, recommendation, or question..."
                        className="w-full bg-tartan-navy border border-tartan-border rounded-2xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent leading-relaxed"
                      />
                      <EmojiBar
                        onSelectEmoji={(emoji) => insertEmojiIntoField(emoji, threadReplyText, setThreadReplyText, threadReplyTextareaRef)}
                        label="Add Emojis & 3D Stickers to Reply:"
                      />
                    </div>

                    <div className="flex items-center justify-end pt-2">
                      <button
                        type="submit"
                        className="px-7 py-3 bg-gold-gradient text-tartan-dark font-extrabold uppercase rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>Submit Reply</span>
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            ) : selectedForumTopic !== 'All' ? (
              /* ═════════════════════════════════════════════════════════════ */
              /* SUB-VIEW 2: CATEGORY TOPICS LISTING TABLE                     */
              /* ═════════════════════════════════════════════════════════════ */
              <div className="space-y-6 animate-in fade-in">
                
                {/* Category Header Banner */}
                {(() => {
                  const currentCategoryDef = (forumCategories || []).find(c => c.topicName === selectedForumTopic);
                  const Icon = currentCategoryDef ? getCategoryIcon(currentCategoryDef.iconName) : MessageSquare;

                  return (
                    <div className="bg-tartan-dark rounded-3xl p-6 sm:p-8 border border-tartan-border shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-tartan-gold shrink-0">
                          <Icon className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-tartan-navy text-tartan-gold text-xs font-bold border border-tartan-accent/40 mb-1">
                            Category Board
                          </div>
                          <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif">
                            {currentCategoryDef?.title || selectedForumTopic}
                          </h2>
                          <p className="text-xs sm:text-sm text-gray-300 max-w-2xl mt-1 leading-relaxed">
                            {currentCategoryDef?.description}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setForumTopic(selectedForumTopic as any);
                          setIsForumModalOpen(true);
                        }}
                        className="px-6 py-3 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 shrink-0"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Start Topic in this Category</span>
                      </button>
                    </div>
                  );
                })()}

                {/* Topics Table */}
                <div className="bg-tartan-dark/95 rounded-3xl border border-tartan-border shadow-2xl overflow-hidden">
                  
                  {/* Table Header */}
                  <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-tartan-navy/60 border-b border-tartan-border text-xs font-bold uppercase tracking-wider text-tartan-gold">
                    <div className="col-span-6">Topic / Discussion</div>
                    <div className="col-span-2 text-center">Author</div>
                    <div className="col-span-2 text-center">Replies & Likes</div>
                    <div className="col-span-2 text-right">Last Activity</div>
                  </div>

                  {/* Topics List */}
                  {forumPosts.length === 0 ? (
                    <div className="text-center py-16 p-6 space-y-3">
                      <MessageSquare className="w-12 h-12 text-tartan-gold/50 mx-auto" />
                      <h3 className="text-base font-bold text-white font-serif">No discussions in this category yet</h3>
                      <p className="text-xs text-gray-400">Be the first to start a conversation or ask Spud a question here!</p>
                      <button
                        onClick={() => {
                          setForumTopic(selectedForumTopic as any);
                          setIsForumModalOpen(true);
                        }}
                        className="px-5 py-2.5 bg-gold-gradient text-tartan-dark font-bold text-xs rounded-xl shadow"
                      >
                        Start First Topic
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-tartan-border/60">
                      {forumPosts.map((post) => {
                        const hasSpudAnswer = post.comments?.some(c => c.authorName === 'Spud the Piper' || c.authorRole === 'Spud the Piper');

                        return (
                          <div
                            key={post.id}
                            onClick={() => setActiveThreadId(post.id)}
                            className="p-5 sm:p-6 hover:bg-white/[0.02] cursor-pointer transition-all flex flex-col md:grid md:grid-cols-12 gap-4 items-start md:items-center group"
                          >
                            {/* Column 1: Title & Preview */}
                            <div className="col-span-6 space-y-1.5 w-full">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-tartan-gold transition-colors font-serif leading-snug">
                                  {post.title}
                                </h3>
                                {hasSpudAnswer && (
                                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.5 rounded-full border border-amber-500/40 inline-flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Spud Answered</span>
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                                {post.content}
                              </p>
                              {post.eventLocation && (
                                <div className="text-[11px] text-gray-400 flex items-center gap-1 pt-0.5">
                                  <MapPin className="w-3 h-3 text-tartan-gold" />
                                  <span>{post.eventLocation}</span>
                                </div>
                              )}
                            </div>

                            {/* Column 2: Author */}
                            <div className="col-span-2 text-left md:text-center w-full md:w-auto flex md:flex-col items-center gap-2 md:gap-0.5">
                              <span className="text-xs font-bold text-white">{post.authorName}</span>
                              <span className="text-[10px] text-gray-400 bg-slate-800 px-2 py-0.5 rounded">
                                {post.authorRole}
                              </span>
                            </div>

                            {/* Column 3: Stats */}
                            <div className="col-span-2 text-left md:text-center flex items-center md:justify-center gap-3 text-xs text-gray-300 font-semibold">
                              <span className="flex items-center gap-1 text-tartan-gold">
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>{post.comments?.length || 0}</span>
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-gray-400">
                                <ThumbsUp className="w-3.5 h-3.5" />
                                <span>{post.likes}</span>
                              </span>
                            </div>

                            {/* Column 4: Last Activity */}
                            <div className="col-span-2 text-left md:text-right w-full md:w-auto text-xs text-gray-400 flex md:flex-col justify-between md:justify-center">
                              <span className="font-medium text-gray-300">{post.timestamp}</span>
                              <span className="text-[11px] text-tartan-gold group-hover:underline">Open Discussion →</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            ) : (
              /* ═════════════════════════════════════════════════════════════ */
              /* SUB-VIEW 3: TRADITIONAL FORUM CATEGORIES DIRECTORY (INDEX)    */
              /* ═════════════════════════════════════════════════════════════ */
              <div className="space-y-8 animate-in fade-in">
                
                {/* Categories Table / Directory Board */}
                <div className="bg-tartan-dark/95 rounded-3xl border border-tartan-border shadow-2xl overflow-hidden">
                  
                  <div className="px-6 py-4 bg-gradient-to-r from-tartan-navy to-tartan-dark border-b border-tartan-border flex items-center justify-between">
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-white font-serif">Scottish Piping Discussion Categories</h2>
                      <p className="text-xs text-gray-400">Select a category board to view topics, acoustics advice, or start a new thread</p>
                    </div>
                    <span className="text-xs font-bold text-tartan-gold uppercase tracking-wider hidden sm:block">
                      {categoryStats.length} Active Boards
                    </span>
                  </div>

                  {/* Categories Rows */}
                  <div className="divide-y divide-tartan-border/60">
                    {categoryStats.map((category) => {
                      const Icon = category.icon;

                      return (
                        <div
                          key={category.id}
                          onClick={() => {
                            setSelectedForumTopic(category.topicName);
                            setActiveThreadId(null);
                          }}
                          className="p-5 sm:p-6 hover:bg-white/[0.025] cursor-pointer transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 group"
                        >
                          {/* Category Info */}
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-tartan-gold shrink-0 group-hover:scale-110 transition-transform">
                              <Icon className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-tartan-gold transition-colors font-serif">
                                  {category.title}
                                </h3>
                              </div>
                              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-2xl">
                                {category.description}
                              </p>
                            </div>
                          </div>

                          {/* Stats & Latest Post Preview */}
                          <div className="flex items-center justify-between lg:justify-end gap-6 w-full lg:w-auto shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-tartan-border/40">
                            <div className="flex items-center gap-4 text-center">
                              <div>
                                <span className="block text-sm sm:text-base font-extrabold text-white font-serif">
                                  {category.topicsCount}
                                </span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Topics</span>
                              </div>
                              <div className="w-px h-8 bg-tartan-border/60" />
                              <div>
                                <span className="block text-sm sm:text-base font-extrabold text-tartan-gold font-serif">
                                  {category.repliesCount}
                                </span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Replies</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs font-bold text-tartan-gold group-hover:translate-x-1 transition-transform">
                              <span>Browse Board</span>
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* RECENT DISCUSSIONS ACROSS ALL CATEGORIES */}
                <div className="bg-tartan-dark/95 rounded-3xl border border-tartan-border shadow-2xl overflow-hidden space-y-0">
                  <div className="px-6 py-4 bg-tartan-navy/60 border-b border-tartan-border flex items-center justify-between">
                    <h3 className="text-base font-bold text-white font-serif flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-400" />
                      <span>Recent Active Discussions Across Scotland</span>
                    </h3>
                    <span className="text-xs text-gray-400">Showing all active threads</span>
                  </div>

                  <div className="divide-y divide-tartan-border/60">
                    {forumPosts.map((post) => {
                      const hasSpudAnswer = post.comments?.some(c => c.authorName === 'Spud the Piper' || c.authorRole === 'Spud the Piper');

                      return (
                        <div
                          key={post.id}
                          onClick={() => {
                            setSelectedForumTopic(post.forumTopic || 'General Piping');
                            setActiveThreadId(post.id);
                          }}
                          className="p-5 sm:p-6 hover:bg-white/[0.02] cursor-pointer transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                        >
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800 text-tartan-gold border border-tartan-border">
                                {post.forumTopic || 'General'}
                              </span>
                              <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-tartan-gold transition-colors font-serif">
                                {post.title}
                              </h4>
                              {hasSpudAnswer && (
                                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.5 rounded-full border border-amber-500/40 inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Spud Answered</span>
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 line-clamp-1">
                              {post.content}
                            </p>
                            <div className="text-[11px] text-gray-400 flex items-center gap-2 flex-wrap pt-0.5">
                              <span>by <strong className="text-white">{post.authorName}</strong> ({post.authorRole})</span>
                              <span>•</span>
                              <span>{post.timestamp}</span>
                              {post.eventLocation && (
                                <>
                                  <span>•</span>
                                  <span className="text-gray-300 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-tartan-gold" />
                                    <span>{post.eventLocation}</span>
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-xs shrink-0 self-end sm:self-center">
                            <div className="flex items-center gap-1.5 bg-tartan-navy px-3 py-1.5 rounded-xl border border-tartan-border text-tartan-gold font-bold">
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>{post.comments?.length || 0}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-tartan-gold group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* MODAL: IMAGE ZOOM LIGHTBOX                                        */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {zoomedImageUrl && (
          <div 
            onClick={() => setZoomedImageUrl(null)}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          >
            <div className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl">
              <img src={zoomedImageUrl} alt="Spud the Piper" className="w-full h-full object-contain max-h-[85vh] rounded-2xl" />
              <button 
                onClick={() => setZoomedImageUrl(null)}
                className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full hover:bg-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* MODAL: ASK FORUM QUESTION / START NEW TOPIC                        */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {isForumModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-tartan-card border border-tartan-accent/50 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
              
              <div className="bg-tartan-navy px-6 py-4 border-b border-tartan-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-tartan-gold" />
                  <h3 className="text-base font-bold text-white font-serif">Start a New Forum Discussion</h3>
                </div>
                <button onClick={() => setIsForumModalOpen(false)} className="text-gray-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePublishForumQuestion} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-tartan-gold font-bold mb-1">Forum Category *</label>
                  <select
                    value={forumTopic}
                    onChange={(e) => setForumTopic(e.target.value)}
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-tartan-accent"
                  >
                    {(forumCategories || []).map(cat => (
                      <option key={cat.id} value={cat.topicName}>
                        {cat.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-tartan-gold font-bold mb-1">Discussion / Question Title *</label>
                  <input
                    type="text"
                    required
                    value={forumTitle}
                    onChange={(e) => setForumTitle(e.target.value)}
                    placeholder="e.g. Can Highland Cathedral be played in unison with a church organ?"
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-tartan-accent font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-tartan-gold font-bold mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={forumAuthorName}
                      onChange={(e) => setForumAuthorName(e.target.value)}
                      placeholder={isAdminLoggedIn ? 'Spud the Piper' : 'Your Full Name *'}
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-tartan-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-tartan-gold font-bold mb-1">Your Role / Relation *</label>
                    <select
                      value={forumAuthorRole}
                      onChange={(e) => setForumAuthorRole(e.target.value)}
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-tartan-accent"
                    >
                      <option value="Bride/Groom">Bride / Groom</option>
                      <option value="Client">Corporate / Event Host</option>
                      <option value="Guest">Wedding / Event Guest</option>
                      <option value="Student">Piping Student</option>
                      <option value="Fan">Highland Enthusiast</option>
                      <option value="Other">Other (Specify below...)</option>
                      {isAdminLoggedIn && <option value="Spud the Piper">Spud the Piper (Official)</option>}
                    </select>
                  </div>
                </div>

                {/* Custom Role Input if 'Other' selected in Forum */}
                {forumAuthorRole === 'Other' && (
                  <div className="animate-in fade-in">
                    <label className="block text-tartan-gold font-bold mb-1">Specify Your Role / Relation *</label>
                    <input
                      type="text"
                      required
                      value={customForumRoleText}
                      onChange={(e) => setCustomForumRoleText(e.target.value)}
                      placeholder="e.g. Mother of the Bride, Best Man, Venue Manager, Friend"
                      className="w-full bg-tartan-dark border border-tartan-accent/60 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-tartan-gold font-bold mb-1">Details & Context *</label>
                  <textarea
                    ref={forumModalTextareaRef}
                    rows={4}
                    required
                    value={forumContent}
                    onChange={(e) => setForumContent(e.target.value)}
                    placeholder="Describe your venue, date, special requests, acoustics question, or piping topic..."
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent leading-relaxed"
                  />
                  <EmojiBar
                    onSelectEmoji={(emoji) => insertEmojiIntoField(emoji, forumContent, setForumContent, forumModalTextareaRef)}
                    label="Add Emojis & 3D Stickers to Topic:"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-tartan-border/80">
                  <button
                    type="button"
                    onClick={() => setIsForumModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-gray-300 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gold-gradient text-tartan-dark font-extrabold rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all"
                  >
                    Publish Discussion
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </section>
  );
};
