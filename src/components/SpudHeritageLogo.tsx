'use client';

import React from 'react';
import Image from 'next/image';

interface SpudHeritageLogoProps {
  className?: string;
  variant?: 'crest' | 'icon' | 'horizontal' | 'badge';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  showEst?: boolean;
}

export const SpudHeritageLogo: React.FC<SpudHeritageLogoProps> = ({
  className = '',
  variant = 'crest',
  size = 'md',
  showEst = true
}) => {
  // Dimension presets
  const sizeStyles = {
    xs: 'w-6 h-6',
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-36 h-36',
    custom: ''
  };

  // 1. Icon Only Variant (For Navbar avatar, Favicon, PWA badges)
  if (variant === 'icon') {
    return (
      <div className={`relative flex items-center justify-center shrink-0 ${size !== 'custom' ? sizeStyles[size] : ''} ${className}`}>
        <svg 
          viewBox="0 0 200 240" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            <linearGradient id="spudGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF2B2" />
              <stop offset="25%" stopColor="#DFBF73" />
              <stop offset="50%" stopColor="#C69E45" />
              <stop offset="75%" stopColor="#DFBF73" />
              <stop offset="100%" stopColor="#9C7728" />
            </linearGradient>
            <linearGradient id="celticRingGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#B8933A" />
              <stop offset="50%" stopColor="#E9D392" />
              <stop offset="100%" stopColor="#8C6820" />
            </linearGradient>
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Bagpipe Pipes Silhouette (Drones & Chanters) */}
          <g fill="url(#spudGoldGrad)">
            {/* 1. Bass Drone (Tallest Center) */}
            <path d="M 98 12 L 102 12 L 103 26 Q 100 32 97 26 Z" />
            <rect x="96.5" y="27" width="7" height="12" rx="1.5" />
            <rect x="97" y="40" width="6" height="50" rx="1" />
            <rect x="95" y="91" width="10" height="6" rx="1" />
            <rect x="97" y="98" width="6" height="65" rx="1" />
            <rect x="95" y="164" width="10" height="18" rx="2" />

            {/* 2. Tenor Drone Left */}
            <path d="M 69 46 L 73 46 L 74 58 Q 71 63 68 58 Z" />
            <rect x="67.5" y="59" width="7" height="10" rx="1.5" />
            <rect x="68" y="70" width="6" height="40" rx="1" />
            <rect x="66" y="111" width="10" height="5" rx="1" />
            <rect x="68" y="117" width="6" height="48" rx="1" />
            <rect x="66" y="166" width="10" height="16" rx="2" />

            {/* 3. Tenor Drone Right */}
            <path d="M 127 78 L 131 78 L 132 88 Q 129 93 126 88 Z" />
            <rect x="125.5" y="89" width="7" height="8" rx="1" />
            <rect x="126" y="98" width="6" height="35" rx="1" />
            <rect x="124" y="134" width="10" height="5" rx="1" />
            <rect x="126" y="140" width="6" height="28" rx="1" />
            <rect x="124" y="169" width="10" height="13" rx="2" />

            {/* 4. Blowpipe / Chanter Far Right */}
            <path d="M 152 104 L 154 104 L 155 112 L 151 112 Z" />
            <rect x="150" y="113" width="6" height="18" rx="1" />
            <rect x="149" y="132" width="7" height="4" rx="0.5" />
            <rect x="150.5" y="137" width="4.5" height="32" rx="0.8" />
            <rect x="148.5" y="170" width="8.5" height="12" rx="1.5" />
          </g>

          {/* Celtic Crescent Swoosh / Ring Wrapping Around Base */}
          <path 
            d="M 112 118 C 85 120 62 135 55 160 C 47 188 64 216 98 221 C 132 226 164 205 166 172 C 167 154 158 141 144 135 C 158 152 153 186 128 198 C 104 210 76 195 72 172 C 68 148 88 128 112 118 Z" 
            fill="url(#celticRingGrad)"
            opacity="0.95"
          />

          {/* Inner Accent Swoosh */}
          <path 
            d="M 125 190 C 145 180 157 160 156 142 C 150 158 138 174 125 190 Z" 
            fill="url(#spudGoldGrad)"
            opacity="0.8"
          />
        </svg>
      </div>
    );
  }

  // 2. Horizontal Header / Brand Variant
  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-3.5 ${className}`}>
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-tartan-accent/40 via-yellow-500/20 to-amber-700/40 p-0.5 border border-tartan-accent/60 shadow-lg shrink-0 flex items-center justify-center">
          <SpudHeritageLogo variant="icon" size="custom" className="w-8 h-8" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-lg md:text-xl font-extrabold tracking-wider text-white font-serif uppercase leading-tight">
              Spud The Piper
            </span>
            <span className="hidden sm:inline-block bg-tartan-red/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider border border-red-400/80 shadow-sm">
              Scotland
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-tartan-gold tracking-widest uppercase font-semibold">
            <span>Highland Bagpiper</span>
            {showEst && (
              <>
                <span className="text-slate-500">•</span>
                <span className="font-serif italic font-normal text-tartan-goldLight capitalize tracking-normal">Est. 1999</span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. Official Heritage Badge / Trust Mark (Compact circular crest)
  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-tartan-card via-tartan-navy to-tartan-dark border border-tartan-accent/50 shadow-xl ${className}`}>
        <div className="w-8 h-8 shrink-0">
          <SpudHeritageLogo variant="icon" size="custom" className="w-8 h-8" />
        </div>
        <div className="text-left">
          <span className="block text-[11px] font-bold text-white uppercase tracking-wider font-serif">
            Spud The Piper
          </span>
          <span className="block text-[10px] text-tartan-gold font-serif italic">
            Authentic Scottish Heritage • Est. 1999
          </span>
        </div>
      </div>
    );
  }

  // 4. Default: Full Crest Emblem with Pipes, Celtic Ring, Typography & Est. 1999
  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      {/* Upper Pipes & Celtic Ring */}
      <div className="relative w-28 sm:w-36 h-36 sm:h-44 flex items-center justify-center mb-1">
        <SpudHeritageLogo variant="icon" size="custom" className="w-full h-full" />
      </div>

      {/* Celtic Insular Typography */}
      <div className="space-y-0.5">
        <h3 className="text-sm sm:text-base font-extrabold tracking-[0.25em] text-tartan-gold uppercase font-serif">
          Spud The Piper
        </h3>
        {showEst && (
          <p className="text-xs sm:text-sm text-tartan-goldLight font-serif italic tracking-wider">
            Est. 1999
          </p>
        )}
      </div>
    </div>
  );
};
