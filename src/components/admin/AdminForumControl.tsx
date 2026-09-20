'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  MessageSquare, 
  PlusCircle, 
  Trash2, 
  CheckCircle2, 
  ShieldCheck, 
  Castle, 
  Music, 
  Volume2, 
  Globe, 
  Flame, 
  Award, 
  ExternalLink,
  FolderPlus
} from 'lucide-react';

export const AdminForumControl: React.FC = () => {
  const { 
    forumCategories, 
    createForumCategory, 
    deleteForumCategory, 
    socialPosts, 
    deleteSocialPost,
    addCommentToPost
  } = useApp();

  const [activeTab, setActiveTab] = useState<'categories' | 'moderation'>('categories');

  // New Category Form State
  const [newTopicName, setNewTopicName] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newIconName, setNewIconName] = useState('MessageSquare');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Quick Reply / Answer Modal from Spud
  const [answeringPostId, setAnsweringPostId] = useState<string | null>(null);
  const [spudAnswerText, setSpudAnswerText] = useState('');

  const forumPosts = socialPosts.filter(p => p.postType === 'forum' || Boolean(p.forumTopic) || p.id.startsWith('forum-'));

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim() || !newTitle.trim() || !newDescription.trim()) return;

    createForumCategory({
      topicName: newTopicName.trim(),
      title: newTitle.trim(),
      description: newDescription.trim(),
      iconName: newIconName,
      accentBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      isCustom: true
    });

    setNewTopicName('');
    setNewTitle('');
    setNewDescription('');
    setIsAddingCategory(false);
  };

  const handleSpudQuickAnswer = (postId: string) => {
    if (!spudAnswerText.trim()) return;
    addCommentToPost(postId, spudAnswerText.trim(), 'Spud the Piper', 'Spud the Piper');
    setSpudAnswerText('');
    setAnsweringPostId(null);
  };

  const getIconComponent = (name?: string) => {
    switch (name) {
      case 'Music': return Music;
      case 'Castle': return Castle;
      case 'Volume2': return Volume2;
      case 'Globe': return Globe;
      case 'Flame': return Flame;
      case 'Award': return Award;
      default: return MessageSquare;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-tartan-card rounded-3xl p-6 sm:p-8 border border-tartan-border shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-bold border border-amber-500/30">
            <ShieldCheck className="w-4 h-4" />
            <span>Spud Back Office Exclusive</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif">
            Forum & Category Control
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-2xl leading-relaxed">
            Create and manage official Scottish discussion categories. The public can only post topics inside categories you set up here.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'categories'
                ? 'bg-gold-gradient text-tartan-dark font-extrabold shadow'
                : 'bg-tartan-navy text-gray-300 hover:text-white border border-tartan-border'
            }`}
          >
            Categories ({forumCategories.length})
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'moderation'
                ? 'bg-gold-gradient text-tartan-dark font-extrabold shadow'
                : 'bg-tartan-navy text-gray-300 hover:text-white border border-tartan-border'
            }`}
          >
            Moderate Topics ({forumPosts.length})
          </button>
        </div>
      </div>

      {/* ── TAB 1: CATEGORY MANAGEMENT ── */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          
          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white font-serif flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-tartan-gold" />
              <span>Active Discussion Categories ({forumCategories.length})</span>
            </h2>
            <button
              onClick={() => setIsAddingCategory(!isAddingCategory)}
              className="px-5 py-2.5 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isAddingCategory ? 'Close Form' : 'Add New Category'}</span>
            </button>
          </div>

          {/* Add Category Form */}
          {isAddingCategory && (
            <div className="bg-tartan-card rounded-3xl p-6 sm:p-8 border border-tartan-accent/60 shadow-2xl animate-in fade-in space-y-4">
              <h3 className="text-base font-bold text-white font-serif">Create Official Category Board</h3>
              <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-tartan-gold font-bold mb-1">Unique Topic Key *</label>
                    <input
                      type="text"
                      required
                      value={newTopicName}
                      onChange={(e) => setNewTopicName(e.target.value)}
                      placeholder="e.g. Burns Supper & Ceilidh Piping"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-tartan-gold font-bold mb-1">Public Display Title *</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Burns Night Addresses & Ceilidh Traditions"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-tartan-gold font-bold mb-1">Description *</label>
                    <input
                      type="text"
                      required
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="What should people discuss in this category?"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-tartan-gold font-bold mb-1">Icon Style</label>
                    <select
                      value={newIconName}
                      onChange={(e) => setNewIconName(e.target.value)}
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-tartan-accent"
                    >
                      <option value="Music">🎵 Music Note</option>
                      <option value="Castle">🏰 Castle</option>
                      <option value="Volume2">🎼 Bagpipe / Audio</option>
                      <option value="Globe">🌍 Worldwide Travel</option>
                      <option value="Flame">🔥 Highland Flame</option>
                      <option value="Award">🏆 Award / Heritage</option>
                      <option value="MessageSquare">💬 Discussion</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(false)}
                    className="px-4 py-2 bg-slate-800 text-gray-300 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gold-gradient text-tartan-dark font-extrabold uppercase rounded-xl shadow-lg"
                  >
                    Save Category to Live Forum
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {forumCategories.map((cat) => {
              const Icon = getIconComponent(cat.iconName);
              const matchingPosts = forumPosts.filter(p => p.forumTopic === cat.topicName);
              const totalReplies = matchingPosts.reduce((acc, p) => acc + (p.comments?.length || 0), 0);

              return (
                <div
                  key={cat.id}
                  className="bg-tartan-card rounded-3xl p-6 border border-tartan-border shadow-lg flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-tartan-gold">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex items-center gap-2">
                        {cat.isCustom && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                            Custom
                          </span>
                        )}
                        {cat.isCustom && (
                          <button
                            onClick={() => deleteForumCategory(cat.id)}
                            className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-950/40 transition-colors"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-serif font-bold text-white text-lg">{cat.title}</h3>
                      <span className="text-[11px] text-tartan-gold font-mono block mt-0.5">
                        Key: {cat.topicName}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-tartan-border/50 flex items-center justify-between text-xs text-gray-300 font-semibold">
                    <span className="text-white font-bold">{matchingPosts.length} Topics</span>
                    <span className="text-tartan-gold font-bold">{totalReplies} Replies</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ── TAB 2: FORUM TOPICS MODERATION & SPUD REPLIES ── */}
      {activeTab === 'moderation' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white font-serif">
              All Public Forum Discussions ({forumPosts.length})
            </h2>
            <a
              href="/social"
              target="_blank"
              className="text-xs text-tartan-gold hover:underline flex items-center gap-1 font-semibold"
            >
              <span>View Public Forum Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-4">
            {forumPosts.map((post) => {
              const hasSpudAnswer = post.comments?.some(c => c.authorName === 'Spud the Piper' || c.authorRole === 'Spud the Piper');

              return (
                <div
                  key={post.id}
                  className="bg-tartan-card rounded-3xl p-6 border border-tartan-border shadow-xl space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-tartan-navy text-tartan-gold border border-tartan-border">
                          {post.forumTopic || 'General'}
                        </span>
                        {hasSpudAnswer && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.5 rounded-full border border-amber-500/40 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Spud Answered</span>
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white font-serif">{post.title}</h3>
                      <div className="text-xs text-gray-400">
                        <span>by <strong className="text-white">{post.authorName}</strong> ({post.authorRole})</span>
                        <span> • {post.timestamp}</span>
                        {post.eventLocation && <span> • 📍 {post.eventLocation}</span>}
                      </div>
                    </div>

                    {deleteSocialPost && (
                      <button
                        onClick={() => deleteSocialPost(post.id)}
                        className="p-2 text-gray-400 hover:text-red-400 rounded-xl hover:bg-red-950/40 transition-colors shrink-0"
                        title="Delete this topic"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed bg-tartan-dark/60 p-4 rounded-2xl border border-tartan-border/40 whitespace-pre-wrap">
                    {post.content}
                  </p>

                  {/* Replies Preview */}
                  {post.comments && post.comments.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <span className="text-xs font-bold text-tartan-gold uppercase tracking-wider">
                        Replies ({post.comments.length}):
                      </span>
                      {post.comments.map((c) => (
                        <div key={c.id} className="text-xs p-3 rounded-xl bg-tartan-navy/50 border border-tartan-border/40 text-gray-300 flex items-start justify-between gap-2">
                          <div>
                            <strong className="text-white">{c.authorName}</strong>: {c.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Spud Quick Answer Form */}
                  {answeringPostId === post.id ? (
                    <div className="pt-2 space-y-2 animate-in fade-in">
                      <label className="block text-xs font-bold text-tartan-gold">
                        Post Official Spud Answer:
                      </label>
                      <textarea
                        rows={3}
                        value={spudAnswerText}
                        onChange={(e) => setSpudAnswerText(e.target.value)}
                        placeholder="Write your official advice or recommendations as Spud..."
                        className="w-full bg-tartan-dark border border-tartan-accent/60 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setAnsweringPostId(null)}
                          className="px-3 py-1.5 bg-slate-800 text-gray-300 text-xs rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSpudQuickAnswer(post.id)}
                          className="px-4 py-1.5 bg-gold-gradient text-tartan-dark font-extrabold text-xs rounded-lg shadow"
                        >
                          Publish Verified Answer
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setAnsweringPostId(post.id);
                        setSpudAnswerText('');
                      }}
                      className="px-4 py-2 bg-tartan-navy hover:bg-slate-700 text-tartan-gold rounded-xl border border-tartan-border text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>{hasSpudAnswer ? 'Add Another Official Answer' : 'Answer as Spud the Piper'}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
};