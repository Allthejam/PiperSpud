'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { EditableElement } from './EditableElement';
import { PwaInstallModal } from './PwaInstallModal';
import { SpudHeritageLogo } from './SpudHeritageLogo';
import { 
  Phone, 
  Mail, 
  Heart, 
  Award, 
  ShieldCheck, 
  Sparkles, 
  Scale, 
  Cookie, 
  FileText,
  Smartphone,
  Download,
  HelpCircle,
  CheckCircle2,
  Zap,
  Music
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { socialLinks, addMailingContact } = useApp();
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);
  const [subscriberEmail, setSubscriberEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscriberEmail) return;
    addMailingContact({
      name: subscriberEmail.split('@')[0],
      email: subscriberEmail,
      source: 'newsletter',
      status: 'subscribed',
      tags: ['VIP Highland Club', 'Website Footer'],
      addedAt: new Date().toISOString(),
      brevoSynced: true
    });
    setIsSubscribed(true);
    setSubscriberEmail('');
    setTimeout(() => setIsSubscribed(false), 5000);
  };

  const socialChannels = [
    {
      name: 'Facebook',
      url: socialLinks?.facebook || 'https://www.facebook.com/spudthepiper/',
      hoverColor: 'hover:bg-blue-600 hover:text-white',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    {
      name: 'X (Twitter)',
      url: socialLinks?.twitter || 'https://twitter.com/spudthepiper',
      hoverColor: 'hover:bg-slate-700 hover:text-white',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    },
    {
      name: 'Pinterest',
      url: socialLinks?.pinterest || 'https://www.pinterest.com/spudthepiper/',
      hoverColor: 'hover:bg-red-600 hover:text-white',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 0a12 12 0 0 0-4.37 23.18c-.07-.95-.13-2.4.03-3.44l1.04-4.41s-.27-.53-.27-1.32c0-1.24.72-2.16 1.61-2.16.76 0 1.13.57 1.13 1.25 0 .76-.49 1.9-0.74 2.96-.21.89.44 1.61 1.32 1.61 1.58 0 2.8-1.67 2.8-4.08 0-2.13-1.53-3.62-3.72-3.62-2.53 0-4.02 1.9-4.02 3.86 0 .77.29 1.59.66 2.04.07.09.08.17.06.26l-.25 1.01c-.04.16-.14.2-.32.12-1.19-.55-1.93-2.29-1.93-3.68 0-2.99 2.18-5.74 6.29-5.74 3.3 0 5.87 2.35 5.87 5.5 0 3.28-2.07 5.92-4.94 5.92-.96 0-1.87-.5-2.18-1.09l-.59 2.27c-.22.83-.8 1.88-1.2 2.51A12 12 0 1 0 12 0z"/>
        </svg>
      )
    },
    {
      name: 'Instagram',
      url: socialLinks?.instagram || 'https://www.instagram.com/spudthepiper/',
      hoverColor: 'hover:bg-gradient-to-tr hover:from-amber-600 hover:via-pink-600 hover:to-purple-600 hover:text-white',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    },
    {
      name: 'LinkedIn',
      url: socialLinks?.linkedin || 'https://www.linkedin.com/in/spudthepiper/',
      hoverColor: 'hover:bg-cyan-700 hover:text-white',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      )
    },
    {
      name: 'TikTok',
      url: socialLinks?.tiktok || 'https://www.tiktok.com/@spudthepiper',
      hoverColor: 'hover:bg-pink-600 hover:text-white',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      )
    },
    {
      name: 'Trustpilot',
      url: socialLinks?.trustpilot || 'https://www.trustpilot.com/review/spudthepiper.co.uk',
      hoverColor: 'hover:bg-[#00b67a] hover:text-white',
      icon: (
        <svg className="w-4 h-4 fill-[#00b67a] group-hover:fill-white" viewBox="0 0 24 24">
          <path d="M12 0l3.708 7.514 8.292 1.206-6 5.849 1.416 8.257L12 18.927l-7.416 3.9 1.416-8.257-6-5.849 8.292-1.206z"/>
        </svg>
      )
    }
  ];

  return (
    <>
      <footer className="bg-tartan-dark border-t border-tartan-border/80 text-gray-400 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          
          {/* VIP Highland Newsletter Signup Banner */}
          <div className="bg-gradient-to-r from-tartan-card via-tartan-navy to-tartan-card p-6 sm:p-8 rounded-3xl border border-tartan-gold/40 shadow-2xl mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-xs font-bold text-tartan-gold uppercase tracking-wider flex items-center justify-center md:justify-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>VIP Highland Club & Newsletter</span>
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white font-serif">
                Join Spud\'s Inner Circle
              </h3>
              <p className="text-xs text-gray-300 max-w-lg">
                Receive festive greetings, Burns Night announcements, exclusive bagpipe recordings, and priority notification when next season\'s diary dates open.
              </p>
            </div>

            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
              <input
                type="email"
                required
                value={subscriberEmail}
                onChange={(e) => setSubscriberEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="bg-tartan-dark border border-tartan-border rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent w-full sm:w-64"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs tracking-wider uppercase whitespace-nowrap hover:brightness-110 shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                {isSubscribed ? 'Subscribed! ✓' : 'Join VIP Club'}
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            
            {/* Col 1: Brand, Bio & Social Channels */}
            <div className="lg:col-span-2 space-y-4">
              <Link href="/" className="inline-flex items-center gap-3.5 group">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-tartan-card via-tartan-navy to-tartan-dark p-1.5 border border-tartan-accent/60 shadow-xl flex items-center justify-center group-hover:scale-105 group-hover:border-tartan-gold transition-all">
                  <SpudHeritageLogo variant="icon" size="custom" className="w-9 h-9" />
                </div>
                <div>
                  <span className="text-xl font-bold text-white font-serif tracking-tight uppercase block leading-tight">
                    Spud The Piper
                  </span>
                  <span className="text-[10px] text-tartan-gold font-serif italic tracking-wider">
                    Official Scottish Heritage • Est. 1999
                  </span>
                </div>
              </Link>
              <EditableElement
                id="footer-brand-desc"
                tag="p"
                defaultContent="Scotland's multiple award-winning Highland Bagpiper for weddings, funerals, castle galas, Burns suppers, and private events globally."
                className="text-gray-400 leading-relaxed text-xs max-w-sm"
                label="Footer Brand Description"
                section="footer"
              />

              {/* Official Social Media Links + Call & Email */}
              <div className="space-y-2.5 pt-2">
                <EditableElement
                  id="footer-social-header"
                  tag="div"
                  defaultContent="Official Social Channels & Contact:"
                  className="text-[11px] font-bold text-tartan-gold uppercase tracking-wider"
                  label="Footer Social Header"
                  section="footer"
                />
                <div className="flex items-center gap-2 flex-wrap text-gray-300">
                  {socialChannels.map((item) => (
                    <a
                      key={item.name}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group p-2.5 rounded-xl bg-tartan-card ${item.hoverColor} text-gray-300 border border-tartan-border hover:border-tartan-accent/50 transition-all shadow hover:scale-110 active:scale-95`}
                      title={`Follow Spud on ${item.name}`}
                    >
                      {item.icon}
                    </a>
                  ))}

                  <a
                    href="tel:07793491367"
                    className="p-2.5 rounded-xl bg-tartan-card hover:bg-green-600 hover:text-white text-green-400 border border-tartan-border hover:border-green-500 transition-all shadow hover:scale-110 active:scale-95"
                    title="Call Spud directly"
                  >
                    <Phone className="w-4 h-4" />
                  </a>

                  <a
                    href="mailto:spud@spudthepiper.co.uk"
                    className="p-2.5 rounded-xl bg-tartan-card hover:bg-amber-600 hover:text-white text-amber-400 border border-tartan-border hover:border-amber-500 transition-all shadow hover:scale-110 active:scale-95"
                    title="Email Spud"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                </div>

                {/* Trustpilot Review Badge in Footer */}
                <div className="pt-2">
                  <a
                    href={socialLinks?.trustpilot || 'https://www.trustpilot.com/review/spudthepiper.co.uk'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-500 text-xs transition-all text-white group shadow hover:bg-emerald-950/70"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                      <svg className="w-4 h-4 fill-[#00b67a]" viewBox="0 0 24 24">
                        <path d="M12 0l3.708 7.514 8.292 1.206-6 5.849 1.416 8.257L12 18.927l-7.416 3.9 1.416-8.257-6-5.849 8.292-1.206z"/>
                      </svg>
                      <span>Trustpilot</span>
                    </div>
                    <span className="text-gray-400 text-[10px]">|</span>
                    <div className="flex items-center text-[#00b67a] text-xs">
                      ★★★★★
                    </div>
                    <span className="text-[11px] text-emerald-400 font-bold">5.0 / 5.0</span>
                    <span className="text-[10px] text-gray-400 group-hover:text-emerald-300 transition-colors">Verified Reviews →</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Col 2: Multi-Page Navigation */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white font-serif uppercase tracking-wider">Navigation</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/" className="hover:text-tartan-gold transition-colors">Home Page</Link></li>
                <li><Link href="/about" className="hover:text-tartan-gold transition-colors">About Spud & Awards</Link></li>
                <li><Link href="/services" className="hover:text-tartan-gold transition-colors">Services & Packages</Link></li>
                <li><Link href="/tunes" className="hover:text-tartan-gold transition-colors">Bagpipe Tune Jukebox</Link></li>
                <li><Link href="/attire" className="hover:text-tartan-gold transition-colors">Tartan & Attire Studio</Link></li>
                <li><Link href="/booking" className="hover:text-tartan-gold transition-colors">Live Diary & Booking</Link></li>
                <li><Link href="/social" className="hover:text-tartan-gold transition-colors">Social Wall & Stream</Link></li>
                <li><Link href="/reviews" className="hover:text-tartan-gold transition-colors">Client Reviews</Link></li>
                <li><Link href="/faq" className="hover:text-tartan-gold transition-colors">FAQ</Link></li>
                <li><Link href="/contact" className="hover:text-tartan-gold transition-colors">Contact Us</Link></li>
              </ul>
            </div>

            {/* Col 3: Piping Services */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white font-serif uppercase tracking-wider">Piping Services</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/services" className="hover:text-gray-200">Scottish Castle Weddings</Link></li>
                <li><Link href="/services" className="hover:text-gray-200">Top Table Pipe-In & Ceilidh</Link></li>
                <li><Link href="/services" className="hover:text-gray-200">Funerals & Memorial Laments</Link></li>
                <li><Link href="/services" className="hover:text-gray-200">Burns Suppers & Hogmanay</Link></li>
                <li><Link href="/services" className="hover:text-gray-200">Corporate & Castle Galas</Link></li>
                <li><Link href="/services" className="hover:text-gray-200">Private 1-on-1 Bagpipe Lessons</Link></li>
              </ul>
            </div>

            {/* Col 4: Progressive Web App (PWA) & Install Guide */}
            <div className="space-y-3 bg-gradient-to-b from-tartan-card to-tartan-dark p-4 rounded-2xl border border-tartan-accent/40 shadow-xl">
              <div className="flex items-center gap-1.5 text-tartan-gold">
                <Smartphone className="w-4 h-4" />
                <h4 className="text-xs font-bold text-white font-serif uppercase tracking-wider">
                  Mobile App (PWA)
                </h4>
              </div>

              <p className="text-[11px] text-gray-300 leading-relaxed">
                Install Spud the Piper on your iPhone, iPad, Android or PC for 1-tap offline sound samples & fast diary booking.
              </p>

              <div className="pt-1 space-y-2">
                <button
                  onClick={() => setIsPwaModalOpen(true)}
                  className="w-full py-2 px-3 rounded-xl bg-gold-gradient text-tartan-dark text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>How to Install App</span>
                </button>

                <Link
                  href="/install"
                  className="w-full py-1.5 px-3 rounded-xl bg-tartan-navy hover:bg-slate-700 text-gray-200 border border-tartan-border text-[11px] font-semibold flex items-center justify-center gap-1 transition-all"
                >
                  <HelpCircle className="w-3 h-3 text-tartan-gold" />
                  <span>Full Step-by-Step Guide →</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-slate-800 text-[10px] text-gray-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Zero app store downloads needed</span>
              </div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-400">
            <p>© {new Date().getFullYear()} Spud the Piper. All Rights Reserved. Scotland.</p>
            
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <button
                onClick={() => setIsPwaModalOpen(true)}
                className="text-tartan-gold hover:underline font-bold flex items-center gap-1"
              >
                <Smartphone className="w-3.5 h-3.5 text-tartan-gold" />
                <span>How to Install</span>
              </button>
              <span>•</span>
              <Link href="/terms" className="hover:underline">Terms</Link>
              <span>•</span>
              <Link href="/privacy" className="hover:underline">Privacy</Link>
              <span>•</span>
              <Link href="/cookies" className="hover:underline">Cookies</Link>
              <span>•</span>
              <Link href="/booking-policy" className="hover:underline">Deposits</Link>
              <span>•</span>
              <Link href="/admin" className="text-tartan-gold hover:underline font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Back Office</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* PWA Install Guide Modal */}
      <PwaInstallModal
        isOpen={isPwaModalOpen}
        onClose={() => setIsPwaModalOpen(false)}
      />
    </>
  );
};
