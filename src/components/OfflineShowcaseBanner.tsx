'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  WifiOff, 
  Wifi, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  X, 
  ChevronRight, 
  Music, 
  Calendar, 
  ShieldCheck,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { SpudHeritageLogo } from './SpudHeritageLogo';

export const OfflineShowcaseBanner: React.FC = () => {
  const { 
    isOffline, 
    isOfflineShowcaseMode, 
    toggleOfflineShowcaseMode,
    offlineQueueCount, 
    syncOfflineQueue, 
    isSyncingOfflineQueue,
    isMounted
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showRestoredNotice, setShowRestoredNotice] = useState(false);
  const [lastWasOffline, setLastWasOffline] = useState(false);

  // Monitor online transitions to display "Connection Restored" confirmation
  useEffect(() => {
    if (isMounted) {
      if (isOffline) {
        setLastWasOffline(true);
        setShowRestoredNotice(false);
      } else if (lastWasOffline && !isOffline) {
        setShowRestoredNotice(true);
        setLastWasOffline(false);
        const timer = setTimeout(() => {
          setShowRestoredNotice(false);
        }, 4000);
        return () => clearTimeout(timer);
      }
    }
  }, [isOffline, isMounted, lastWasOffline]);

  if (!isMounted) return null;

  const isActive = isOffline || isOfflineShowcaseMode;

  return (
    <>
      {/* 1. RESTORED ONLINE FLASH NOTIFICATION */}
      {showRestoredNotice && !isActive && (
        <aside aria-label="Connection Status" className="fixed top-18 sm:top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-emerald-950/95 border border-emerald-500/60 shadow-2xl rounded-2xl px-4 py-2.5 flex items-center gap-2.5 text-xs text-white backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <Wifi className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bold">Highland Cloud Restored:</span>
            <span className="text-emerald-200">All queued inquiries and diary entries synchronized!</span>
          </div>
        </aside>
      )}

      {/* 2. OFFLINE SHOWCASE MODE BANNER */}
      {isActive && (
        <>
          {!isMinimized ? (
            <aside aria-label="Offline Mode" className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-4 z-40 max-w-md animate-in slide-in-from-bottom duration-300">
              <div className="bg-tartan-card/95 border border-amber-500/50 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md text-white flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wide">
                      <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                      <span>Offline Showcase Mode Active</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setIsMinimized(true)}
                      className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                      title="Minimize banner"
                    >
                      <Minimize2 className="w-3.5 h-3.5" />
                    </button>
                    {isOfflineShowcaseMode && !isOffline && (
                      <button
                        onClick={() => toggleOfflineShowcaseMode(false)}
                        className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="Exit simulated showcase"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-gray-300 leading-snug">
                  Highland Castles &amp; Remote Venues: Browsing cached portfolio, tunes &amp; ceremony pricing. Inquiries will queue safely.
                </p>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-tartan-border/60">
                  <div className="text-[10px] text-amber-200/90 font-medium">
                    {offlineQueueCount > 0 ? (
                      <span className="text-amber-400 font-bold">{offlineQueueCount} inquiry queued</span>
                    ) : (
                      <span>100% Cache Ready</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1 transition-all"
                    >
                      <span>Showcase Hub</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          ) : (
            /* MINIMIZED FLOATING PILL */
            <aside aria-label="Offline Mode Pill" className="fixed bottom-4 right-4 z-40 animate-in fade-in duration-200">
              <button
                onClick={() => setIsMinimized(false)}
                className="px-3 py-1.5 rounded-full bg-tartan-card/95 border border-amber-500/60 text-amber-300 text-xs font-bold shadow-2xl flex items-center gap-2 hover:scale-105 transition-transform backdrop-blur-md"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline Showcase</span>
                {offlineQueueCount > 0 && (
                  <span className="bg-amber-500 text-tartan-dark px-1.5 py-0.2 rounded-full text-[10px] font-extrabold">
                    {offlineQueueCount}
                  </span>
                )}
              </button>
            </aside>
          )}
        </>
      )}

      {/* 3. INTERACTIVE OFFLINE SHOWCASE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-tartan-card border border-tartan-accent/50 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 text-white">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-tartan-navy via-tartan-card to-amber-950 p-6 border-b border-tartan-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/40 shrink-0">
                  <WifiOff className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-white">Highland Offline Showcase</h3>
                  <p className="text-xs text-amber-300">Engineered for Remote Scottish Venues</p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 text-xs text-gray-300 max-h-[75vh] overflow-y-auto">
              
              <div className="bg-tartan-dark/70 rounded-2xl p-4 border border-tartan-border/70 space-y-2">
                <p className="font-bold text-white text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-tartan-gold" />
                  <span>Why Offline Showcase Mode?</span>
                </p>
                <p className="leading-relaxed">
                  Many of Scotland&apos;s most breathtaking castles (such as Eilean Donan, Dunrobin, or remote venues across Glencoe and Skye) have thick historic stone walls and limited cellular signal.
                </p>
                <p className="leading-relaxed">
                  Spud&apos;s Progressive Web App stores ceremony tunes, Highland attire photos, service pricing, and booking forms in your local browser cache so everything remains accessible at all times.
                </p>
              </div>

              {/* Offline Capabilities List */}
              <div className="space-y-2.5">
                <p className="font-bold uppercase tracking-wider text-tartan-gold text-[10px]">
                  What Works Offline
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="bg-tartan-navy/60 p-3 rounded-xl border border-tartan-border/60 flex items-start gap-2.5">
                    <Music className="w-4 h-4 text-tartan-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white text-[11px]">Bagpipe Tune Sampler</p>
                      <p className="text-[10px] text-gray-400">Audio recordings &amp; Web Audio chanter synthesizer</p>
                    </div>
                  </div>

                  <div className="bg-tartan-navy/60 p-3 rounded-xl border border-tartan-border/60 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-tartan-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white text-[11px]">Highland Attire Guide</p>
                      <p className="text-[10px] text-gray-400">No. 1 Dress, Royal Stewart &amp; Modern Tweeds</p>
                    </div>
                  </div>

                  <div className="bg-tartan-navy/60 p-3 rounded-xl border border-tartan-border/60 flex items-start gap-2.5">
                    <Calendar className="w-4 h-4 text-tartan-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white text-[11px]">Offline Booking Queue</p>
                      <p className="text-[10px] text-gray-400">Inquiries save locally and auto-sync when online</p>
                    </div>
                  </div>

                  <div className="bg-tartan-navy/60 p-3 rounded-xl border border-tartan-border/60 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-tartan-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white text-[11px]">Pricing &amp; Packages</p>
                      <p className="text-[10px] text-gray-400">Full wedding, castle &amp; funeral ceremony details</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sync Queue Manager */}
              <div className="bg-amber-950/30 rounded-2xl p-4 border border-amber-600/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white text-xs">Pending Offline Sync Queue</p>
                    <p className="text-[10px] text-gray-400">
                      {offlineQueueCount === 0 
                        ? 'Queue is currently clear. No pending items.' 
                        : `${offlineQueueCount} item${offlineQueueCount > 1 ? 's' : ''} queued on this device.`}
                    </p>
                  </div>

                  {offlineQueueCount > 0 && (
                    <button
                      onClick={() => syncOfflineQueue()}
                      disabled={isSyncingOfflineQueue}
                      className="px-3 py-1.5 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-[11px] flex items-center gap-1.5 shadow disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncingOfflineQueue ? 'animate-spin' : ''}`} />
                      <span>{isSyncingOfflineQueue ? 'Syncing...' : 'Sync Now'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Manual Simulation Toggle */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-tartan-border">
                <div className="text-left w-full sm:w-auto">
                  <p className="font-bold text-white text-xs">Test Mode for Meetings &amp; Clients</p>
                  <p className="text-[10px] text-gray-400">Simulate offline showcase anytime without disabling Wi-Fi.</p>
                </div>

                <button
                  onClick={() => {
                    toggleOfflineShowcaseMode();
                  }}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-all w-full sm:w-auto text-center shrink-0 ${
                    isOfflineShowcaseMode 
                      ? 'bg-amber-500 text-tartan-dark' 
                      : 'bg-tartan-navy hover:bg-slate-700 text-tartan-gold border border-tartan-accent/50'
                  }`}
                >
                  {isOfflineShowcaseMode ? 'Disable Test Mode' : 'Enable Test Mode'}
                </button>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-tartan-navy/60 px-6 py-4 border-t border-tartan-border flex items-center justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
              >
                Close Showcase Hub
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
