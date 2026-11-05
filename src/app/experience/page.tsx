'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LiveChatWidget } from '@/components/LiveChatWidget';
import { VisualPencilOverlay } from '@/components/VisualPencilOverlay';
import { EditableElement } from '@/components/EditableElement';
import { useApp } from '@/context/AppContext';
import { 
  Award, 
  Clock, 
  Users, 
  MapPin, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  CheckCircle2, 
  ExternalLink, 
  Heart, 
  Music, 
  HelpCircle, 
  ChevronRight, 
  Info,
  Car,
  Compass,
  ArrowRight,
  Star
} from 'lucide-react';

interface ExperienceSlot {
  id: string;
  dateStr: string;
  displayDate: string;
  timeSlot: string;
  isAvailable: boolean;
  remainingSpots: number;
}

const UPCOMING_EXPERIENCE_SLOTS: ExperienceSlot[] = [
  {
    id: 'abnb-slot-1',
    dateStr: '2026-11-08',
    displayDate: 'Sunday, 8 November 2026',
    timeSlot: '12:00 – 13:30',
    isAvailable: true,
    remainingSpots: 10
  },
  {
    id: 'abnb-slot-2',
    dateStr: '2026-11-11',
    displayDate: 'Wednesday, 11 November 2026',
    timeSlot: '14:00 – 15:30',
    isAvailable: true,
    remainingSpots: 10
  },
  {
    id: 'abnb-slot-3',
    dateStr: '2026-12-03',
    displayDate: 'Thursday, 3 December 2026',
    timeSlot: '10:00 – 11:30',
    isAvailable: true,
    remainingSpots: 10
  },
  {
    id: 'abnb-slot-4',
    dateStr: '2026-12-04',
    displayDate: 'Friday, 4 December 2026',
    timeSlot: '10:00 – 11:30',
    isAvailable: true,
    remainingSpots: 10
  },
  {
    id: 'abnb-slot-5',
    dateStr: '2026-12-09',
    displayDate: 'Wednesday, 9 December 2026',
    timeSlot: '10:00 – 11:30',
    isAvailable: true,
    remainingSpots: 10
  }
];

const AGENDA_STEPS = [
  {
    step: 1,
    title: 'Discover the life of a bagpiper',
    subtitle: 'Step 1 • 15 Mins',
    description: "Spud kicks off with an entertaining and personal introduction to professional piping in Scotland. He traces his 25+ year piping career since 1999, reveals behind-the-scenes stories from piping at world-famous castle weddings (including Madonna's wedding at Skibo Castle), and explains where bagpipes fit into Highland heritage today.",
    image: 'https://a0.muscache.com/im/pictures/Mt/MtTemplate-7375032/original/d4cc11a9-61a6-4af2-90b5-ee568d7775dc.jpeg'
  },
  {
    step: 2,
    title: 'Deconstruct the instrument',
    subtitle: 'Step 2 • 20 Mins',
    description: 'Watch the Great Highland Bagpipe get disassembled piece by piece right before your eyes! Spud gives you a hands-on primer on each component: the airtight pipe bag, blowpipe non-return valve, bass & tenor drones, chanter, and the delicate cane reeds that give the bagpipes their unmistakable sound.',
    image: 'https://a0.muscache.com/im/pictures/Mt/MtTemplate-7375032/original/43e4e33f-51ba-48b1-b0f5-aa5e9bd8a014.jpeg'
  },
  {
    step: 3,
    title: 'Take in a live demonstration',
    subtitle: 'Step 3 • 15 Mins',
    description: 'See and hear Spud demonstrate the nuance across all nine notes of the traditional Scottish Mixolydian scale. He showcases the difference between acoustic and electronic bagpipes, demonstrates lightning-fast grace notes and birls, and performs an up-close musical demonstration.',
    image: 'https://a0.muscache.com/im/pictures/Mt/MtTemplate-7375032/original/a4018f00-cee3-41ab-b7e6-bdd2f0bc8d6c.jpeg'
  },
  {
    step: 4,
    title: 'Practice finger placement',
    subtitle: 'Step 4 • 20 Mins',
    description: 'Now it is your turn! Every guest is handed an individual, sanitized Scottish practice chanter—the traditional woodwind used by pipers for rehearsals. Spud patiently guides your fingers over the tone holes, teaching you the scale and playing simple Scottish tunes together as a group.',
    image: 'https://a0.muscache.com/im/pictures/Mt/MtTemplate-7375032/original/7f958b11-c2dd-454a-aa79-0c0714b7b39f.jpeg'
  },
  {
    step: 5,
    title: 'Refine your bag control',
    subtitle: 'Step 5 • 15 Mins',
    description: 'Step up to the real full bagpipes! Pick up an inflated bag and practice proper arm pressure, blowing technique, and how to coordinate breath control with the arm squeeze to sustain steady drone harmony without losing sound.',
    image: 'https://a0.muscache.com/im/pictures/Mt/MtTemplate-7375032/original/fcf44259-b36b-4589-99af-670e604f08ce.png'
  },
  {
    step: 6,
    title: 'Snap pictures with the bagpipes',
    subtitle: 'Step 6 • 15 Mins',
    description: 'Memorialize your masterclass by stepping outside to the historic 1717 Carrbridge Packhorse Bridge—the oldest stone bridge in the Scottish Highlands! Pose for unforgettable photos and videos holding the Great Highland Bagpipes alongside Spud in full Highland dress.',
    image: 'https://a0.muscache.com/im/pictures/Mt/MtTemplate-7375032/original/fc385be9-5647-4333-90c3-0bb86f51fa43.jpeg'
  }
];

