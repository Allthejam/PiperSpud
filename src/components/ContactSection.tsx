'use client';

import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Send, 
  CheckCircle2, 
  MessageSquare, 
  Clock, 
  Share2,
  Calendar
} from 'lucide-react';

export const ContactSection: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setIsSent(true);
    setTimeout(() => {
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setIsSent(false);
    }, 3000);
  };

  return (
    <section id="contact" className="py-20 bg-tartan-dark relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tartan-accent/15 border border-tartan-accent/40 text-tartan-gold text-xs font-semibold">
            <Mail className="w-4 h-4" />
            <span>Get In Touch with Spud</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-serif tracking-tight">
            Let\'s Plan Your Unforgettable Bagpipe Performance
          </h2>
          <p className="text-base text-gray-300">
            Have an inquiry or special request? Reach out to Spud directly via phone, WhatsApp, or the contact form below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Direct Contact Info & Map Coverage */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Direct Phone & WhatsApp Card */}
            <div className="bg-tartan-card rounded-3xl p-6 sm:p-8 border border-tartan-accent/40 shadow-2xl space-y-6">
              <h3 className="text-xl font-bold text-white font-serif">Quick Contact Channels</h3>

              <div className="space-y-4">
                <a
                  href="tel:07793491367"
                  className="p-4 rounded-2xl bg-tartan-navy hover:bg-slate-700/80 border border-tartan-border flex items-center gap-4 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-green-900/60 text-green-400 border border-green-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-tartan-gold font-bold uppercase tracking-wider">Direct Phone & WhatsApp</p>
                    <p className="text-base sm:text-lg font-bold text-white">07793 491367</p>
                  </div>
                </a>

                <a
                  href="mailto:spud@spudthepiper.co.uk"
                  className="p-4 rounded-2xl bg-tartan-navy hover:bg-slate-700/80 border border-tartan-border flex items-center gap-4 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-tartan-accent/20 text-tartan-gold border border-tartan-accent/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-tartan-gold font-bold uppercase tracking-wider">Official Email</p>
                    <p className="text-sm sm:text-base font-bold text-white">spud@spudthepiper.co.uk</p>
                  </div>
                </a>
              </div>

              {/* Service Areas */}
              <div className="pt-4 border-t border-tartan-border/60 space-y-2">
                <p className="text-xs font-bold text-tartan-gold uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Primary Scotland Coverage</span>
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {['Edinburgh & Lothians', 'Glasgow & West', 'Inverness & Highlands', 'Stirling & Perthshire', 'Aberdeenshire', 'Isle of Skye', 'UK Wide', 'Worldwide'].map((area, idx) => (
                    <span key={idx} className="bg-tartan-dark px-2.5 py-1 rounded-md text-gray-300 border border-tartan-border">
                      {area}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Live Streaming Info */}
            <div className="bg-gradient-to-br from-blue-950/80 to-tartan-navy rounded-3xl p-6 border border-blue-500/30 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                <span>Facebook Live Stream</span>
              </div>
              <h4 className="text-base font-bold text-white font-serif">Every Tuesday & Friday at 6:00 PM</h4>
              <p className="text-xs text-blue-200">
                Join Spud online from the comfort of your home for live Highland tune requests and Scottish banter.
              </p>
            </div>

          </div>

          {/* Right Column: Contact Inquiry Form */}
          <div className="lg:col-span-7 bg-tartan-card rounded-3xl p-6 sm:p-8 border border-tartan-accent/40 shadow-2xl">
            {isSent ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-900/60 text-green-400 border border-green-500 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white font-serif">Message Sent Successfully!</h3>
                <p className="text-sm text-gray-300 max-w-md mx-auto">
                  Thank you for reaching out. Spud has received your inquiry and will be in touch with you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-bold text-white font-serif mb-2">Send an Inquiry to Spud</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John MacLean"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-tartan-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-tartan-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-tartan-gold mb-1">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="07700 900123"
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-tartan-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-tartan-gold mb-1">Your Message or Event Details *</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Please include event type, desired date, venue location, or any questions for Spud..."
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-3.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-tartan-accent"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message to Spud</span>
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
