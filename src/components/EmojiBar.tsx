'use client';

import React, { useState } from 'react';
import { Smile, Sparkles, Flame, Heart, X, Check, Music, Castle, Laugh } from 'lucide-react';

interface EmojiBarProps {
  onSelectEmoji: (emoji: string) => void;
  label?: string;
  className?: string;
}

interface EmojiCategory {
  id: string;
  name: string;
  icon: string;
  badgeColor: string;
  emojis: string[];
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: 'scottish',
    name: '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scottish & Bagpipe',
    icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    emojis: [
      '🏴󠁧󠁢󠁳󠁣󠁴󠁿', '🥃', '🏰', '🎵', '🎶', '👑', '⛰️', '⚔️', '🛡️', 
      '🐑', '🦌', '🌊', '🌲', '🍀', '🪵', '🕯️', '🎻', '🥁'
    ]
  },
  {
    id: 'fancy-3d',
    name: '✨ 3D Fancy & Sparkle',
    icon: '✨',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    emojis: [
      '✨', '🌟', '💫', '💎', '🏆', '🥇', '🥂', '🍾', '💖', 
      '🎇', '🎆', '🎀', '🪄', '🪩', '🔮', '📯', '👑', '⭐'
    ]
  },
  {
    id: 'funny-3d',
    name: '🤪 Funny 3D & Banter',
    icon: '🤪',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    emojis: [
      '🤪', '🤣', '🤠', '🕺', '💃', '🦄', '🦖', '🎭', '🚀', 
      '👻', '👾', '🍻', '🥳', '🤩', '🥸', '🤯', '🍕', '💣', '🧨', '🎪'
    ]
  },
  {
    id: 'weddings',
    name: '❤️ Wedding & Love',
    icon: '❤️',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    emojis: [
      '👰', '🤵', '💍', '💒', '💐', '🎂', '💌', '🎉', '🎊', 
      '🤍', '💕', '🕊️', '🌹', '🥂', '🍾', '🥰', '💖', '✨'
    ]
  }
];

const QUICK_SCOTTISH_TAGS = [
  '🥃 Slàinte Mhath!',
  '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Alba gu bràth!',
  '🎵 Highland Cathedral',
  '🏰 Castle Magic ✨',
  '🍾 Huge Congratulations!',
  '👑 Masterclass Piping!',
  '🕺 Ceilidh Time!',
  '🔥 Epic Performance'
];

export const EmojiBar: React.FC<EmojiBarProps> = ({ onSelectEmoji, label = 'Add Fancy Emojis & 3D Stickers:', className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('scottish');
  const [copiedSticker, setCopiedSticker] = useState<string | null>(null);

  const handleSelect = (emoji: string) => {
    onSelectEmoji(emoji);
    setCopiedSticker(emoji);
    setTimeout(() => setCopiedSticker(null), 1200);
  };

  const currentCategory = EMOJI_CATEGORIES.find(c => c.id === activeTab) || EMOJI_CATEGORIES[0];

  return (
    <div className={`space-y-2 select-none ${className}`}>
      {/* QUICK TAP EMOJI STRIP */}
      <div className="flex items-center justify-between gap-2 flex-wrap bg-tartan-dark/70 px-3 py-2 rounded-2xl border border-tartan-border/60">
        
        {/* Quick Emojis */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-gray-400 font-medium hidden sm:inline mr-1">
            {label}
          </span>
          {['🏴󠁧󠁢󠁳󠁣󠁴󠁿', '🥃', '🏰', '🎵', '✨', '💍', '🤪', '🥂', '🥳', '💎', '🕺'].map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleSelect(emoji)}
              className="text-base sm:text-lg hover:scale-135 hover:-translate-y-1 active:scale-95 transition-all duration-150 p-1 rounded-lg hover:bg-amber-500/20 hover:drop-shadow-[0_4px_8px_rgba(217,119,6,0.6)] shrink-0"
              title={`Insert ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Expand Drawer Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            isOpen 
              ? 'bg-gold-gradient text-tartan-dark shadow-md scale-105' 
              : 'bg-tartan-navy hover:bg-slate-800 text-tartan-gold border border-tartan-border hover:border-tartan-gold/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isOpen ? 'Close Emojis' : '✨ 3D & Funny Emojis'}</span>
        </button>
      </div>

      {/* EXPANDABLE RICH 3D & FUNNY EMOJI TRAY */}
      {isOpen && (
        <div className="bg-tartan-dark/95 border border-tartan-accent/50 rounded-2xl p-4 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-2">
          
          {/* Category Switcher Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {EMOJI_CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveTab(category.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === category.id
                    ? 'bg-gold-gradient text-tartan-dark shadow scale-105'
                    : 'bg-tartan-navy text-gray-300 hover:text-white hover:bg-slate-800 border border-tartan-border'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name.replace(/^[^\s]+ /, '')}</span>
              </button>
            ))}
          </div>

          {/* Emojis Grid with 3D Hover & Glow Effect */}
          <div className="bg-tartan-navy/50 p-3.5 rounded-xl border border-tartan-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${currentCategory.badgeColor}`}>
                {currentCategory.name}
              </span>
              {copiedSticker && (
                <span className="text-[11px] text-green-400 font-bold flex items-center gap-1 animate-pulse">
                  <Check className="w-3.5 h-3.5" /> Added {copiedSticker}!
                </span>
              )}
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-12 gap-2 text-center">
              {currentCategory.emojis.map((emoji, index) => (
                <button
                  key={`${emoji}-${index}`}
                  type="button"
                  onClick={() => handleSelect(emoji)}
                  className="w-10 h-10 flex items-center justify-center text-2xl hover:scale-140 hover:-translate-y-1.5 active:scale-90 transition-transform duration-150 rounded-xl hover:bg-gradient-to-tr hover:from-amber-500/30 hover:to-amber-300/30 hover:shadow-lg hover:shadow-amber-500/20 border border-transparent hover:border-amber-400/50"
                  title={`Insert ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* QUICK 1-CLICK SCOTTISH PHRASES / STICKERS */}
          <div className="space-y-2 pt-1 border-t border-tartan-border/50">
            <div className="flex items-center gap-1.5 text-xs text-tartan-gold font-bold">
              <Castle className="w-3.5 h-3.5" />
              <span>Quick Scottish Shoutouts (Tap to Insert):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_SCOTTISH_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleSelect(` ${tag} `)}
                  className="px-3 py-1 bg-slate-800/90 hover:bg-gradient-to-r hover:from-amber-500 hover:to-amber-600 hover:text-tartan-dark text-gray-200 text-xs font-semibold rounded-lg border border-slate-700/70 hover:border-transparent transition-all shadow-sm active:scale-95"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