export default function AirbnbExperiencePage() {
  const router = useRouter();
  const { isMounted, cmsBlocks } = useApp();
  const [selectedSlot, setSelectedSlot] = useState<ExperienceSlot>(UPCOMING_EXPERIENCE_SLOTS[0]);
  const [guestCount, setGuestCount] = useState<number>(2);
  const [customDate, setCustomDate] = useState<string>('');
  const [isBookingSubmitting, setIsBookingSubmitting] = useState<boolean>(false);

  // Read editable CMS price (or fallback to £91 matching live Airbnb advert)
  const priceBlock = isMounted && Array.isArray(cmsBlocks) ? cmsBlocks.find(b => b && b.id === 'airbnb-price-per-guest') : undefined;
  const parsedPrice = priceBlock?.content ? parseFloat(priceBlock.content.replace(/[^0-9.]/g, '')) : NaN;
  const pricePerGuest = !isNaN(parsedPrice) && parsedPrice > 0 ? parsedPrice : 91;
  const totalPrice = (guestCount * pricePerGuest).toFixed(0);
  const airbnbListingUrl = 'https://www.airbnb.co.uk/experiences/7375032?viralityEntryPoint=2&s=76';

  const handleBookDirect = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBookingSubmitting(true);
    const chosenDate = customDate || selectedSlot.dateStr;
    const chosenTime = selectedSlot.timeSlot;
    
    // Redirect to main booking calendar pre-configured for this experience
    router.push(`/booking?service=srv-experience&date=${encodeURIComponent(chosenDate)}&time=${encodeURIComponent(chosenTime)}&guests=${guestCount}&location=${encodeURIComponent('Carrbridge Hotel, PH23 3AB')}`);
  };

  return (
    <div className="min-h-screen bg-tartan-dark flex flex-col relative text-gray-200">
      <VisualPencilOverlay />
      <Navbar />

      {/* Hero Header */}
      <div className="relative bg-gradient-to-b from-tartan-card via-tartan-navy to-tartan-dark border-b border-tartan-border py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Breadcrumb & Official Partnership Badge */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Link href="/" className="hover:text-tartan-gold transition-colors">Home</Link>
              <span>/</span>
              <Link href="/services" className="hover:text-tartan-gold transition-colors">Services</Link>
              <span>/</span>
              <span className="text-tartan-gold font-bold">Airbnb Experience</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-bold shadow-lg">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
              <span>Official Airbnb Experience Partner • Listing #7375032</span>
            </div>
          </div>

          {/* Heading & Byline */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-serif tracking-tight">
              Learn to Play Highland Bagpipes with @spudthepiper
            </h1>
            <p className="text-base sm:text-lg text-gray-300 max-w-4xl leading-relaxed">
              Join award-winning Scottish musician <strong>Spud the Piper (Callum Fraser)</strong> for a hands-on masterclass in the art of the Great Highland Bagpipe. From finger placement on practice chanters to real bag pressure and drone blowing, learn on authentic Highland instruments in the heart of the Cairngorms. No prior musical experience required!
            </p>
          </div>

          {/* Location & Quick Meta Bar */}
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap text-xs sm:text-sm text-gray-300 pt-2 border-t border-tartan-border/60">
            <div className="flex items-center gap-1.5 text-tartan-gold font-semibold">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>Carrbridge Hotel, Carrbridge (near Aviemore) • PH23 3AB</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>1.5 Hours (90 Mins)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Up to 10 Guests • Ages 9+</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-300 font-bold">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
              <span>5.0 Star Scottish Highland Experience</span>
            </div>
          </div>

        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Photo Gallery Grid (Authentic Airbnb Images) */}
        <section className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4 rounded-3xl overflow-hidden border border-tartan-border shadow-2xl">
            {/* Main Big Photo */}
            <div className="md:col-span-2 md:row-span-2 relative min-h-[320px] sm:min-h-[420px] group overflow-hidden bg-tartan-navy">
              <Image 
                src="https://a0.muscache.com/im/pictures/Mt/MtTemplate-7375032/original/d4cc11a9-61a6-4af2-90b5-ee568d7775dc.jpeg"
                alt="Spud the Piper holding Highland Bagpipes in Carrbridge"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                <div>
                  <span className="px-3 py-1 rounded-full bg-tartan-gold text-tartan-dark text-xs font-bold uppercase tracking-wider">
                    Featured Masterclass
                  </span>
                  <h3 className="text-xl font-bold text-white font-serif mt-2">
                    Carrbridge Historic 1717 Packhorse Bridge
                  </h3>
                </div>
              </div>
            </div>

            {/* 4 Supporting Photos */}
            <div className="relative min-h-[190px] group overflow-hidden bg-tartan-navy">
              <Image 
                src="https://a0.muscache.com/im/pictures/Mt/MtTemplate-7375032/original/43e4e33f-51ba-48b1-b0f5-aa5e9bd8a014.jpeg"
                alt="Deconstructing the bagpipes"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 text-[11px] font-semibold text-white">
                Deconstruct the Instrument
              </div>
            </div>

            <div className="relative min-h-[190px] group overflow-hidden bg-tartan-navy">
              <Image 
                src="https://a0.muscache.com/im/pictures/Mt/MtTemplate-7375032/original/a4018f00-cee3-41ab-b7e6-bdd2f0bc8d6c.jpeg"
                alt="Demonstrating scales and notes"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 text-[11px] font-semibold text-white">
                Live Acoustic &amp; Electric Demo
              </div>
            </div>

            <div className="relative min-h-[190px] group overflow-hidden bg-tartan-navy">
              <Image 
                src="https://a0.muscache.com/im/pictures/Mt/MtTemplate-7375032/original/7f958b11-c2dd-454a-aa79-0c0714b7b39f.jpeg"
                alt="Practice chanter finger placement"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 text-[11px] font-semibold text-white">
                Hands-On Practice Chanters
              </div>
            </div>

            <div className="relative min-h-[190px] group overflow-hidden bg-tartan-navy">
              <Image 
                src="https://a0.muscache.com/im/pictures/Mt/MtTemplate-7375032/original/fc385be9-5647-4333-90c3-0bb86f51fa43.jpeg"
                alt="Souvenir photos on the historic bridge"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 text-[11px] font-semibold text-white">
                Souvenir Photo Session
              </div>
            </div>
          </div>
        </section>

        {/* Two Columns: Details on Left, Booking / Calendar Card on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Agenda, Highlights, Host & Location (7 Cols) */}
          <div className="lg:col-span-7 space-y-10">

            {/* Quick Feature Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-tartan-card border border-tartan-border shadow space-y-1">
                <Clock className="w-5 h-5 text-tartan-gold" />
                <h4 className="font-bold text-white text-xs">90 Minutes</h4>
                <p className="text-[11px] text-gray-400">Masterclass duration</p>
              </div>

              <div className="p-4 rounded-2xl bg-tartan-card border border-tartan-border shadow space-y-1">
                <Users className="w-5 h-5 text-emerald-400" />
                <h4 className="font-bold text-white text-xs">Max 10 Guests</h4>
                <p className="text-[11px] text-gray-400">Intimate group size</p>
              </div>

              <div className="p-4 rounded-2xl bg-tartan-card border border-tartan-border shadow space-y-1">
                <Music className="w-5 h-5 text-sky-400" />
                <h4 className="font-bold text-white text-xs">All Gear Provided</h4>
                <p className="text-[11px] text-gray-400">Chanters &amp; pipes included</p>
              </div>

              <div className="p-4 rounded-2xl bg-tartan-card border border-tartan-border shadow space-y-1">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h4 className="font-bold text-white text-xs">No Experience</h4>
                <p className="text-[11px] text-gray-400">100% Beginner friendly</p>
              </div>

              <div className="p-4 rounded-2xl bg-tartan-card border border-tartan-border shadow space-y-1">
                <Car className="w-5 h-5 text-purple-400" />
                <h4 className="font-bold text-white text-xs">Free Parking</h4>
                <p className="text-[11px] text-gray-400">At Carrbridge Hotel</p>
              </div>

              <div className="p-4 rounded-2xl bg-tartan-card border border-tartan-border shadow space-y-1">
                <ShieldCheck className="w-5 h-5 text-rose-400" />
                <h4 className="font-bold text-white text-xs">Free Cancel</h4>
                <p className="text-[11px] text-gray-400">Up to 24h prior</p>
              </div>
            </div>

            {/* What you'll do (6 Detailed Steps) */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-white font-serif tracking-tight">
                  What You&apos;ll Do
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  A step-by-step masterclass curated by Scotland&apos;s award-winning Highland bagpiper.
                </p>
              </div>

              <div className="space-y-4">
                {AGENDA_STEPS.map((agenda) => (
                  <div 
                    key={agenda.step}
                    className="p-5 rounded-3xl bg-tartan-card border border-tartan-border hover:border-tartan-accent/60 transition-all shadow-lg flex flex-col sm:flex-row gap-5 items-start"
                  >
                    <div className="relative w-full sm:w-36 h-28 rounded-2xl overflow-hidden shrink-0 border border-tartan-border bg-tartan-navy">
                      <Image 
                        src={agenda.image} 
                        alt={agenda.title} 
                        fill 
                        className="object-cover"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-tartan-dark/90 text-tartan-gold text-[10px] font-extrabold border border-tartan-gold/40">
                        {agenda.step}
                      </span>
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <span className="text-[10px] uppercase font-extrabold text-tartan-gold tracking-wider">
                        {agenda.subtitle}
                      </span>
                      <h3 className="text-base font-bold text-white font-serif">
                        {agenda.title}
                      </h3>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        {agenda.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Meet Your Host: Callum Fraser (Spud) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-tartan-card border border-tartan-border shadow-xl space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-tartan-gold shadow-lg shrink-0">
                  <Image 
                    src="https://a0.muscache.com/im/pictures/user/User/original/85f868ff-f026-4ef0-a5cd-94f6be81e0d8.jpeg" 
                    alt="Spud the Piper (Callum Fraser)"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-serif">
                    Hosted by Callum Fraser (@spudthepiper)
                  </h3>
                  <p className="text-xs text-tartan-gold font-medium">
                    Professional Scottish Bagpiper since 1999 • Aviemore, Highlands
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                &ldquo;Hi there, I&apos;m Callum Fraser, aka Spud the Piper, a Scottish Highland bagpiper based in Aviemore. I&apos;ve been playing the pipes professionally since 1999, winning awards on the Scottish wedding circuit and soundtracking ceremonies weekly—sometimes for famous people like Madonna. I perform in traditional Highland dress, carrying forward an ancient musical tradition that has shaped my entire life.&rdquo;
              </p>
            </div>

            {/* Where We'll Meet */}
            <div className="p-6 sm:p-8 rounded-3xl bg-tartan-card border border-tartan-border shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-tartan-gold">
                <MapPin className="w-5 h-5 text-tartan-gold" />
                <h3 className="text-lg font-bold text-white font-serif">
                  Where We&apos;ll Meet: Carrbridge Hotel
                </h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                <strong>Address:</strong> Carrbridge Hotel, Carrbridge, Highland Council, PH23 3AB.<br />
                The experience is hosted in the hotel&apos;s private lounge and immediately outside on the banks of the River Dulnain at the famous <strong>1717 Packhorse Bridge</strong>.
              </p>

              <div className="p-4 rounded-2xl bg-tartan-navy/70 border border-tartan-border text-xs space-y-2">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-tartan-gold" />
                  Travel &amp; Directions
                </h4>
                <ul className="space-y-1.5 text-gray-300">
                  <li>• <strong>By Car:</strong> 10 mins north of Aviemore via the A9; 30 mins south of Inverness. Free parking in the hotel car park.</li>
                  <li>• <strong>By Train:</strong> Carrbridge Railway Station is a 5-minute walk directly to the hotel entrance.</li>
                  <li>• <strong>Tour Coaches &amp; Groups:</strong> Dedicated coach parking available at the hotel.</li>
                </ul>
              </div>
            </div>

            {/* Things to Know & FAQ */}
            <div className="p-6 sm:p-8 rounded-3xl bg-tartan-card border border-tartan-border shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-white font-serif">
                Things to Know Before You Go
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-tartan-dark/70 border border-tartan-border space-y-1">
                  <h4 className="font-bold text-white">Guest Requirements</h4>
                  <p className="text-gray-400">Suitable for guests aged 9 and over. Under 18s must be accompanied by an adult.</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-tartan-dark/70 border border-tartan-border space-y-1">
                  <h4 className="font-bold text-white">What to Wear</h4>
                  <p className="text-gray-400">Casual clothing. Bring a warm Scottish jacket or layer for the outdoor photo shoot by the stone bridge.</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-tartan-dark/70 border border-tartan-border space-y-1">
                  <h4 className="font-bold text-white">Cancellation Policy</h4>
                  <p className="text-gray-400">Full refund if cancelled up to 24 hours prior to your scheduled masterclass start time.</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-tartan-dark/70 border border-tartan-border space-y-1">
                  <h4 className="font-bold text-white">Private Group Bookings</h4>
                  <p className="text-gray-400">Private masterclasses for tour groups, family reunions, and corporate events available on request.</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Live Booking & Availability Widget (5 Cols Sticky) */}
          <div className="lg:col-span-5 sticky top-28 space-y-6">
            
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-tartan-card via-tartan-navy to-tartan-dark border-2 border-tartan-gold/60 shadow-2xl space-y-6">
              
              {/* Price & Rating Header */}
              <div className="flex items-baseline justify-between border-b border-tartan-border/80 pb-4">
                <div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-white font-serif inline-flex items-center">
                    <span>£</span>
                    <EditableElement
                      id="airbnb-price-per-guest"
                      tag="span"
                      defaultContent="91"
                      label="Airbnb Advertised Rate Per Guest (£)"
                      section="experience"
                      className="inline font-extrabold text-white"
                    />
                  </span>
                  <span className="text-xs text-gray-400 font-medium"> / guest</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-amber-300 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>5.0</span>
                  <span className="text-gray-400 font-normal">(Airbnb Superhost)</span>
                </div>
              </div>

              {/* Booking Form */}
              <form onSubmit={handleBookDirect} className="space-y-4">
                
                {/* 1. Select Scheduled Session */}
                <div>
                  <label className="block text-xs font-bold text-tartan-gold uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Choose Available Session</span>
                    <span className="text-[10px] text-emerald-400 lowercase font-normal">verified live availability</span>
                  </label>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {UPCOMING_EXPERIENCE_SLOTS.map((slot) => {
                      const isChosen = selectedSlot.id === slot.id && !customDate;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => { setSelectedSlot(slot); setCustomDate(''); }}
                          className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between text-xs ${
                            isChosen
                              ? 'bg-tartan-gold text-tartan-dark border-yellow-300 font-bold shadow-lg scale-[1.01]'
                              : 'bg-tartan-dark/80 hover:bg-slate-800 text-gray-200 border-tartan-border/80'
                          }`}
                        >
                          <div>
                            <p className="font-bold">{slot.displayDate}</p>
                            <p className={`text-[11px] ${isChosen ? 'text-tartan-dark/80' : 'text-gray-400'}`}>
                              {slot.timeSlot} • Carrbridge Hotel
                            </p>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isChosen ? 'bg-tartan-dark text-tartan-gold' : 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                          }`}>
                            {slot.remainingSpots} spots
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Or Choose Custom Date */}
                <div className="pt-2 border-t border-tartan-border/60">
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">
                    Or Request a Bespoke Date / Time:
                  </label>
                  <input 
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-tartan-gold"
                  />
                </div>

                {/* 3. Number of Guests Counter */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-tartan-dark/80 border border-tartan-border">
                  <div>
                    <p className="font-bold text-white text-xs">Number of Guests</p>
                    <p className="text-[10px] text-gray-400">Up to 10 guests per session</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                      className="w-7 h-7 rounded-lg bg-tartan-navy hover:bg-slate-700 text-white font-bold flex items-center justify-center border border-tartan-border"
                    >
                      -
                    </button>
                    <span className="font-bold text-sm text-tartan-gold w-4 text-center">{guestCount}</span>
                    <button
                      type="button"
                      onClick={() => setGuestCount(Math.min(10, guestCount + 1))}
                      className="w-7 h-7 rounded-lg bg-tartan-navy hover:bg-slate-700 text-white font-bold flex items-center justify-center border border-tartan-border"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Price Summary Breakdown */}
                <div className="p-3.5 rounded-2xl bg-tartan-navy/60 border border-tartan-border/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-gray-300">
                    <span>£{pricePerGuest} × {guestCount} {guestCount === 1 ? 'Guest' : 'Guests'}</span>
                    <span>£{totalPrice}</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-400 text-[11px]">
                    <span>Practice Chanter &amp; Gear Hire</span>
                    <span>Included Free</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-400 text-[11px]">
                    <span>1717 Bridge Photo Shoot</span>
                    <span>Included Free</span>
                  </div>
                  <div className="pt-2 border-t border-tartan-border/60 flex items-center justify-between font-extrabold text-sm text-white">
                    <span>Total Investment</span>
                    <span className="text-tartan-gold font-serif text-base">£{totalPrice}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5 pt-2">
                  <button
                    type="submit"
                    disabled={isBookingSubmitting}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book Direct with Spud</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href={airbnbListingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-2xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-600/70 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow hover:scale-[1.01]"
                  >
                    <span>Book via Airbnb</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <p className="text-[10px] text-gray-400 text-center leading-tight">
                  🔒 No immediate payment required for website requests. Spud will confirm availability and travel logistics by return email.
                </p>

              </form>

            </div>

            {/* Need a Custom Time or Private Tour Bus Booking? */}
            <div className="p-5 rounded-2xl bg-tartan-card border border-tartan-border text-xs space-y-2 text-center">
              <h4 className="font-bold text-white text-xs">Bringing a Coach Tour or Private Party?</h4>
              <p className="text-[11px] text-gray-400">
                Spud frequently hosts private Highland workshops for tour groups, wedding parties, and corporate retreats across Scotland.
              </p>
              <Link 
                href="/contact" 
                className="inline-flex items-center gap-1 text-tartan-gold font-bold hover:underline text-[11px]"
              >
                <span>Enquire about private group pricing →</span>
              </Link>
            </div>

          </div>

        </div>

      </main>

      <Footer />
      <LiveChatWidget />
    </div>
  );
}
