'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  CreditCard, 
  QrCode, 
  Sparkles, 
  CheckCircle2, 
  RotateCcw, 
  Copy, 
  ExternalLink, 
  Volume2, 
  VolumeX, 
  Tag, 
  Store, 
  Loader2, 
  ArrowRight, 
  DollarSign, 
  Clock, 
  User, 
  Mail, 
  MapPin, 
  Flame, 
  Check, 
  RefreshCw, 
  Ban, 
  Archive, 
  ArchiveRestore, 
  Trash2, 
  MoreVertical, 
  Pencil, 
  Plus,
  Receipt,
  Share2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot 
} from 'firebase/firestore';
import { TillCharge, TillPresetItem, BookingEvent } from '@/types/spud';
import { initialTillPresets } from '@/lib/initialData';

/**
 * Web Audio API synthesizer for instant 2-tone Scottish cash register / chime.
 * Operates offline, zero external audio latency.
 */
function playCashChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Tone 1: High crisp bell (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    // Tone 2: Harmonious high chime (A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0.3, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.7);
  } catch (err) {
    console.warn('[Till Audio] Could not play synth chime:', err);
  }
}

export const AdminTill: React.FC = () => {
  const { bookings } = useApp();

  // Local Toast Notification
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => {
      setToastMsg((current) => (current?.message === message ? null : current));
    }, 3500);
  };

  // Terminal Input State
  const [amountStr, setAmountStr] = useState<string>('0');
  const [description, setDescription] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [eventLocation, setEventLocation] = useState<string>('Live Highland Performance');
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');

  // Active Terminal State
  const [activeCharge, setActiveCharge] = useState<TillCharge | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [hasPaidAlertShown, setHasPaidAlertShown] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Presets & Customisation
  const [presets, setPresets] = useState<TillPresetItem[]>(initialTillPresets);
  const [isEditingPresets, setIsEditingPresets] = useState<boolean>(false);
  const [draftPresets, setDraftPresets] = useState<TillPresetItem[]>(initialTillPresets);
  const [isSavingPresets, setIsSavingPresets] = useState<boolean>(false);
  const [newPresetName, setNewPresetName] = useState<string>('');
  const [newPresetPrice, setNewPresetPrice] = useState<string>('');
  const [newPresetCategory, setNewPresetCategory] = useState<string>('Performances');

  // Transaction History & Filters
  const [recentCharges, setRecentCharges] = useState<TillCharge[]>([]);
  const [filterStatus, setFilterStatus] = useState<'active' | 'archived' | 'all'>('active');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Load Presets from Firestore / LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('spud_till_presets');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPresets(parsed);
          }
        }
      } catch (err) {
        console.warn('Could not read presets from localStorage:', err);
      }
    }

    if (!db) return;
    const presetsDocRef = doc(db, 'till_presets', 'default');
    const unsubscribe = onSnapshot(
      presetsDocRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data?.items) && data.items.length > 0) {
            setPresets(data.items);
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem('spud_till_presets', JSON.stringify(data.items));
              } catch (e) {}
            }
          }
        }
      },
      (err) => {
        console.warn('Till presets listener notice:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  // Real-time listener for recent transactions
  useEffect(() => {
    if (!db) return;
    const chargesCol = collection(db, 'till_charges');
    const q = query(chargesCol, orderBy('createdAt', 'desc'), limit(40));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: TillCharge[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as TillCharge);
        });
        setRecentCharges(items);
      },
      (err) => {
        console.warn('[Till] Transactions stream error:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  // Real-time listener on active charge for instant PAID detection
  useEffect(() => {
    if (!activeCharge?.id || !db) return;

    const chargeDocRef = doc(db, 'till_charges', activeCharge.id);
    const unsubscribe = onSnapshot(
      chargeDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as TillCharge;
          if (data.status === 'paid' && activeCharge.status !== 'paid') {
            setActiveCharge(data);
            if (soundEnabled) {
              playCashChime();
            }
            if (!hasPaidAlertShown) {
              setHasPaidAlertShown(true);
              addToast(
                `🎉 £${data.amount.toFixed(2)} Paid by ${data.payerName || data.payerEmail || 'Client'}!`,
                'success'
              );
            }
          }
        }
      },
      (error) => {
        console.warn('[Till] Real-time listener notice:', error);
      }
    );

    return () => unsubscribe();
  }, [activeCharge?.id, soundEnabled, hasPaidAlertShown, addToast]);

  // Keypad Handlers
  const handleKeypadPress = (val: string) => {
    if (val === 'C') {
      setAmountStr('0');
      return;
    }
    if (val === '.') {
      if (amountStr.includes('.')) return;
      setAmountStr(amountStr + '.');
      return;
    }
    if (val === '00') {
      if (amountStr === '0') return;
      if (amountStr.includes('.') && amountStr.split('.')[1].length >= 2) return;
      setAmountStr(amountStr + '00');
      return;
    }

    if (amountStr === '0') {
      setAmountStr(val);
    } else {
      if (amountStr.includes('.')) {
        const decimals = amountStr.split('.')[1];
        if (decimals.length >= 2) return;
      }
      setAmountStr(amountStr + val);
    }
  };

  const handleQuickAdd = (inc: number) => {
    const current = parseFloat(amountStr) || 0;
    setAmountStr((current + inc).toFixed(2));
  };

  const handleApplyPreset = (item: TillPresetItem) => {
    setAmountStr(item.price.toFixed(2));
    setDescription(item.name);
  };

  const handleBookingSelect = (bId: string) => {
    setSelectedBookingId(bId);
    if (!bId) return;
    const match = (bookings || []).find((b) => b.id === bId);
    if (match) {
      setCustomerName(match.clientName || '');
      setCustomerEmail(match.clientEmail || '');
      setEventLocation(match.venueName || 'Highland Venue');
      const rem = Math.max(0, match.estimatedPrice - (match.depositAmount || 0));
      if (rem > 0) {
        setAmountStr(rem.toFixed(2));
        setDescription(`Final Balance Settlement: ${match.eventType} (${match.date})`);
      }
    }
  };

  const handleGenerateCharge = async () => {
    const num = parseFloat(amountStr);
    if (isNaN(num) || num <= 0) {
      addToast('Please enter a valid amount greater than £0.00', 'error');
      return;
    }

    setIsGenerating(true);
    setHasPaidAlertShown(false);

    const chargeId = `till_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const newCharge: TillCharge = {
      id: chargeId,
      amount: parseFloat(num.toFixed(2)),
      currency: 'GBP',
      description: description.trim() || 'Highland Bagpipe Performance',
      customerName: customerName.trim() || null,
      customerEmail: customerEmail.trim().toLowerCase() || null,
      eventLocation: eventLocation.trim() || 'Live Highland Performance',
      bookingId: selectedBookingId || null,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setActiveCharge(newCharge);

    if (db) {
      try {
        const docRef = doc(db, 'till_charges', chargeId);
        await setDoc(docRef, newCharge);
      } catch (err: any) {
        console.warn('[Till] Offline/persistence notice:', err);
      }
    }

    setIsGenerating(false);
    addToast(`QR Payment Code for £${newCharge.amount.toFixed(2)} generated!`, 'success');
  };

  const getPaymentUrl = (chargeId: string, itemCharge?: TillCharge) => {
    const c = itemCharge || activeCharge;
    const query = c
      ? `?amount=${encodeURIComponent(c.amount.toFixed(2))}&desc=${encodeURIComponent(c.description || '')}&loc=${encodeURIComponent(c.eventLocation || '')}&name=${encodeURIComponent(c.customerName || '')}&email=${encodeURIComponent(c.customerEmail || '')}&bookingId=${encodeURIComponent(c.bookingId || '')}`
      : '';
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/pay/${chargeId}${query}`;
    }
    return `https://spudthepiper.com/pay/${chargeId}${query}`;
  };

  const handleCopyLink = () => {
    if (!activeCharge) return;
    const url = getPaymentUrl(activeCharge.id);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    addToast('Payment checkout link copied to clipboard!', 'info');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleResetTill = () => {
    setActiveCharge(null);
    setAmountStr('0');
    setDescription('');
    setCustomerName('');
    setCustomerEmail('');
    setSelectedBookingId('');
    setHasPaidAlertShown(false);
  };

  const handleShowQr = (item: TillCharge) => {
    setActiveCharge(item);
    setAmountStr(item.amount.toFixed(2));
    setDescription(item.description);
    setCustomerName(item.customerName || '');
    setCustomerEmail(item.customerEmail || '');
    if (item.eventLocation) setEventLocation(item.eventLocation);
    if (item.bookingId) setSelectedBookingId(item.bookingId);
    addToast('Charge loaded to payment terminal', 'info');
  };

  const handleMarkAsPaidCash = async (item: TillCharge) => {
    if (!confirm(`Mark £${item.amount.toFixed(2)} as PAID (Received via Cash / External Card)?`)) return;

    const updated: Partial<TillCharge> = {
      status: 'paid',
      paymentMethod: 'cash',
      paidAt: new Date().toISOString()
    };

    if (db) {
      try {
        await setDoc(doc(db, 'till_charges', item.id), updated, { merge: true });
        addToast(`Marked #${item.id.slice(-6)} as Paid (Cash / Card)`, 'success');
        if (soundEnabled) playCashChime();
        if (activeCharge?.id === item.id) {
          setActiveCharge({ ...activeCharge, ...updated } as TillCharge);
        }
      } catch (err: any) {
        addToast(`Could not update: ${err.message}`, 'error');
      }
    }
  };

  const handleCancelOrder = async (item: TillCharge) => {
    if (!confirm(`Cancel payment request for £${item.amount.toFixed(2)}?`)) return;

    if (db) {
      try {
        await setDoc(doc(db, 'till_charges', item.id), { status: 'cancelled', cancelledAt: new Date().toISOString() }, { merge: true });
        addToast('Payment request cancelled', 'info');
        if (activeCharge?.id === item.id) {
          setActiveCharge(null);
        }
      } catch (err: any) {
        addToast(`Could not cancel: ${err.message}`, 'error');
      }
    }
  };

  const handleArchiveOrder = async (item: TillCharge) => {
    const newArchived = !item.archived;
    if (db) {
      try {
        await setDoc(doc(db, 'till_charges', item.id), { 
          archived: newArchived, 
          archivedAt: newArchived ? new Date().toISOString() : null 
        }, { merge: true });
        addToast(newArchived ? 'Charge archived' : 'Charge unarchived', 'info');
      } catch (err: any) {
        addToast(`Error: ${err.message}`, 'error');
      }
    }
  };

  const handleDeleteCharge = async (item: TillCharge) => {
    if (!confirm(`Permanently delete transaction record #${item.id.slice(-6)}?`)) return;

    if (db) {
      try {
        await deleteDoc(doc(db, 'till_charges', item.id));
        addToast('Charge permanently deleted', 'info');
        if (activeCharge?.id === item.id) {
          setActiveCharge(null);
        }
      } catch (err: any) {
        addToast(`Error deleting: ${err.message}`, 'error');
      }
    }
  };

  // Presets Editor Functions
  const handleOpenPresetsEditor = () => {
    setDraftPresets([...presets]);
    setIsEditingPresets(true);
  };

  const handleSavePresets = async () => {
    const cleaned = draftPresets
      .map((p) => ({
        name: p.name.trim(),
        price: parseFloat(Number(p.price).toFixed(2)),
        category: p.category || 'Performances'
      }))
      .filter((p) => p.name.length > 0 && !isNaN(p.price) && p.price > 0);

    if (cleaned.length === 0) {
      addToast('Please have at least one preset with a valid name and price', 'error');
      return;
    }

    setIsSavingPresets(true);
    setPresets(cleaned);

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('spud_till_presets', JSON.stringify(cleaned));
      }

      if (db) {
        await setDoc(doc(db, 'till_presets', 'default'), {
          items: cleaned,
          updatedAt: new Date().toISOString()
        });
      }

      addToast(`Updated ${cleaned.length} presets for your Till!`, 'success');
      setIsEditingPresets(false);
    } catch (err: any) {
      console.warn('Presets cloud sync warning:', err);
      addToast('Presets saved on this device.', 'info');
      setIsEditingPresets(false);
    } finally {
      setIsSavingPresets(false);
    }
  };

  const handleAddNewPreset = () => {
    const name = newPresetName.trim();
    const price = parseFloat(newPresetPrice);
    if (!name) {
      addToast('Please enter a name for the preset item', 'error');
      return;
    }
    if (isNaN(price) || price <= 0) {
      addToast('Please enter a valid price greater than £0.00', 'error');
      return;
    }

    setDraftPresets([...draftPresets, { name, price, category: newPresetCategory }]);
    setNewPresetName('');
    setNewPresetPrice('');
  };

  const handleRemoveDraftPreset = (index: number) => {
    setDraftPresets(draftPresets.filter((_, i) => i !== index));
  };

  const filteredCharges = useMemo(() => {
    if (filterStatus === 'archived') {
      return recentCharges.filter((c) => c.archived === true);
    }
    if (filterStatus === 'active') {
      return recentCharges.filter((c) => !c.archived);
    }
    return recentCharges;
  }, [recentCharges, filterStatus]);

  // Revenue summaries for today
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysPaidTotal = recentCharges
    .filter((c) => c.status === 'paid' && c.paidAt && c.paidAt.startsWith(todayStr))
    .reduce((sum, c) => sum + (c.amount || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-tartan-card border border-tartan-gold rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full bg-tartan-accent/20 border border-tartan-gold text-tartan-gold text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-tartan-gold" />
              <span>Highland Point of Sale (POS)</span>
            </span>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Chime sound enabled' : 'Chime sound muted'}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
            </button>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight">
            Event Till &amp; Mobile Checkout
          </h2>
          <p className="text-xs text-gray-300 max-w-xl">
            Settle wedding balances on the night, charge for performance extensions, sell albums, or take tips instantly. Customers scan the QR code to pay via Apple Pay, Google Pay, Card, or PayPal.
          </p>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="bg-tartan-dark/90 border border-tartan-border rounded-2xl px-5 py-3 text-right">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Today&apos;s Till Take</span>
            <span className="text-2xl font-black text-emerald-400">£{todaysPaidTotal.toFixed(2)}</span>
          </div>

          <button
            onClick={handleOpenPresetsEditor}
            className="px-4 py-2.5 bg-tartan-dark border border-tartan-gold/60 text-tartan-gold hover:bg-tartan-accent/20 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit Presets</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Point-of-Sale Terminal Keypad & Presets (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-tartan-card border border-tartan-border rounded-3xl p-6 shadow-xl space-y-5">
            
            {/* Amount Display */}
            <div className="bg-tartan-dark rounded-2xl p-5 border border-tartan-border/80 text-right space-y-1 relative">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block text-left">
                Amount to Charge (GBP)
              </span>
              <div className="text-4xl sm:text-5xl font-black text-tartan-gold font-mono tracking-tight flex items-center justify-end">
                <span>£</span>
                <span>{amountStr}</span>
              </div>
            </div>

            {/* Quick Increment Buttons */}
            <div className="flex flex-wrap gap-2">
              {[10, 20, 50, 100, 150, 250].map((inc) => (
                <button
                  key={inc}
                  onClick={() => handleQuickAdd(inc)}
                  className="px-3 py-1.5 bg-tartan-dark hover:bg-tartan-accent/30 border border-tartan-border hover:border-tartan-gold rounded-xl text-xs font-bold text-gray-200 transition-colors"
                >
                  +£{inc}
                </button>
              ))}
              <button
                onClick={() => setAmountStr('0')}
                className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 rounded-xl text-xs font-bold text-rose-300 ml-auto transition-colors"
              >
                Clear
              </button>
            </div>

            {/* Numeric Touch Keypad */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '00'].map((val) => (
                <button
                  key={val}
                  onClick={() => handleKeypadPress(val)}
                  className="py-3.5 sm:py-4 bg-tartan-dark/90 hover:bg-tartan-accent/25 border border-tartan-border/70 hover:border-tartan-gold rounded-2xl text-lg sm:text-xl font-black text-white transition-all active:scale-95 shadow-sm"
                >
                  {val}
                </button>
              ))}
            </div>

            {/* Piper Presets Selector */}
            <div className="space-y-2 pt-2 border-t border-tartan-border/60">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-tartan-gold" />
                  <span>Highland Quick Presets</span>
                </label>
                <button
                  onClick={handleOpenPresetsEditor}
                  className="text-[11px] text-tartan-gold hover:underline flex items-center gap-1"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Customize</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {presets.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleApplyPreset(item)}
                    className="p-2.5 bg-tartan-dark/80 hover:bg-tartan-accent/20 border border-tartan-border hover:border-tartan-gold rounded-xl text-left transition-all group"
                  >
                    <div className="text-[11px] font-bold text-white group-hover:text-tartan-gold truncate">
                      {item.name}
                    </div>
                    <div className="text-xs font-extrabold text-amber-400">
                      £{item.price.toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Charge Details Form */}
            <div className="space-y-3 pt-3 border-t border-tartan-border/60">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-gray-300 font-semibold flex items-center gap-1">
                    <Tag className="w-3 h-3 text-tartan-gold" />
                    <span>Item / Service Note</span>
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Wedding Balance Settlement"
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-gray-300 font-semibold flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-tartan-gold" />
                    <span>Performance Location</span>
                  </label>
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="e.g. Eilean Donan Castle"
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-gray-300 font-semibold flex items-center gap-1">
                    <User className="w-3 h-3 text-tartan-gold" />
                    <span>Customer Name (Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Fiona & Alasdair"
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-gray-300 font-semibold flex items-center gap-1">
                    <Mail className="w-3 h-3 text-tartan-gold" />
                    <span>Receipt Email (Optional)</span>
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. client@example.com"
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-gold"
                  />
                </div>
              </div>

              {/* Link to existing booking in diary */}
              <div className="space-y-1">
                <label className="text-[11px] text-gray-300 font-semibold flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-tartan-gold" />
                  <span>Link to Diary Booking (Optional - Auto-Fills Client)</span>
                </label>
                <select
                  value={selectedBookingId}
                  onChange={(e) => handleBookingSelect(e.target.value)}
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-tartan-gold"
                >
                  <option value="">-- Standalone Charge / Spontaneous Performance --</option>
                  {(bookings || []).slice(0, 15).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.date} • {b.clientName} ({b.eventType} at {b.venueName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Generate QR Button */}
              <button
                onClick={handleGenerateCharge}
                disabled={isGenerating || parseFloat(amountStr) <= 0}
                className="w-full py-4 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:brightness-110 disabled:opacity-50 text-tartan-dark font-black rounded-2xl text-sm uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 transition-all mt-4"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generating Terminal Code...</span>
                  </>
                ) : (
                  <>
                    <QrCode className="w-5 h-5" />
                    <span>Generate Instant QR Payment Code (£{parseFloat(amountStr || '0').toFixed(2)})</span>
                  </>
                )}
              </button>

            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Active Terminal QR & Live Status (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-tartan-card border-2 border-tartan-gold rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-tartan-border/60 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-tartan-gold" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Customer Terminal View
                </h3>
              </div>
              {activeCharge && (
                <button
                  onClick={handleResetTill}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {activeCharge ? (
              <div className="space-y-5 text-center">
                
                {/* Active Charge Status Badge */}
                {activeCharge.status === 'paid' ? (
                  <div className="bg-emerald-950/80 border-2 border-emerald-500 rounded-2xl p-4 text-emerald-400 space-y-2 animate-in zoom-in-95">
                    <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-400 animate-bounce" />
                    <div className="text-xl font-black text-white">PAYMENT COMPLETE!</div>
                    <div className="text-xs text-emerald-300">
                      £{activeCharge.amount.toFixed(2)} received from {activeCharge.payerName || activeCharge.customerName || 'Customer'}
                    </div>
                    {activeCharge.paypalOrderId && (
                      <div className="text-[10px] font-mono text-emerald-400/80 pt-1 border-t border-emerald-800">
                        Ref: {activeCharge.paypalOrderId}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 animate-pulse">
                      <Clock className="w-3 h-3" />
                      <span>Awaiting Customer Payment...</span>
                    </span>
                    <div className="text-3xl font-black text-white pt-1">
                      £{activeCharge.amount.toFixed(2)}
                    </div>
                    <p className="text-xs text-gray-300 truncate font-medium">
                      {activeCharge.description}
                    </p>
                  </div>
                )}

                {/* QR Code Graphic Container (White background for max camera contrast) */}
                <div className="bg-white rounded-3xl p-5 shadow-2xl max-w-[280px] mx-auto border-4 border-amber-500/40">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(
                      getPaymentUrl(activeCharge.id)
                    )}`}
                    alt="Customer Scan QR Code"
                    className="w-full h-auto aspect-square rounded-xl"
                  />
                  <p className="text-[11px] font-bold text-gray-800 mt-2">
                    Customer scans with phone camera
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleCopyLink}
                    className="w-full py-2.5 bg-tartan-dark hover:bg-tartan-accent/20 border border-tartan-border rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-tartan-gold" />}
                    <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Payment Link (SMS / WhatsApp)'}</span>
                  </button>

                  <a
                    href={getPaymentUrl(activeCharge.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-tartan-dark/60 hover:bg-tartan-dark border border-tartan-border/60 rounded-xl text-xs font-bold text-gray-300 hover:text-white flex items-center justify-center gap-2 transition-all"
                  >
                    <ExternalLink className="w-4 h-4 text-tartan-gold" />
                    <span>Open Checkout Page in New Tab (Test)</span>
                  </a>

                  {activeCharge.status !== 'paid' && (
                    <button
                      onClick={() => handleMarkAsPaidCash(activeCharge)}
                      className="w-full py-2 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Customer Handed Cash / External Terminal</span>
                    </button>
                  )}
                </div>

              </div>
            ) : (
              <div className="py-16 text-center space-y-4 text-gray-400">
                <div className="w-16 h-16 rounded-3xl bg-tartan-dark border border-tartan-border mx-auto flex items-center justify-center text-tartan-gold/60">
                  <QrCode className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white font-serif">Terminal Idle</p>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto">
                    Punch in an amount or tap a Highland preset on the left, then click Generate QR Code to begin.
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* BOTTOM SECTION: Recent Till Transactions */}
      <div className="bg-tartan-card border border-tartan-border rounded-3xl p-6 shadow-xl space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-tartan-border/60 pb-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-tartan-gold" />
            <h3 className="text-base font-bold text-white font-serif">
              Recent Point-of-Sale Transactions
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-tartan-dark border border-tartan-border text-[10px] text-gray-300 font-bold">
              {filteredCharges.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {(['active', 'all', 'archived'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterStatus(mode)}
                className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                  filterStatus === mode
                    ? 'bg-tartan-gold text-tartan-dark'
                    : 'bg-tartan-dark text-gray-400 hover:text-white border border-tartan-border'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {filteredCharges.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs">
            No transactions found in this filter view.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-tartan-border/60 text-gray-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3">Client &amp; Contact</th>
                  <th className="py-3 px-3">Venue / Location</th>
                  <th className="py-3 px-3">Created</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tartan-border/40">
                {filteredCharges.map((item) => (
                  <tr key={item.id} className="hover:bg-tartan-dark/50 transition-colors">
                    <td className="py-3 px-3 whitespace-nowrap">
                      {item.status === 'paid' ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-extrabold uppercase">
                          PAID
                        </span>
                      ) : item.status === 'cancelled' ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-extrabold uppercase">
                          CANCELLED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold uppercase">
                          PENDING
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 font-bold text-white text-sm">
                      £{item.amount.toFixed(2)}
                    </td>

                    <td className="py-3 px-3 text-gray-200 font-medium max-w-xs truncate">
                      {item.description}
                    </td>

                    <td className="py-3 px-3 text-gray-300">
                      <div>{item.customerName || item.payerName || 'Direct Guest'}</div>
                      {item.customerEmail && (
                        <div className="text-[10px] text-gray-500 truncate">{item.customerEmail}</div>
                      )}
                    </td>

                    <td className="py-3 px-3 text-gray-400 truncate max-w-[140px]">
                      {item.eventLocation || 'Highland Gathering'}
                    </td>

                    <td className="py-3 px-3 text-gray-400 whitespace-nowrap text-[11px]">
                      {new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}{' '}
                      {new Date(item.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleShowQr(item)}
                          title="Show QR on Terminal"
                          className="p-1.5 rounded-lg bg-tartan-dark hover:bg-tartan-accent/30 text-tartan-gold transition-colors"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>

                        {item.status === 'pending' && (
                          <button
                            onClick={() => handleMarkAsPaidCash(item)}
                            title="Mark as Paid (Cash / Card)"
                            className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {item.status === 'pending' && (
                          <button
                            onClick={() => handleCancelOrder(item)}
                            title="Cancel Request"
                            className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-400 transition-colors"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => handleArchiveOrder(item)}
                          title={item.archived ? 'Restore from Archive' : 'Archive'}
                          className="p-1.5 rounded-lg bg-tartan-dark hover:bg-tartan-accent/20 text-gray-400 hover:text-white transition-colors"
                        >
                          {item.archived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleDeleteCharge(item)}
                          title="Delete Record"
                          className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* MODAL: Presets Editor */}
      {isEditingPresets && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-tartan-card border-2 border-tartan-gold rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-tartan-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-tartan-gold" />
                <h3 className="text-xl font-bold text-white font-serif">
                  Customize Till Presets
                </h3>
              </div>
              <button
                onClick={() => setIsEditingPresets(false)}
                className="text-gray-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-300">
              Customize the quick-tap buttons available on your mobile till. Changes sync to cloud and your phone.
            </p>

            {/* Existing Presets List */}
            <div className="space-y-2">
              {draftPresets.map((preset, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-tartan-dark p-2.5 rounded-xl border border-tartan-border"
                >
                  <input
                    type="text"
                    value={preset.name}
                    onChange={(e) => {
                      const updated = [...draftPresets];
                      updated[idx].name = e.target.value;
                      setDraftPresets(updated);
                    }}
                    placeholder="Preset Item Name"
                    className="flex-1 bg-transparent border-none text-xs text-white focus:outline-none"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400">£</span>
                    <input
                      type="number"
                      step="0.01"
                      value={preset.price}
                      onChange={(e) => {
                        const updated = [...draftPresets];
                        updated[idx].price = parseFloat(e.target.value) || 0;
                        setDraftPresets(updated);
                      }}
                      className="w-20 bg-tartan-card border border-tartan-border rounded-lg px-2 py-1 text-xs text-tartan-gold font-bold text-right focus:outline-none focus:border-tartan-gold"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveDraftPreset(idx)}
                    className="p-1 text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Preset Row */}
            <div className="bg-tartan-dark/60 p-3 rounded-2xl border border-dashed border-tartan-border space-y-2">
              <span className="text-[11px] font-bold text-tartan-gold uppercase tracking-wider block">
                Add New Preset Item
              </span>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="Item Name (e.g. Extra 30 Mins)"
                  className="flex-1 bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-gold"
                />
                <input
                  type="number"
                  step="0.01"
                  value={newPresetPrice}
                  onChange={(e) => setNewPresetPrice(e.target.value)}
                  placeholder="Price (£)"
                  className="w-full sm:w-24 bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-tartan-gold"
                />
                <button
                  onClick={handleAddNewPreset}
                  className="px-4 py-2 bg-tartan-gold text-tartan-dark font-extrabold rounded-xl text-xs flex items-center justify-center gap-1 hover:brightness-110 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-tartan-border/60">
              <button
                onClick={() => setIsEditingPresets(false)}
                className="px-4 py-2 bg-tartan-dark border border-tartan-border text-gray-300 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePresets}
                disabled={isSavingPresets}
                className="px-6 py-2 bg-gold-gradient text-tartan-dark font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 hover:brightness-110"
              >
                {isSavingPresets ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Save All Presets</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
          <div className={`px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2.5 ${
            toastMsg.type === 'success' ? 'bg-emerald-950/95 border-emerald-500 text-emerald-200' :
            toastMsg.type === 'error' ? 'bg-rose-950/95 border-rose-500 text-rose-200' :
            'bg-tartan-card border-tartan-gold text-tartan-gold'
          }`}>
            {toastMsg.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toastMsg.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toastMsg.type === 'info' && <Sparkles className="w-4 h-4 text-tartan-gold shrink-0" />}
            <span>{toastMsg.message}</span>
          </div>
        </div>
      )}

    </div>
  );
};
