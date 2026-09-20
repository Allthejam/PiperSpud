'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
  Phone, 
  Mail,
  Volume2, 
  VolumeX, 
  Menu, 
  X,
  Calendar,
  ChevronDown,
  Sparkles,
  Shield,
  HelpCircle,
  Star,
  Shirt,
  Music,
  Users,
  Compass,
  Info
} from 'lucide-react';

interface NavItem {
  label: string;
  href?: string;
  children?: {
    label: string;
    href: string;
    desc?: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { 
    isMounted,
    isAdminLoggedIn, 
    currentPlayingTune, 
    stopTune, 
    playTune
  } = useApp();

  const isRealAdmin = isMounted && isAdminLoggedIn;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpandedGroups, setMobileExpandedGroups] = useState<{ [key: string]: boolean }>({
    'Home': true,
    'Services': true,
    'Reviews': true
  });

  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (label: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const toggleMobileGroup = (label: string) => {
    setMobileExpandedGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  // Structured Nav with Sub-menus
  const navItems: NavItem[] = [
    {
      label: 'Home',
      href: '/',
      children: [
        { label: 'Welcome / Home', href: '/', desc: 'Main Highland Overview & Hero', icon: Compass },
        { label: 'About Spud', href: '/about', desc: '40+ Years of Piping Heritage', icon: Info },
      ]
    },
    {
      label: 'Services',
      href: '/services',
      children: [
        { label: 'All Services & Packages', href: '/services', desc: 'Weddings, Castles, Funerals & Corporate', icon: Sparkles },
        { label: 'Highland Attire & Tartans', href: '/attire', desc: 'No. 1 Feather Bonnet, Royal Stewart & Modern', icon: Shirt },
      ]
    },
    {
      label: 'Tunes',
      href: '/tunes',
    },
    {
      label: 'Community',
      href: '/social',
    },
    {
      label: 'Reviews',
      href: '/reviews',
      children: [
        { label: 'Client Reviews & Awards', href: '/reviews', desc: 'Voted Best Scottish Wedding Entertainer', icon: Star },
        { label: 'Frequently Asked Questions', href: '/faq', desc: 'Booking, Logistics, Repertoire & Advice', icon: HelpCircle },
      ]
    },
    {
      label: 'Contact',
      href: '/contact',
    }
  ];

  return (
    <>
      {/* 1. TOP NARROW UTILITY BAR */}
      <div className={`bg-tartan-navy/95 border-b border-tartan-border/60 text-gray-300 text-xs py-1.5 transition-all ${isRealAdmin ? 'mt-10' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between flex-wrap gap-2">
          
          {/* Direct Phone & Email Links */}
          <div className="flex items-center gap-2 sm:gap-4 text-[12px] font-medium">
            <a 
              href="tel:07793491367" 
              className="flex items-center gap-1.5 text-gray-300 hover:text-tartan-gold transition-colors"
            >
              <Phone className="w-3 h-3 text-tartan-gold" />
              <span>Tel: <strong className="text-tartan-gold font-bold">07793 491367</strong></span>
            </a>

            <span className="text-slate-600 select-none">|</span>

            <a 
              href="mailto:spud@spudthepiper.co.uk" 
              className="flex items-center gap-1.5 text-gray-300 hover:text-tartan-gold transition-colors"
            >
              <Mail className="w-3 h-3 text-tartan-gold" />
              <span>Email: <strong className="text-tartan-gold font-bold">spud@spudthepiper.co.uk</strong></span>
            </a>
          </div>

          {/* Right Tagline */}
          <div className="hidden md:flex items-center gap-2 text-[11px] text-tartan-goldLight tracking-wide">
            <span>🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland&apos;s Premier Highland Bagpiper</span>
            <span className="text-slate-600">•</span>
            <span>Available UK & Worldwide</span>
          </div>

        </div>
      </div>

      {/* 2. PRIMARY MAIN HEADER & CLEAN MENU */}
      <header className="sticky top-0 z-40 bg-tartan-dark/95 backdrop-blur-md border-b border-tartan-accent/30 transition-all shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 py-2">
            
            {/* Logo / Brand */}
            <Link href="/" className="flex items-center gap-3 cursor-pointer group shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-tartan-accent via-yellow-500 to-amber-700 p-0.5 shadow-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-tartan-dark rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold font-serif text-tartan-gold">S</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg md:text-xl font-extrabold tracking-tight text-white font-serif uppercase">
                    Spud The Piper
                  </span>
                  <span className="hidden sm:inline-block bg-tartan-red/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider border border-red-400">
                    Scotland
                  </span>
                </div>
                <p className="text-[10px] text-tartan-gold tracking-widest uppercase font-semibold">
                  Highland Bagpiper For Hire
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links with Dropdowns */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
              {navItems.map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                const isDirectActive = item.href && pathname === item.href;
                const isChildActive = hasChildren && item.children?.some(c => c.href === pathname);
                const isActive = isDirectActive || isChildActive;
                const isOpen = activeDropdown === item.label;

                if (hasChildren) {
                  return (
                    <div
                      key={item.label}
                      className="relative"
                      onMouseEnter={() => handleMouseEnter(item.label)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <button
                        onClick={() => setActiveDropdown(isOpen ? null : item.label)}
                        className={`transition-all py-2 px-3 rounded-xl text-[13px] font-bold tracking-wide flex items-center gap-1.5 ${
                          isActive
                            ? 'text-tartan-dark bg-tartan-gold shadow-sm'
                            : isOpen
                              ? 'text-tartan-gold bg-tartan-navy'
                              : 'text-gray-200 hover:text-tartan-gold hover:bg-tartan-navy/60'
                        }`}
                      >
                        <span>{item.label}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown Menu Box */}
                      {isOpen && (
                        <div 
                          className="absolute left-0 top-full pt-2 w-72 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                          onMouseEnter={() => handleMouseEnter(item.label)}
                          onMouseLeave={handleMouseLeave}
                        >
                          <div className="bg-tartan-card border border-tartan-accent/50 rounded-2xl p-2 shadow-2xl backdrop-blur-xl space-y-1">
                            {item.children?.map((sub) => {
                              const isSubActive = pathname === sub.href;
                              const Icon = sub.icon || Sparkles;

                              return (
                                <Link
                                  key={sub.href}
                                  href={sub.href}
                                  onClick={() => setActiveDropdown(null)}
                                  className={`p-2.5 rounded-xl flex items-start gap-3 transition-colors ${
                                    isSubActive
                                      ? 'bg-tartan-gold text-tartan-dark font-bold shadow-md'
                                      : 'hover:bg-tartan-navy text-gray-200 hover:text-white'
                                  }`}
                                >
                                  <div className={`p-1.5 rounded-lg ${isSubActive ? 'bg-tartan-dark text-tartan-gold' : 'bg-tartan-navy text-tartan-gold'}`}>
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div className="space-y-0.5">
                                    <div className="text-xs font-bold leading-tight">
                                      {sub.label}
                                    </div>
                                    {sub.desc && (
                                      <p className={`text-[10px] leading-tight ${isSubActive ? 'text-tartan-dark/80 font-medium' : 'text-gray-400'}`}>
                                        {sub.desc}
                                      </p>
                                    )}
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href || '/'}
                    className={`transition-all py-2 px-3 rounded-xl text-[13px] font-bold tracking-wide ${
                      isActive
                        ? 'text-tartan-dark bg-tartan-gold shadow-sm'
                        : 'text-gray-200 hover:text-tartan-gold hover:bg-tartan-navy/60'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Header Right CTAs */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Bagpipe Audio Synth Quick Toggle */}
              <button
                onClick={() => {
                  if (currentPlayingTune) {
                    stopTune();
                  } else {
                    playTune('Highland Cathedral');
                  }
                }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md ${
                  currentPlayingTune
                    ? 'bg-tartan-gold text-tartan-dark ring-2 ring-yellow-300 animate-pulse font-bold'
                    : 'bg-tartan-navy text-tartan-gold hover:bg-tartan-card border border-tartan-accent/40'
                }`}
                title={currentPlayingTune ? `Playing: ${currentPlayingTune} (Click to pause)` : "Play Highland Cathedral Bagpipe Sample"}
              >
                {currentPlayingTune ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span className="hidden xl:inline text-xs font-bold">
                  {currentPlayingTune ? 'Playing Bagpipes' : 'Sound Sample'}
                </span>
              </button>

              {/* Book Now Primary Button */}
              <Link
                href="/booking"
                className="px-4 py-2 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs tracking-wide uppercase shadow-lg hover:shadow-yellow-500/20 transition-all hover:scale-105 flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Diary & Booking</span>
              </Link>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl lg:hidden bg-tartan-navy text-gray-200 border border-tartan-border hover:text-white"
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-tartan-card border-b border-tartan-border px-4 pt-3 pb-6 space-y-2 shadow-2xl animate-in slide-in-from-top duration-200 text-sm max-h-[80vh] overflow-y-auto">
            {navItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isDirectActive = item.href && pathname === item.href;
              const isChildActive = hasChildren && item.children?.some(c => c.href === pathname);
              const isGroupExpanded = mobileExpandedGroups[item.label] !== false;

              if (hasChildren) {
                return (
                  <div key={item.label} className="bg-tartan-navy/60 rounded-2xl border border-tartan-border/50 overflow-hidden">
                    <button
                      onClick={() => toggleMobileGroup(item.label)}
                      className="w-full px-3.5 py-2.5 flex items-center justify-between text-left font-bold text-gray-200"
                    >
                      <span className="flex items-center gap-2">
                        <span>{item.label}</span>
                        {isChildActive && <span className="w-2 h-2 rounded-full bg-tartan-gold"></span>}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-tartan-gold transition-transform duration-200 ${isGroupExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    {isGroupExpanded && (
                      <div className="px-2 pb-2 space-y-1">
                        {item.children?.map((sub) => {
                          const isSubActive = pathname === sub.href;
                          const Icon = sub.icon || Sparkles;

                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between ${
                                isSubActive
                                  ? 'bg-tartan-gold text-tartan-dark font-bold'
                                  : 'text-gray-300 hover:bg-tartan-navy hover:text-white'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Icon className="w-3.5 h-3.5 text-tartan-gold" />
                                <span>{sub.label}</span>
                              </div>
                              {isSubActive && <span className="text-[10px] font-bold">Active</span>}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href || '/'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold flex items-center justify-between transition-colors ${
                    isDirectActive
                      ? 'bg-gold-gradient text-tartan-dark font-bold shadow'
                      : 'text-gray-200 hover:bg-tartan-navy hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {isDirectActive && <span className="text-[10px] font-bold uppercase tracking-wider">Active</span>}
                </Link>
              );
            })}

            <div className="pt-3 border-t border-tartan-border flex items-center justify-between gap-3">
              <a
                href="tel:07793491367"
                className="flex-1 py-2.5 text-center bg-green-700 hover:bg-green-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow"
              >
                <Phone className="w-4 h-4" />
                <span>Call 07793 491367</span>
              </a>
              <Link
                href="/booking"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex-1 py-2.5 text-center bg-gold-gradient text-tartan-dark rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Online</span>
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
