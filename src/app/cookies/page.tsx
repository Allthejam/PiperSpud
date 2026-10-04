'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LiveChatWidget } from '@/components/LiveChatWidget';
import { VisualPencilOverlay } from '@/components/VisualPencilOverlay';
import { EditableElement } from '@/components/EditableElement';
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
            <EditableElement
              id="cookies-badge-text"
              label="Cookies Badge Label"
              section="cookies-header"
              tag="span"
              defaultContent="Browser Storage & Transparency"
            />
          </div>
          <EditableElement
            id="cookies-header-title"
            label="Cookies Page Heading"
            section="cookies-header"
            tag="h1"
            defaultContent="Cookie Policy"
            className="text-3xl sm:text-5xl font-extrabold text-white font-serif tracking-tight uppercase"
          />
          <EditableElement
            id="cookies-header-subtitle"
            label="Cookies Subtitle"
            section="cookies-header"
            tag="p"
            defaultContent="Learn how we use cookies and local storage to enhance your browsing experience."
            className="text-sm text-gray-300"
          />
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-xs sm:text-sm text-gray-300 space-y-8 leading-relaxed">
        
        <section className="bg-tartan-card p-6 sm:p-8 rounded-3xl border border-tartan-border space-y-4 shadow-xl">
          <EditableElement
            id="cookies-sec1-title"
            label="Section 1 Title"
            section="cookies"
            tag="h2"
            defaultContent="1. What Are Cookies and Local Storage?"
            className="text-xl font-bold text-white font-serif text-tartan-gold"
          />
          <EditableElement
            id="cookies-sec1-p1"
            label="Section 1 Explanation"
            section="cookies"
            tag="p"
            defaultContent="Cookies and browser Local Storage are small text data elements placed on your computer, tablet, or smartphone when you browse our website or install our Progressive Web App (PWA). They allow the application to remember your preferences and keep your interactive sessions active."
          />
        </section>

        <section className="bg-tartan-card p-6 sm:p-8 rounded-3xl border border-tartan-border space-y-4 shadow-xl">
          <EditableElement
            id="cookies-sec2-title"
            label="Section 2 Title"
            section="cookies"
            tag="h2"
            defaultContent="2. Categories of Cookies We Utilize"
            className="text-xl font-bold text-white font-serif text-tartan-gold"
          />

          <div className="space-y-4">
            <div className="bg-tartan-dark p-4 rounded-2xl border border-tartan-border space-y-2">
              <div className="flex items-center justify-between">
                <EditableElement
                  id="cookies-cat1-title"
                  label="Category 1 Title"
                  section="cookies"
                  tag="span"
                  defaultContent="Essential & Functional Storage"
                  className="font-bold text-white text-sm"
                />
                <span className="bg-green-950 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded border border-green-800">Always Active</span>
              </div>
              <EditableElement
                id="cookies-cat1-desc"
                label="Category 1 Description"
                section="cookies"
                tag="p"
                defaultContent="Required for core PWA features, remembering your live chat history, keeping Spud's admin login session active, and storing offline diary cache in remote Scottish areas."
                className="text-xs text-gray-400"
              />
            </div>

            <div className="bg-tartan-dark p-4 rounded-2xl border border-tartan-border space-y-2">
              <div className="flex items-center justify-between">
                <EditableElement
                  id="cookies-cat2-title"
                  label="Category 2 Title"
                  section="cookies"
                  tag="span"
                  defaultContent="Payment & Security Cookies"
                  className="font-bold text-white text-sm"
                />
                <span className="bg-blue-950 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-800">Secure Gateway</span>
              </div>
              <EditableElement
                id="cookies-cat2-desc"
                label="Category 2 Description"
                section="cookies"
                tag="p"
                defaultContent="Used by PayPal during deposit checkout to prevent fraud and authenticate secure transaction tokens."
                className="text-xs text-gray-400"
              />
            </div>

            <div className="bg-tartan-dark p-4 rounded-2xl border border-tartan-border space-y-2">
              <div className="flex items-center justify-between">
                <EditableElement
                  id="cookies-cat3-title"
                  label="Category 3 Title"
                  section="cookies"
                  tag="span"
                  defaultContent="Audio & Preference Cookies"
                  className="font-bold text-white text-sm"
                />
                <span className="bg-tartan-navy text-tartan-gold text-[10px] font-bold px-2 py-0.5 rounded border border-tartan-accent/40">User Controlled</span>
              </div>
              <EditableElement
                id="cookies-cat3-desc"
                label="Category 3 Description"
                section="cookies"
                tag="p"
                defaultContent="Remembers your volume level and previously played bagpipe tune in the Jukebox."
                className="text-xs text-gray-400"
              />
            </div>
          </div>
        </section>

        <section className="bg-tartan-card p-6 sm:p-8 rounded-3xl border border-tartan-border space-y-4 shadow-xl">
          <EditableElement
            id="cookies-sec3-title"
            label="Section 3 Title"
            section="cookies"
            tag="h2"
            defaultContent="3. How to Manage or Clear Cookies"
            className="text-xl font-bold text-white font-serif text-tartan-gold"
          />
          <EditableElement
            id="cookies-sec3-p1"
            label="Section 3 Instructions"
            section="cookies"
            tag="p"
            defaultContent="You can configure your web browser (Chrome, Safari, Edge, Firefox) to delete or block cookies at any time via your browser settings. You can also reset your choices by clicking below:"
          />
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
