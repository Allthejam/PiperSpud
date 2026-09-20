'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Music, 
  Play, 
  Square, 
  Volume2, 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  Headphones, 
  X, 
  Save, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { BagpipeTune } from '@/types/spud';
import { EditableElement } from './EditableElement';

export const TuneSampler: React.FC = () => {
  const { 
    tunesList, 
    currentPlayingTune, 
    playTune, 
    stopTune, 
    addTune, 
    updateTune, 
    deleteTune,
    isAdminLoggedIn,
    isVisualEditMode 
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  
  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTuneId, setEditingTuneId] = useState<string | null>(null);
  const [tuneTitle, setTuneTitle] = useState<string>('');
  const [tuneCategory, setTuneCategory] = useState<BagpipeTune['category']>('Wedding');
  const [tuneDuration, setTuneDuration] = useState<string>('1:45');
  const [tuneDescription, setTuneDescription] = useState<string>('');
  const [tuneAudioUrl, setTuneAudioUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const categories = ['All', 'Wedding', 'Lament / Funeral', 'Celebration / March', 'Traditional Scottish'];

  const filteredTunes = activeCategory === 'All' 
    ? tunesList 
    : tunesList.filter(t => t.category === activeCategory);

  const handleOpenAddModal = () => {
    setEditingTuneId(null);
    setTuneTitle('');
    setTuneCategory('Wedding');
    setTuneDuration('1:45');
    setTuneDescription('');
    setTuneAudioUrl('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tune: BagpipeTune) => {
    setEditingTuneId(tune.id);
    setTuneTitle(tune.title);
    setTuneCategory(tune.category);
    setTuneDuration(tune.duration);
    setTuneDescription(tune.description);
    setTuneAudioUrl(tune.audioUrl || '');
    setIsModalOpen(true);
  };

  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setTuneAudioUrl(reader.result);
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveTune = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tuneTitle.trim()) return;

    if (editingTuneId) {
      updateTune(editingTuneId, {
        title: tuneTitle,
        category: tuneCategory,
        duration: tuneDuration,
        description: tuneDescription,
        audioUrl: tuneAudioUrl || undefined
      });
    } else {
      addTune({
        title: tuneTitle,
        category: tuneCategory,
        duration: tuneDuration,
        description: tuneDescription,
        audioUrl: tuneAudioUrl || undefined
      });
    }

    setIsModalOpen(false);
  };

  const canManage = isAdminLoggedIn || isVisualEditMode;

  return (
    <section id="tunes" className="py-20 bg-tartan-dark relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tartan-accent/15 border border-tartan-accent/40 text-tartan-gold text-xs font-semibold">
            <Music className="w-4 h-4 shrink-0" />
            <EditableElement
              id="tunes-header-badge"
              tag="span"
              defaultContent="Interactive Bagpipe Jukebox"
              label="Tunes Header Badge"
              section="tunes"
            />
          </div>
          <EditableElement
            id="tunes-header-title"
            tag="h2"
            defaultContent="Listen to the Authentic Sound of the Highlands"
            className="text-3xl sm:text-5xl font-extrabold text-white font-serif tracking-tight"
            label="Tunes Header Title"
            section="tunes"
          />
          <EditableElement
            id="tunes-header-desc"
            tag="p"
            defaultContent="Preview iconic bagpipe tunes and studio recordings. Choose your favorite processional, celebratory march, or solemn lament for your special occasion."
            className="text-base text-gray-300"
            label="Tunes Header Description"
            section="tunes"
          />
        </div>

        {/* Category Filters & Admin Quick Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center justify-center flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeCategory === cat
                    ? 'bg-gold-gradient text-tartan-dark shadow-lg scale-105'
                    : 'bg-tartan-card text-gray-300 hover:bg-tartan-navy border border-tartan-border/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Spud Admin: Add & Upload Music Track Button */}
          {canManage && (
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Bagpipe Track / Upload Audio</span>
            </button>
          )}
        </div>

        {/* Jukebox Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTunes.map((tune: BagpipeTune) => {
            const isThisPlaying = currentPlayingTune === tune.title;

            return (
              <div
                key={tune.id}
                className={`bg-tartan-card rounded-2xl p-6 border transition-all relative overflow-hidden flex flex-col justify-between shadow-xl group hover:border-tartan-accent/60 ${
                  isThisPlaying 
                    ? 'border-tartan-gold ring-2 ring-tartan-gold/50 shadow-yellow-500/10' 
                    : 'border-tartan-border/60'
                }`}
              >
                {/* Active Playing Wave Graphic */}
                {isThisPlaying && (
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-tartan-accent via-yellow-400 to-tartan-gold animate-pulse"></div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-tartan-navy text-tartan-gold border border-tartan-accent/30 uppercase tracking-wider">
                      {tune.category}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      {tune.audioUrl && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 flex items-center gap-1" title="High-res audio recording uploaded by Spud">
                          <Headphones className="w-3 h-3" />
                          <span>Studio Audio</span>
                        </span>
                      )}
                      <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-500" />
                        {tune.duration}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white font-serif">{tune.title}</h3>
                  <p className="text-xs text-gray-300 leading-relaxed">{tune.description}</p>
                </div>

                {/* Player & Management Controls */}
                <div className="mt-6 pt-4 border-t border-tartan-border/50 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      if (isThisPlaying) {
                        stopTune();
                      } else {
                        playTune(tune.title);
                      }
                    }}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
                      isThisPlaying
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-gold-gradient hover:brightness-110 text-tartan-dark'
                    }`}
                  >
                    {isThisPlaying ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-white" />
                        <span>Stop Audio</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-tartan-dark" />
                        <span>Play Sample</span>
                      </>
                    )}
                  </button>

                  {/* Admin Edit & Delete Quick Icons */}
                  {canManage ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(tune)}
                        className="p-2 rounded-lg bg-tartan-navy hover:bg-slate-700 text-tartan-gold border border-tartan-accent/40 shadow hover:scale-105 transition-all"
                        title="Edit Tune & Upload Music Track"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {deleteConfirmId === tune.id ? (
                        <div className="flex items-center gap-1 bg-red-950 p-1 rounded-lg border border-red-500">
                          <button
                            onClick={() => {
                              deleteTune(tune.id);
                              setDeleteConfirmId(null);
                            }}
                            className="text-[10px] bg-red-600 hover:bg-red-500 text-white px-2 py-0.5 rounded font-bold"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="text-[10px] text-gray-400 hover:text-white px-1"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(tune.id)}
                          className="p-2 rounded-lg bg-tartan-navy hover:bg-red-900/60 text-red-400 border border-tartan-border hover:border-red-500 shadow hover:scale-105 transition-all"
                          title="Delete Tune from Jukebox"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ) : (
                    isThisPlaying && (
                      <div className="flex items-center gap-1.5 text-xs text-tartan-gold font-medium">
                        <Volume2 className="w-4 h-4 animate-bounce" />
                        <span>Playing Live</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Tune Request Banner */}
        <div className="mt-12 bg-tartan-navy/70 rounded-2xl p-6 border border-tartan-border text-center max-w-2xl mx-auto space-y-2">
          <p className="text-sm text-gray-200">
            <span className="text-tartan-gold font-bold">Have a special song or family tune in mind?</span> Spud accommodates custom tune requests for weddings, graduations, and memorials.
          </p>
          <a
            href="#contact"
            className="inline-block text-xs font-bold text-tartan-goldLight hover:underline mt-1"
          >
            Ask Spud about special tune arrangements →
          </a>
        </div>

      </div>

      {/* Add / Edit Bagpipe Tune Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-tartan-card border border-tartan-accent/50 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="bg-tartan-navy px-6 py-4 border-b border-tartan-border flex items-center justify-between">
              <div className="flex items-center gap-2 text-tartan-gold">
                <Music className="w-5 h-5 text-tartan-gold" />
                <h3 className="text-base font-bold text-white font-serif">
                  {editingTuneId ? 'Edit Bagpipe Track & Audio' : 'Add New Bagpipe Tune to Jukebox'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTune} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-tartan-gold mb-1">
                  Tune Title *
                </label>
                <input
                  type="text"
                  required
                  value={tuneTitle}
                  onChange={(e) => setTuneTitle(e.target.value)}
                  placeholder="e.g. Highland Cathedral, Mairi's Wedding, Going Home"
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-tartan-accent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-tartan-gold mb-1">
                    Occasion Category *
                  </label>
                  <select
                    value={tuneCategory}
                    onChange={(e) => setTuneCategory(e.target.value as any)}
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-tartan-accent"
                  >
                    <option value="Wedding">Wedding Processional & Recessional</option>
                    <option value="Lament / Funeral">Lament / Funeral Farewell</option>
                    <option value="Celebration / March">Celebration / March & Ceilidh</option>
                    <option value="Traditional Scottish">Traditional Scottish Air</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-tartan-gold mb-1">
                    Track Duration
                  </label>
                  <input
                    type="text"
                    value={tuneDuration}
                    onChange={(e) => setTuneDuration(e.target.value)}
                    placeholder="e.g. 1:45"
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-tartan-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-tartan-gold mb-1">
                  Description & Musical Context
                </label>
                <textarea
                  rows={3}
                  value={tuneDescription}
                  onChange={(e) => setTuneDescription(e.target.value)}
                  placeholder="e.g. Soulful slow air traditionally played for the bride walking down the castle aisle..."
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-tartan-accent"
                />
              </div>

              {/* Audio Track Upload / URL */}
              <div className="bg-tartan-dark/90 p-4 rounded-2xl border border-tartan-border space-y-3">
                <label className="block text-xs font-bold text-tartan-gold uppercase tracking-wider flex items-center gap-2">
                  <Headphones className="w-4 h-4" />
                  <span>Custom Studio Audio Recording (MP3 / WAV / Audio File)</span>
                </label>
                
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-gold-gradient text-tartan-dark text-xs font-extrabold flex items-center gap-2 shadow-md hover:brightness-110 transition-all">
                    <Upload className="w-4 h-4" />
                    <span>{isUploading ? 'Processing File...' : 'Upload MP3 / Audio from Device'}</span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioFileUpload}
                      className="hidden"
                    />
                  </label>

                  {tuneAudioUrl && (
                    <button
                      type="button"
                      onClick={() => setTuneAudioUrl('')}
                      className="text-xs text-red-400 hover:text-red-300 underline"
                    >
                      Remove Custom Audio
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Or Direct Audio Stream URL (CDN / Cloud Storage):</label>
                  <input
                    type="text"
                    value={tuneAudioUrl}
                    onChange={(e) => setTuneAudioUrl(e.target.value)}
                    placeholder="https://.../spud-tune.mp3"
                    className="w-full bg-tartan-card border border-tartan-border rounded-xl px-3 py-2 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-tartan-accent"
                  />
                </div>

                {tuneAudioUrl && (
                  <div className="pt-2 border-t border-tartan-border/60">
                    <p className="text-xs text-emerald-400 font-semibold mb-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Audio Track Attached & Ready for Jukebox</span>
                    </p>
                    <audio controls src={tuneAudioUrl} className="w-full h-8 mt-1" />
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-tartan-border/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 text-gray-300 hover:text-white rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gold-gradient text-tartan-dark font-extrabold text-xs rounded-xl shadow-lg hover:brightness-110 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingTuneId ? 'Save Tune Changes' : 'Add Tune to Live Jukebox'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
