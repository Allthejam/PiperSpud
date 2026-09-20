'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { PiperToTheStars } from '@/components/PiperToTheStars';
import { TuneSampler } from '@/components/TuneSampler';
import { TartanSelector } from '@/components/TartanSelector';
import { ServicesSection } from '@/components/ServicesSection';
import { AboutSection } from '@/components/AboutSection';
import { ReviewsSection } from '@/components/ReviewsSection';
import { BookingCalendar } from '@/components/BookingCalendar';
import { FaqSection } from '@/components/FaqSection';
import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';
import { LiveChatWidget } from '@/components/LiveChatWidget';
import { VisualPencilOverlay } from '@/components/VisualPencilOverlay';
import { BrevoEmailModal } from '@/components/admin/BrevoEmailModal';
import { PayPalCheckoutModal } from '@/components/admin/PayPalCheckoutModal';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import { Calendar, Music, Shirt, Users, Star, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const { activeBrevoEmail, closeBrevoPreview, activePayPalModal, closePayPalModal } = useApp();

  return (
    <div className="min-h-screen bg-tartan-dark flex flex-col relative">
      
      {/* Admin Floating In-Page CMS Overlay & Pencil Mode */}
      <VisualPencilOverlay />

      {/* Main Navigation */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Piper to the Stars Credibility Bar */}
      <PiperToTheStars />

      {/* Quick Interactive Features Exploration Hub */}
      <section className="py-12 bg-tartan-navy/60 border-y border-tartan-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white font-serif">Explore Spud\'s Platform</h3>
            <p className="text-xs text-tartan-gold">Select any section to open dedicated pages and interactive features</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Link
              href="/about"
              className="p-4 rounded-2xl bg-tartan-card hover:bg-tartan-dark border border-tartan-border hover:border-tartan-accent transition-all text-center space-y-2 group shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-tartan-navy text-tartan-gold flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                👑
              </div>
              <h4 className="text-xs font-bold text-white font-serif">About Spud</h4>
              <p className="text-[10px] text-gray-400">15+ Years & Bio</p>
            </Link>

            <Link
              href="/services"
              className="p-4 rounded-2xl bg-tartan-card hover:bg-tartan-dark border border-tartan-border hover:border-tartan-accent transition-all text-center space-y-2 group shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-tartan-navy text-tartan-gold flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                🏰
              </div>
              <h4 className="text-xs font-bold text-white font-serif">Services</h4>
              <p className="text-[10px] text-gray-400">Weddings & Laments</p>
            </Link>

            <Link
              href="/tunes"
              className="p-4 rounded-2xl bg-tartan-card hover:bg-tartan-dark border border-tartan-border hover:border-tartan-accent transition-all text-center space-y-2 group shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-tartan-navy text-tartan-gold flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Music className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-white font-serif">Tune Jukebox</h4>
              <p className="text-[10px] text-gray-400">Web Audio Player</p>
            </Link>

            <Link
              href="/attire"
              className="p-4 rounded-2xl bg-tartan-card hover:bg-tartan-dark border border-tartan-border hover:border-tartan-accent transition-all text-center space-y-2 group shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-tartan-navy text-tartan-gold flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Shirt className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-white font-serif">Tartan Studio</h4>
              <p className="text-[10px] text-gray-400">Attire Selector</p>
            </Link>

            <Link
              href="/booking"
              className="p-4 rounded-2xl bg-tartan-card hover:bg-tartan-dark border border-tartan-gold text-center space-y-2 group shadow-xl ring-1 ring-tartan-gold/30"
            >
              <div className="w-10 h-10 rounded-xl bg-tartan-accent/20 text-tartan-gold flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-tartan-gold font-serif">Live Booking</h4>
              <p className="text-[10px] text-gray-300">Diary & PayPal</p>
            </Link>

            <Link
              href="/social"
              className="p-4 rounded-2xl bg-tartan-card hover:bg-tartan-dark border border-tartan-border hover:border-tartan-accent transition-all text-center space-y-2 group shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-tartan-navy text-tartan-gold flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-white font-serif">Community</h4>
              <p className="text-[10px] text-gray-400">Live Feed & Forum</p>
            </Link>
          </div>
        </div>
      </section>

      {/* About Showcase */}
      <AboutSection />

      {/* Services Showcase */}
      <ServicesSection />

      {/* Audio Jukebox Sampler */}
      <TuneSampler />

      {/* Tartan & Highland Attire Studio */}
      <TartanSelector />

      {/* Live Availability Calendar & Booking */}
      <BookingCalendar />

      {/* Reviews & Testimonials Carousel */}
      <ReviewsSection />

      {/* Searchable FAQ */}
      <FaqSection />

      {/* Direct Contact Form & Map */}
      <ContactSection />

      {/* Footer */}
      <Footer />

      {/* Floating Two-Way Live Chat */}
      <LiveChatWidget />

      {/* Brevo Email & PayPal Modals */}
      {activeBrevoEmail?.isOpen && activeBrevoEmail.booking && (
        <BrevoEmailModal
          isOpen={activeBrevoEmail.isOpen}
          onClose={closeBrevoPreview}
          booking={activeBrevoEmail.booking}
          paypalLink={activeBrevoEmail.paypalLink}
        />
      )}

      {activePayPalModal?.isOpen && activePayPalModal.booking && (
        <PayPalCheckoutModal
          isOpen={activePayPalModal.isOpen}
          onClose={closePayPalModal}
          booking={activePayPalModal.booking}
        />
      )}

    </div>
  );
}
