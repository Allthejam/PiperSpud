'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, Check, X } from 'lucide-react';

export const CookieConsentBanner: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const consent = localStorage.getItem('spud_cookie_consent');
      if (!consent) {
        setIsVisible(true);
      }
    } catch (e) {}
  }, []);

  if (!mounted || !isVisible) return null;

  const handleAcceptAll = () => {
    try {
      localStorage.setItem('spud_cookie_consent', 'accepted');
    } catch (e) {}
    setIsVisible(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem('spud_cookie_consent', 'essential_only');
    } catch (e) {}
    setIsVisible(false);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:max-w-md z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-tartan-card border border-tartan-accent/60 rounded-3xl p-5 shadow-2xl space-y-3 text-xs text-gray-300 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-tartan-gold font-bold">
            <Cookie className="w-5 h-5 text-tartan-gold" />
            <span className="text-sm font-serif">Cookie & Privacy Choices</span>
          </div>
          <button
            onClick={handleDecline}
            className="text-gray-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[11px] leading-relaxed text-gray-300">
          We use cookies and local storage to remember your diary booking preferences, live chat sessions, and to provide secure Brevo & PayPal transactions. Read our{' '}
          <Link href="/cookies" className="text-tartan-gold underline hover:text-yellow-300">
            Cookie Policy
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-tartan-gold underline hover:text-yellow-300">
            Privacy Policy
          </Link>.
        </p>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleAcceptAll}
            className="flex-1 py-2 bg-gold-gradient text-tartan-dark font-extrabold text-[11px] rounded-xl shadow-md hover:brightness-110 flex items-center justify-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Accept All Cookies</span>
          </button>
          <button
            onClick={handleDecline}
            className="px-3 py-2 bg-tartan-navy hover:bg-slate-700 text-gray-300 rounded-xl text-[11px] font-semibold border border-tartan-border"
          >
            Essential Only
          </button>
        </div>
      </div>
    </div>
  );
};
