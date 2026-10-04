'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { BookingEvent } from '@/types/spud';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  Eye, 
  Smartphone, 
  Monitor, 
  Sparkles, 
  Calendar, 
  CreditCard, 
  Bell, 
  Clock, 
  User, 
  MapPin, 
  HelpCircle, 
  ShieldCheck, 
  FileText, 
  Save, 
  RotateCcw, 
  ExternalLink,
  MessageSquare,
  AlertTriangle,
  RefreshCw,
  Info
} from 'lucide-react';

interface EmailTemplateDef {
  id: string;
  category: 'client' | 'admin' | 'payments' | 'reminders';
  name: string;
  triggerDescription: string;
  recipientRole: 'Client' | 'Spud Admin';
  defaultSubject: string;
  badgeLabel: string;
  badgeColor: string; // emerald, gold, amber, blue
  introHeadline: string;
  introBody: string;
  whatNextTitle?: string;
  whatNextPoints?: string[];
  ctaButtonText?: string;
  ctaButtonUrl?: string;
  footerNote?: string;
}

const DEFAULT_TEMPLATES: EmailTemplateDef[] = [
  {
    id: 'booking_created',
    category: 'client',
    name: '1. Booking Request Received (Client Confirmation)',
    triggerDescription: 'Sent immediately to the client when they submit the online date request form on /booking or the home page.',
    recipientRole: 'Client',
    defaultSubject: '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Booking Request Received: Spud the Piper ({eventType} - {eventDate})',
    badgeLabel: 'Booking Request Received • Under Review',
    badgeColor: 'gold',
    introHeadline: 'Thank you for choosing Spud the Piper!',
    introBody: 'We have successfully received your provisional booking request for {eventType} on {eventDate}. Callum (Spud) will personally review your date against his private diary and confirm availability shortly.',
    whatNextTitle: '📋 What Happens Next?',
    whatNextPoints: [
      'Callum (Spud) will personally check his private diary and travel logistics for your venue.',
      'Once verified, you will receive an Official Approval Email with your secure PayPal deposit link.',
      'Completing your deposit payment officially locks your date in Spud\'s diary.',
      'No payment is required right now.'
    ],
    footerNote: 'If you need to make any immediate adjustments, reply directly to this email or call Spud on 07793 491367.'
  },
  {
    id: 'admin_booking_alert',
    category: 'admin',
    name: '2. New Booking Request Alert (Spud Diary Alert)',
    triggerDescription: 'Sent immediately to Spud@spudthepiper.com whenever a client submits a new booking inquiry on the website.',
    recipientRole: 'Spud Admin',
    defaultSubject: '🔔 New Booking Request: {clientName} ({eventType} - {eventDate})',
    badgeLabel: 'New Inquiry In Diary',
    badgeColor: 'gold',
    introHeadline: 'New Booking Request Received',
    introBody: 'A new provisional booking request was just submitted on your website diary. Please review the event details, travel calculations, and approve in the Back Office:',
    ctaButtonText: 'Review & Approve in Back Office',
    ctaButtonUrl: 'https://spudthepiper.com/admin/bookings',
    footerNote: 'Logged in Spud\'s CRM & Booking Management Engine.'
  },
  {
    id: 'booking_approved',
    category: 'payments',
    name: '3. Booking Approved & Deposit Invoice (Client)',
    triggerDescription: 'Sent to the client when Spud clicks "Approve Booking" in the Back Office. Contains the PayPal deposit invoice link.',
    recipientRole: 'Client',
    defaultSubject: '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Booking Approved: Spud the Piper for {eventType} on {eventDate}',
    badgeLabel: 'Official Booking Approval & Deposit Invoice',
    badgeColor: 'gold',
    introHeadline: 'Great news! Your booking is approved!',
    introBody: 'Callum Fraser (Spud the Piper) has personally reviewed your booking request and confirmed availability for your upcoming occasion.',
    whatNextTitle: '🔒 How to Lock Your Date:',
    whatNextPoints: [
      'Your date is provisionally reserved for 7 days.',
      'Click the secure PayPal deposit button below to submit your £{depositAmount}.00 booking deposit.',
      'Upon payment, your date is 100% officially locked in Spud\'s private diary and full receipts will be issued.'
    ],
    ctaButtonText: 'Pay £{depositAmount}.00 Deposit via PayPal',
    ctaButtonUrl: 'https://paypal.me/spudthepiper/{depositAmount}',
    footerNote: 'Official Brevo Transactional Invoice from Spud the Piper.'
  },
  {
    id: 'deposit_received',
    category: 'payments',
    name: '4. Deposit Paid & Booking Locked Receipt (Client)',
    triggerDescription: 'Sent to the client immediately upon PayPal deposit capture. Confirms the gig is locked and states balance due date.',
    recipientRole: 'Client',
    defaultSubject: '✅ Deposit Received & Booking Locked: Spud the Piper ({eventDate})',
    badgeLabel: 'Official Booking Confirmed & Locked',
    badgeColor: 'emerald',
    introHeadline: 'Your booking is officially locked in Spud\'s diary!',
    introBody: 'Thank you! Your deposit payment of £{depositAmount}.00 has been confirmed via PayPal. Your event date is now 100% OFFICIALLY LOCKED in Spud\'s diary.',
    whatNextTitle: '💳 Remaining Balance Notice:',
    whatNextPoints: [
      'Your remaining balance of £{remainingBalance}.00 is due the day before your event ({dayBeforeDate}).',
      'You can settle the balance anytime using the PayPal link provided in your receipt.',
      'Spud will be in touch prior to your date to coordinate final musical cues and entrance timings.'
    ],
    ctaButtonText: 'Pay Remaining Balance (£{remainingBalance}.00) via PayPal',
    ctaButtonUrl: 'https://paypal.me/spudthepiper/{remainingBalance}',
    footerNote: 'Official Booking Receipt Ref #{bookingId}. Thank you for booking Spud the Piper!'
  },
  {
    id: 'client_balance_reminder_7day',
    category: 'reminders',
    name: '5. 7-Day Final Balance & Event Reminder (Client)',
    triggerDescription: 'Sent automatically to the client 7 days prior to their event if their balance is still outstanding.',
    recipientRole: 'Client',
    defaultSubject: '⏰ 7 Days Until Your Event: Final Balance Reminder - Spud the Piper ({eventDate})',
    badgeLabel: '7 Days to Your Event • Friendly Reminder',
    badgeColor: 'amber',
    introHeadline: 'Your special event is just 7 days away!',
    introBody: 'Callum (Spud the Piper) is preparing for your performance on {eventDate} at {venueName}. We look forward to providing the traditional Scottish soundtrack for your day.',
    whatNextTitle: '💳 Remaining Balance Settle:',
    whatNextPoints: [
      'The outstanding balance of £{remainingBalance}.00 is due the day before your event ({dayBeforeDate}).',
      'Please use the secure PayPal link below to complete your payment at your earliest convenience.',
      'If you need to update timings or arrival entrances, reply directly to this email.'
    ],
    ctaButtonText: 'Pay Remaining Balance (£{remainingBalance}.00) via PayPal',
    ctaButtonUrl: 'https://paypal.me/spudthepiper/{remainingBalance}',
    footerNote: 'Spud the Piper • Direct Contact: 07793 491367'
  },
  {
    id: 'admin_event_reminder_7day',
    category: 'admin',
    name: '6. 7-Day Gig Briefing & Diary Alert (Spud Admin)',
    triggerDescription: 'Sent to Spud@spudthepiper.com 7 days before an upcoming performance with the client briefing and balance status.',
    recipientRole: 'Spud Admin',
    defaultSubject: '📅 7-Day Gig Alert: {clientName} on {eventDate} at {venueName}',
    badgeLabel: 'Upcoming Gig in 7 Days',
    badgeColor: 'amber',
    introHeadline: '7-Day Gig Briefing: {clientName}',
    introBody: 'You have a confirmed booking coming up in exactly 7 days. Here is your full event summary, attire style, and requested repertoire:',
    ctaButtonText: 'View Diary in Back Office',
    ctaButtonUrl: 'https://spudthepiper.com/admin/diary',
    footerNote: 'Spud the Piper Diary & Schedule Automation.'
  },
  {
    id: 'admin_event_reminder_1day',
    category: 'admin',
    name: '7. 1-Day Final Event Alert (Spud Admin)',
    triggerDescription: 'Sent to Spud@spudthepiper.com the morning before a gig with the final equipment, attire, and venue access checklist.',
    recipientRole: 'Spud Admin',
    defaultSubject: '🎺 TOMORROW: Bagpiping for {clientName} at {venueName} ({timeSlot})',
    badgeLabel: 'Performance Tomorrow',
    badgeColor: 'emerald',
    introHeadline: 'Gig Alert: Tomorrow at {venueName}',
    introBody: 'Your performance for {clientName} takes place tomorrow. Make sure your pipes are tuned, reeds checked, and Highland attire ready:',
    whatNextTitle: '🎒 Pre-Gig Checklist:',
    whatNextPoints: [
      'Pipe Chanter tuned & drones inspected with hemp checked.',
      'Attire ready: {tartanChoice}.',
      'Vehicle fueled & navigation route to {venuePostcode} pre-loaded.',
      'Arrival target: 30–45 mins prior to {timeSlot}.'
    ],
    ctaButtonText: 'Open Full Diary Details',
    ctaButtonUrl: 'https://spudthepiper.com/admin/diary',
    footerNote: 'Spud the Piper 24h Logistics Engine.'
  },
  {
    id: 'balance_paid_receipt',
    category: 'payments',
    name: '8. Full Payment Settlement Receipt (Client)',
    triggerDescription: 'Sent to the client when their final balance is marked as paid in full.',
    recipientRole: 'Client',
    defaultSubject: '🎉 Payment Fully Settled: Spud the Piper ({eventDate})',
    badgeLabel: 'Payment Fully Settled • Balance £0.00',
    badgeColor: 'emerald',
    introHeadline: 'Your event balance is fully settled!',
    introBody: 'We have received full and final payment for your booking on {eventDate} at {venueName}. Your total performance investment of £{estimatedPrice}.00 is completely settled.',
    whatNextTitle: '🎺 Next Step on Event Day:',
    whatNextPoints: [
      'No further payments are required.',
      'Spud will arrive in Full Highland Attire 30–45 minutes prior to {timeSlot} to tune and liaise with your coordinator.',
      'Get ready for an unforgettable Scottish piping performance!'
    ],
    footerNote: 'Thank you for booking Spud the Piper! We look forward to celebrating with you.'
  },
  {
    id: 'admin_chat_alert',
    category: 'admin',
    name: '9. Live Website Chat Message Alert (Spud Admin)',
    triggerDescription: 'Sent instantly to Spud@spudthepiper.com when a visitor posts a message in the website live chat.',
    recipientRole: 'Spud Admin',
    defaultSubject: '💬 Live Chat Message from {clientName}',
    badgeLabel: 'Live Website Chat Message',
    badgeColor: 'blue',
    introHeadline: 'Incoming Live Message from {clientName}',
    introBody: 'A visitor is waiting on your live website chat right now with an inquiry about bagpipe booking:',
    ctaButtonText: 'Reply Live in Back Office',
    ctaButtonUrl: 'https://spudthepiper.com/admin/messages',
    footerNote: 'Live Chat Dispatch Engine • Spud the Piper.'
  },
  {
    id: 'inquiry_reply',
    category: 'client',
    name: '10. Direct Inquiry Reply from Spud (Client)',
    triggerDescription: 'Sent to a client when Spud composes and sends a direct reply from the Back Office Message Center.',
    recipientRole: 'Client',
    defaultSubject: 'Regarding Your Bagpipe Inquiry - Spud the Piper',
    badgeLabel: 'Direct Message from Spud the Piper',
    badgeColor: 'gold',
    introHeadline: 'Message from Callum Fraser (Spud the Piper)',
    introBody: 'Dear {clientName},\n\nThank you for reaching out regarding bagpiping for your upcoming event. I would be delighted to discuss details and tailor the perfect musical arrangements for your occasion.',
    footerNote: 'Spud the Piper • Aviemore, Highlands, Scotland • 07793 491367'
  }
];

