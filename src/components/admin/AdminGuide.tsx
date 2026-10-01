'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Sparkles, 
  Compass, 
  CheckCircle2, 
  Edit3, 
  MessageSquare, 
  Star, 
  Smartphone, 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  Mail, 
  CreditCard, 
  HelpCircle,
  Clock,
  MapPin,
  Music,
  Camera,
  Layers,
  ChevronRight,
  ExternalLink,
  Info,
  DollarSign
} from 'lucide-react';

interface AdminGuideProps {
  onNavigateTab?: (tab: string) => void;
}

interface GuideSection {
  id: string;
  title: string;
  shortDesc: string;
  icon: any;
  badge: string;
  badgeColor: string;
  targetTab?: string;
  steps: {
    title: string;
    description: string;
    tip?: string;
  }[];
  faq: {
    q: string;
    a: string;
  }[];
}

export const AdminGuide: React.FC<AdminGuideProps> = ({ onNavigateTab }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSectionId, setActiveSectionId] = useState<string>('bookings');

  const guideSections: GuideSection[] = [
    {
      id: 'bookings',
      title: '📅 1. Booking Inquiries, Diary & PayPal Deposits',
      shortDesc: 'How clients reserve dates, how you review them, and how PayPal deposits work automatically.',
      icon: Calendar,
      badge: 'Core Routine',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      targetTab: 'bookings',
      steps: [
        {
          title: 'Step 1: Client Reserves a Date on the Website',
          description: 'A couple or corporate client visits your website, picks an open date on the calendar, enters their venue location, chooses their dress tartan, and submits their inquiry. No payment is taken from them yet.',
          tip: 'Dates marked with a gold dot or green tick are available. Once you confirm a booking, the date automatically locks so no one else can double-book you.'
        },
        {
          title: 'Step 2: You Receive an Instant Notification',
          description: 'You will see a notification alert in your Back Office and an email with the client\'s name, date, time, venue, and distance.',
          tip: 'Click on "Booking Approvals & Deposits" in the sidebar anytime to see all pending requests.'
        },
        {
          title: 'Step 3: Review Details & Set Bespoke Quote',
          description: 'Look at the venue distance and requirements. If everything looks good, click "Approve & Send Brevo Invoice". The system automatically generates a professional confirmation email containing your bespoke quote and a secure PayPal deposit link.',
          tip: 'The client pays the deposit directly into your PayPal account. Once paid, the booking turns green ("Deposit Paid") and locks into your diary.'
        }
      ],
      faq: [
        {
          q: 'What if I am unavailable on that date?',
          a: 'Click "Decline" on the booking card. The client is notified politely and the slot remains open for other inquiries.'
        },
        {
          q: 'Can I add a manual booking that came over the phone or WhatsApp?',
          a: 'Yes! Go to the "Interactive Diary" tab and click "+ Add Manual Booking". Fill in the client\'s name and date, and it will lock into your calendar.'
        }
      ]
    },
    {
      id: 'pricing',
      title: '💰 2. Public Pricing & "Price on Application" (POA)',
      shortDesc: 'How to switch between showing fixed prices or keeping prices hidden with bespoke quotes on inquiry.',
      icon: DollarSign,
      badge: 'New Feature',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      targetTab: 'services',
      steps: [
        {
          title: 'Step 1: Open Services & Packages Studio',
          description: 'Click on "Services & Packages Studio" in the left sidebar menu. At the top of the page, you will see the "💰 Public Pricing & Price on Application (POA) Controls" box.',
        },
        {
          title: 'Step 2: Choose Your Display Mode',
          description: 'Click either:\n• "Hide Public Prices — Show Price on Application (POA)" (Spud\'s Preferred): Hides all rigid £ prices on the homepage and booking calendar. Visitors see "Price on Application" and submit their event details for your tailored quote.\n• "Show Public Fixed Prices & Estimates": Displays package rates (e.g. £480) publicly.',
          tip: 'Your choice syncs to the website instantly in real-time. You can change this anytime with one click.'
        },
        {
          title: 'Step 3: Customize the Public Label',
          description: 'You can customize what visitors see — for example "Price on Application", "Bespoke Quote on Request", or "POA".',
        }
      ],
      faq: [
        {
          q: 'How does PayPal work if prices are hidden (POA)?',
          a: 'When a client submits an inquiry, they reserve the date. You review their venue and requirements, enter your bespoke quote, and when you click Approve, the system sends them their PayPal invoice link with your exact agreed price.'
        }
      ]
    },
    {
      id: 'travel',
      title: '🚗 3. Travel Radius, Mileage & Surcharges',
      shortDesc: 'How the 50-mile Aviemore free travel radius, mileage calculator, and overnight stays work.',
      icon: Compass,
      badge: 'Automated Logistics',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      targetTab: 'travel-expenses',
      steps: [
        {
          title: 'Step 1: Your Home Base is Set in Aviemore',
          description: 'Your base is configured at Aviemore, Cairngorms (PH22 1UJ). A 50-mile radial zone is completely FREE for travel (covering Inverness, Speyside, Loch Ness, Cairngorms National Park, Pitlochry, etc.).',
        },
        {
          title: 'Step 2: Automatic Distance Calculation',
          description: 'When a client types their venue postcode (e.g. EH1 2NG for Edinburgh Castle or G1 2DH for Glasgow), the system calculates the exact road distance from Aviemore.',
          tip: 'Travel above the 50-mile free threshold is automatically calculated with a fair return mileage rate (65p/mile).'
        },
        {
          title: 'Step 3: Overnight Stay & Island Ferry Surcharges',
          description: 'If a venue is over 120 miles away, the calculator automatically adds an overnight accommodation allowance. For Scottish Islands (Skye, Mull, Orkney), ferry logistics are flagged automatically.',
        }
      ],
      faq: [
        {
          q: 'Can I change my mileage rate or free radius?',
          a: 'Yes! Go to the "Travel & Additional Expenses" tab in the sidebar. You can adjust your free radius (e.g. 50 mi), mileage rate (e.g. 65p), or base location, then click "Save Travel Configuration".'
        }
      ]
    },
    {
      id: 'visual-pencil',
      title: '✏️ 4. In-Page Visual Pencil Editing (Change Text & Photos)',
      shortDesc: 'How to click on any wording or picture directly on the live website to update it without writing code.',
      icon: Edit3,
      badge: 'Visual CMS',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      steps: [
        {
          title: 'Step 1: Open the Public Website',
          description: 'At the top of your Back Office, click the button that says "View Public Website & Visual Edit" (or open the homepage in your browser).',
        },
        {
          title: 'Step 2: Turn on the Floating Pencil Switch',
          description: 'In the bottom-right corner of your screen, you will see a golden floating pill that says "✏️ Visual Edit Mode". Click it to turn it ON (it turns bright gold).',
          tip: 'When Visual Edit Mode is active, every headline, paragraph, and photo gets a golden pencil icon ✏️.'
        },
        {
          title: 'Step 3: Click Any Text or Image to Edit',
          description: 'Click on any headline or text box. A friendly pop-up appears where you can type your new words, upload a new photo, or change links. Click "Save Changes" and the website updates instantly across the world!',
        }
      ],
      faq: [
        {
          q: 'Can visitors see the pencil icons?',
          a: 'No! The pencil icons are only visible to you when you are signed in as Spud the Piper. Public visitors see the clean, beautiful website.'
        },
        {
          q: 'What if I make a mistake?',
          a: 'Every editing pop-up has a "Reset to Default" button that restores the original text with one click.'
        }
      ]
    },
    {
      id: 'tunes',
      title: '🎵 5. Bagpipe Tunes Player & Music Sampler',
      shortDesc: 'How the audio sampler works, filtering by wedding moments, and uploading your authentic recordings.',
      icon: Music,
      badge: 'Music Studio',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      steps: [
        {
          title: 'Step 1: The Tunes Page on the Website',
          description: 'Visitors can visit the "/tunes" page to hear audio samples of Highland Cathedral, Scotland the Brave, Flower of Scotland, and more.',
        },
        {
          title: 'Step 2: Wedding Moments Filters',
          description: 'Clients can filter tunes by their wedding moment: "Arrival of Guests", "Bride\'s Processional Entrance", "Signing the Register", or "Ceilidh Festivities".',
          tip: 'During booking, clients can check the boxes for the specific tunes they want you to play at their celebration.'
        },
        {
          title: 'Step 3: Under-Construction Notice',
          description: 'We have placed a clear notice on the tunes page stating that audio samples are for demonstration purposes while Spud uploads his personal performance recordings.',
        }
      ],
      faq: [
        {
          q: 'How do I upload my own music MP3 files?',
          a: 'You can send your MP3 tracks or recordings, and we link them directly so visitors hear your exact pipes playing on the website.'
        }
      ]
    },
    {
      id: 'chat-crm',
      title: '💬 6. Live Chat Widget, WhatsApp & Client CRM',
      shortDesc: 'How to chat with couples on the website, use quick answers, and track client records.',
      icon: MessageSquare,
      badge: 'Communication',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      targetTab: 'messages',
      steps: [
        {
          title: 'Step 1: Visitors Start a Chat on the Website',
          description: 'Visitors see the golden chat badge in the bottom-right corner. They can send a question, request a quote, or click the direct WhatsApp button to text you.',
        },
        {
          title: 'Step 2: Open Message Center in the Back Office',
          description: 'Click on "Message Center" in the sidebar. You will see all conversations, the visitor\'s name, email, and the questions they asked.',
        },
        {
          title: 'Step 3: Send Instant Replies or Use Quick Responses',
          description: 'Type your message and hit Enter, or click one of the pre-written Quick Responses (e.g. "I would be honored to pipe at your wedding! Let me check the diary...").',
          tip: 'You can toggle your status between "Online & Piping" and "Away / Performing" at the top of the chat window.'
        }
      ],
      faq: [
        {
          q: 'Where do all my client contacts get saved?',
          a: 'Go to the "Client CRM" tab in the sidebar. Every client who has ever booked or inquired is saved in your CRM database with their email, phone number, and event history.'
        }
      ]
    },
    {
      id: 'mobile-app',
      title: '📱 7. Using the Back Office on Your Mobile Phone (PWA)',
      shortDesc: 'How to install the Spud the Piper App on your iPhone or Android phone for 1-tap diary access on the road.',
      icon: Smartphone,
      badge: 'Mobile First',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      steps: [
        {
          title: 'Step 1: Open the Website on Your Phone Safari or Chrome',
          description: 'Open the website URL on your mobile phone browser (Safari on iPhone, Chrome on Android).',
        },
        {
          title: 'Step 2: Add to Home Screen (1 Tap Install)',
          description: '• On iPhone (Safari): Tap the Share icon (square with arrow pointing up) -> scroll down and tap "Add to Home Screen".\n• On Android (Chrome): Tap the 3 dots menu -> tap "Install App" or "Add to Home screen".',
          tip: 'An official Spud the Piper icon with the Scottish lion will appear on your phone screen just like an app from the App Store!'
        },
        {
          title: 'Step 3: Open and Check Your Diary Anywhere',
          description: 'Tap the app icon anytime on the road to review upcoming gigs, view venue directions, and check client phone numbers without needing a computer.',
        }
      ],
      faq: [
        {
          q: 'Do I need to sign in every time on my phone?',
          a: 'No! Once you sign in with your Google account or passcode on your phone, you stay signed in automatically.'
        }
      ]
    },
    {
      id: 'security-faq',
      title: '🔒 8. Signing In, Security & Admin Team',
      shortDesc: 'How to sign in securely, add authorized helpers, and manage your account.',
      icon: ShieldCheck,
      badge: 'Security',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      targetTab: 'security',
      steps: [
        {
          title: 'Step 1: Sign in with 1-Click Google or Email',
          description: 'Whenever you open `/admin`, click "Sign in with Google" (using your piperspud@gmail.com account) or enter your email & password.',
        },
        {
          title: 'Step 2: Authorized Admin Team',
          description: 'You (Spud) are the Owner with full permissions. In the "Admin Team & Security" tab, you can view authorized administrators.',
          tip: 'Your database is backed by Google Firebase with real-time cloud backup, ensuring your diary and client records are safe.'
        }
      ],
      faq: [
        {
          q: 'What if I forget my password?',
          a: 'Click "Forgot Password?" on the login screen. Firebase will instantly send a password reset link to your email address.'
        }
      ]
    }
  ];

  const filteredSections = guideSections.filter(section => {
    if (!section) return false;
    const q = (searchQuery || '').toLowerCase().trim();
    if (!q) return true;
    return (
      (section.title || '').toLowerCase().includes(q) ||
      (section.shortDesc || '').toLowerCase().includes(q) ||
      (section.steps || []).some(s => s && ((s.title || '').toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q))) ||
      (section.faq || []).some(f => f && ((f.q || '').toLowerCase().includes(q) || (f.a || '').toLowerCase().includes(q)))
    );
  });

  const activeSection = guideSections.find(s => s.id === activeSectionId) || guideSections[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* ── TOP HERO BANNER ── */}
      <div className="bg-gradient-to-r from-amber-950/60 via-tartan-navy to-tartan-card rounded-3xl p-6 sm:p-8 border border-tartan-accent/50 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-4 max-w-4xl">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-tartan-accent to-amber-700 flex items-center justify-center text-tartan-dark font-serif font-extrabold text-base shadow-md">
              📖
            </div>
            <div>
              <span className="text-xs font-bold text-tartan-gold uppercase tracking-wider">
                Spud&apos;s Easy PC & Mobile Manual
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif">
                How to Run Your Website & Diary
              </h2>
            </div>
          </div>

          <p className="text-sm text-gray-300 leading-relaxed">
            Welcome, Spud! This simple guide is written in plain English to show you step-by-step how everything works. Whether you are reviewing a wedding booking, hiding prices, checking your diary on your phone, or editing text with the visual pencil, you will find simple 1-2-3 instructions below.
          </p>

          {/* Quick Search Bar */}
          <div className="pt-2 relative max-w-xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guide (e.g. 'paypal', 'booking', 'prices', 'travel', 'phone app')..."
              className="w-full bg-tartan-dark/95 border border-tartan-accent/50 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-white placeholder-gray-400 focus:outline-none focus:border-tartan-gold shadow-inner"
            />
            <Search className="w-4 h-4 text-tartan-gold absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* ── QUICK CHEAT SHEET: "SPUD'S 3-STEP DAILY ROUTINE" ── */}
      <div className="bg-tartan-card rounded-3xl p-6 border border-tartan-border shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-tartan-gold" />
            <h3 className="text-lg font-bold text-white font-serif">Spud&apos;s 60-Second Daily Routine</h3>
          </div>
          <span className="text-xs text-gray-400">All you ever need to do in 3 quick steps:</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-tartan-dark/80 p-5 rounded-2xl border border-tartan-border/60 space-y-2 relative">
            <div className="w-8 h-8 rounded-full bg-gold-gradient text-tartan-dark font-extrabold text-sm flex items-center justify-center shadow">
              1
            </div>
            <h4 className="text-sm font-bold text-white">Check Booking Requests</h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              Open the <strong>Bookings</strong> tab. Look at the client&apos;s venue location and date.
            </p>
          </div>

          <div className="bg-tartan-dark/80 p-5 rounded-2xl border border-tartan-border/60 space-y-2 relative">
            <div className="w-8 h-8 rounded-full bg-gold-gradient text-tartan-dark font-extrabold text-sm flex items-center justify-center shadow">
              2
            </div>
            <h4 className="text-sm font-bold text-white">Click &quot;Approve &amp; Send&quot;</h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              Click the golden Approve button. The system sends the client their confirmation email with your PayPal deposit link.
            </p>
          </div>

          <div className="bg-tartan-dark/80 p-5 rounded-2xl border border-tartan-border/60 space-y-2 relative">
            <div className="w-8 h-8 rounded-full bg-gold-gradient text-tartan-dark font-extrabold text-sm flex items-center justify-center shadow">
              3
            </div>
            <h4 className="text-sm font-bold text-white">Play the Pipes &amp; Celebrate! 🏴󠁧󠁢󠁳󠁣󠁴󠁿</h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              When they pay the deposit, the date locks in green in your diary and receipts are delivered automatically.
            </p>
          </div>
        </div>
      </div>

      {/* ── TWO-COLUMN GUIDE BROWSER ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Topic Selector Menu */}
        <div className="lg:col-span-4 space-y-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2">
            Select a Guide Topic ({filteredSections.length}):
          </p>

          <div className="space-y-2">
            {filteredSections.map((sec) => {
              const Icon = sec.icon;
              const isSelected = activeSectionId === sec.id;

              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSectionId(sec.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-950/60 to-tartan-navy border-tartan-gold shadow-lg shadow-amber-950/30 text-white'
                      : 'bg-tartan-card/80 border-tartan-border/70 hover:bg-tartan-navy text-gray-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      isSelected ? 'bg-gold-gradient text-tartan-dark font-bold' : 'bg-slate-800 text-tartan-gold'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold leading-snug">{sec.title}</h4>
                      <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{sec.shortDesc}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 mt-1 transition-transform ${isSelected ? 'text-tartan-gold translate-x-0.5' : 'text-gray-500'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Step-by-Step Instructions */}
        <div className="lg:col-span-8 bg-tartan-card rounded-3xl p-6 sm:p-8 border border-tartan-accent/40 shadow-2xl space-y-6">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-tartan-border/70 pb-5">
            <div className="space-y-1">
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${activeSection.badgeColor}`}>
                {activeSection.badge}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white font-serif mt-1">
                {activeSection.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-300">
                {activeSection.shortDesc}
              </p>
            </div>

            {/* Direct Jump to Tab Button */}
            {activeSection.targetTab && onNavigateTab && (
              <button
                onClick={() => onNavigateTab(activeSection.targetTab!)}
                className="px-5 py-2.5 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-xl shadow hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 shrink-0"
              >
                <span>Open This Section</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Numbered Steps List */}
          <div className="space-y-5">
            <h4 className="text-xs font-bold text-tartan-gold uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-tartan-gold" />
              <span>Step-by-Step Instructions:</span>
            </h4>

            <div className="space-y-4">
              {activeSection.steps.map((step, idx) => (
                <div key={idx} className="bg-tartan-dark/70 rounded-2xl p-5 border border-tartan-border/60 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-tartan-navy text-tartan-gold border border-tartan-accent/40 flex items-center justify-center font-bold text-xs shrink-0">
                      {idx + 1}
                    </span>
                    <h5 className="text-sm font-bold text-white">{step.title}</h5>
                  </div>
                  <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-line pl-10">
                    {step.description}
                  </p>
                  {step.tip && (
                    <div className="ml-10 mt-2 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-[11px] text-amber-300 flex items-start gap-2">
                      <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                      <span><strong>Pro Tip:</strong> {step.tip}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Frequently Asked Questions for this Topic */}
          {activeSection.faq && activeSection.faq.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-tartan-border/60">
              <h4 className="text-xs font-bold text-tartan-gold uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-tartan-gold" />
                <span>Common Questions Spud Asks:</span>
              </h4>

              <div className="space-y-3">
                {activeSection.faq.map((item, idx) => (
                  <div key={idx} className="bg-tartan-navy/50 p-4 rounded-xl border border-tartan-border/50 space-y-1">
                    <p className="text-xs font-bold text-white flex items-center gap-2">
                      <span className="text-tartan-gold">Q:</span> {item.q}
                    </p>
                    <p className="text-xs text-gray-300 pl-4 leading-relaxed">
                      <strong className="text-emerald-400">A: </strong>{item.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Help Note */}
          <div className="pt-4 border-t border-tartan-border/60 flex items-center justify-between flex-wrap gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              <span>Everything auto-saves to Google Cloud Firestore in real time.</span>
            </span>
            <a
              href="/"
              className="text-tartan-gold hover:underline flex items-center gap-1 font-bold"
            >
              <span>Test on Live Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

      </div>

    </div>
  );
};
