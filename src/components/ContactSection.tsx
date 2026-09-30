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
  Calendar,
  Radio,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { EditableElement } from './EditableElement';

export const ContactSection: React.FC = () => {
  const { 
    isVisualEditMode, 
    showLiveStream, 
    toggleLiveStream, 
    setShowLiveStream,
    addMailingContact,
    submitOfflineInquiry
  } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    // Send direct offline inquiry to Back Office Message Center & Firestore
    try {
      submitOfflineInquiry({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        eventType: 'Website Contact Form',
        question: message.trim()
      });
    } catch (err) {
      console.warn('Could not submit contact inquiry:', err);
    }

    setIsSent(true);
    setTimeout(() => {
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setIsSent(false);
    }, 4000);
  };

  return (
    <section id="contact" className="py-20 bg-tartan-dark relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tartan-accent/15 border border-tartan-accent/40 text-tartan-gold text-xs font-semibold">
            <Mail className="w-4 h-4 shrink-0" />
            <EditableElement
              id="contact-header-badge"
              tag="span"
              defaultContent="Get In Touch with Spud"
              label="Contact Header Badge"
              section="contact"
            />
          </div>
          <EditableElement
            id="contact-header-title"
            tag="h2"
            defaultContent="Let's Plan Your Unforgettable Bagpipe Performance"
            className="text-3xl sm:text-5xl font-extrabold text-white font-serif tracking-tight"
            label="Contact Header Title"
            section="contact"
          />
          <EditableElement
            id="contact-header-desc"
            tag="p"
            defaultContent="Have an inquiry or special request? Reach out to Spud directly via phone, WhatsApp, or the contact form below."
            className="text-base text-gray-300"
            label="Contact Header Description"
            section="contact"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Direct Contact Info, Coverage & Live Stream */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Quick Contact Channels Card */}
            <div className="bg-tartan-card rounded-3xl p-6 sm:p-8 border border-tartan-accent/40 shadow-2xl space-y-6">
              
              <div className="flex items-center justify-between">
                <EditableElement
                  id="contact-quick-title"
                  tag="h3"
                  defaultContent="Quick Contact Channels"
                  className="text-xl font-bold text-white font-serif"
                  label="Quick Contact Section Title"
                  section="contact"
                />
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Direct to Spud</span>
                </span>
              </div>

              <div className="space-y-4">
                {/* Phone Card */}
                <a
                  href="tel:07793491367"
                  className="p-4 rounded-2xl bg-tartan-navy hover:bg-slate-700/80 border border-tartan-border flex items-center gap-4 transition-all group shadow-md"
                >
                  <div className="w-12 h-12 rounded-xl bg-green-900/60 text-green-400 border border-green-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <EditableElement
                      id="contact-phone-label"
                      tag="p"
                      defaultContent="Direct Phone & WhatsApp"
                      className="text-xs text-tartan-gold font-bold uppercase tracking-wider"
                      label="Phone Label"
                      section="contact"
                    />
                    <EditableElement
                      id="contact-phone-value"
                      tag="p"
                      defaultContent="07793 491367"
                      className="text-base sm:text-lg font-bold text-white"
                      label="Direct Phone Number"
                      section="contact"
                    />
                    <EditableElement
                      id="contact-phone-note"
                      tag="span"
                      defaultContent="Available 7 days • Direct line to Callum (Spud)"
                      className="text-[10px] text-gray-400 block mt-0.5"
                      label="Phone Availability Note"
                      section="contact"
                    />
                  </div>
                </a>

                {/* Email Card */}
                <a
                  href="mailto:spud@spudthepiper.co.uk"
                  className="p-4 rounded-2xl bg-tartan-navy hover:bg-slate-700/80 border border-tartan-border flex items-center gap-4 transition-all group shadow-md"
                >
                  <div className="w-12 h-12 rounded-xl bg-tartan-accent/20 text-tartan-gold border border-tartan-accent/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <EditableElement
                      id="contact-email-label"
                      tag="p"
                      defaultContent="Official Email"
                      className="text-xs text-tartan-gold font-bold uppercase tracking-wider"
                      label="Email Label"
                      section="contact"
                    />
                    <EditableElement
                      id="contact-email-value"
                      tag="p"
                      defaultContent="spud@spudthepiper.co.uk"
                      className="text-sm sm:text-base font-bold text-white truncate"
                      label="Official Email Address"
                      section="contact"
                    />
                    <EditableElement
                      id="contact-email-note"
                      tag="span"
                      defaultContent="Brevo verified • Enquiries answered within 24 hrs"
                      className="text-[10px] text-gray-400 block mt-0.5"
                      label="Email Response Note"
                      section="contact"
                    />
                  </div>
                </a>
              </div>

              {/* Primary Scotland Coverage */}
              <div className="pt-4 border-t border-tartan-border/60 space-y-2.5">
                <p className="text-xs font-bold text-tartan-gold uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <EditableElement
                    id="contact-areas-label"
                    tag="span"
                    defaultContent="Primary Scotland & Worldwide Coverage"
                    label="Coverage Title"
                    section="contact"
                  />
                </p>
                <div className="p-3 bg-tartan-dark rounded-xl border border-tartan-border/80">
                  <EditableElement
                    id="contact-areas-desc"
                    tag="p"
                    defaultContent="Aviemore & Cairngorms • Inverness & Highlands • Edinburgh & Lothians • Glasgow & West • Stirling & Perthshire • Aberdeenshire • Isle of Skye • UK-Wide & International Expeditions"
                    className="text-xs text-gray-300 leading-relaxed"
                    label="Service Areas Description"
                    section="contact"
                  />
                </div>
              </div>

            </div>

            {/* Live Streaming Info Card (with Add / Remove / Edit Options) */}
            {showLiveStream ? (
              <div className="bg-gradient-to-br from-blue-950/90 via-tartan-navy to-slate-900 rounded-3xl p-6 border border-blue-500/40 shadow-2xl space-y-3 relative group">
                
                {/* Visual Edit Control: Remove / Hide Live Stream Button */}
                {isVisualEditMode && (
                  <div className="flex items-center justify-between pb-2 border-b border-blue-500/30">
                    <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1">
                      <Radio className="w-3 h-3 text-red-400 animate-pulse" />
                      <span>Live Stream Section (Active)</span>
                    </span>
                    <button
                      onClick={toggleLiveStream}
                      className="px-2.5 py-1 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 text-[11px] font-bold border border-red-700 flex items-center gap-1 shadow transition-all"
                      title="Hide or remove this live stream section from the home page"
                    >
                      <EyeOff className="w-3 h-3" />
                      <span>Remove / Hide Section</span>
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                    <EditableElement
                      id="contact-stream-badge"
                      tag="span"
                      defaultContent="Facebook Live Stream"
                      className="text-red-400 font-bold uppercase tracking-wider"
                      label="Stream Platform Badge"
                      section="livestream"
                    />
                  </div>
                  <span className="text-[10px] text-blue-300 bg-blue-900/60 px-2 py-0.5 rounded-full border border-blue-700 font-medium">
                    Online Broadcast
                  </span>
                </div>

                <EditableElement
                  id="contact-stream-schedule"
                  tag="h4"
                  defaultContent="Every Tuesday & Friday at 6:00 PM"
                  className="text-base sm:text-lg font-bold text-white font-serif"
                  label="Live Stream Schedule / Heading"
                  section="livestream"
                />

                <EditableElement
                  id="contact-stream-desc"
                  tag="p"
                  defaultContent="Join Spud online from the comfort of your home for live Highland tune requests, Scottish banter, and piping stories from the Cairngorms."
                  className="text-xs text-blue-200 leading-relaxed"
                  label="Live Stream Description"
                  section="livestream"
                />

                <div className="pt-2">
                  <a
                    href="https://www.facebook.com/spudthepiper/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all group-hover:scale-[1.02]"
                  >
                    <EditableElement
                      id="contact-stream-btn"
                      tag="span"
                      defaultContent="Watch Live on Facebook →"
                      defaultLinkUrl="https://www.facebook.com/spudthepiper/"
                      label="Live Stream Button Text"
                      section="livestream"
                    />
                  </a>
                </div>
              </div>
            ) : (
              /* When Live Stream is Hidden: In Visual Edit Mode, show prompt to Add / Restore it */
              isVisualEditMode && (
                <div className="bg-tartan-card/60 rounded-3xl p-6 border-2 border-dashed border-blue-500/40 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-blue-950/80 text-blue-400 border border-blue-500/50 flex items-center justify-center mx-auto">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white font-serif">Live Stream Section is Currently Hidden</h4>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">
                      Public visitors cannot see this section. Click below to restore and display the Live Stream on your home page.
                    </p>
                  </div>
                  <button
                    onClick={toggleLiveStream}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 mx-auto shadow transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add / Restore Live Stream Section</span>
                  </button>
                </div>
              )
            )}

          </div>

          {/* Right Column: Send an Inquiry to Spud Form */}
          <div className="lg:col-span-7 bg-tartan-card rounded-3xl p-6 sm:p-8 border border-tartan-accent/40 shadow-2xl space-y-6">
            
            {/* Form Header */}
            <div>
              <EditableElement
                id="contact-form-title"
                tag="h3"
                defaultContent="Send an Inquiry to Spud"
                className="text-xl sm:text-2xl font-bold text-white font-serif mb-1"
                label="Contact Form Title"
                section="contact"
              />
              <EditableElement
                id="contact-form-sub"
                tag="p"
                defaultContent="Have a question about event availability, custom tune requests, or travel logistics? Send a direct message to Spud's personal inbox."
                className="text-xs text-gray-300"
                label="Contact Form Subtitle"
                section="contact"
              />
            </div>

            {isSent ? (
              <div className="py-12 text-center space-y-4 bg-tartan-navy/60 p-8 rounded-2xl border border-green-500/50 animate-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-green-900/60 text-green-400 border border-green-500 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <EditableElement
                  id="contact-form-success-title"
                  tag="h3"
                  defaultContent="Message Sent Successfully!"
                  className="text-2xl font-bold text-white font-serif"
                  label="Success Message Title"
                  section="contact"
                />
                <EditableElement
                  id="contact-form-success-desc"
                  tag="p"
                  defaultContent="Thank you for reaching out. Spud has received your inquiry and will be in touch with you shortly via your preferred contact channel."
                  className="text-sm text-gray-300 max-w-md mx-auto"
                  label="Success Message Description"
                  section="contact"
                />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1.5">
                      <EditableElement
                        id="contact-form-name-label"
                        tag="span"
                        defaultContent="Your Full Name *"
                        label="Form Name Label"
                        section="contact"
                      />
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Fiona MacLeod"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-tartan-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1.5">
                      <EditableElement
                        id="contact-form-email-label"
                        tag="span"
                        defaultContent="Email Address *"
                        label="Form Email Label"
                        section="contact"
                      />
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="fiona@example.scot"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-tartan-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-tartan-gold mb-1.5">
                    <EditableElement
                      id="contact-form-phone-label"
                      tag="span"
                      defaultContent="Phone Number (Optional)"
                      label="Form Phone Label"
                      section="contact"
                    />
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="07798 123456"
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-tartan-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-tartan-gold mb-1.5">
                    <EditableElement
                      id="contact-form-msg-label"
                      tag="span"
                      defaultContent="Your Message or Event Details *"
                      label="Form Message Label"
                      section="contact"
                    />
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Please include event date, venue location, occasion type, or any questions for Spud..."
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-3.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-tartan-accent"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                  >
                    <Send className="w-4 h-4" />
                    <EditableElement
                      id="contact-form-btn-text"
                      tag="span"
                      defaultContent="Send Message to Spud"
                      label="Form Submit Button"
                      section="contact"
                    />
                  </button>
                  <p className="text-[11px] text-gray-400 text-center mt-2">
                    Enquiries go directly to Spud the Piper. You will receive an email confirmation upon sending.
                  </p>
                </div>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
