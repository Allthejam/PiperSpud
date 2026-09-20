'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LiveChatWidget } from '@/components/LiveChatWidget';
import { VisualPencilOverlay } from '@/components/VisualPencilOverlay';
import Link from 'next/link';
import { Cookie, ShieldCheck, Check, Sliders } from 'lucide-react';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-tartan-dark flex flex-col relative">
      <VisualPencilOverlay />
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-b from-tartan-card via-tartan-navy to-tartan-dark py-14 border-b border-tartan-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tartan-accent/15 border border-tartan-accent/40 text-tartan-gold text-xs font-semibold">
            <Cookie className="w-4 h-4" />
            <span>Browser Storage & Transparency</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-serif tracking-tight uppercase">
            Cookie Policy
          </h1>
          <p className="text-sm text-gray-300">
            Learn how we use cookies and local storage to enhance your experience.
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-xs sm:text-sm text-gray-300 space-y-8 leading-relaxed">
        
        <section className="bg-tartan-card p-6 sm:p-8 rounded-3xl border border-tartan-border space-y-4 shadow-xl">
          <h2 className="text-xl font-bold text-white font-serif text-tartan-gold">
            1. What Are Cookies and Local Storage?
          </h2>
          <p>
            Cookies and browser Local Storage are small text data elements placed on your computer, tablet, or smartphone when you browse our website or install our Progressive Web App (PWA). They allow the application to remember your preferences and keep your interactive sessions active.
          </p>
        </section>

        <section className="bg-tartan-card p-6 sm:p-8 rounded-3xl border border-tartan-border space-y-4 shadow-xl">
          <h2 className="text-xl font-bold text-white font-serif text-tartan-gold">
            2. Categories of Cookies We Utilize
          </h2>

          <div className="space-y-4">
            <div className="bg-tartan-dark p-4 rounded-2xl border border-tartan-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">Essential & Functional Storage</span>
                <span className="bg-green-950 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded border border-green-800">Always Active</span>
              </div>
              <p className="text-xs text-gray-400">
                Required for core PWA features, remembering your live chat history, keeping Spud&apos;s admin login session active, and storing offline diary cache in remote Scottish areas.
              </p>
            </div>

            <div className="bg-tartan-dark p-4 rounded-2xl border border-tartan-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">Payment & Security Cookies</span>
                <span className="bg-blue-950 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-800">Secure Gateway</span>
              </div>
              <p className="text-xs text-gray-400">
                Used by PayPal during deposit checkout to prevent fraud and authenticate secure transaction tokens.
              </p>
            </div>

            <div className="bg-tartan-dark p-4 rounded-2xl border border-tartan-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">Audio & Preference Cookies</span>
                <span className="bg-tartan-navy text-tartan-gold text-[10px] font-bold px-2 py-0.5 rounded border border-tartan-accent/40">User Controlled</span>
              </div>
              <p className="text-xs text-gray-400">
                Remembers your volume level and previously played bagpipe tune in the Jukebox.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-tartan-card p-6 sm:p-8 rounded-3xl border border-tartan-border space-y-4 shadow-xl">
          <h2 className="text-xl font-bold text-white font-serif text-tartan-gold">
            3. How to Manage or Clear Cookies
          </h2>
          <p>
            You can configure your web browser (Chrome, Safari, Edge, Firefox) to delete or block cookies at any time via your browser settings. You can also reset your choices by clicking below:
          </p>
          <button
            onClick={() => {
              try {
                localStorage.removeItem('spud_cookie_consent');
                alert('Cookie consent preferences have been reset. Reload the page to view the consent dialog.');
              } catch (e) {}
            }}
            className="px-5 py-2.5 bg-tartan-navy hover:bg-slate-700 text-tartan-gold font-bold text-xs rounded-xl border border-tartan-accent/40 flex items-center gap-2"
          >
            <Sliders className="w-4 h-4" />
            <span>Reset Cookie Consent Preferences</span>
          </button>
        </section>

      </main>

      <Footer />
      <LiveChatWidget />
    </div>
  );
}
