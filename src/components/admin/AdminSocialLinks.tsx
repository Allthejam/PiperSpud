'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Share2, 
  Check, 
  ExternalLink, 
  Save, 
  RotateCcw, 
  ShieldCheck, 
  Globe, 
  Sparkles,
  Link2
} from 'lucide-react';
import { SocialMediaLinks } from '@/types/spud';
import { initialSocialLinks } from '@/lib/initialData';

export const AdminSocialLinks: React.FC = () => {
  const { socialLinks, updateSocialLinks } = useApp();

  const [formData, setFormData] = useState<SocialMediaLinks>({
    facebook: socialLinks.facebook || '',
    twitter: socialLinks.twitter || '',
    pinterest: socialLinks.pinterest || '',
    instagram: socialLinks.instagram || '',
    linkedin: socialLinks.linkedin || '',
    tiktok: socialLinks.tiktok || '',
    trustpilot: socialLinks.trustpilot || ''
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (platform: keyof SocialMediaLinks, val: string) => {
    setFormData(prev => ({ ...prev, [platform]: val }));
    setIsSaved(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSocialLinks(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all social links to Spud\'s standard defaults?')) {
      setFormData(initialSocialLinks);
      updateSocialLinks(initialSocialLinks);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  const socialPlatforms = [
    {
      key: 'facebook' as keyof SocialMediaLinks,
      name: 'Facebook',
      description: 'Official Spud the Piper Facebook page & wedding community group',
      placeholder: 'https://www.facebook.com/spudthepiper/',
      color: 'from-blue-600 to-blue-800',
      badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    {
      key: 'twitter' as keyof SocialMediaLinks,
      name: 'X (Twitter)',
      description: 'Official X / Twitter profile for piping announcements, tour dates & live galas',
      placeholder: 'https://twitter.com/spudthepiper',
      color: 'from-gray-700 to-black',
      badgeBg: 'bg-gray-500/20 text-gray-300 border-gray-500/40',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    },
    {
      key: 'pinterest' as keyof SocialMediaLinks,
      name: 'Pinterest',
      description: 'Scottish wedding attire inspiration, Highland castle photography & tartan mood boards',
      placeholder: 'https://www.pinterest.com/spudthepiper/',
      color: 'from-red-600 to-rose-800',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 0a12 12 0 0 0-4.37 23.18c-.07-.95-.13-2.4.03-3.44l1.04-4.41s-.27-.53-.27-1.32c0-1.24.72-2.16 1.61-2.16.76 0 1.13.57 1.13 1.25 0 .76-.49 1.9-0.74 2.96-.21.89.44 1.61 1.32 1.61 1.58 0 2.8-1.67 2.8-4.08 0-2.13-1.53-3.62-3.72-3.62-2.53 0-4.02 1.9-4.02 3.86 0 .77.29 1.59.66 2.04.07.09.08.17.06.26l-.25 1.01c-.04.16-.14.2-.32.12-1.19-.55-1.93-2.29-1.93-3.68 0-2.99 2.18-5.74 6.29-5.74 3.3 0 5.87 2.35 5.87 5.5 0 3.28-2.07 5.92-4.94 5.92-.96 0-1.87-.5-2.18-1.09l-.59 2.27c-.22.83-.8 1.88-1.2 2.51A12 12 0 1 0 12 0z"/>
        </svg>
      )
    },
    {
      key: 'instagram' as keyof SocialMediaLinks,
      name: 'Instagram',
      description: 'Behind the scenes bagpipe clips, castle reels, wedding entrance videos & stories',
      placeholder: 'https://www.instagram.com/spudthepiper/',
      color: 'from-pink-600 via-purple-600 to-amber-600',
      badgeBg: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    },
    {
      key: 'linkedin' as keyof SocialMediaLinks,
      name: 'LinkedIn',
      description: 'Corporate entertainment bookings, brand partnerships, Burns Night galas & event networking',
      placeholder: 'https://www.linkedin.com/in/spudthepiper/',
      color: 'from-blue-700 to-cyan-800',
      badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      )
    },
    {
      key: 'tiktok' as keyof SocialMediaLinks,
      name: 'TikTok',
      description: 'Viral Scottish piping tunes, sound testing in castle halls & NYC Tartan Day highlights',
      placeholder: 'https://www.tiktok.com/@spudthepiper',
      color: 'from-slate-900 to-black',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      )
    },
    {
      key: 'trustpilot' as keyof SocialMediaLinks,
      name: 'Trustpilot',
      description: 'Official Trustpilot reviews page, customer ratings score & verified client feedback',
      placeholder: 'https://www.trustpilot.com/review/spudthepiper.co.uk',
      color: 'from-emerald-700 to-green-900',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      icon: (
        <svg className="w-5 h-5 fill-[#00b67a]" viewBox="0 0 24 24">
          <path d="M12 0l3.708 7.514 8.292 1.206-6 5.849 1.416 8.257L12 18.927l-7.416 3.9 1.416-8.257-6-5.849 8.292-1.206z"/>
        </svg>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Top Banner */}
      <div className="bg-tartan-card rounded-3xl p-6 sm:p-8 border border-tartan-border shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-bold border border-amber-500/30">
            <Share2 className="w-4 h-4 text-amber-400" />
            <span>Footer & Public Social Profiles</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif">
            Social Media Links & Channels
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-2xl leading-relaxed">
            Configure your official social media URLs for Facebook, X (Twitter), Pinterest, Instagram, LinkedIn, and TikTok. These links instantly sync to the website footer and social integrations.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleResetDefaults}
            type="button"
            className="px-4 py-2.5 bg-tartan-navy hover:bg-slate-700 text-gray-300 hover:text-white rounded-xl border border-tartan-border text-xs font-bold transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Save Success Banner */}
      {isSaved && (
        <div className="p-4 rounded-2xl bg-green-950/60 border border-green-500/50 flex items-center justify-between text-green-300 text-xs sm:text-sm font-semibold shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <Check className="w-5 h-5 text-green-400" />
            <span>Social media links successfully updated and synced with the footer!</span>
          </div>
          <a
            href="/#social"
            target="_blank"
            className="underline hover:text-white text-xs flex items-center gap-1"
          >
            <span>View Public Footer</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Social Links Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {socialPlatforms.map((platform) => {
            const currentVal = formData[platform.key] || '';

            return (
              <div
                key={platform.key}
                className="bg-tartan-card rounded-3xl p-6 border border-tartan-border shadow-xl hover:border-tartan-accent/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${platform.color} flex items-center justify-center text-white shadow`}>
                        {platform.icon}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white font-serif">{platform.name}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${platform.badgeBg}`}>
                          Official Channel
                        </span>
                      </div>
                    </div>

                    {currentVal && (
                      <a
                        href={currentVal}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-tartan-navy hover:bg-slate-700 text-tartan-gold text-xs font-bold border border-tartan-border flex items-center gap-1.5 transition-all shadow"
                        title={`Test ${platform.name} URL`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Test Link</span>
                      </a>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed">
                    {platform.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-tartan-border/50">
                  <label className="block text-xs font-semibold text-tartan-gold">
                    {platform.name} URL Profile Link
                  </label>
                  <div className="relative">
                    <Link2 className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={currentVal}
                      onChange={(e) => handleChange(platform.key, e.target.value)}
                      placeholder={platform.placeholder}
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent transition-colors"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Form Bottom Save Action */}
        <div className="p-6 bg-tartan-dark rounded-3xl border border-tartan-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <ShieldCheck className="w-4 h-4 text-green-400 shrink-0" />
            <span>Changes save immediately to local state and apply to the public footer across all devices.</span>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save All Social Links</span>
          </button>
        </div>
      </form>

    </div>
  );
};