// Sample Scenarios for Realistic Live Preview
const SAMPLE_SCENARIOS: Record<string, Partial<BookingEvent>> = {
  wedding: {
    id: 'spud-bk-7821',
    clientName: 'Fiona & Liam MacLeod',
    clientEmail: 'fiona.macleod@example.scot',
    clientPhone: '07798 123456',
    eventType: 'Scottish Castle & Highland Weddings',
    date: '2026-11-14',
    timeSlot: '13:30 - 17:00 (Ceremony & Drinks)',
    venueName: 'Blair Castle & Gardens',
    venueAddress: 'Blair Atholl, Pitlochry',
    venuePostcode: 'PH18 5TL',
    tartanChoice: 'Full No. 1 Dress (Feather Bonnet & Plaid)',
    estimatedPrice: 580,
    depositAmount: 100,
    specialTunes: ['Highland Cathedral', 'Scotland the Brave', 'Mairi\'s Wedding'],
    notes: 'Please pipe guests across the castle courtyard and lead the grand bride entrance.',
    preferredContactMethod: 'email'
  },
  gala: {
    id: 'spud-bk-9042',
    clientName: 'Alexander Campbell (Clan Gala)',
    clientEmail: 'alexander@highlandgala.co.uk',
    clientPhone: '07812 998877',
    eventType: 'Corporate Banquets & Castle Galas',
    date: '2026-12-05',
    timeSlot: '18:00 - 22:00 (Evening Gala)',
    venueName: 'Eilean Donan Castle',
    venueAddress: 'Dornie, Kyle of Lochalsh',
    venuePostcode: 'IV40 8DX',
    tartanChoice: 'Royal Stewart Tartan (Traditional Red)',
    estimatedPrice: 650,
    depositAmount: 150,
    specialTunes: ['Skye Boat Song', 'Flower of Scotland', 'Black Bear'],
    notes: 'Address to the Haggis performance requested with dramatic sword entrance.',
    preferredContactMethod: 'telephone'
  },
  memorial: {
    id: 'spud-bk-3319',
    clientName: 'Margaret Stewart',
    clientEmail: 'margaret.stewart@example.com',
    clientPhone: '07700 900123',
    eventType: 'Funerals & Memorial Laments',
    date: '2026-10-28',
    timeSlot: '11:00 - 13:00 (Service & Graveside)',
    venueName: 'Inverness Cathedral',
    venueAddress: 'Ardross Street, Inverness',
    venuePostcode: 'IV3 5NN',
    tartanChoice: 'Black Watch Tartan (Military Green/Blue)',
    estimatedPrice: 280,
    depositAmount: 50,
    specialTunes: ['Flowers of the Forest', 'Amazing Grace', 'Going Home'],
    notes: 'Solemn lament during the final farewell walk.',
    preferredContactMethod: 'email'
  }
};

