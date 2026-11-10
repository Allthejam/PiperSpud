'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LiveChatWidget } from '@/components/LiveChatWidget';
import { VisualPencilOverlay } from '@/components/VisualPencilOverlay';
import { EditableElement } from '@/components/EditableElement';
import { SpudHeritageLogo } from '@/components/SpudHeritageLogo';
import Link from 'next/link';
import { 
  Music, 
  ShieldCheck, 
  Scale, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles, 
  Calendar, 
  HelpCircle,
  Wind,
  Globe,
  Radio,
  Flame,
  Swords,
  Info
} from 'lucide-react';

export default function AboutThePipesPage() {
  return (
    <div className="min-h-screen bg-tartan-dark flex flex-col relative">
      <VisualPencilOverlay />
      <Navbar />

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-b from-tartan-card via-tartan-navy to-tartan-dark py-14 sm:py-20 border-b border-tartan-border relative overflow-hidden">
        {/* Subtle decorative Celtic backdrop elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-tartan-gold/5 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-tartan-accent/10 blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 relative z-10">
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 mb-2">
            <SpudHeritageLogo variant="icon" size="custom" className="w-full h-full" />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tartan-accent/20 border border-tartan-accent/40 text-tartan-gold text-xs font-semibold">
            <Wind className="w-4 h-4 text-tartan-gold" />
            <EditableElement
              id="pipes-hero-badge"
              tag="span"
              defaultContent="Scottish Cultural Heritage • Instrument Anatomy • 4,000 Years of Music"
              label="Pipes Hero Badge"
              section="about-pipes"
            />
          </div>

          <EditableElement
            id="pipes-hero-title"
            tag="h1"
            defaultContent="About The Great Highland Bagpipe"
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white font-serif tracking-tight uppercase"
            label="Pipes Page H1 Title"
            section="about-pipes"
          />

          <p className="text-tartan-gold font-serif italic text-base sm:text-xl font-medium">
            Pìob Mhòr — The Voice of the Scottish Highlands
          </p>

          <EditableElement
            id="pipes-hero-desc"
            tag="p"
            defaultContent="Discover the anatomy, 4,000-year ancient origins, clan battlefield history, and why traditional Scottish bagpipe music belongs to the cultural commons of Scotland and the world."
            className="text-sm sm:text-base text-gray-300 max-w-3xl mx-auto leading-relaxed"
            label="Pipes Hero Description"
            section="about-pipes"
          />

          {/* Quick Anchor Navigation */}
          <div className="pt-4 flex items-center justify-center gap-2 sm:gap-3 flex-wrap text-xs font-semibold">
            <a
              href="#anatomy"
              className="px-3.5 py-1.5 rounded-full bg-tartan-navy/80 hover:bg-tartan-card text-gray-200 hover:text-tartan-gold border border-tartan-border transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>🔬 Anatomy &amp; Sound</span>
            </a>
            <a
              href="#origins"
              className="px-3.5 py-1.5 rounded-full bg-tartan-navy/80 hover:bg-tartan-card text-gray-200 hover:text-tartan-gold border border-tartan-border transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>⏳ 4,000-Year Origins</span>
            </a>
            <a
              href="#war-and-freedom"
              className="px-3.5 py-1.5 rounded-full bg-tartan-navy/80 hover:bg-tartan-card text-gray-200 hover:text-tartan-gold border border-tartan-border transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>⚔️ Clans, War &amp; Law</span>
            </a>
            <a
              href="#music-ownership"
              className="px-3.5 py-1.5 rounded-full bg-tartan-accent/25 hover:bg-tartan-card text-tartan-gold border border-tartan-gold/40 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>📜 Folk Music vs Modern Artists</span>
            </a>
            <a
              href="#interactive"
              className="px-3.5 py-1.5 rounded-full bg-gold-gradient text-tartan-dark font-extrabold hover:brightness-110 transition-transform shadow-sm flex items-center gap-1.5"
            >
              <span>🎮 Virtual Studio &amp; Masterclass</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">

        {/* ── SECTION 1: ANATOMY & SOUND MECHANICS ── */}
        <section id="anatomy" className="space-y-8 scroll-mt-24">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-tartan-navy text-tartan-gold text-xs font-bold border border-tartan-border">
              <span>Part 1 • The Anatomy</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-serif tracking-tight">
              How The Great Highland Bagpipe Works
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Crafted from dense African Blackwood, seasoned leather, and delicate cane reeds, the Great Highland Bagpipe is an unbroken acoustic powerhouse. Because the bag provides uninterrupted air pressure, the piper plays continuously without rests or volume changes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* The Chanter */}
            <div className="p-6 rounded-3xl bg-tartan-card border border-tartan-accent/50 shadow-xl space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-tartan-navy text-tartan-gold border border-tartan-border">
                    <Music className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-tartan-gold/15 text-tartan-gold border border-tartan-gold/30">
                    The Melody Pipe
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white font-serif">
                  1. The Pipe Chanter (An Fheadan)
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  The woodwind pipe that plays the tune. It features a conical bore and a sensitive double cane reed, producing exactly <strong>nine notes</strong>: from Low G up to High A. It is pitched in the ancient Scottish <strong>Mixolydian mode</strong> with a flattened seventh (High G natural), giving Highland music its haunting, unmistakable emotional power.
                </p>
              </div>
              <div className="pt-3 border-t border-tartan-border/60 text-[11px] text-tartan-gold font-medium">
                💡 Articulation is created purely through rapid finger grace notes (birls, doublings &amp; strikes).
              </div>
            </div>

            {/* The Drones */}
            <div className="p-6 rounded-3xl bg-tartan-card border border-tartan-accent/50 shadow-xl space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-tartan-navy text-tartan-gold border border-tartan-border">
                    <Radio className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-600/40">
                    Harmonic Backdrop
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white font-serif">
                  2. The Drones (Na Dronan)
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Three cylindrical pipes that rest over the piper&apos;s left shoulder: <strong>two Tenor Drones</strong> (playing an octave below the chanter tonic) and <strong>one Bass Drone</strong> (playing two octaves below). Using single cane or synthetic reeds, they create the deep, continuous harmonic chord that rings out for miles across Scottish hills.
                </p>
              </div>
              <div className="pt-3 border-t border-tartan-border/60 text-[11px] text-amber-300 font-medium">
                💡 Drones are finely tuned by sliding wooden tenons sealed with natural hemp.
              </div>
            </div>

            {/* The Pipe Bag */}
            <div className="p-6 rounded-3xl bg-tartan-card border border-tartan-accent/50 shadow-xl space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-tartan-navy text-tartan-gold border border-tartan-border">
                    <Wind className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600/40">
                    Airtight Reservoir
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white font-serif">
                  3. The Bag (Am Màla)
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Tucked beneath the piper&apos;s left arm, the bag acts as a reservoir of constant air pressure. Traditionally sewn from cowhide or sheepskin and sealed with seasoning (molasses and honey), modern pipes also use breathable multi-ply synthetic membranes (Gore-Tex) dressed in clan tartan velvet covers.
                </p>
              </div>
              <div className="pt-3 border-t border-tartan-border/60 text-[11px] text-emerald-300 font-medium">
                💡 Pipers squeeze the bag with their arm while breathing in, preventing any break in sound.
              </div>
            </div>

            {/* The Blowpipe */}
            <div className="p-6 rounded-3xl bg-tartan-card border border-tartan-accent/50 shadow-xl space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-tartan-navy text-tartan-gold border border-tartan-border">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-600/40">
                    Non-Return Valve
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white font-serif">
                  4. The Blowpipe &amp; Valve
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  The tube through which the piper supplies breath into the bag. The base features a delicate one-way leather or rubber flapper valve that allows air into the bag when blown, but immediately seals shut under pressure so air cannot escape back into the piper&apos;s mouth while inhaling.
                </p>
              </div>
              <div className="pt-3 border-t border-tartan-border/60 text-[11px] text-cyan-300 font-medium">
                💡 Maintaining constant pressure requires years of lung and arm coordination.
              </div>
            </div>

            {/* African Blackwood */}
            <div className="p-6 rounded-3xl bg-tartan-card border border-tartan-accent/50 shadow-xl space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-tartan-navy text-tartan-gold border border-tartan-border">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-600/40">
                    Acoustic Timber
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white font-serif">
                  5. African Blackwood &amp; Silver
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Top professional bagpipes are turned from <em>Dalbergia melanoxylon</em> (African Blackwood). Renowned for its extreme density and natural acoustic resonance, it resists moisture from breath. Drones are traditionally mounted with engraved sterling silver, nickel, or staghorn Celtic ferrules.
                </p>
              </div>
              <div className="pt-3 border-t border-tartan-border/60 text-[11px] text-purple-300 font-medium">
                💡 Spud&apos;s master pipes are hand-crafted Scottish timber aged for decades.
              </div>
            </div>

            {/* Practice Chanter */}
            <div className="p-6 rounded-3xl bg-tartan-card border border-tartan-accent/50 shadow-xl space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-tartan-navy text-tartan-gold border border-tartan-border">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-600/40">
                    The Training Tool
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white font-serif">
                  6. The Practice Chanter
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  No piper learns directly on the full pipes! Every piper begins on a small, quiet, double-reeded practice chanter blown by mouth. It is used throughout a piper&apos;s life to learn new fingerings, master intricate embellishments, and memorize tunes before stepping onto the pipes.
                </p>
              </div>
              <div className="pt-3 border-t border-tartan-border/60 text-[11px] text-rose-300 font-medium">
                💡 Guests at Spud&apos;s Airbnb Experience each receive a practice chanter to learn!
              </div>
            </div>

          </div>
        </section>

        {/* ── SECTION 2: 4,000-YEAR ANCIENT HISTORY ── */}
        <section id="origins" className="space-y-8 scroll-mt-24">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-tartan-card via-tartan-navy to-tartan-dark border border-tartan-accent/60 shadow-2xl space-y-8">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-tartan-accent/20 text-tartan-gold text-xs font-bold border border-tartan-gold/30">
                <span>Part 2 • Ancient Roots</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-serif tracking-tight">
                Where Did Bagpipes Actually Originate?
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                Despite being the universal national symbol of Scotland, the bagpipe was <strong>not invented in Scotland</strong>. Its lineage stretches back four millennia across ancient civilizations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="p-6 rounded-2xl bg-tartan-dark/80 border border-tartan-border space-y-3">
                <div className="text-2xl">🏺</div>
                <h3 className="text-base font-bold text-white font-serif">Mesopotamia &amp; Ancient Egypt</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Primitive reed pipes attached to inflated animal bladders date back to ancient Sumer and Egypt as early as 1000 BCE. Greek and Egyptian shepherds discovered that adding an animal skin reservoir allowed players to breathe without stopping the melody.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-tartan-dark/80 border border-tartan-border space-y-3">
                <div className="text-2xl">🏛️</div>
                <h3 className="text-base font-bold text-white font-serif">The Roman Empire (Tibia Utricularis)</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Roman legions marched with a bagpipe known as the <em>tibia utricularis</em>. Roman historian Suetonius explicitly documented that Emperor Nero could play the bagpipe and vowed to perform publicly on it if he preserved his throne.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-tartan-dark/80 border border-tartan-border space-y-3">
                <div className="text-2xl">🏴󠁧󠁢󠁳󠁣󠁴󠁿</div>
                <h3 className="text-base font-bold text-white font-serif">Arrival in the Scottish Highlands</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Introduced across Europe via Celtic migrations and medieval trade, Scotland embraced the instrument unlike any other nation. While other cultures favored soft indoor chamber pipes, the Highland clans engineered an acoustic giant built for mountain glens.
                </p>
              </div>
            </div>

            {/* The MacCrimmons of Skye */}
            <div className="p-6 sm:p-8 rounded-2xl bg-tartan-dark/95 border border-tartan-gold/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-tartan-gold uppercase tracking-wider">The Golden Age of Piping</span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-400">1500 – 1800</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white font-serif">
                  The MacCrimmon Hereditary Dynasty of Boreraig, Skye
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  For over three centuries, the MacCrimmon family served as hereditary pipers to Clan MacLeod at Dunvegan Castle. They established the world&apos;s first piping college, training master pipers for seven years. They codified <strong>Ceòl Mòr</strong> (&quot;Great Music&quot; or Pìobaireachd)—the classical symphony of the pipes consisting of an <em>Urlar</em> (theme) followed by intricate variations.
                </p>
              </div>
              <div className="shrink-0 p-4 rounded-xl bg-tartan-navy text-tartan-gold border border-tartan-gold/30 text-center">
                <span className="text-2xl font-black block font-mono">300+</span>
                <span className="text-[10px] uppercase font-bold text-gray-300">Years of MacCrimmon Lore</span>
              </div>
            </div>

          </div>
        </section>

        {/* ── SECTION 3: CLANS, WAR, LAW & FREEDOM ── */}
        <section id="war-and-freedom" className="space-y-8 scroll-mt-24">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-tartan-navy text-tartan-gold text-xs font-bold border border-tartan-border">
              <span>Part 3 • Clans &amp; History</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-serif tracking-tight">
              An &ldquo;Instrument of War&rdquo; &amp; The Symbol of Freedom
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              No musical instrument on earth is more intertwined with military valor, clan defiance, and political survival than the Scottish bagpipe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* The 1746 Legal Ruling */}
            <div className="p-7 sm:p-8 rounded-3xl bg-tartan-card border-2 border-red-900/60 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-rose-400">
                <Swords className="w-5 h-5 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider">The 1746 Act of Proscription</span>
              </div>
              <h3 className="text-xl font-bold text-white font-serif">
                The Day the Bagpipe Became Legally a &ldquo;Weapon&rdquo;
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Following the tragic Jacobite defeat at the <strong>Battle of Culloden (1746)</strong>, the British Government passed the Act of Proscription to dismantle the Highland clan system, banning weapons, kilts, and tartans.
              </p>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                When Jacobite piper <strong>James Reid</strong> was captured at Carlisle, he appealed his treason conviction arguing he carried no sword or gun—only bagpipes. In a landmark ruling, British Judge Murray ruled that <em>&quot;a Highland regiment never marches without a piper, and therefore his bagpipe in the eye of the law is an instrument of war.&quot;</em> Reid was tragically executed.
              </p>
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/40 text-[11px] text-red-200">
                <strong>Historical Impact:</strong> Rather than silencing the pipes, the ruling immortalized them forever as the supreme sound of Scottish freedom, pride, and defiance.
              </div>
            </div>

            {/* Battlefields from Waterloo to D-Day */}
            <div className="p-7 sm:p-8 rounded-3xl bg-tartan-card border border-tartan-accent/50 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-tartan-gold">
                <Flame className="w-5 h-5 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider">Valor on the World Stage</span>
              </div>
              <h3 className="text-xl font-bold text-white font-serif">
                From Waterloo to the Normandy D-Day Beaches
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Highland pipers marched at the front of British regiments into battle at Waterloo (1815), the Crimean War (1854), and World War I, where hundreds of pipers lost their lives playing troops over the top of the trenches.
              </p>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                On June 6, 1944 (D-Day), 21-year-old <strong>Piper Bill Millin</strong> famously stepped off his landing craft onto Sword Beach in Normandy, armed only with his pipes and a ceremonial skean dhu in his kilt hose. Under heavy machine-gun fire, he marched up and down the beach playing <em>Highland Laddie</em> and <em>The Road to the Isles</em> to inspire Allied troops.
              </p>
              <div className="p-4 rounded-xl bg-tartan-navy border border-tartan-border text-[11px] text-tartan-gold">
                <strong>Today&apos;s Celebration:</strong> Those same stirring tunes now open castle weddings, welcome international heads of state, and celebrate lifetime milestones.
              </div>
            </div>

          </div>
        </section>

        {/* ── SECTION 4: THE OWNERSHIP QUESTION (FOLK COMMONS VS CAMMY BARNES) ── */}
        <section id="music-ownership" className="space-y-8 scroll-mt-24">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-tartan-card via-tartan-navy to-tartan-card border-2 border-tartan-gold/60 shadow-2xl space-y-8">
            
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                <Scale className="w-4 h-4 text-emerald-400" />
                <span>Part 4 • Musical Rights &amp; Heritage</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-serif tracking-tight">
                Does Any Piper &ldquo;Own&rdquo; Bagpipe Music?
              </h2>
              <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
                A common question often arises among the public and event planners: <em>Can an individual piper claim exclusive ownership over Scottish bagpipe tunes?</em> The answer is clear under UK and international law.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Folk Heritage Pillar */}
              <div className="p-6 sm:p-7 rounded-2xl bg-tartan-dark/95 border border-emerald-500/40 space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Traditional Scottish Folk Commons
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-200 font-mono">
                    Public Domain
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white font-serif">
                  Centuries of Shared Scottish Heritage
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  Centuries-old standards—such as <em>The Skye Boat Song</em>, <em>Amazing Grace</em>, <em>Killiecrankie</em>, <em>Highland Wedding</em>, <em>Flowers of the Forest</em>, and <em>Loch Lomond</em>—were passed down orally by ear and <em>canntaireachd</em> (vocal piping syllables).
                </p>
                <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-xs text-emerald-200 leading-relaxed space-y-1">
                  <p className="font-bold">⚖️ The Legal Reality:</p>
                  <p>
                    These tunes have been out of copyright for generations and belong to the public domain. <strong>No single piper, competitor, or commercial organization owns them.</strong> Any piper is 100% free to play them, advertise them in their repertoire, teach them, and record them. Any claim of exclusive rights over standard Scottish tunes is legally baseless.
                  </p>
                </div>
              </div>

              {/* Contemporary Songs Pillar: Cammy Barnes, Dougie MacLean, Modern Works */}
              <div className="p-6 sm:p-7 rounded-2xl bg-tartan-dark/95 border border-amber-500/40 space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4" /> Contemporary Compositions &amp; Modern Artists
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-200 font-mono">
                    PRS / PPL Licensed
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white font-serif">
                  What About Modern Songs like Cammy Barnes or Caledonia?
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  What happens when clients ask for modern Scottish songs—like acclaimed Fife singer-songwriter and world champion piper <strong>Cammy Barnes</strong> (*Bonnie&apos;s Eyes*), Dougie MacLean (*Caledonia*), or Roever &amp; Korb (*Highland Cathedral*)?
                </p>
                <div className="p-3.5 rounded-xl bg-amber-950/50 border border-amber-500/30 text-xs text-amber-200 leading-relaxed space-y-1">
                  <p className="font-bold">⚖️ How Modern Licensing Works:</p>
                  <p>
                    Unlike 300-year-old folk airs, modern songs written by living songwriters are protected by copyright. However, <strong>pipers can freely play them live at wedding venues, hotels, and ceremonies</strong> because UK event venues maintain blanket collection licenses with <strong>PRS for Music / PPL</strong>. Royalties are collected by the venue and paid directly to the original songwriters!
                  </p>
                </div>
              </div>

            </div>

            {/* Summary Banner */}
            <div className="p-4 rounded-2xl bg-tartan-dark/90 border border-tartan-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-tartan-gold shrink-0" />
                <span>
                  Spud honors living composers while proudly sharing Scotland&apos;s public domain bagpipe heritage with wedding couples and audiences across the globe.
                </span>
              </div>
              <Link
                href="/terms#repertoire-heritage"
                className="text-tartan-gold hover:underline font-bold whitespace-nowrap flex items-center gap-1 shrink-0"
              >
                <span>Read Full Copyright Notice</span>
                <span>&rarr;</span>
              </Link>
            </div>

          </div>
        </section>

        {/* ── SECTION 5: INTERACTIVE PIPING HUBS ON SPUD'S PLATFORM ── */}
        <section id="interactive" className="space-y-8 scroll-mt-24">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-tartan-navy text-tartan-gold text-xs font-bold border border-tartan-border">
              <span>Part 5 • Interactive Exploration</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-serif tracking-tight">
              Experience The Bagpipes Yourself
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Whether you want to try playing the virtual chanter right in your browser, take a hands-on masterclass with Spud in the Cairngorms, or book Spud for your big day, explore our interactive features:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* 1. Virtual Studio */}
            <Link
              href="/studio"
              className="p-6 rounded-3xl bg-tartan-card hover:bg-tartan-navy border border-tartan-accent/40 hover:border-tartan-gold transition-all group flex flex-col justify-between shadow-xl"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-tartan-navy group-hover:scale-110 transition-transform text-tartan-gold flex items-center justify-center border border-tartan-border">
                  <Music className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-tartan-gold transition-colors font-serif">
                  Virtual Synthesiser Studio
                </h3>
                <p className="text-xs text-gray-400 group-hover:text-gray-300 leading-relaxed">
                  Play the Great Highland Bagpipe chanter, activate drones, and compose procedural Scottish tunes live in your browser.
                </p>
              </div>
              <div className="pt-4 text-xs font-bold text-tartan-gold flex items-center gap-1">
                <span>Open Studio</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 2. Airbnb Masterclass */}
            <Link
              href="/experience"
              className="p-6 rounded-3xl bg-tartan-card hover:bg-tartan-navy border border-tartan-accent/40 hover:border-tartan-gold transition-all group flex flex-col justify-between shadow-xl"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-tartan-navy group-hover:scale-110 transition-transform text-rose-400 flex items-center justify-center border border-tartan-border">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-tartan-gold transition-colors font-serif">
                  Airbnb Bagpipe Masterclass
                </h3>
                <p className="text-xs text-gray-400 group-hover:text-gray-300 leading-relaxed">
                  Join Spud at the Carrbridge Hotel in the Scottish Highlands for a hands-on masterclass learning to blow and play the pipes.
                </p>
              </div>
              <div className="pt-4 text-xs font-bold text-rose-400 flex items-center gap-1">
                <span>View Masterclass</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 3. Tune Jukebox */}
            <Link
              href="/tunes"
              className="p-6 rounded-3xl bg-tartan-card hover:bg-tartan-navy border border-tartan-accent/40 hover:border-tartan-gold transition-all group flex flex-col justify-between shadow-xl"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-tartan-navy group-hover:scale-110 transition-transform text-tartan-gold flex items-center justify-center border border-tartan-border">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-tartan-gold transition-colors font-serif">
                  Repertoire &amp; Jukebox
                </h3>
                <p className="text-xs text-gray-400 group-hover:text-gray-300 leading-relaxed">
                  Listen to studio sound samples of Scotland&apos;s greatest wedding processionals, battle marches, and clan laments.
                </p>
              </div>
              <div className="pt-4 text-xs font-bold text-tartan-gold flex items-center gap-1">
                <span>Listen to Tunes</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 4. Live Diary & Booking */}
            <Link
              href="/booking"
              className="p-6 rounded-3xl bg-tartan-card hover:bg-tartan-navy border border-tartan-accent/40 hover:border-tartan-gold transition-all group flex flex-col justify-between shadow-xl"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-tartan-navy group-hover:scale-110 transition-transform text-emerald-400 flex items-center justify-center border border-tartan-border">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-tartan-gold transition-colors font-serif">
                  Book Spud for Your Event
                </h3>
                <p className="text-xs text-gray-400 group-hover:text-gray-300 leading-relaxed">
                  Check live date availability in Spud&apos;s diary for Scottish castle weddings, corporate banquets, and memorials.
                </p>
              </div>
              <div className="pt-4 text-xs font-bold text-emerald-400 flex items-center gap-1">
                <span>Check Availability</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

          </div>
        </section>

      </main>

      {/* Booking CTA Bar */}
      <section className="py-16 bg-tartan-navy border-t border-tartan-border text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <h2 className="text-2xl sm:text-4xl font-bold text-white font-serif">
            Ready to hear the Great Highland Bagpipe live?
          </h2>
          <p className="text-sm text-gray-300 max-w-xl mx-auto">
            From the romantic strains of Highland Cathedral walking down a castle aisle to rousing banquet marches, add Scotland&apos;s premier piper to your special occasion.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/booking"
              className="px-7 py-3.5 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xl hover:brightness-110 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Check Spud&apos;s Live Diary</span>
            </Link>
            <Link
              href="/tunes"
              className="px-7 py-3.5 bg-tartan-card hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-tartan-border flex items-center gap-2"
            >
              <Music className="w-4 h-4 text-tartan-gold" />
              <span>Explore Full Tune Repertoire</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <LiveChatWidget />
    </div>
  );
}
