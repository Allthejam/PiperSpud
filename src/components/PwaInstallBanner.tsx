'use client';

import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Sparkles, HelpCircle } from 'lucide-react';
import { PwaInstallModal } from './PwaInstallModal';
import { SpudHeritageLogo } from './SpudHeritageLogo';

export const PwaInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);

    if (typeof window !== 'undefined') {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);

      const dismissed = localStorage.getItem('spud_pwa_banner_dismissed');
      if (dismissed === 'true') {
        setIsDismissed(true);
      }

      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        (window as any).deferredPwaPrompt = e;
      };

      const handleAppInstalled = () => {
        setIsStandalone(true);
        setDeferredPrompt(null);
        localStorage.setItem('spud_pwa_installed', 'true');
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('spud_pwa_banner_dismissed', 'true');
    }
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setIsModalOpen(true);
    }
  };

  if (!isMounted || isStandalone || isDismissed) {
    return (
      <PwaInstallModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        deferredPrompt={deferredPrompt}
      />
    );
  }

  return (
    <>
      <div className="fixed bottom-20 sm:bottom-6 right-4 z-40 max-w-sm w-[calc(100%-2rem)] sm:w-auto bg-gradient-to-r from-tartan-dark via-tartan-card to-tartan-navy p-3.5 sm:p-4 rounded-2xl border border-tartan-accent/60 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tartan-card via-tartan-navy to-tartan-dark p-1 border border-tartan-accent/60 shadow-md shrink-0 flex items-center justify-center">
            <SpudHeritageLogo variant="icon" size="custom" className="w-8 h-8" />
          </div>

          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-tartan-gold uppercase tracking-wider bg-tartan-navy px-1.5 py-0.5 rounded border border-tartan-border">
                App
              </span>
              <h4 className="text-xs font-bold text-white truncate">Install Spud the Piper</h4>
            </div>
            <p className="text-[11px] text-gray-300 truncate mt-0.5">
              Add to Home Screen for offline music & quick diary
            </p>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 shrink-0"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center gap-2">
          <button
            onClick={handleInstallClick}
            className="flex-1 py-1.5 px-3 rounded-xl bg-gold-gradient text-tartan-dark text-xs font-extrabold flex items-center justify-center gap-1.5 shadow hover:brightness-110 active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install App</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="py-1.5 px-2.5 rounded-xl bg-tartan-navy hover:bg-slate-700 text-gray-200 border border-tartan-border text-xs font-semibold flex items-center justify-center gap-1 transition-all"
            title="How to install instructions"
          >
            <HelpCircle className="w-3.5 h-3.5 text-tartan-gold" />
            <span>Guide</span>
          </button>
        </div>
      </div>

      <PwaInstallModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        deferredPrompt={deferredPrompt}
      />
    </>
  );
};