export const AdminEmailTemplates: React.FC = () => {
  const { isSpudOnline } = useApp();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('booking_created');
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<'wedding' | 'gala' | 'memorial'>('wedding');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // Template Customization Overrides State (Loaded from localStorage or defaults)
  const [templates, setTemplates] = useState<EmailTemplateDef[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('spud_custom_email_templates');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return DEFAULT_TEMPLATES;
        }
      }
    }
    return DEFAULT_TEMPLATES;
  });

  const [isSavedSuccess, setIsSavedSuccess] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('Spud@spudthepiper.com');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSendResult, setTestSendResult] = useState<{ success: boolean; message: string } | null>(null);

  const activeTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];
  const sampleBooking = SAMPLE_SCENARIOS[selectedScenarioKey] || SAMPLE_SCENARIOS.wedding;

  const filteredTemplates = templates.filter(t => {
    if (activeCategory === 'all') return true;
    return t.category === activeCategory;
  });

  // Calculate dynamic strings for preview
  const remainingBalance = Math.max(0, (sampleBooking.estimatedPrice || 0) - (sampleBooking.depositAmount || 0));
  const formatEventDate = (d?: string) => {
    if (!d) return 'Saturday, 14 November 2026';
    try {
      return new Date(d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return d;
    }
  };
  const getDayBefore = (d?: string) => {
    if (!d) return 'Friday, 13 November 2026';
    try {
      const dt = new Date(d);
      dt.setDate(dt.getDate() - 1);
      return dt.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return 'Day before event';
    }
  };

  const replacePlaceholders = (text: string = '') => {
    return text
      .replace(/{clientName}/g, sampleBooking.clientName || 'Fiona & Liam MacLeod')
      .replace(/{eventType}/g, sampleBooking.eventType || 'Scottish Castle Wedding')
      .replace(/{eventDate}/g, formatEventDate(sampleBooking.date))
      .replace(/{timeSlot}/g, sampleBooking.timeSlot || '13:30 - 17:00')
      .replace(/{venueName}/g, sampleBooking.venueName || 'Blair Castle & Gardens')
      .replace(/{venuePostcode}/g, sampleBooking.venuePostcode || 'PH18 5TL')
      .replace(/{tartanChoice}/g, sampleBooking.tartanChoice || 'Full No. 1 Dress')
      .replace(/{estimatedPrice}/g, String(sampleBooking.estimatedPrice || 580))
      .replace(/{depositAmount}/g, String(sampleBooking.depositAmount || 100))
      .replace(/{remainingBalance}/g, String(remainingBalance))
      .replace(/{dayBeforeDate}/g, getDayBefore(sampleBooking.date))
      .replace(/{bookingId}/g, sampleBooking.id || 'spud-bk-7821');
  };

  const handleUpdateActiveTemplate = (field: keyof EmailTemplateDef, value: any) => {
    setTemplates(prev => prev.map(t => {
      if (t.id === activeTemplate.id) {
        return { ...t, [field]: value };
      }
      return t;
    }));
  };

  const handleSaveTemplates = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('spud_custom_email_templates', JSON.stringify(templates));
    }
    setIsSavedSuccess(true);
    setTimeout(() => setIsSavedSuccess(false), 3000);
  };

  const handleResetToDefaults = () => {
    if (confirm('Reset all email templates to the factory Scottish default copy?')) {
      setTemplates(DEFAULT_TEMPLATES);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('spud_custom_email_templates');
      }
      setIsSavedSuccess(true);
      setTimeout(() => setIsSavedSuccess(false), 3000);
    }
  };

  const handleSendLiveTestEmail = async () => {
    if (!testEmailAddress) {
      alert('Please provide a destination email address.');
      return;
    }

    setIsSendingTest(true);
    setTestSendResult(null);

    try {
      // Map template ID to Brevo send type
      const testBookingPayload = {
        ...sampleBooking,
        clientEmail: testEmailAddress,
        clientName: sampleBooking.clientName || 'Test Client'
      };

      const res = await fetch('/api/brevo/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTemplate.id === 'admin_booking_alert' ? 'booking_created' : activeTemplate.id,
          booking: testBookingPayload,
          to: testEmailAddress,
          name: sampleBooking.clientName,
          recipientEmail: testEmailAddress,
          subject: replacePlaceholders(activeTemplate.defaultSubject),
          messageContent: replacePlaceholders(activeTemplate.introBody)
        })
      });

      const data = await res.json();
      if (res.ok) {
        setTestSendResult({
          success: true,
          message: `Live test email for "${activeTemplate.name}" dispatched to ${testEmailAddress}!`
        });
      } else {
        setTestSendResult({
          success: false,
          message: data.error || 'Failed to dispatch test email via Brevo.'
        });
      }
    } catch (err: any) {
      setTestSendResult({
        success: false,
        message: err.message || 'Error communicating with Brevo API endpoint.'
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Header Banner */}
      <div className="bg-tartan-card rounded-3xl p-6 sm:p-8 border border-tartan-border shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tartan-accent/15 text-tartan-gold text-xs font-bold border border-tartan-accent/30">
              <Mail className="w-4 h-4 text-tartan-gold" />
              <span>Brevo Transactional Email Engine</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 text-xs font-bold border border-emerald-500/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Trustpilot AFS Invites Connected</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif">
            Automated Email Templates &amp; Live Previewer
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-2xl leading-relaxed">
            Preview, customize, and test all automated emails sent to clients and Spud without placing test bookings. All client confirmation receipts automatically BCC your Trustpilot review invite engine (<span className="text-tartan-gold font-mono text-[11px]">spudthepiper.com+aebdc308b6@invite.trustpilot.com</span>) to collect verified 5-star reviews automatically.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3 flex-wrap shrink-0">
          <button
            onClick={handleResetToDefaults}
            className="px-4 py-2.5 rounded-xl bg-tartan-navy hover:bg-slate-700 text-gray-300 hover:text-white border border-tartan-border text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Restore original factory wording"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          
          <button
            onClick={handleSaveTemplates}
            className="px-5 py-2.5 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Custom Copy</span>
          </button>
        </div>
      </div>

      {/* Save Notification */}
      {isSavedSuccess && (
        <div className="p-4 rounded-2xl bg-green-950/80 border border-green-500/60 text-green-300 text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
          <span>Email template customizations saved successfully!</span>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 flex-wrap pb-1">
        <span className="text-xs text-gray-400 font-semibold mr-1">Filter Templates:</span>
        {[
          { id: 'all', label: 'All Templates (10)' },
          { id: 'client', label: '👤 Client Journey (6)' },
          { id: 'admin', label: '🛡️ Spud Admin Alerts (4)' },
          { id: 'payments', label: '💳 Payments & Receipts (3)' },
          { id: 'reminders', label: '⏰ 7-Day & 1-Day Reminders (3)' }
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              activeCategory === cat.id
                ? 'bg-tartan-gold text-tartan-dark border-tartan-gold shadow-md'
                : 'bg-tartan-card text-gray-300 border-tartan-border hover:text-white hover:border-gray-600'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Left Template Selector & Editor, Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ================= LEFT COLUMN: TEMPLATE SELECTOR & COPY EDITOR (5 Cols) ================= */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Template Selector Card */}
          <div className="bg-tartan-card rounded-3xl border border-tartan-border p-5 space-y-3 shadow-xl">
            <label className="block text-xs font-bold text-tartan-gold uppercase tracking-wider">
              Select Automated Email Template:
            </label>

            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {filteredTemplates.map((tmpl) => {
                const isSelected = tmpl.id === selectedTemplateId;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => setSelectedTemplateId(tmpl.id)}
                    className={`w-full p-3 rounded-2xl text-left text-xs transition-all border flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-tartan-navy text-tartan-gold border-tartan-gold shadow-md ring-1 ring-tartan-gold/40'
                        : 'bg-tartan-dark/70 text-gray-300 border-tartan-border/60 hover:bg-tartan-dark hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold truncate text-white">{tmpl.name}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                        tmpl.recipientRole === 'Client'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {tmpl.recipientRole}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 line-clamp-1">{tmpl.triggerDescription}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Template Details & Copy Editor */}
          <div className="bg-tartan-card rounded-3xl border border-tartan-border p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-tartan-border pb-3">
              <div>
                <h3 className="text-sm font-bold text-white font-serif">
                  Template Copy &amp; Placeholders
                </h3>
                <p className="text-[11px] text-gray-400">Edit subject line and body wording</p>
              </div>
              <span className="text-[10px] text-tartan-gold bg-tartan-navy px-2.5 py-1 rounded-full border border-tartan-accent/40 font-mono">
                ID: {activeTemplate.id}
              </span>
            </div>

            {/* Trigger info */}
            <div className="p-3 rounded-xl bg-tartan-dark border border-tartan-border/80 text-xs space-y-1">
              <span className="text-[10px] font-bold text-tartan-gold uppercase tracking-wider block">When this email sends:</span>
              <p className="text-gray-300 text-[11px] leading-relaxed">{activeTemplate.triggerDescription}</p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 text-xs">
              
              {/* Subject Line */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-tartan-gold">
                  Subject Line Template:
                </label>
                <input
                  type="text"
                  value={activeTemplate.defaultSubject}
                  onChange={(e) => handleUpdateActiveTemplate('defaultSubject', e.target.value)}
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-tartan-gold text-xs"
                />
              </div>

              {/* Pre-Header Badge */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-tartan-gold">
                  Header Top Badge Label:
                </label>
                <input
                  type="text"
                  value={activeTemplate.badgeLabel}
                  onChange={(e) => handleUpdateActiveTemplate('badgeLabel', e.target.value)}
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-tartan-gold text-xs"
                />
              </div>

              {/* Headline Greeting */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-tartan-gold">
                  Introduction Headline:
                </label>
                <input
                  type="text"
                  value={activeTemplate.introHeadline}
                  onChange={(e) => handleUpdateActiveTemplate('introHeadline', e.target.value)}
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-tartan-gold text-xs"
                />
              </div>

              {/* Intro Body */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-tartan-gold">
                  Main Body Message:
                </label>
                <textarea
                  rows={3}
                  value={activeTemplate.introBody}
                  onChange={(e) => handleUpdateActiveTemplate('introBody', e.target.value)}
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-3 text-white focus:outline-none focus:border-tartan-gold text-xs leading-relaxed"
                />
              </div>

              {/* Footer Note */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-tartan-gold">
                  Footer Sign-Off / Notice:
                </label>
                <input
                  type="text"
                  value={activeTemplate.footerNote || ''}
                  onChange={(e) => handleUpdateActiveTemplate('footerNote', e.target.value)}
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-tartan-gold text-xs"
                />
              </div>

              {/* Placeholder Helper Chips */}
              <div className="pt-2 border-t border-tartan-border/60">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Available Smart Placeholders:</p>
                <div className="flex flex-wrap gap-1.5">
                  {['{clientName}', '{eventType}', '{eventDate}', '{timeSlot}', '{venueName}', '{venuePostcode}', '{tartanChoice}', '{estimatedPrice}', '{depositAmount}', '{remainingBalance}', '{dayBeforeDate}'].map((chip) => (
                    <span key={chip} className="text-[10px] bg-tartan-dark text-tartan-gold px-2 py-0.5 rounded-md border border-tartan-border font-mono">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Test Dispatch Card */}
          <div className="bg-gradient-to-r from-tartan-navy to-tartan-card rounded-3xl border border-tartan-accent/50 p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-tartan-gold">
              <Send className="w-4 h-4" />
              <h3 className="text-sm font-bold text-white font-serif">Send Real Live Test Email</h3>
            </div>
            <p className="text-xs text-gray-300">
              Deliver this exact template preview directly to your inbox via Brevo to verify real inbox formatting:
            </p>

            <div className="space-y-3">
              <input
                type="email"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                placeholder="Spud@spudthepiper.com"
                className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-gold"
              />

              <button
                onClick={handleSendLiveTestEmail}
                disabled={isSendingTest}
                className="w-full py-3 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isSendingTest ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{isSendingTest ? 'Sending via Brevo...' : 'Send Live Test Email Now'}</span>
              </button>
            </div>

            {testSendResult && (
              <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                testSendResult.success 
                  ? 'bg-green-950/80 border-green-500/60 text-green-300' 
                  : 'bg-red-950/80 border-red-500/60 text-red-300'
              }`}>
                {testSendResult.success ? <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
                <span>{testSendResult.message}</span>
              </div>
            )}
          </div>

        </div>

        {/* ================= RIGHT COLUMN: INTERACTIVE LIVE PREVIEW FRAME (7 Cols) ================= */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Preview Controls Bar */}
          <div className="bg-tartan-card rounded-2xl border border-tartan-border p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            
            {/* Scenario Selector */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs text-gray-400 font-bold whitespace-nowrap">Test Scenario:</label>
              <select
                value={selectedScenarioKey}
                onChange={(e) => setSelectedScenarioKey(e.target.value as any)}
                className="bg-tartan-dark border border-tartan-border rounded-xl px-3 py-1.5 text-xs text-tartan-gold font-bold focus:outline-none cursor-pointer"
              >
                <option value="wedding">🏰 Castle Wedding (Blair Castle • £580)</option>
                <option value="gala">⚔️ Clan Gala (Eilean Donan • £650)</option>
                <option value="memorial">🕊️ Cathedral Memorial (Inverness • £280)</option>
              </select>
            </div>

            {/* Device Toggle */}
            <div className="flex items-center gap-1.5 bg-tartan-dark p-1 rounded-xl border border-tartan-border">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  previewDevice === 'desktop'
                    ? 'bg-tartan-gold text-tartan-dark shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop</span>
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  previewDevice === 'mobile'
                    ? 'bg-tartan-gold text-tartan-dark shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile</span>
              </button>
            </div>
          </div>

          {/* Realistic Email Client Frame */}
          <div className={`mx-auto transition-all duration-300 ${
            previewDevice === 'mobile' ? 'max-w-sm' : 'w-full'
          }`}>
            <div className="bg-slate-900 rounded-3xl border-2 border-tartan-gold/50 shadow-2xl overflow-hidden">
              
              {/* Email Client Header Bar */}
              <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
                  <span className="font-mono text-[11px] text-gray-300 ml-2">Brevo Transactional Dispatch</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  Live Preview
                </span>
              </div>

              {/* Email Envelope Metadata */}
              <div className="bg-slate-900/90 px-6 py-4 border-b border-slate-800 text-xs text-gray-300 space-y-1.5 font-sans">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p><strong className="text-gray-400">From:</strong> Spud the Piper &lt;info@spudthepiper.com&gt;</p>
                  <span className="text-[10px] text-gray-400">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <p>
                  <strong className="text-gray-400">To:</strong>{' '}
                  {activeTemplate.recipientRole === 'Client' ? sampleBooking.clientName : 'Callum "Spud" Fraser'}{' '}
                  &lt;{activeTemplate.recipientRole === 'Client' ? sampleBooking.clientEmail : 'Spud@spudthepiper.com'}&gt;
                </p>
                <p className="text-white font-semibold pt-1 border-t border-slate-800">
                  <strong className="text-tartan-gold">Subject:</strong> {replacePlaceholders(activeTemplate.defaultSubject)}
                </p>
              </div>

              {/* Rendered Email Body Canvas */}
              <div className="p-4 sm:p-6 bg-[#070b14] overflow-y-auto max-h-[720px]">
                
                {/* Outer Email Container (Matches Brevo Template) */}
                <div className="max-w-[580px] mx-auto bg-[#0d1527] text-gray-100 p-6 sm:p-8 rounded-2xl border border-[#c5a059] shadow-2xl space-y-6">
                  
                  {/* Top Scottish Header */}
                  <div className="text-center border-b border-[#1e293b] pb-5 space-y-1.5">
                    <h2 className="text-2xl font-bold font-serif text-[#c5a059] tracking-tight uppercase m-0">
                      Spud The Piper
                    </h2>
                    <p className="text-xs text-[#94a3b8] uppercase tracking-wider font-semibold m-0">
                      {replacePlaceholders(activeTemplate.badgeLabel)}
                    </p>
                  </div>

                  {/* Greeting & Main Intro Message */}
                  <div className="bg-[#131d33] p-5 rounded-xl border border-[#1e293b] space-y-3">
                    <p className="text-sm font-bold text-white m-0">
                      Dear <span className="text-[#c5a059]">{activeTemplate.recipientRole === 'Client' ? sampleBooking.clientName : 'Spud'}</span>,
                    </p>
                    <p className="text-xs text-[#e2e8f0] leading-relaxed m-0 whitespace-pre-line">
                      {replacePlaceholders(activeTemplate.introBody)}
                    </p>

                    {/* Event Breakdown Table */}
                    <div className="bg-[#0b1120] rounded-xl p-4 my-3 border-l-4 border-[#c5a059]">
                      <table className="w-full text-xs border-collapse">
                        <tbody>
                          <tr className="border-b border-[#1e293b]">
                            <td className="py-1.5 text-[#94a3b8]">Event / Occasion:</td>
                            <td className="py-1.5 text-right font-bold text-white">{sampleBooking.eventType}</td>
                          </tr>
                          <tr className="border-b border-[#1e293b]">
                            <td className="py-1.5 text-[#94a3b8]">Date &amp; Slot:</td>
                            <td className="py-1.5 text-right font-bold text-[#facc15]">{formatEventDate(sampleBooking.date)} ({sampleBooking.timeSlot})</td>
                          </tr>
                          <tr className="border-b border-[#1e293b]">
                            <td className="py-1.5 text-[#94a3b8]">Venue &amp; Location:</td>
                            <td className="py-1.5 text-right font-bold text-white">{sampleBooking.venueName} ({sampleBooking.venuePostcode})</td>
                          </tr>
                          <tr className="border-b border-[#1e293b]">
                            <td className="py-1.5 text-[#94a3b8]">Highland Attire:</td>
                            <td className="py-1.5 text-right text-white">{sampleBooking.tartanChoice}</td>
                          </tr>
                          <tr className="border-b border-[#1e293b]">
                            <td className="py-1.5 text-[#94a3b8]">Requested Tunes:</td>
                            <td className="py-1.5 text-right text-[#facc15] font-bold">{(sampleBooking.specialTunes || []).join(', ')}</td>
                          </tr>
                          <tr className="border-b border-[#1e293b]">
                            <td className="py-1.5 text-[#94a3b8]">Total Performance Fee:</td>
                            <td className="py-1.5 text-right font-bold text-white">£{sampleBooking.estimatedPrice}.00</td>
                          </tr>
                          <tr>
                            <td className="py-2 text-[#c5a059] font-bold">Provisional Deposit:</td>
                            <td className="py-2 text-right font-bold text-sm text-[#c5a059]">£{sampleBooking.depositAmount}.00</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* What Happens Next Guidance Box */}
                    {activeTemplate.whatNextTitle && activeTemplate.whatNextPoints && (
                      <div className="bg-[#1e293b] rounded-xl p-4 border border-[#334155] space-y-2">
                        <h4 className="text-xs font-bold text-[#facc15] m-0">
                          {activeTemplate.whatNextTitle}
                        </h4>
                        <ul className="text-xs text-[#cbd5e1] space-y-1.5 pl-4 list-disc m-0 leading-relaxed">
                          {activeTemplate.whatNextPoints.map((pt, idx) => (
                            <li key={idx}>{replacePlaceholders(pt)}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* CTA Button if present */}
                    {activeTemplate.ctaButtonText && (
                      <div className="text-center pt-3 pb-1">
                        <span className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-[#c5a059] to-[#dfb76c] text-[#0b1120] font-extrabold text-xs uppercase tracking-wider shadow-lg cursor-default">
                          {replacePlaceholders(activeTemplate.ctaButtonText)}
                        </span>
                      </div>
                    )}

                    {/* Client Notes if applicable */}
                    {sampleBooking.notes && (
                      <div className="p-3 bg-[#0b1120] rounded-lg border border-[#1e293b] text-[11px] text-[#94a3b8] italic">
                        <strong>Client Note:</strong> &quot;{sampleBooking.notes}&quot;
                      </div>
                    )}

                    {/* Footer Contact */}
                    {activeTemplate.footerNote && (
                      <div className="pt-3 border-t border-[#334155] text-[11px] text-[#94a3b8] leading-relaxed">
                        <p className="m-0">{replacePlaceholders(activeTemplate.footerNote)}</p>
                      </div>
                    )}

                  </div>

                  {/* Template Footer */}
                  <div className="text-center text-[10px] text-[#64748b] space-y-1">
                    <p className="m-0">Spud The Piper • Aviemore, Highlands, Scotland • spudthepiper.com</p>
                    <p className="m-0">Automated Dispatch Engine powered by Brevo Transactional Email</p>
                  </div>

                </div>

              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
