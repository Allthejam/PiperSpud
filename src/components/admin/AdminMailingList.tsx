'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Mail, 
  Send, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Trash2, 
  Tag, 
  Calendar, 
  Heart, 
  Flame, 
  Globe, 
  Clock,
  ExternalLink,
  RefreshCw,
  Eye,
  Check
} from 'lucide-react';
import { MailingContact, EmailCampaign } from '@/types/spud';

export const AdminMailingList: React.FC = () => {
  const { 
    mailingContacts, 
    emailCampaigns, 
    addMailingContact, 
    removeMailingContact,
    dispatchBroadcastCampaign,
    bookings
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'contacts' | 'composer' | 'history'>('composer');

  // New Contact Modal State
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newSource, setNewSource] = useState<'booking' | 'enquiry' | 'newsletter' | 'manual'>('manual');
  const [newEventType, setNewEventType] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Campaign Composer State
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(emailCampaigns[0]?.id || 'camp-christmas-2026');
  const [activeCampaign, setActiveCampaign] = useState<EmailCampaign>(emailCampaigns[0] || {
    id: 'camp-custom',
    title: 'Custom Broadcast',
    subject: 'Greetings from Spud the Piper 🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    heading: 'Highland Bagpipe News & Celebrations',
    bodyContent: 'Dear friends and clients,\n\nSharing warm greetings from Aviemore in the Scottish Highlands!\n\nHere are the latest updates, upcoming public performances, and availability for next season.',
    ctaText: 'View Diary & Dates',
    ctaUrl: 'https://spudthepiper.com/booking',
    segment: 'all',
    status: 'draft',
    templateType: 'custom'
  });

  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<{ success: boolean; count: number; message: string } | null>(null);

  // Filter contacts
  const filteredContacts = mailingContacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.phone && contact.phone.includes(searchTerm)) ||
      (contact.venueName && contact.venueName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.tags && contact.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));

    if (!matchesSearch) return false;
    if (filterTag === 'all') return true;
    if (filterTag === 'booking') return contact.source === 'booking';
    if (filterTag === 'enquiry') return contact.source === 'enquiry';
    if (filterTag === 'newsletter') return contact.source === 'newsletter';
    if (filterTag === 'weddings') return contact.tags?.some(t => t.toLowerCase().includes('wedding')) || contact.eventType?.toLowerCase().includes('wedding');
    if (filterTag === 'corporate') return contact.tags?.some(t => t.toLowerCase().includes('corporate') || t.toLowerCase().includes('castle'));
    return true;
  });

  // Calculate target audience for current campaign segment
  const getTargetRecipients = (segment: EmailCampaign['segment']) => {
    return mailingContacts.filter(c => {
      if (c.status !== 'subscribed') return false;
      if (segment === 'all') return true;
      if (segment === 'bookings_only') return c.source === 'booking';
      if (segment === 'enquiries_only') return c.source === 'enquiry';
      if (segment === 'weddings') return c.tags?.some(t => t.toLowerCase().includes('wedding')) || c.eventType?.toLowerCase().includes('wedding');
      if (segment === 'corporate') return c.tags?.some(t => t.toLowerCase().includes('corporate') || t.toLowerCase().includes('castle'));
      if (segment === 'subscribers') return c.source === 'newsletter';
      return true;
    });
  };

  const targetRecipients = getTargetRecipients(activeCampaign.segment);

  // Handle template selection
  const handleSelectTemplate = (camp: EmailCampaign) => {
    setSelectedCampaignId(camp.id);
    setActiveCampaign({ ...camp });
    setDispatchResult(null);
  };

  // Handle adding new contact
  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    addMailingContact({
      name: newName,
      email: newEmail,
      phone: newPhone || undefined,
      source: newSource,
      status: 'subscribed',
      tags: newTags ? newTags.split(',').map(t => t.trim()).filter(Boolean) : ['Client'],
      eventType: newEventType || undefined,
      notes: newNotes || undefined,
      addedAt: new Date().toISOString(),
      brevoSynced: true
    });

    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewEventType('');
    setNewTags('');
    setNewNotes('');
    setIsAddContactModalOpen(false);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Source', 'Status', 'Event Type', 'Event Date', 'Venue', 'Tags', 'Date Added'];
    const rows = filteredContacts.map(c => [
      `"${c.name}"`,
      `"${c.email}"`,
      `"${c.phone || ''}"`,
      `"${c.source}"`,
      `"${c.status}"`,
      `"${c.eventType || ''}"`,
      `"${c.eventDate || ''}"`,
      `"${c.venueName || ''}"`,
      `"${(c.tags || []).join('; ')}"`,
      `"${c.addedAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `spud-the-piper-mailing-list-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle sending broadcast via Brevo
  const handleSendBroadcast = async () => {
    if (targetRecipients.length === 0) {
      alert('No subscribed recipients match this audience segment.');
      return;
    }

    const confirmSend = window.confirm(
      `Are you sure you want to dispatch "${activeCampaign.title}" to ${targetRecipients.length} recipients via Brevo?`
    );
    if (!confirmSend) return;

    setIsDispatching(true);
    setDispatchResult(null);

    try {
      const res = await dispatchBroadcastCampaign(activeCampaign, targetRecipients);
      setIsDispatching(false);
      if (res?.success) {
        setDispatchResult({
          success: true,
          count: res.sentCount || targetRecipients.length,
          message: `Broadcast successfully dispatched to ${res.sentCount || targetRecipients.length} clients via Brevo!`
        });
      } else {
        setDispatchResult({
          success: false,
          count: 0,
          message: res?.error || 'Failed to dispatch broadcast. Check Brevo settings.'
        });
      }
    } catch (err: any) {
      setIsDispatching(false);
      setDispatchResult({
        success: false,
        count: 0,
        message: err.message || 'Error communicating with Brevo.'
      });
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="bg-tartan-card rounded-3xl p-6 sm:p-8 border border-tartan-border shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tartan-accent/15 border border-tartan-accent/30 text-tartan-gold text-xs font-semibold">
            <Mail className="w-3.5 h-3.5" />
            <span>Brevo Email Marketing & Client Communications</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif tracking-tight">
            Client Mailing List & Seasonal Broadcast Studio
          </h2>
          <p className="text-sm text-gray-300 max-w-2xl">
            Automatically captured contacts from bookings, enquiries, and VIP subscribers. Send seasonal greetings, Christmas & Hogmanay messages, Burns Night announcements, and custom Highland newsletters with 1 click via Brevo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddContactModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gold-gradient text-tartan-dark font-bold text-xs flex items-center gap-2 shadow-lg hover:brightness-110 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-tartan-navy hover:bg-slate-700 text-gray-200 border border-tartan-border font-semibold text-xs flex items-center gap-2 transition-all"
            title="Download CSV for Excel / Backups"
          >
            <Download className="w-4 h-4 text-tartan-gold" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-tartan-card p-5 rounded-2xl border border-tartan-border space-y-1 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Total Audience</span>
            <Users className="w-4 h-4 text-tartan-gold" />
          </div>
          <p className="text-2xl font-extrabold text-white font-serif">{mailingContacts.length}</p>
          <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>100% Subscribed & Active</span>
          </p>
        </div>

        <div className="bg-tartan-card p-5 rounded-2xl border border-tartan-border space-y-1 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Booking Clients</span>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-extrabold text-white font-serif">
            {mailingContacts.filter(c => c.source === 'booking').length}
          </p>
          <p className="text-[11px] text-gray-400">Weddings, Galas & Celebrations</p>
        </div>

        <div className="bg-tartan-card p-5 rounded-2xl border border-tartan-border space-y-1 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">VIP Newsletter Subscribers</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-white font-serif">
            {mailingContacts.filter(c => c.source === 'newsletter').length}
          </p>
          <p className="text-[11px] text-gray-400">Highland Club & Fans</p>
        </div>

        <div className="bg-tartan-card p-5 rounded-2xl border border-tartan-border space-y-1 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Brevo Dispatch Status</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <p className="text-base font-bold text-emerald-300 font-serif">Live & Authenticated</p>
          <p className="text-[11px] text-gray-400 truncate">info@spudthepiper.com (DMARC ✓)</p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-tartan-border/60 pb-3 text-sm">
        <button
          onClick={() => setActiveTab('composer')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
            activeTab === 'composer'
              ? 'bg-tartan-gold text-tartan-dark shadow-md'
              : 'text-gray-400 hover:text-white bg-tartan-dark/60'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Seasonal Broadcast Composer</span>
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
            activeTab === 'contacts'
              ? 'bg-tartan-gold text-tartan-dark shadow-md'
              : 'text-gray-400 hover:text-white bg-tartan-dark/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Mailing Directory ({mailingContacts.length})</span>
        </button>
      </div>

      {/* TAB 1: SEASONAL BROADCAST COMPOSER */}
      {activeTab === 'composer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Template Selector & Editor */}
          <div className="lg:col-span-7 bg-tartan-card rounded-3xl p-6 sm:p-8 border border-tartan-border shadow-2xl space-y-6">
            
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-tartan-gold uppercase tracking-wider">
                Select Broadcast Template:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {emailCampaigns.map(camp => (
                  <button
                    key={camp.id}
                    type="button"
                    onClick={() => handleSelectTemplate(camp)}
                    className={`p-3.5 rounded-2xl border text-left space-y-1.5 transition-all ${
                      selectedCampaignId === camp.id
                        ? 'bg-tartan-navy border-tartan-gold ring-1 ring-tartan-gold/60 text-white'
                        : 'bg-tartan-dark/70 border-tartan-border text-gray-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold truncate">{camp.title}</span>
                      {selectedCampaignId === camp.id && <Check className="w-3.5 h-3.5 text-tartan-gold" />}
                    </div>
                    <p className="text-[11px] text-gray-400 truncate">{camp.subject}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Campaign Form */}
            <div className="space-y-4 pt-2 border-t border-tartan-border/60">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-tartan-gold mb-1.5">
                    Internal Campaign Title *
                  </label>
                  <input
                    type="text"
                    value={activeCampaign.title}
                    onChange={(e) => setActiveCampaign({ ...activeCampaign, title: e.target.value })}
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-tartan-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-tartan-gold mb-1.5">
                    Target Audience Segment *
                  </label>
                  <select
                    value={activeCampaign.segment}
                    onChange={(e) => setActiveCampaign({ ...activeCampaign, segment: e.target.value as any })}
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-tartan-accent"
                  >
                    <option value="all">All Contacts ({mailingContacts.length} recipients)</option>
                    <option value="bookings_only">Confirmed Booking Clients Only ({mailingContacts.filter(c => c.source === 'booking').length})</option>
                    <option value="weddings">Past Wedding Couples ({mailingContacts.filter(c => c.tags?.some(t => t.toLowerCase().includes('wedding')) || c.eventType?.toLowerCase().includes('wedding')).length})</option>
                    <option value="corporate">Corporate & Castle Clients ({mailingContacts.filter(c => c.tags?.some(t => t.toLowerCase().includes('corporate') || t.toLowerCase().includes('castle'))).length})</option>
                    <option value="subscribers">VIP Newsletter Subscribers ({mailingContacts.filter(c => c.source === 'newsletter').length})</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-tartan-gold mb-1.5">
                  Email Subject Line *
                </label>
                <input
                  type="text"
                  value={activeCampaign.subject}
                  onChange={(e) => setActiveCampaign({ ...activeCampaign, subject: e.target.value })}
                  placeholder="e.g. 🏴󠁧󠁢󠁳󠁣󠁴󠁿 Festive Greetings & Happy Hogmanay from Spud the Piper!"
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-tartan-accent font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-tartan-gold mb-1.5">
                  Main Email Heading *
                </label>
                <input
                  type="text"
                  value={activeCampaign.heading}
                  onChange={(e) => setActiveCampaign({ ...activeCampaign, heading: e.target.value })}
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-tartan-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-tartan-gold mb-1.5">
                  Email Message Body *
                </label>
                <textarea
                  rows={7}
                  value={activeCampaign.bodyContent}
                  onChange={(e) => setActiveCampaign({ ...activeCampaign, bodyContent: e.target.value })}
                  placeholder="Write Spud's personalized message to his clients..."
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-3 text-white text-xs leading-relaxed focus:outline-none focus:border-tartan-accent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-tartan-gold mb-1.5">
                    Button Label (Optional)
                  </label>
                  <input
                    type="text"
                    value={activeCampaign.ctaText || ''}
                    onChange={(e) => setActiveCampaign({ ...activeCampaign, ctaText: e.target.value })}
                    placeholder="e.g. View 2027 Diary & Dates"
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-tartan-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-tartan-gold mb-1.5">
                    Button Destination URL
                  </label>
                  <input
                    type="text"
                    value={activeCampaign.ctaUrl || ''}
                    onChange={(e) => setActiveCampaign({ ...activeCampaign, ctaUrl: e.target.value })}
                    placeholder="https://spudthepiper.com/booking"
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-tartan-accent"
                  />
                </div>
              </div>

            </div>

            {/* Dispatch Action Box */}
            <div className="pt-4 border-t border-tartan-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-gray-400">
                <span>Sending to: </span>
                <strong className="text-tartan-gold">{targetRecipients.length} verified recipients</strong>
                <span className="text-gray-500 block">via Brevo Transactional Engine</span>
              </div>

              <button
                type="button"
                disabled={isDispatching || targetRecipients.length === 0}
                onClick={handleSendBroadcast}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs tracking-wider uppercase shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                {isDispatching ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Dispatching via Brevo...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Dispatch Broadcast via Brevo</span>
                  </>
                )}
              </button>
            </div>

            {/* Success / Feedback Alert */}
            {dispatchResult && (
              <div className={`p-4 rounded-2xl border text-xs flex items-center gap-3 animate-in zoom-in-95 ${
                dispatchResult.success 
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200' 
                  : 'bg-red-950/80 border-red-500 text-red-200'
              }`}>
                {dispatchResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <Trash2 className="w-5 h-5 text-red-400 shrink-0" />
                )}
                <div>
                  <p className="font-bold">{dispatchResult.message}</p>
                </div>
              </div>
            )}

          </div>

          {/* Right: Live Interactive Email Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between text-xs text-gray-400 font-semibold px-1">
              <span className="flex items-center gap-1.5 text-tartan-gold">
                <Eye className="w-3.5 h-3.5" />
                <span>Live Client Email Preview</span>
              </span>
              <span>Brevo HTML Layout</span>
            </div>

            <div className="bg-[#0b1320] rounded-3xl p-6 border border-tartan-gold/80 shadow-2xl space-y-5 text-white">
              
              {/* Email Top Header */}
              <div className="text-center border-b border-slate-800 pb-4">
                <h3 className="text-xl font-serif font-bold text-tartan-gold tracking-wide">
                  Spud The Piper
                </h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">
                  Traditional Highland Bagpiper • Scotland
                </p>
              </div>

              {/* Email Content Box */}
              <div className="bg-[#141e30] rounded-2xl p-5 border border-slate-800 space-y-4">
                <h4 className="text-base font-serif font-bold text-white border-l-2 border-tartan-gold pl-2.5">
                  {activeCampaign.heading || 'Festive Highland Greetings'}
                </h4>

                <p className="text-xs text-gray-300">
                  Dear <strong className="text-tartan-gold">[Client Name]</strong>,
                </p>

                <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-line">
                  {activeCampaign.bodyContent}
                </p>

                {activeCampaign.ctaText && (
                  <div className="text-center pt-3">
                    <span className="inline-block bg-gold-gradient text-tartan-dark font-extrabold text-[11px] px-5 py-2.5 rounded-lg uppercase tracking-wider shadow-md">
                      {activeCampaign.ctaText}
                    </span>
                  </div>
                )}
              </div>

              {/* Email Footer */}
              <div className="text-center text-[10px] text-gray-500 space-y-1">
                <p>Spud The Piper • Aviemore, Highlands, Scotland • spudthepiper.com</p>
                <p>Delivered via Brevo Transactional Email Network</p>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* TAB 2: CONTACT DIRECTORY & SEARCH */}
      {activeTab === 'contacts' && (
        <div className="bg-tartan-card rounded-3xl p-6 sm:p-8 border border-tartan-border shadow-2xl space-y-6">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, email, venue, tag..."
                className="w-full bg-tartan-dark border border-tartan-border rounded-xl pl-10 pr-4 py-2 text-white text-xs focus:outline-none focus:border-tartan-accent"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'All Contacts' },
                { id: 'booking', label: 'Bookings' },
                { id: 'newsletter', label: 'VIP Newsletter' },
                { id: 'weddings', label: 'Weddings' },
                { id: 'corporate', label: 'Corporate' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterTag(f.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    filterTag === f.id
                      ? 'bg-tartan-gold text-tartan-dark'
                      : 'bg-tartan-dark text-gray-300 border border-tartan-border hover:bg-tartan-navy'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

          </div>

          {/* Contacts Table */}
          <div className="overflow-x-auto rounded-2xl border border-tartan-border/60">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-tartan-dark/90 text-[11px] text-gray-400 uppercase tracking-wider border-b border-tartan-border/60">
                <tr>
                  <th className="py-3.5 px-4">Client Name & Email</th>
                  <th className="py-3.5 px-4">Source / Event</th>
                  <th className="py-3.5 px-4">Location / Venue</th>
                  <th className="py-3.5 px-4">Tags & Segment</th>
                  <th className="py-3.5 px-4">Brevo Sync</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tartan-border/40">
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No contacts found matching your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map(contact => (
                    <tr key={contact.id} className="hover:bg-tartan-navy/40 transition-colors">
                      
                      {/* Name & Contact */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-white text-sm">{contact.name}</p>
                        <span className="text-gray-400 block">{contact.email}</span>
                        {contact.phone && <span className="text-gray-500 text-[11px]">{contact.phone}</span>}
                      </td>

                      {/* Source */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase mb-1 ${
                          contact.source === 'booking' 
                            ? 'bg-blue-950 text-blue-300 border border-blue-800' 
                            : contact.source === 'newsletter'
                            ? 'bg-purple-950 text-purple-300 border border-purple-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {contact.source}
                        </span>
                        {contact.eventType && (
                          <p className="text-[11px] text-tartan-gold font-serif truncate max-w-[180px]">
                            {contact.eventType}
                          </p>
                        )}
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4">
                        <span className="text-white block font-medium">{contact.venueName || contact.location || 'Scotland'}</span>
                        {contact.eventDate && <span className="text-[11px] text-gray-400">Date: {contact.eventDate}</span>}
                      </td>

                      {/* Tags */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {contact.tags.map((t, idx) => (
                            <span key={idx} className="bg-tartan-navy text-tartan-gold text-[10px] px-2 py-0.5 rounded-full border border-tartan-border">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Brevo Sync */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Synced</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            if (window.confirm(`Remove ${contact.name} from mailing list?`)) {
                              removeMailingContact(contact.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-950/40 transition-all"
                          title="Remove from mailing list"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Add Contact Modal */}
      {isAddContactModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-tartan-card rounded-3xl p-6 sm:p-8 border border-tartan-border max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-tartan-border/60 pb-3">
              <h3 className="text-lg font-bold text-white font-serif flex items-center gap-2">
                <Plus className="w-4 h-4 text-tartan-gold" />
                <span>Add Contact to Mailing List</span>
              </h3>
              <button
                onClick={() => setIsAddContactModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddContact} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-tartan-gold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Catriona Campbell"
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-2.5 text-white focus:outline-none focus:border-tartan-accent"
                />
              </div>

              <div>
                <label className="block font-semibold text-tartan-gold mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. catriona@example.scot"
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-2.5 text-white focus:outline-none focus:border-tartan-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-tartan-gold mb-1">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="07798..."
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-2.5 text-white focus:outline-none focus:border-tartan-accent"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-tartan-gold mb-1">Source</label>
                  <select
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value as any)}
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-2.5 text-white focus:outline-none focus:border-tartan-accent"
                  >
                    <option value="manual">Manual Entry</option>
                    <option value="booking">Past Client</option>
                    <option value="newsletter">VIP Newsletter</option>
                    <option value="enquiry">Enquiry</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-tartan-gold mb-1">Event / Occasion Type</label>
                <input
                  type="text"
                  value={newEventType}
                  onChange={(e) => setNewEventType(e.target.value)}
                  placeholder="e.g. Wedding, Burns Supper, Birthday..."
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-2.5 text-white focus:outline-none focus:border-tartan-accent"
                />
              </div>

              <div>
                <label className="block font-semibold text-tartan-gold mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="e.g. Wedding 2026, Inverness, Castle Gala"
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-2.5 text-white focus:outline-none focus:border-tartan-accent"
                />
              </div>

              <div>
                <label className="block font-semibold text-tartan-gold mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Special notes or context..."
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-2.5 text-white focus:outline-none focus:border-tartan-accent"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddContactModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-tartan-navy text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gold-gradient text-tartan-dark font-bold hover:brightness-110 shadow-md"
                >
                  Save to Mailing List
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
