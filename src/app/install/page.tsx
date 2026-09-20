'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LiveChatWidget } from '@/components/LiveChatWidget';
import { VisualPencilOverlay } from '@/components/VisualPencilOverlay';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Apple, 
  Share, 
  PlusSquare, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Music, 
  Calendar, 
  ArrowLeft,
  ChevronRight
} from 'lucide-react';

export default function InstallPage() {
  const [activeTab, setActiveTab] = useState<'ios' | 'android' | 'desktop'>('ios');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(userAgent)) {
        setActiveTab('ios');
      } else if (/android/.test(userAgent)) {
        setActiveTab('android');
      } else {
        setActiveTab('desktop');
      }

      const isAppStandalone = window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true;
      setIsStandalone(isAppStandalone);

      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };

      const handleAppInstalled = () => {
        setIsStandalone(true);
        setInstalledSuccess(true);
        setDeferredPrompt(null);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      setInstalling(true);
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setInstalledSuccess(true);
          setDeferredPrompt(null);
        }
      } catch (err) {
        console.error('PWA install error:', err);
      } finally {
        setInstalling(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-tartan-dark flex flex-col selection:bg-tartan-gold selection:text-tartan-dark">
      <Navbar />
      <VisualPencilOverlay />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-12">
        
        {/* Page Breadcrumb & Title */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tartan-card border border-tartan-accent/50 text-tartan-gold text-xs font-bold shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-tartan-gold" />
            <span>Progressive Web App (PWA) Guide</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-serif tracking-tight">
            How to Install <span className="text-tartan-gold">Spud the Piper</span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Install Spud the Piper directly on your iPhone, iPad, Android phone, or computer. Enjoy 1-tap instant launching, full offline bagpipe music playback, and fast live diary booking.
          </p>
        </div>

        {/* Status Notification if Already Standalone */}
        {isStandalone && (
          <div className="bg-emerald-950/60 border border-emerald-500/60 rounded-3xl p-6 text-emerald-200 flex items-center gap-4 shadow-xl">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
            <div>
              <h3 className="text-base font-bold text-white">App is Installed!</h3>
              <p className="text-xs text-gray-300">You are running Spud the Piper in installed Standalone PWA mode on this device.</p>
            </div>
          </div>
        )}

        {/* 1-Click Install CTA Box (when browser supports beforeinstallprompt) */}
        {deferredPrompt && (
          <div className="bg-gradient-to-r from-emerald-950/80 via-tartan-card to-tartan-navy p-8 rounded-3xl border border-emerald-500/50 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 shadow-inner">
              <Download className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">1-Click Fast Install Ready</h2>
              <p className="text-xs text-gray-300 max-w-md mx-auto">
                Your browser supports instant installation. Click below to add Spud the Piper to your home screen or desktop.
              </p>
            </div>
            <button
              onClick={handleInstallClick}
              disabled={installing}
              className="px-8 py-3.5 rounded-2xl bg-gold-gradient text-tartan-dark font-extrabold text-sm uppercase tracking-wider shadow-xl hover:brightness-110 active:scale-95 transition-all inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{installing ? 'Installing App...' : 'Install Spud the Piper App Now'}</span>
            </button>
          </div>
        )}

        {/* Interactive Device Selector Tabs */}
        <div className="bg-tartan-card rounded-3xl border border-tartan-accent/50 shadow-2xl p-6 sm:p-8 space-y-8">
          
          {/* Tab buttons */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-tartan-dark rounded-2xl border border-tartan-border">
            <button
              onClick={() => setActiveTab('ios')}
              className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'ios'
                  ? 'bg-gold-gradient text-tartan-dark shadow-lg font-extrabold'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Apple iPhone / iPad</span>
            </button>

            <button
              onClick={() => setActiveTab('android')}
              className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'android'
                  ? 'bg-gold-gradient text-tartan-dark shadow-lg font-extrabold'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Android</span>
            </button>

            <button
              onClick={() => setActiveTab('desktop')}
              className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'desktop'
                  ? 'bg-gold-gradient text-tartan-dark shadow-lg font-extrabold'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>PC / Mac / Chrome</span>
            </button>
          </div>

          {/* iOS Safari Instructions */}
          {activeTab === 'ios' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-tartan-gold font-bold text-sm">
                <Apple className="w-5 h-5" />
                <span>3 Simple Steps for iPhone & iPad (Safari Browser)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-tartan-dark/90 rounded-2xl p-5 border border-tartan-border/80 space-y-3">
                  <div className="w-8 h-8 rounded-full bg-tartan-accent/30 text-tartan-gold font-bold flex items-center justify-center text-sm">
                    1
                  </div>
                  <h4 className="font-bold text-white text-sm">Tap Share in Safari</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Open <span className="text-white font-mono">spudthepiper.co.uk</span> in Safari. At the bottom toolbar, tap the <strong className="text-tartan-gold">Share</strong> button (<Share className="w-3.5 h-3.5 inline mx-1 text-blue-400" /> box with upward arrow).
                  </p>
                </div>

                <div className="bg-tartan-dark/90 rounded-2xl p-5 border border-tartan-border/80 space-y-3">
                  <div className="w-8 h-8 rounded-full bg-tartan-accent/30 text-tartan-gold font-bold flex items-center justify-center text-sm">
                    2
                  </div>
                  <h4 className="font-bold text-white text-sm">Add to Home Screen</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Scroll down the action list and tap <strong className="text-tartan-gold">&quot;Add to Home Screen&quot;</strong> (<PlusSquare className="w-3.5 h-3.5 inline mx-1 text-emerald-400" />).
                  </p>
                </div>

                <div className="bg-tartan-dark/90 rounded-2xl p-5 border border-tartan-border/80 space-y-3">
                  <div className="w-8 h-8 rounded-full bg-tartan-accent/30 text-tartan-gold font-bold flex items-center justify-center text-sm">
                    3
                  </div>
                  <h4 className="font-bold text-white text-sm">Tap &quot;Add&quot; Top-Right</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Tap <strong className="text-tartan-gold">Add</strong> in the top right corner. The Scottish Spud icon will immediately appear on your Home Screen!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Android Instructions */}
          {activeTab === 'android' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Smartphone className="w-5 h-5" />
                <span>3 Simple Steps for Android (Chrome / Samsung Internet)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-tartan-dark/90 rounded-2xl p-5 border border-tartan-border/80 space-y-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm">
                    1
                  </div>
                  <h4 className="font-bold text-white text-sm">Tap Chrome Menu (⋮)</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    In Google Chrome or Samsung Internet, tap the 3 vertical dots in the top right corner.
                  </p>
                </div>

                <div className="bg-tartan-dark/90 rounded-2xl p-5 border border-tartan-border/80 space-y-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm">
                    2
                  </div>
                  <h4 className="font-bold text-white text-sm">Select &quot;Install App&quot;</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Tap <strong className="text-tartan-gold">&quot;Install App&quot;</strong> or <strong className="text-tartan-gold">&quot;Add to Home Screen&quot;</strong>.
                  </p>
                </div>

                <div className="bg-tartan-dark/90 rounded-2xl p-5 border border-tartan-border/80 space-y-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm">
                    3
                  </div>
                  <h4 className="font-bold text-white text-sm">Confirm & Enjoy</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Tap <strong>Install</strong>. Spud the Piper will install to your app drawer with offline audio sample support.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Instructions */}
          {activeTab === 'desktop' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-tartan-gold font-bold text-sm">
                <Monitor className="w-5 h-5" />
                <span>Instructions for Windows PC, Mac & Chrome / Edge Desktop</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-tartan-dark/90 rounded-2xl p-5 border border-tartan-border/80 space-y-3">
                  <div className="w-8 h-8 rounded-full bg-tartan-accent/30 text-tartan-gold font-bold flex items-center justify-center text-sm">
                    1
                  </div>
                  <h4 className="font-bold text-white text-sm">Click Address Bar Install Icon (⊕)</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    In Chrome or Edge, look at the right end of the address bar at the top of your screen for the <strong className="text-tartan-gold">Install icon (⊕)</strong>.
                  </p>
                </div>

                <div className="bg-tartan-dark/90 rounded-2xl p-5 border border-tartan-border/80 space-y-3">
                  <div className="w-8 h-8 rounded-full bg-tartan-accent/30 text-tartan-gold font-bold flex items-center justify-center text-sm">
                    2
                  </div>
                  <h4 className="font-bold text-white text-sm">Click &quot;Install&quot;</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Click <strong>Install</strong> to launch Spud the Piper in its own dedicated, clean desktop window on your Mac dock or Windows taskbar.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Why Install Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-gray-300">
          <div className="bg-tartan-card p-6 rounded-2xl border border-tartan-border space-y-2">
            <div className="p-2.5 rounded-xl bg-tartan-accent/20 text-tartan-gold w-fit">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">Zero App Store Downloads</h4>
            <p className="text-gray-400">Installs instantly in seconds without taking up phone storage or requiring App Store / Google Play passwords.</p>
          </div>

          <div className="bg-tartan-card p-6 rounded-2xl border border-tartan-border space-y-2">
            <div className="p-2.5 rounded-xl bg-tartan-accent/20 text-tartan-gold w-fit">
              <Music className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">Offline Bagpipe Audio</h4>
            <p className="text-gray-400">Play authentic bagpipe samples anywhere, even with no internet signal or mobile data.</p>
          </div>

          <div className="bg-tartan-card p-6 rounded-2xl border border-tartan-border space-y-2">
            <div className="p-2.5 rounded-xl bg-tartan-accent/20 text-tartan-gold w-fit">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">Fast Live Diary & Chat</h4>
            <p className="text-gray-400">Check dates, request quotes, and manage bookings with 1-tap from your home screen.</p>
          </div>
        </div>

        <div className="text-center pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-tartan-gold hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Spud the Piper Home</span>
          </Link>
        </div>

      </main>

      <Footer />
      <LiveChatWidget />
    </div>
  );
}
