'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
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
  Clock,
  Cloud,
  Loader2,
  AlertCircle,
  Search,
  Sparkle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Heart,
  Award,
  ArrowRight,
  HelpCircle,
  Filter
} from 'lucide-react';
import { BagpipeTune } from '@/types/spud';
import { EditableElement } from './EditableElement';
import { uploadToStorage } from '@/lib/firebase';

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

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeMoment, setActiveMoment] = useState<string>('All');
  const [activeInstrument, setActiveInstrument] = useState<string>('All');
  const [showTimelineGuide, setShowTimelineGuide] = useState<boolean>(true);
  const [showSmallpipesGuide, setShowSmallpipesGuide] = useState<boolean>(false);
  
  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTuneId, setEditingTuneId] = useState<string | null>(null);
  const [tuneTitle, setTuneTitle] = useState<string>('');
  const [tuneCategory, setTuneCategory] = useState<string>('Wedding');
  const [tuneWeddingMoment, setTuneWeddingMoment] = useState<string>('Walking Up the Aisle');
  const [tuneInstrumentRecommended, setTuneInstrumentRecommended] = useState<string>('Great Highland Bagpipes');
  const [tuneTempo, setTuneTempo] = useState<string>('Majestic Slow Air');
  const [tuneDuration, setTuneDuration] = useState<string>('2:30');
  const [tuneDescription, setTuneDescription] = useState<string>('');
  const [tuneFunFact, setTuneFunFact] = useState<string>('');
  const [tuneAudioUrl, setTuneAudioUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Wedding & Event Moments Definition
  const weddingMoments = [
    { id: 'All', label: 'All Repertoire', emoji: '🎵', count: tunesList.length },
    { id: 'Walking Up the Aisle', label: 'Walking Up Aisle', emoji: '👰', count: tunesList.filter(t => t.weddingMoment === 'Walking Up the Aisle').length },
    { id: 'Newlyweds Exit / Recessional', label: 'Newlyweds Exit', emoji: '🎉', count: tunesList.filter(t => t.weddingMoment === 'Newlyweds Exit / Recessional').length },
    { id: 'Signing the Register', label: 'Signing Register', emoji: '✍️', count: tunesList.filter(t => t.weddingMoment === 'Signing the Register').length },
    { id: 'Confetti & Drinks', label: 'Confetti & Drinks', emoji: '🥂', count: tunesList.filter(t => t.weddingMoment === 'Confetti & Drinks').length },
    { id: 'Top Table Entrance', label: 'Top Table Entrance', emoji: '👑', count: tunesList.filter(t => t.weddingMoment === 'Top Table Entrance').length },
    { id: 'Guests Arrival', label: 'Guests Arrival', emoji: '👋', count: tunesList.filter(t => t.weddingMoment === 'Guests Arrival').length },
    { id: 'Memorial & Lament', label: 'Memorials & Laments', emoji: '🕊️', count: tunesList.filter(t => t.weddingMoment === 'Memorial & Lament').length },
    { id: 'Burns & Galas', label: 'Burns & Galas', emoji: '🥃', count: tunesList.filter(t => t.weddingMoment === 'Burns & Galas').length },
  ];

  // Filtered Tunes computation
  const filteredTunes = useMemo(() => {
    return tunesList.filter((tune) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = tune.title.toLowerCase().includes(q);
        const matchesDesc = tune.description?.toLowerCase().includes(q);
        const matchesMoment = tune.weddingMoment?.toLowerCase().includes(q);
        const matchesFact = tune.funFact?.toLowerCase().includes(q);
        const matchesCategory = tune.category?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesMoment && !matchesFact && !matchesCategory) {
          return false;
        }
      }

      // 2. Wedding Moment Filter
      if (activeMoment !== 'All') {
        if (tune.weddingMoment !== activeMoment) {
          return false;
        }
      }

      // 3. Instrument Filter
      if (activeInstrument !== 'All') {
        if (activeInstrument === 'Great Highland Bagpipes' && tune.instrumentRecommended === 'Scottish Smallpipes') {
          return false;
        }
        if (activeInstrument === 'Scottish Smallpipes' && tune.instrumentRecommended === 'Great Highland Bagpipes') {
          return false;
        }
      }

      return true;
    });
  }, [tunesList, searchQuery, activeMoment, activeInstrument]);

  const handleOpenAddModal = () => {
    setEditingTuneId(null);
    setTuneTitle('');
    setTuneCategory('Wedding');
    setTuneWeddingMoment('Walking Up the Aisle');
    setTuneInstrumentRecommended('Great Highland Bagpipes');
    setTuneTempo('Majestic Slow Air');
    setTuneDuration('2:30');
    setTuneDescription('');
    setTuneFunFact('');
    setTuneAudioUrl('');
    setUploadStatus('');
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tune: BagpipeTune) => {
    setEditingTuneId(tune.id);
    setTuneTitle(tune.title);
    setTuneCategory(tune.category || 'Wedding');
    setTuneWeddingMoment(tune.weddingMoment || 'Walking Up the Aisle');
    setTuneInstrumentRecommended(tune.instrumentRecommended || 'Great Highland Bagpipes');
    setTuneTempo(tune.tempo || 'Majestic Slow Air');
    setTuneDuration(tune.duration || '2:30');
    setTuneDescription(tune.description || '');
    setTuneFunFact(tune.funFact || '');
    setTuneAudioUrl(tune.audioUrl || '');
    setUploadStatus('');
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleAudioFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 40 * 1024 * 1024) {
      setUploadError('Audio file is too large. Please choose an audio file under 40MB.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadStatus(`Uploading "${file.name}" to Firebase Cloud Storage...`);

    try {
      const cloudUrl = await uploadToStorage(file, 'audio_tunes');
      setTuneAudioUrl(cloudUrl);
      setUploadStatus(`✓ Successfully uploaded & saved to Firebase Storage!`);

      try {
        const audioTest = new Audio();
        audioTest.src = URL.createObjectURL(file);
        audioTest.onloadedmetadata = () => {
          const totalSec = Math.round(audioTest.duration);
          if (!isNaN(totalSec) && totalSec > 0) {
            const mins = Math.floor(totalSec / 60);
            const secs = totalSec % 60;
            setTuneDuration(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
          }
        };
      } catch {}
    } catch (err: any) {
      console.error('Firebase Storage upload error:', err);
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setTuneAudioUrl(reader.result);
            setUploadStatus('Saved locally in browser.');
          }
        };
        reader.readAsDataURL(file);
      } catch {
        setUploadError(err?.message || 'Failed to upload audio file. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveTune = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tuneTitle.trim()) return;

    const payload = {
      title: tuneTitle,
      category: tuneCategory,
      weddingMoment: tuneWeddingMoment,
      instrumentRecommended: tuneInstrumentRecommended,
      tempo: tuneTempo,
      duration: tuneDuration,
      description: tuneDescription,
      funFact: tuneFunFact,
      audioUrl: tuneAudioUrl || undefined
    };

    if (editingTuneId) {
      updateTune(editingTuneId, payload);
    } else {
      addTune(payload);
    }

    setIsModalOpen(false);
  };

  const canManage = isAdminLoggedIn || isVisualEditMode;

  return (
    <section id="tunes" className="py-20 bg-tartan-dark relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tartan-accent/15 border border-tartan-accent/40 text-tartan-gold text-xs font-semibold shadow-sm">
            <Music className="w-4 h-4 shrink-0 text-tartan-gold" />
            <EditableElement
              id="tunes-header-badge"
              tag="span"
              defaultContent="The Definitive Scottish Repertoire & Audio Jukebox"
              label="Tunes Header Badge"
              section="tunes"
            />
          </div>
          <EditableElement
            id="tunes-header-title"
            tag="h2"
            defaultContent="Authentic Scottish Bagpipe Music for Weddings & Occasions"
            className="text-3xl sm:text-5xl font-extrabold text-white font-serif tracking-tight leading-tight"
            label="Tunes Header Title"
            section="tunes"
          />
          <EditableElement
            id="tunes-header-desc"
            tag="p"
            defaultContent="From majestic aisle processionals like Highland Cathedral to joyous recesionals, clapping banquet marches, and soulful laments. Listen to real audio recordings and plan the soundtrack to your Scottish day."
            className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl mx-auto"
            label="Tunes Header Description"
            section="tunes"
          />
        </div>

        {/* ── 1. INTERACTIVE WEDDING TIMELINE MUSIC GUIDE (Collapsible) ── */}
        <div className="mb-10 bg-gradient-to-br from-tartan-navy/90 via-tartan-dark to-tartan-navy/80 rounded-3xl p-6 sm:p-8 border border-tartan-border shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-tartan-accent/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-tartan-gold/15 border border-tartan-gold/40 flex items-center justify-center text-tartan-gold shadow-md">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white font-serif flex items-center gap-2">
                  <span>How Bagpipe Music Shapes Your Wedding Ceremony</span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-tartan-gold/20 text-tartan-gold border border-tartan-gold/40 font-mono">
                    6 Key Moments
                  </span>
                </h3>
                <p className="text-xs text-gray-300">
                  Click any stage below to instantly filter tunes recommended for that exact moment of your day.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowTimelineGuide(!showTimelineGuide)}
                className="text-xs text-tartan-gold hover:text-yellow-300 flex items-center gap-1 font-semibold px-3 py-1.5 rounded-xl bg-tartan-dark border border-tartan-border transition-colors"
              >
                <span>{showTimelineGuide ? 'Hide Guide' : 'Show Guide'}</span>
                {showTimelineGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {showTimelineGuide && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {[
                {
                  step: '1',
                  moment: 'Guests Arrival',
                  title: "1. Welcoming Your Guests",
                  tunes: "Murdo's Wedding · Hornpipes & Jigs",
                  desc: "As guests arrive at the venue (30-45 mins before), lively hornpipes and jaunty marches build excitement and set the celebratory tone.",
                  badge: "👋 Upbeat & Jaunty"
                },
                {
                  step: '2',
                  moment: 'Walking Up the Aisle',
                  title: "2. Piping Bride Up the Aisle",
                  tunes: "Highland Cathedral · Skye Boat Song · Caledonia",
                  desc: "One of the most emotional moments of your life. Grand, majestic slow airs played on the Great Highland Bagpipes or mellow Smallpipes.",
                  badge: "👰 Majestic Slow Air"
                },
                {
                  step: '3',
                  moment: 'Signing the Register',
                  title: "3. Signing the Marriage Register",
                  tunes: "Mingulay Boat Song · Red, Red Rose · Wild Mountain Thyme",
                  desc: "Gentle romantic melodies while you sign the schedule, followed by a cheerful jig to prepare the room for celebration.",
                  badge: "✍️ Romantic & Lyrical"
                },
                {
                  step: '4',
                  moment: 'Newlyweds Exit / Recessional',
                  title: "4. Recessional Down the Aisle",
                  tunes: "The Highland Wedding · Mairi's Wedding · Scotland the Brave",
                  desc: "You are now officially married! Triumphant, rousing marches deliver guaranteed cheers, applause, and huge energy as you exit.",
                  badge: "🎉 Rousing & Triumphant"
                },
                {
                  step: '5',
                  moment: 'Confetti & Drinks',
                  title: "5. Confetti Shower & Drinks",
                  tunes: "Heilan Laddie · The Black Bear · Cock o' the North",
                  desc: "Fast, exhilarating regimental quicksteps as you run the confetti gauntlet, followed by cocktail hour tunes for photos.",
                  badge: "🥂 High Energy March"
                },
                {
                  step: '6',
                  moment: 'Top Table Entrance',
                  title: "6. Grand Banquet Top Table Entrance",
                  tunes: "Killiecrankie · Campbeltown Loch · Piper's Toast",
                  desc: "Driving rhythmic marches that get the entire dining room clapping in unison, topped off with Spud's Traditional Piper's Toast.",
                  badge: "👑 Clapping Banquet March"
                },
              ].map((item) => (
                <button
                  key={item.step}
                  type="button"
                  onClick={() => setActiveMoment(item.moment)}
                  className={`p-4 rounded-2xl border text-left transition-all relative group flex flex-col justify-between ${
                    activeMoment === item.moment
                      ? 'bg-tartan-gold/15 border-tartan-gold ring-1 ring-tartan-gold shadow-lg'
                      : 'bg-tartan-dark/70 hover:bg-tartan-dark border-tartan-border/70 hover:border-tartan-gold/50'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-tartan-navy text-tartan-gold border border-tartan-border/60">
                        {item.badge}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400 group-hover:text-tartan-gold transition-colors flex items-center gap-0.5">
                        <span>View Tunes</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white font-serif">{item.title}</h4>
                    <p className="text-[11px] text-gray-300 leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-tartan-border/40 text-[10px] text-tartan-gold font-medium">
                    <span>Popular: </span>
                    <span className="text-gray-300">{item.tunes}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* ── Spotlight: Scottish Smallpipes vs. Great Highland Pipes ── */}
          <div className="mt-6 pt-6 border-t border-tartan-border/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎺</span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  Did you know? Spud plays both Great Highland Bagpipes & Mellow Scottish Smallpipes
                </h4>
                <p className="text-[11px] text-gray-300">
                  Smallpipes are bellows-blown and quieter—ideal for intimate indoor chapels, registry offices, and gentle aisle walks.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActiveInstrument(activeInstrument === 'Scottish Smallpipes' ? 'All' : 'Scottish Smallpipes');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                  activeInstrument === 'Scottish Smallpipes'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md font-bold'
                    : 'bg-tartan-dark text-blue-300 border-blue-800/60 hover:bg-blue-950/60'
                }`}
              >
                <span>Filter Mellow Smallpipes</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveInstrument(activeInstrument === 'Great Highland Bagpipes' ? 'All' : 'Great Highland Bagpipes');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                  activeInstrument === 'Great Highland Bagpipes'
                    ? 'bg-tartan-gold text-tartan-dark border-tartan-gold font-bold shadow-md'
                    : 'bg-tartan-dark text-tartan-gold border-tartan-border hover:bg-tartan-navy'
                }`}
              >
                <span>Filter Great Highland Pipes</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── 2. SEARCH & MOMENT FILTER BAR ── */}
        <div className="space-y-4 mb-8">
          
          {/* Search Bar & Stats */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tunes by title, Outlander, moment, or Burns..."
                className="w-full bg-tartan-navy/90 border border-tartan-border rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-400 text-xs focus:outline-none focus:border-tartan-accent font-medium shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
              <span className="text-xs text-gray-400 font-mono">
                Showing <strong className="text-tartan-gold">{filteredTunes.length}</strong> of {tunesList.length} Scottish Tunes
              </span>

              {canManage && (
                <button
                  onClick={handleOpenAddModal}
                  className="px-3.5 py-2 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg hover:brightness-110 active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Track / Upload Audio</span>
                </button>
              )}
            </div>
          </div>

          {/* Moment Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {weddingMoments.map((m) => {
              const isActive = activeMoment === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActiveMoment(m.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 ${
                    isActive 
                      ? 'bg-gold-gradient text-tartan-dark font-extrabold shadow-lg scale-105' 
                      : 'bg-tartan-card text-gray-300 hover:text-white hover:bg-tartan-navy border border-tartan-border/60'
                  }`}
                >
                  <span>{m.emoji}</span>
                  <span>{m.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-black/20 text-tartan-dark' : 'bg-tartan-dark text-gray-400'
                  }`}>
                    {m.id === 'All' ? tunesList.length : m.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Filter Indicators */}
          {(activeMoment !== 'All' || activeInstrument !== 'All' || searchQuery) && (
            <div className="flex items-center gap-2 flex-wrap text-xs text-gray-400 pt-1">
              <span>Active Filters:</span>
              {activeMoment !== 'All' && (
                <span className="px-2.5 py-1 rounded-lg bg-tartan-gold/15 text-tartan-gold border border-tartan-gold/40 flex items-center gap-1">
                  <span>Moment: {activeMoment}</span>
                  <button onClick={() => setActiveMoment('All')} className="hover:text-white ml-1">✕</button>
                </span>
              )}
              {activeInstrument !== 'All' && (
                <span className="px-2.5 py-1 rounded-lg bg-blue-950 text-blue-300 border border-blue-800 flex items-center gap-1">
                  <span>Instrument: {activeInstrument}</span>
                  <button onClick={() => setActiveInstrument('All')} className="hover:text-white ml-1">✕</button>
                </span>
              )}
              {searchQuery && (
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-gray-200 border border-slate-700 flex items-center gap-1">
                  <span>Keyword: &quot;{searchQuery}&quot;</span>
                  <button onClick={() => setSearchQuery('')} className="hover:text-white ml-1">✕</button>
                </span>
              )}
              <button
                onClick={() => {
                  setActiveMoment('All');
                  setActiveInstrument('All');
                  setSearchQuery('');
                }}
                className="text-xs text-tartan-accent hover:underline font-semibold ml-2"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

        {/* ── 3. JUKEBOX TUNE CARDS GRID ── */}
        {filteredTunes.length === 0 ? (
          <div className="text-center py-16 bg-tartan-card rounded-3xl border border-tartan-border space-y-3">
            <Music className="w-12 h-12 text-gray-600 mx-auto" />
            <h3 className="text-lg font-bold text-white font-serif">No tunes matched your filter</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Try searching for a different keyword or click &quot;Reset All Filters&quot; to view Spud&apos;s full Highland repertoire.
            </p>
            <button
              onClick={() => {
                setActiveMoment('All');
                setActiveInstrument('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-gold-gradient text-tartan-dark font-bold text-xs shadow-md"
            >
              Show All Tunes ({tunesList.length})
            </button>
          </div>
        ) : (
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
                  {/* Active Playing Equalizer Bar */}
                  {isThisPlaying && (
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-tartan-accent via-yellow-400 to-tartan-gold animate-pulse" />
                  )}

                  <div className="space-y-3.5">
                    
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {tune.weddingMoment && (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-tartan-gold/15 text-tartan-gold border border-tartan-gold/40">
                            {tune.weddingMoment}
                          </span>
                        )}
                        {tune.instrumentRecommended && (
                          <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${
                            tune.instrumentRecommended.includes('Smallpipes')
                              ? 'bg-blue-950/70 text-blue-300 border-blue-800/40'
                              : 'bg-tartan-navy text-gray-300 border-tartan-border/50'
                          }`}>
                            {tune.instrumentRecommended}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
                        {tune.audioUrl && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 flex items-center gap-1" title="High-res studio recording uploaded by Spud">
                            <Headphones className="w-2.5 h-2.5" />
                            <span>Studio MP3</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-500" />
                          {tune.duration}
                        </span>
                      </div>
                    </div>

                    {/* Title & Tempo */}
                    <div>
                      <h3 className="text-xl font-bold text-white font-serif tracking-tight leading-snug group-hover:text-tartan-gold transition-colors">
                        {tune.title}
                      </h3>
                      {tune.tempo && (
                        <p className="text-[11px] text-tartan-accent font-medium mt-0.5">
                          Tempo: {tune.tempo}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {tune.description}
                    </p>

                    {/* Historical Fun Fact / Lore Box */}
                    {tune.funFact && (
                      <div className="bg-tartan-dark/80 p-3 rounded-xl border border-tartan-border/80 text-[11px] text-gray-300 space-y-1">
                        <span className="text-[10px] font-bold text-tartan-gold uppercase tracking-wider flex items-center gap-1">
                          <Sparkle className="w-3 h-3 text-tartan-gold" />
                          <span>Historical Lore &amp; Fun Fact:</span>
                        </span>
                        <p className="italic text-gray-300 leading-normal">
                          &quot;{tune.funFact}&quot;
                        </p>
                      </div>
                    )}

                  </div>

                  {/* Player Controls & Request CTA */}
                  <div className="mt-6 pt-4 border-t border-tartan-border/50 space-y-3">
                    
                    <div className="flex items-center justify-between gap-2">
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
                            ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
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

                      {/* Request CTA for booking */}
                      <Link
                        href={`/booking?service=wedding&tune=${encodeURIComponent(tune.title)}`}
                        className="text-[11px] font-semibold text-gray-300 hover:text-tartan-gold flex items-center gap-1 transition-colors group/req"
                        title="Pre-select this tune in your booking inquiry"
                      >
                        <Heart className="w-3 h-3 text-tartan-accent group-hover/req:scale-110 transition-transform" />
                        <span>Request for My Day</span>
                      </Link>
                    </div>

                    {/* Admin Edit & Delete Quick Icons */}
                    {canManage && (
                      <div className="flex items-center justify-between pt-2 border-t border-tartan-border/40 text-[10px]">
                        <span className="text-gray-400 font-mono">ID: {tune.id}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(tune)}
                            className="px-2.5 py-1 rounded-lg bg-tartan-navy hover:bg-slate-700 text-tartan-gold border border-tartan-accent/40 shadow flex items-center gap-1"
                            title="Edit Tune & Upload Music Track"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit / Upload</span>
                          </button>

                          {deleteConfirmId === tune.id ? (
                            <div className="flex items-center gap-1 bg-red-950 p-1 rounded-lg border border-red-500">
                              <button
                                onClick={() => {
                                  deleteTune(tune.id);
                                  setDeleteConfirmId(null);
                                }}
                                className="text-[9px] bg-red-600 hover:bg-red-500 text-white px-2 py-0.5 rounded font-bold"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="text-[9px] text-gray-400 hover:text-white px-1"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(tune.id)}
                              className="p-1 rounded-lg bg-tartan-navy hover:bg-red-900/60 text-red-400 border border-tartan-border hover:border-red-500"
                              title="Delete Tune from Jukebox"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* ── 4. FOOTER CALLOUT: CUSTOM TUNE REQUESTS ── */}
        <div className="mt-14 bg-tartan-navy/70 rounded-3xl p-6 sm:p-8 border border-tartan-border flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-bold text-white font-serif flex items-center justify-center sm:justify-start gap-2">
              <Sparkles className="w-5 h-5 text-tartan-gold" />
              <span>Have a Custom Song or Family Tune in Mind?</span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 max-w-xl leading-relaxed">
              Spud regularly arranges special contemporary songs, movie themes, rock anthems, and Gaelic family heirlooms for the bagpipes upon request.
            </p>
          </div>

          <Link
            href="/contact?topic=custom_tune"
            className="px-6 py-3 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all whitespace-nowrap flex items-center gap-2 shrink-0"
          >
            <span>Request a Custom Song</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>

      {/* ── 5. ADD / EDIT TUNE MODAL WITH DIRECT CLOUD UPLOAD ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-tartan-card border border-tartan-border rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto my-8">
            
            <div className="flex items-center justify-between pb-4 border-b border-tartan-border">
              <div className="flex items-center gap-2">
                <Music className="w-6 h-6 text-tartan-gold" />
                <h3 className="text-lg font-bold text-white font-serif">
                  {editingTuneId ? 'Edit Bagpipe Tune & Music Track' : 'Add New Bagpipe Track to Jukebox'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTune} className="space-y-4">
              
              {/* Row 1: Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-tartan-gold mb-1">
                    Tune Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={tuneTitle}
                    onChange={(e) => setTuneTitle(e.target.value)}
                    placeholder="e.g. Highland Cathedral"
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-tartan-accent font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-tartan-gold mb-1">
                    Category *
                  </label>
                  <select
                    value={tuneCategory}
                    onChange={(e) => setTuneCategory(e.target.value)}
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-tartan-accent"
                  >
                    <option value="Wedding">Wedding</option>
                    <option value="Celebration / March">Celebration / March</option>
                    <option value="Lament / Funeral">Lament / Funeral</option>
                    <option value="Traditional Scottish">Traditional Scottish</option>
                    <option value="Burns & Hogmanay">Burns &amp; Hogmanay</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Wedding Moment & Instrument Recommendation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-tartan-gold mb-1">
                    Wedding &amp; Event Moment
                  </label>
                  <select
                    value={tuneWeddingMoment}
                    onChange={(e) => setTuneWeddingMoment(e.target.value)}
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-tartan-accent font-medium"
                  >
                    <option value="Walking Up the Aisle">👰 Walking Up the Aisle (Processional)</option>
                    <option value="Newlyweds Exit / Recessional">🎉 Newlyweds Exit (Recessional)</option>
                    <option value="Signing the Register">✍️ Signing the Marriage Register</option>
                    <option value="Confetti & Drinks">🥂 Confetti Shower &amp; Drinks</option>
                    <option value="Top Table Entrance">👑 Top Table Banquet Entrance</option>
                    <option value="Guests Arrival">👋 Guests Arrival &amp; Welcome</option>
                    <option value="Memorial & Lament">🕊️ Memorial &amp; Funeral Lament</option>
                    <option value="Burns & Galas">🥃 Burns Night &amp; Castle Galas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-tartan-gold mb-1">
                    Instrument Recommendation
                  </label>
                  <select
                    value={tuneInstrumentRecommended}
                    onChange={(e) => setTuneInstrumentRecommended(e.target.value)}
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-tartan-accent font-medium"
                  >
                    <option value="Great Highland Bagpipes">Great Highland Bagpipes (Full Grandeur)</option>
                    <option value="Scottish Smallpipes">Scottish Smallpipes (Mellow / Indoor)</option>
                    <option value="Choice / Both">Choice / Both</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Tempo & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-tartan-gold mb-1">
                    Tempo &amp; Musical Character
                  </label>
                  <select
                    value={tuneTempo}
                    onChange={(e) => setTuneTempo(e.target.value)}
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-tartan-accent"
                  >
                    <option value="Majestic Slow Air">Majestic Slow Air</option>
                    <option value="Jaunty March">Jaunty March</option>
                    <option value="Rousing Quickstep">Rousing Quickstep</option>
                    <option value="Lively Hornpipe / Jig">Lively Hornpipe / Jig</option>
                    <option value="Heartfelt Lament">Heartfelt Lament</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-tartan-gold mb-1">
                    Duration (Minutes:Seconds)
                  </label>
                  <input
                    type="text"
                    value={tuneDuration}
                    onChange={(e) => setTuneDuration(e.target.value)}
                    placeholder="e.g. 2:45"
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-tartan-accent font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-tartan-gold mb-1">
                  Description &amp; Context
                </label>
                <textarea
                  rows={2}
                  value={tuneDescription}
                  onChange={(e) => setTuneDescription(e.target.value)}
                  placeholder="e.g. Soulful slow air traditionally played for the bride walking down the castle aisle..."
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-tartan-accent"
                />
              </div>

              {/* Historical Fun Fact & Lore */}
              <div>
                <label className="block text-xs font-semibold text-tartan-gold mb-1">
                  Historical Lore &amp; Fun Fact (Optional)
                </label>
                <textarea
                  rows={2}
                  value={tuneFunFact}
                  onChange={(e) => setTuneFunFact(e.target.value)}
                  placeholder="e.g. Featured in Outlander; composed by Queen Victoria's personal piper in 1856..."
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-tartan-accent"
                />
              </div>

              {/* Audio Track Upload directly to Firebase Storage */}
              <div className="bg-tartan-dark/90 p-4 rounded-2xl border border-tartan-border space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-tartan-gold uppercase tracking-wider flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-tartan-gold" />
                    <span>Studio Audio Track (MP3 / WAV / Cloud Stream)</span>
                  </label>
                  <span className="text-[10px] text-blue-300 font-mono flex items-center gap-1 bg-blue-950/70 px-2 py-0.5 rounded-full border border-blue-800/40">
                    <Cloud className="w-3 h-3 text-blue-400" />
                    <span>Firebase Storage</span>
                  </span>
                </div>
                
                <div className="flex items-center gap-3 flex-wrap">
                  <label className={`cursor-pointer px-4 py-2.5 rounded-xl bg-gold-gradient text-tartan-dark text-xs font-extrabold flex items-center gap-2 shadow-md hover:brightness-110 transition-all ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}>
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span>{isUploading ? 'Uploading to Cloud Storage...' : 'Upload MP3 / Audio from Device'}</span>
                    <input
                      type="file"
                      accept="audio/*"
                      disabled={isUploading}
                      onChange={handleAudioFileUpload}
                      className="hidden"
                    />
                  </label>

                  {tuneAudioUrl && !isUploading && (
                    <button
                      type="button"
                      onClick={() => {
                        setTuneAudioUrl('');
                        setUploadStatus('');
                      }}
                      className="text-xs text-red-400 hover:text-red-300 underline"
                    >
                      Remove Audio Track
                    </button>
                  )}
                </div>

                {/* Upload Status & Error Banner */}
                {uploadStatus && (
                  <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5 bg-emerald-950/40 p-2 rounded-lg border border-emerald-800/40">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                    <span>{uploadStatus}</span>
                  </p>
                )}

                {uploadError && (
                  <p className="text-[11px] text-red-400 font-medium flex items-center gap-1.5 bg-red-950/40 p-2 rounded-lg border border-red-800/40">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                    <span>{uploadError}</span>
                  </p>
                )}

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Permanent Cloud Storage / CDN Audio URL:</label>
                  <input
                    type="text"
                    value={tuneAudioUrl}
                    onChange={(e) => setTuneAudioUrl(e.target.value)}
                    placeholder="https://firebasestorage.googleapis.com/.../tune.mp3"
                    className="w-full bg-tartan-card border border-tartan-border rounded-xl px-3 py-2 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-tartan-accent font-mono"
                  />
                </div>

                {tuneAudioUrl && (
                  <div className="pt-2 border-t border-tartan-border/60">
                    <p className="text-xs text-emerald-400 font-semibold mb-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Audio Track Active &amp; Streamable Online</span>
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
