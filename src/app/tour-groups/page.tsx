'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LiveChatWidget } from '@/components/LiveChatWidget';
import { VisualPencilOverlay } from '@/components/VisualPencilOverlay';
import { EditableElement } from '@/components/EditableElement';
import { SpudHeritageLogo } from '@/components/SpudHeritageLogo';
import { TartanSelector } from '@/components/TartanSelector';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import { 
  Compass, 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Camera, 
  Sparkles, 
  Shirt, 
  CheckCircle2, 
  Award, 
  Heart, 
  Globe, 
  Volume2, 
  Wine, 
  Send, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function TourGroupsPage() {
  const { addNotification, travelConfig } = useApp();

  // Inquiry Form State
  const [operatorName, setOperatorName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [originCountry, setOriginCountry] = useState('United States');
  const [groupSize, setGroupSize] = useState('20-40 Passengers');
  const [tourDate, setTourDate] = useState('');
  const [locationOrHotel, setLocationOrHotel] = useState('');
  const [experienceType, setExperienceType] = useState('Coach Arrival & Traditional Highland Welcome');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !email || !tourDate) return;

    setIsSubmitting(true);
    // Simulate booking / lead notification
    setTimeout(() => {
      addNotification({
        type: 'booking_request',
        title: 'New Tour Group Inquiry',
        message: `${operatorName || contactName} (${originCountry}) for ${groupSize} on ${tourDate} at ${locationOrHotel || 'Highlands'}`,
        actionUrl: '/admin'
      });
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-tartan-dark flex flex-col relative">
      <VisualPencilOverlay />
      <Navbar />

      {/* Hero Banner */}
      <div className="bg-gradient-to-b from-tartan-card via-tartan-navy to-tartan-dark py-16 sm:py-24 border-b border-tartan-border relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 relative z-10">
          <div className="mx-auto w-20 h-20 mb-2">
            <SpudHeritageLogo variant="icon" size="custom" className="w-full h-full" />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tartan-accent/20 border border-tartan-accent/40 text-tartan-gold text-xs font-semibold shadow-lg">
            <Globe className="w-4 h-4" />
            <span>International Coach Holidays & Tour Group Experiences</span>
          </div>

          <EditableElement
            id="tour-page-title"
            tag="h1"
            defaultContent="Highland Bagpipe Welcome for Tour Groups"
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white font-serif tracking-tight uppercase"
            label="Tour Page Title"
            section="tour-groups"
          />

          <EditableElement
            id="tour-page-subtitle"
            tag="p"
            defaultContent="Make your clients' holiday to Scotland truly unforgettable. Spud pipes coach arrivals, hosts interactive Highland regalia sessions, and performs at scenic loch viewpoints, distilleries, and castle hotels across Scotland."
            className="text-base sm:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed"
            label="Tour Page Subtitle"
            section="tour-groups"
          />

          <div className="pt-4 flex items-center justify-center gap-4 flex-wrap">
            <a
              href="#tour-inquiry"
              className="px-6 py-3.5 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xl hover:brightness-110 flex items-center gap-2 transition"
            >
              <Calendar className="w-4 h-4" />
              <span>Enquire for Tour Dates</span>
            </a>
            <a
              href="tel:07793491367"
              className="px-6 py-3.5 bg-tartan-card hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-tartan-border flex items-center gap-2 transition"
            >
              <Phone className="w-4 h-4 text-tartan-gold" />
              <span>Direct Tour Dispatch: 07793 491367</span>
            </a>
          </div>
        </div>
      </div>

      {/* What Tour Groups Experience */}
      <section className="py-16 sm:py-24 bg-tartan-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-tartan-gold uppercase tracking-wider">
              Iconic Scottish Hospitality
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-serif">
              What International Guests Experience
            </h2>
            <p className="text-sm text-gray-300">
              For visitors travelling from North America, Europe, Australia, and Asia, hearing an authentic bagpiper in full ceremonial dress in the Highlands is the bucket-list moment of their journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-tartan-card rounded-2xl p-6 border border-tartan-border hover:border-tartan-gold/60 transition shadow-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-tartan-accent/20 border border-tartan-accent/40 text-tartan-gold flex items-center justify-center">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white font-serif">
                  Coach Arrival & Welcome
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  As your coach pulls up to your hotel, castle, or visitor centre, the stirring sound of the pipes greets your guests, providing an immediate goosebumps moment and the warmest Scottish welcome.
                </p>
              </div>
              <div className="text-[11px] text-tartan-gold font-bold pt-2 border-t border-tartan-border/60">
                15 - 30 Minute Flexible Stops
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-tartan-card rounded-2xl p-6 border border-tartan-border hover:border-tartan-gold/60 transition shadow-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center">
                  <Camera className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white font-serif">
                  Guest Photo Opportunities
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Spud stands in immaculate No. 1 Ceremonial Dress with Feather Bonnet, cross-belt, plaid, and horsehair sporran. Every passenger gets the chance for individual and group photographs with a genuine Highland Piper.
                </p>
              </div>
              <div className="text-[11px] text-tartan-gold font-bold pt-2 border-t border-tartan-border/60">
                Memorable Holiday Keepsakes
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-tartan-card rounded-2xl p-6 border border-tartan-border hover:border-tartan-gold/60 transition shadow-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-tartan-accent/20 border border-tartan-accent/40 text-tartan-gold flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white font-serif">
                  Interactive Story & Q&A
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Spud explains how the Great Highland Bagpipe works, reveals the meaning behind tartans, clan crests, and dirks, and shares entertaining Scottish banter tailored to international holidaymakers.
                </p>
              </div>
              <div className="text-[11px] text-tartan-gold font-bold pt-2 border-t border-tartan-border/60">
                Scottish Heritage & Humour
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-tartan-card rounded-2xl p-6 border border-tartan-border hover:border-tartan-gold/60 transition shadow-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center">
                  <Wine className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white font-serif">
                  Whisky Toasts & Banquets
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Piping tour parties into gala Scottish banquets, performing the official &quot;Address to a Haggis&quot;, or playing outside during sunset drinks at historic castles and distillery tours.
                </p>
              </div>
              <div className="text-[11px] text-tartan-gold font-bold pt-2 border-t border-tartan-border/60">
                Evening Gala Dinners
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Coverage & Venues */}
      <section className="py-16 bg-tartan-navy/60 border-y border-tartan-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tartan-gold/10 border border-tartan-gold/30 text-tartan-gold text-xs font-semibold">
                <MapPin className="w-4 h-4" />
                <span>Prime Scottish Tour Corridors</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-serif">
                Covering the Highlands, Loch Ness, Aviemore & Central Scotland
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                Spud is centrally positioned in the Scottish Highlands (based Aviemore / Inverness-shire) with rapid access to the most popular tour routes: A9 Highland spine, Loch Ness & Urquhart Castle, Inverness, Speyside Distilleries, Cairngorms National Park, Stirling Castle, Fort William, and Edinburgh.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs text-gray-200">
                <div className="bg-tartan-card p-3 rounded-xl border border-tartan-border flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-tartan-gold shrink-0" />
                  <span>Aviemore & Cairngorms</span>
                </div>
                <div className="bg-tartan-card p-3 rounded-xl border border-tartan-border flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-tartan-gold shrink-0" />
                  <span>Inverness & Loch Ness</span>
                </div>
                <div className="bg-tartan-card p-3 rounded-xl border border-tartan-border flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-tartan-gold shrink-0" />
                  <span>Speyside Whisky Trail</span>
                </div>
                <div className="bg-tartan-card p-3 rounded-xl border border-tartan-border flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-tartan-gold shrink-0" />
                  <span>Stirling & Trossachs</span>
                </div>
                <div className="bg-tartan-card p-3 rounded-xl border border-tartan-border flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-tartan-gold shrink-0" />
                  <span>Highland Castle Hotels</span>
                </div>
                <div className="bg-tartan-card p-3 rounded-xl border border-tartan-border flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-tartan-gold shrink-0" />
                  <span>Cruise Shore Excursions</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-tartan-card rounded-3xl p-6 sm:p-8 border border-tartan-border shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-white font-serif flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-tartan-gold" />
                <span>Tour Operator Peace of Mind</span>
              </h3>
              <ul className="space-y-3 text-xs text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-tartan-gold mt-1.5 shrink-0" />
                  <span><strong>100% Punctuality Guarantee</strong>: Synchronized with coach manifests and traffic delays.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-tartan-gold mt-1.5 shrink-0" />
                  <span><strong>Weather Resilient</strong>: Accustomed to all Scottish elements (rain, mist, snow, or shine).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-tartan-gold mt-1.5 shrink-0" />
                  <span><strong>Full Public Liability Insurance</strong>: Accepted at all historic castles and state sites.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-tartan-gold mt-1.5 shrink-0" />
                  <span><strong>Flexible Invoicing & Deposit Portal</strong>: Online credit card, PayPal, or BACS invoicing.</span>
                </li>
              </ul>

              <div className="pt-2">
                <Link
                  href="/meet-spud"
                  className="inline-flex items-center gap-2 text-xs font-bold text-tartan-gold hover:underline"
                >
                  <span>Watch videos of Spud talking and playing</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Attire Preview */}
      <TartanSelector />

      {/* Tour Inquiry Form Section */}
      <section id="tour-inquiry" className="py-20 bg-tartan-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-tartan-card rounded-3xl p-6 sm:p-10 border border-tartan-gold/60 shadow-2xl space-y-6">
            
            <div className="text-center space-y-2 border-b border-tartan-border pb-6">
              <span className="text-xs font-bold text-tartan-gold uppercase tracking-wider">
                Direct Booking Diary
              </span>
              <h2 className="text-3xl font-extrabold text-white font-serif">
                Tour Group Booking & Availability Inquiry
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto">
                Fill out your coach itinerary details below for a fast confirmation and competitive group rate quotation.
              </p>
            </div>

            {isSubmitted ? (
              <div className="p-8 text-center space-y-4 animate-in fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500 mx-auto flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white font-serif">
                  Thank You! Your Tour Inquiry is Received
                </h3>
                <p className="text-sm text-gray-300 max-w-md mx-auto">
                  Spud will review your coach schedule for <strong>{tourDate}</strong> and reply via email ({email}) and telephone with confirmation and details.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="px-6 py-2.5 bg-tartan-navy hover:bg-slate-700 text-gray-200 text-xs font-bold rounded-xl border border-tartan-border"
                  >
                    Submit Another Tour Date
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitInquiry} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1">
                      Tour Operator / Company Name
                    </label>
                    <input
                      type="text"
                      value={operatorName}
                      onChange={(e) => setOperatorName(e.target.value)}
                      placeholder="e.g. Trafalgar / Insight / Grand UK Holidays / Private"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-tartan-accent font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1">
                      Contact Name / Tour Director *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-tartan-accent font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tourdirector@company.com"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-tartan-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1">
                      Telephone / WhatsApp (Mobile) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000 or UK mobile"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-tartan-accent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1">
                      Country of Origin
                    </label>
                    <select
                      value={originCountry}
                      onChange={(e) => setOriginCountry(e.target.value)}
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-tartan-accent font-medium"
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia / NZ">Australia / New Zealand</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Germany / Austria / Switzerland">Germany / Austria / Switzerland</option>
                      <option value="France / Benelux">France / Benelux</option>
                      <option value="Scandinavia">Scandinavia</option>
                      <option value="Asia">Asia</option>
                      <option value="Other">Other International</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1">
                      Estimated Passengers
                    </label>
                    <select
                      value={groupSize}
                      onChange={(e) => setGroupSize(e.target.value)}
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-tartan-accent font-medium"
                    >
                      <option value="Under 15 (VIP Mini-Coach)">Under 15 (VIP Mini-Coach)</option>
                      <option value="15 - 30 Passengers">15 - 30 Passengers</option>
                      <option value="30 - 55 Passengers (Full Coach)">30 - 55 Passengers (Full Coach)</option>
                      <option value="Multiple Coaches (60+ Passengers)">Multiple Coaches (60+ Passengers)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1">
                      Tour Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={tourDate}
                      onChange={(e) => setTourDate(e.target.value)}
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-tartan-accent font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1">
                      Venue, Hotel or Landmark Stop
                    </label>
                    <input
                      type="text"
                      value={locationOrHotel}
                      onChange={(e) => setLocationOrHotel(e.target.value)}
                      placeholder="e.g. Coylumbridge Hotel / Urquhart Castle / Aviemore"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-tartan-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1">
                      Experience Preferred
                    </label>
                    <select
                      value={experienceType}
                      onChange={(e) => setExperienceType(e.target.value)}
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-tartan-accent font-medium"
                    >
                      <option value="Coach Arrival & Traditional Highland Welcome">Coach Arrival & Traditional Highland Welcome (15-30m)</option>
                      <option value="Interactive Piping, Stories & Photo Session">Interactive Piping, Stories & Photo Session (45-60m)</option>
                      <option value="Evening Gala Dinner / Haggis Address">Evening Gala Dinner / Haggis Address</option>
                      <option value="Whisky Distillery Toast & Outdoor Piping">Whisky Distillery Toast & Outdoor Piping</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-tartan-gold mb-1">
                    Special Requests, Timings or Notes
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Provide estimated coach arrival time, special tune requests (e.g. Scotland the Brave, Amazing Grace), or logistics..."
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-3 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-tartan-accent"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xl hover:brightness-110 flex items-center justify-center gap-2 transition"
                  >
                    <Send className="w-4 h-4 text-tartan-dark" />
                    <span>{isSubmitting ? 'Sending Request to Spud...' : 'Submit Tour Group Inquiry'}</span>
                  </button>
                </div>
              </form>
            )}

          </div>

        </div>
      </section>

      <Footer />
      <LiveChatWidget />
    </div>
  );
}
