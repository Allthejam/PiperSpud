'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Monitor, 
  Apple, 
  Share, 
  PlusSquare, 
  Download, 
  CheckCircle2, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Music,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt?: any;
  onInstallSuccess?: () => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallSuccess
}) => {
  const [activePlatform, setActivePlatform] = useState<'ios' | 'android' | 'desktop'>('ios');
  const [isStandalone, setIsStandalone] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIos = /iphone|ipad|ipod/.test(userAgent);
      const isAndroid = /android/.test(userAgent);
      
      if (isIos) {
        setActivePlatform('ios');
      } else if (isAndroid) {
        setActivePlatform('android');
      } else {
        setActivePlatform('desktop');
      }

      const isAppStandalone = window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true;
      setIsStandalone(isAppStandalone);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      setInstalling(true);
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          if (onInstallSuccess) onInstallSuccess();
          onClose();
        }
      } catch (err) {
        console.error('PWA install error:', err);
      } finally {
        setInstalling(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-tartan-card border border-tartan-accent/60 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 my-8">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-tartan-dark via-tartan-navy to-tartan-card p-6 border-b border-tartan-border flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gold-gradient p-0.5 shadow-lg flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-tartan-dark rounded-[14px] flex items-center justify-center font-serif font-extrabold text-tartan-gold text-xl">
                S
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-tartan-accent/20 border border-tartan-accent/40 text-tartan-gold text-[10px] font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5 text-tartan-gold" />
                <span>Official Progressive Web App</span>
              </div>
              <h3 className="text-xl font-bold text-white font-serif tracking-tight">
                Install Spud the Piper App
              </h3>
              <p className="text-xs text-gray-300">
                1-tap access, offline bagpipe jukebox, live diary and instant wedding bookings
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Benefits Strip */}
        <div className="bg-tartan-dark/90 px-6 py-3 border-b border-tartan-border/60 grid grid-cols-3 gap-2 text-center text-[11px] text-gray-300">
          <div className="flex items-center justify-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-tartan-gold shrink-0" />
            <span className="font-semibold text-white">Instant Launch</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 border-x border-slate-800 px-2">
            <Music className="w-3.5 h-3.5 text-tartan-gold shrink-0" />
            <span className="font-semibold text-white">Offline Sound Samples</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-tartan-gold shrink-0" />
            <span className="font-semibold text-white">Fast Diary Bookings</span>
          </div>
        </div>

        {/* Platform Selection Tabs */}
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2 p-1.5 bg-tartan-dark rounded-2xl border border-tartan-border">
            <button
              onClick={() => setActivePlatform('ios')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activePlatform === 'ios'
                  ? 'bg-gold-gradient text-tartan-dark shadow-md font-extrabold'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>iPhone & iPad (iOS)</span>
            </button>

            <button
              onClick={() => setActivePlatform('android')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activePlatform === 'android'
                  ? 'bg-gold-gradient text-tartan-dark shadow-md font-extrabold'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Android Phone/Tablet</span>
            </button>

            <button
              onClick={() => setActivePlatform('desktop')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activePlatform === 'desktop'
                  ? 'bg-gold-gradient text-tartan-dark shadow-md font-extrabold'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>PC / Mac / Chrome</span>
            </button>
          </div>

          {/* Platform Specific Instructions */}
          {activePlatform === 'ios' && (
            <div className="space-y-4 animate-in fade-in duration-150 text-xs">
              <div className="bg-tartan-navy/60 rounded-2xl p-4 border border-tartan-border/80 space-y-3">
                <div className="flex items-center gap-2 text-tartan-gold font-bold">
                  <Apple className="w-4 h-4" />
                  <span>How to install on Apple iOS (Safari Browser):</span>
                </div>
                
                <div className="space-y-3 text-gray-200">
                  <div className="flex items-start gap-3 bg-tartan-dark/70 p-3 rounded-xl border border-slate-800">
                    <span className="w-6 h-6 rounded-full bg-tartan-accent/30 text-tartan-gold font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                      1
                    </span>
                    <div className="space-y-1">
                      <p className="font-semibold text-white">Open in Safari & Tap Share</p>
                      <p className="text-gray-400">
                        At the bottom of your screen (or top on iPad), tap the <strong className="text-tartan-gold">Share</strong> button (the box with an upward arrow <Share className="w-3.5 h-3.5 inline mx-1 text-blue-400" />).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-tartan-dark/70 p-3 rounded-xl border border-slate-800">
                    <span className="w-6 h-6 rounded-full bg-tartan-accent/30 text-tartan-gold font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                      2
                    </span>
                    <div className="space-y-1">
                      <p className="font-semibold text-white">Select &quot;Add to Home Screen&quot;</p>
                      <p className="text-gray-400">
                        Scroll down the sharing menu options and tap <strong className="text-tartan-gold">&quot;Add to Home Screen&quot;</strong> (<PlusSquare className="w-3.5 h-3.5 inline mx-1 text-emerald-400" />).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-tartan-dark/70 p-3 rounded-xl border border-slate-800">
                    <span className="w-6 h-6 rounded-full bg-tartan-accent/30 text-tartan-gold font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                      3
                    </span>
                    <div className="space-y-1">
                      <p className="font-semibold text-white">Tap &quot;Add&quot; Top-Right</p>
                      <p className="text-gray-400">
                        Tap <strong className="text-tartan-gold">Add</strong> in the top-right corner. The <strong>Spud the Piper</strong> Scottish icon will appear on your iPhone/iPad Home Screen like a native app!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePlatform === 'android' && (
            <div className="space-y-4 animate-in fade-in duration-150 text-xs">
              {deferredPrompt ? (
                <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-5 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                    <Download className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">1-Click Fast Install Available!</h4>
                    <p className="text-gray-300 text-xs">Your Android browser is ready to install Spud the Piper immediately.</p>
                  </div>
                  <button
                    onClick={handleNativeInstall}
                    disabled={installing}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>{installing ? 'Installing...' : 'Install Spud App on Android Now'}</span>
                  </button>
                </div>
              ) : null}

              <div className="bg-tartan-navy/60 rounded-2xl p-4 border border-tartan-border/80 space-y-3">
                <span className="font-bold text-tartan-gold block">Android Chrome / Browser Steps:</span>
                
                <div className="space-y-3 text-gray-200">
                  <div className="flex items-start gap-3 bg-tartan-dark/70 p-3 rounded-xl border border-slate-800">
                    <span className="w-6 h-6 rounded-full bg-tartan-accent/30 text-tartan-gold font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
                    <div>
                      <p className="font-semibold text-white">Tap the 3-Dots Menu (⋮)</p>
                      <p className="text-gray-400">In Google Chrome, Samsung Internet, or Brave, tap the 3 dots in the top right corner.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-tartan-dark/70 p-3 rounded-xl border border-slate-800">
                    <span className="w-6 h-6 rounded-full bg-tartan-accent/30 text-tartan-gold font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
                    <div>
                      <p className="font-semibold text-white">Tap &quot;Install App&quot; or &quot;Add to Home Screen&quot;</p>
                      <p className="text-gray-400">Select <strong className="text-tartan-gold">&quot;Install App&quot;</strong> or <strong className="text-tartan-gold">&quot;Add to Home Screen&quot;</strong> from the dropdown.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-tartan-dark/70 p-3 rounded-xl border border-slate-800">
                    <span className="w-6 h-6 rounded-full bg-tartan-accent/30 text-tartan-gold font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">3</span>
                    <div>
                      <p className="font-semibold text-white">Confirm Installation</p>
                      <p className="text-gray-400">Tap <strong>Install</strong>. Spud the Piper will install to your app drawer and home screen.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePlatform === 'desktop' && (
            <div className="space-y-4 animate-in fade-in duration-150 text-xs">
              {deferredPrompt ? (
                <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-5 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                    <Monitor className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">1-Click Desktop App Install</h4>
                    <p className="text-gray-300 text-xs">Launch Spud the Piper in a clean standalone desktop window on your Windows PC or Mac.</p>
                  </div>
                  <button
                    onClick={handleNativeInstall}
                    disabled={installing}
                    className="w-full py-3 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>{installing ? 'Installing...' : 'Install Spud Desktop App'}</span>
                  </button>
                </div>
              ) : null}

              <div className="bg-tartan-navy/60 rounded-2xl p-4 border border-tartan-border/80 space-y-3">
                <span className="font-bold text-tartan-gold block">Chrome, Edge & Mac Safari Desktop Steps:</span>
                
                <div className="space-y-3 text-gray-200">
                  <div className="flex items-start gap-3 bg-tartan-dark/70 p-3 rounded-xl border border-slate-800">
                    <span className="w-6 h-6 rounded-full bg-tartan-accent/30 text-tartan-gold font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
                    <div>
                      <p className="font-semibold text-white">Look for the Install Icon in the URL Address Bar</p>
                      <p className="text-gray-400">
                        In Google Chrome or Microsoft Edge, look at the right side of the top address bar for the <strong className="text-tartan-gold">Install icon (⊕ or computer screen icon)</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-tartan-dark/70 p-3 rounded-xl border border-slate-800">
                    <span className="w-6 h-6 rounded-full bg-tartan-accent/30 text-tartan-gold font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
                    <div>
                      <p className="font-semibold text-white">Click &quot;Install Spud the Piper&quot;</p>
                      <p className="text-gray-400">Click the install prompt to place Spud the Piper in your Applications / Start Menu and desktop dock.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isStandalone && (
            <div className="p-4 rounded-2xl bg-green-950/60 border border-green-700/60 text-green-300 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
              <span>You are currently running Spud the Piper in installed Standalone App mode!</span>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="bg-tartan-navy px-6 py-4 border-t border-tartan-border flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <ShieldCheck className="w-4 h-4 text-tartan-gold" />
            <span>Lightweight PWA • No App Store download required • 0MB storage</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all shadow"
          >
            Done / Close
          </button>
        </div>

      </div>
    </div>
  );
};
