'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';
import { LiveChatWidget } from '@/components/LiveChatWidget';
import { VisualPencilOverlay } from '@/components/VisualPencilOverlay';
import { Mail, Phone } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-tartan-dark flex flex-col relative">
      <VisualPencilOverlay />
      <Navbar />

      {/* Page Header */}
      <div className="bg-gradient-to-b from-tartan-card via-tartan-navy to-tartan-dark py-14 border-b border-tartan-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tartan-accent/15 border border-tartan-accent/40 text-tartan-gold text-xs font-semibold">
            <Mail className="w-4 h-4" />
            <span>Get in Touch with Spud</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white font-serif tracking-tight uppercase">
            Contact Spud The Piper
          </h1>
          <p className="text-base text-gray-300 max-w-2xl mx-auto">
            Direct phone inquiries, WhatsApp, email, and booking questions. We are ready to assist you.
          </p>
        </div>
      </div>

      <ContactSection />

      <Footer />
      <LiveChatWidget />
    </div>
  );
}
