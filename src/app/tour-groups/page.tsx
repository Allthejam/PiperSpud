'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LiveChatWidget } from '@/components/LiveChatWidget';
import { VisualPencilOverlay } from '@/components/VisualPencilOverlay';
import { EditableElement } from '@/components/EditableElement';
import { SpudHeritageLogo } from '@/components/SpudHeritageLogo';
import { useApp } from '@/context/AppContext';
import { uploadToStorage, db } from '@/lib/firebase';
import { doc, setDoc, deleteDoc, onSnapshot, collection } from 'firebase/firestore';
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
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit3,
  Trash2,
  X,
  Upload,
  Loader2,
  Swords,
  Music
} from 'lucide-react';

interface PastTourEvent {
  id: string;
  title: string;
  location: string;
  groupType: string;
  origin: string;
  imageUrl: string;
  description: string;
  highlight: string;
  order?: number;
}

const initialTourEvents: PastTourEvent[] = [
  {
    id: 'event-1',
    title: 'North American Coach Holiday Grand Arrival',
    location: 'Cairngorms & Aviemore Highland Hotel',
    groupType: 'Coach Holiday Tour (48 Passengers)',
    origin: 'USA & Canada',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&q=80',
    description: 'Surprise bagpipe welcoming ceremony as the luxury coach pulled up to the hotel. Spud greeted guests in full No. 1 Dress with "Scotland the Brave", followed by a spirited photo session with the passengers against the mountain backdrop.',
    highlight: 'Full No. 1 Regalia & Personal Photos for Every Guest',
    order: 1
  },
  {
    id: 'event-2',
    title: 'Highland Loch Ness Excursion & Urquhart Castle',
    location: 'Loch Ness Viewpoint, Inverness-shire',
    groupType: 'Inverness Shore & Highlands Tour',
    origin: 'Australia & New Zealand',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&q=80',
    description: 'A breathtaking outdoor piping stop overlooking the dramatic waters of Loch Ness. Spud performed "Highland Cathedral" and "Skye Boat Song", then hosted a 20-minute Q&A showing how the bagpipes are tuned and answering Scottish clan questions.',
    highlight: 'Outdoor Acoustic Piping with Dramatic Loch Views',
    order: 2
  },
  {
    id: 'event-3',
    title: 'Speyside Single Malt Distillery Gala Reception',
    location: 'Speyside Historic Distillery, Moray',
    groupType: 'Whisky Connoisseurs International Tour',
    origin: 'Germany, Switzerland & Austria',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1000&q=80',
    description: 'Spud piped international guests from their coach through the distillery copper stills to the private tasting warehouse. Delivered a stirring toast in traditional Gaelic before leading a celebratory march into their private banquet.',
    highlight: 'Whisky Toast, Gaelic Salutation & Processional',
    order: 3
  },
  {
    id: 'event-4',
    title: 'Scottish Castle Evening Banquet & Address to the Haggis',
    location: 'Historic Scottish Castle, Central Highlands',
    groupType: 'European Cultural Heritage Tour (52 Guests)',
    origin: 'International Travel Club',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000&q=80',
    description: 'Piped the arrival of the tour coach at the castle portcullis, followed by ceremonial piping of the Haggis into the grand banquet hall with Robert Burns recitation and unforgettable Scottish banter.',
    highlight: 'Traditional Haggis Procession & Banquet Fanfare',
    order: 4
  }
];

const LOCAL_STORAGE_TOUR_EVENTS_KEY = 'spud_tour_events';

export default function TourGroupsPage() {
  const { addNotification, isAdminLoggedIn, isVisualEditMode } = useApp();
  const canManage = Boolean(isAdminLoggedIn || isVisualEditMode);

  // Tour events state with local & Firestore synchronization
  const [tourEvents, setTourEvents] = useState<PastTourEvent[]>(initialTourEvents);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Modal State for adding / editing carousel items
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formGroupType, setFormGroupType] = useState('');
  const [formOrigin, setFormOrigin] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formHighlight, setFormHighlight] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Delete modal state
  const [eventToDelete, setEventToDelete] = useState<PastTourEvent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load persisted tour events on mount & set up Firestore real-time listener
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_TOUR_EVENTS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTourEvents(parsed);
          }
        }
      } catch (e) {
        console.warn('Error reading local tour events:', e);
      }
    }

    if (!db) return;
    try {
      const unsub = onSnapshot(collection(db, 'tour_events'), (snapshot) => {
        if (!snapshot.empty) {
          const remoteEvents: PastTourEvent[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as PastTourEvent;
            if (data && (data.id || d.id)) {
              remoteEvents.push({ ...data, id: data.id || d.id });
            }
          });
          if (remoteEvents.length > 0) {
            setTourEvents(prev => {
              const currentList = prev && prev.length > 0 ? prev : initialTourEvents;
              const merged = [...currentList];
              remoteEvents.forEach(r => {
                const idx = merged.findIndex(e => e.id === r.id);
                if (idx >= 0) {
                  merged[idx] = { ...merged[idx], ...r };
                } else {
                  merged.push(r);
                }
              });
              merged.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
              if (typeof window !== 'undefined') {
                try {
                  localStorage.setItem(LOCAL_STORAGE_TOUR_EVENTS_KEY, JSON.stringify(merged));
                } catch (err) {}
              }
              return merged;
            });
          }
        }
      }, (err) => console.log('Firestore tour_events listener:', err.message));

      return () => unsub();
    } catch (e) {
      console.warn('Firebase Firestore tour_events init:', e);
    }
  }, []);

  // Safe slide index clamping
  useEffect(() => {
    if (currentSlide >= tourEvents.length) {
      setCurrentSlide(Math.max(0, tourEvents.length - 1));
    }
  }, [tourEvents.length, currentSlide]);

  const handlePrevSlide = () => {
    setCurrentSlide(prev => (prev === 0 ? tourEvents.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev === tourEvents.length - 1 ? 0 : prev + 1));
  };

  // Open modal to add a new event/story
  const handleOpenAddModal = () => {
    setEditingEventId(null);
    setFormTitle('');
    setFormLocation('Scottish Highlands');
    setFormGroupType('International Tour Group');
    setFormOrigin('USA, Canada & Europe');
    setFormImageUrl('https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&q=80');
    setFormDescription('');
    setFormHighlight('Authentic Scottish Bagpipe Welcome & Photo Moment');
    setSuccessMessage(null);
    setIsModalOpen(true);
  };

  // Open modal to edit existing event
  const handleOpenEditModal = (item: PastTourEvent) => {
    setEditingEventId(item.id);
    setFormTitle(item.title);
    setFormLocation(item.location);
    setFormGroupType(item.groupType);
    setFormOrigin(item.origin);
    setFormImageUrl(item.imageUrl);
    setFormDescription(item.description);
    setFormHighlight(item.highlight);
    setSuccessMessage(null);
    setIsModalOpen(true);
  };

  // Upload photo handler
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      alert('Photo is too large. Please select an image under 25MB.');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const downloadUrl = await uploadToStorage(file, 'tour_events');
      if (downloadUrl) {
        setFormImageUrl(downloadUrl);
      }
    } catch (err: any) {
      console.error('Error uploading tour event image:', err);
      alert(`Photo upload failed: ${err?.message || err}`);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Save tour event
  const handleSubmitEventForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || isSaving) return;

    setIsSaving(true);
    try {
      if (editingEventId) {
        const updatedItem: PastTourEvent = {
          id: editingEventId,
          title: formTitle.trim(),
          location: formLocation.trim() || 'Scottish Highlands',
          groupType: formGroupType.trim() || 'Tour Group',
          origin: formOrigin.trim() || 'International',
          imageUrl: formImageUrl.trim() || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&q=80',
          description: formDescription.trim(),
          highlight: formHighlight.trim() || 'Highland Welcome'
        };

        const updatedList = tourEvents.map(item => item.id === editingEventId ? { ...item, ...updatedItem } : item);
        setTourEvents(updatedList);
        if (typeof window !== 'undefined') {
          localStorage.setItem(LOCAL_STORAGE_TOUR_EVENTS_KEY, JSON.stringify(updatedList));
        }
        if (db) {
          await setDoc(doc(db, 'tour_events', editingEventId), updatedItem, { merge: true });
        }
        setSuccessMessage('Tour event updated successfully!');
      } else {
        const newId = `tour-ev-${Date.now()}`;
        const newEvent: PastTourEvent = {
          id: newId,
          title: formTitle.trim(),
          location: formLocation.trim() || 'Scottish Highlands',
          groupType: formGroupType.trim() || 'Tour Group',
          origin: formOrigin.trim() || 'International',
          imageUrl: formImageUrl.trim() || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&q=80',
          description: formDescription.trim(),
          highlight: formHighlight.trim() || 'Highland Welcome',
          order: tourEvents.length + 1
        };

        const updatedList = [...tourEvents, newEvent];
        setTourEvents(updatedList);
        setCurrentSlide(updatedList.length - 1);
        if (typeof window !== 'undefined') {
          localStorage.setItem(LOCAL_STORAGE_TOUR_EVENTS_KEY, JSON.stringify(updatedList));
        }
        if (db) {
          // Also seed baseline initial events if new
          for (const init of initialTourEvents) {
            await setDoc(doc(db, 'tour_events', init.id), init, { merge: true });
          }
          await setDoc(doc(db, 'tour_events', newId), newEvent);
        }
        setSuccessMessage('New tour moment added to the carousel!');
      }

      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMessage(null);
      }, 1100);
    } catch (err: any) {
      alert(`Error saving event: ${err?.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete event
  const handleConfirmDelete = async () => {
    if (!eventToDelete || isDeleting) return;
    if (tourEvents.length <= 1) {
      alert('You must have at least one tour event story in the carousel.');
      setEventToDelete(null);
      return;
    }

    setIsDeleting(true);
    try {
      const remaining = tourEvents.filter(e => e.id !== eventToDelete.id);
      setTourEvents(remaining);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_TOUR_EVENTS_KEY, JSON.stringify(remaining));
      }
      if (db) {
        await deleteDoc(doc(db, 'tour_events', eventToDelete.id));
      }
      if (currentSlide >= remaining.length) {
        setCurrentSlide(Math.max(0, remaining.length - 1));
      }
      setEventToDelete(null);
    } catch (err: any) {
      alert(`Error deleting event: ${err?.message || err}`);
    } finally {
      setIsDeleting(false);
    }
  };

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
  const [includeDancers, setIncludeDancers] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !email || !tourDate) return;

    setIsSubmitting(true);
    setTimeout(() => {
      addNotification({
        type: 'booking_request',
        title: 'New Tour Group Inquiry',
        message: `${operatorName || contactName} (${originCountry}) for ${groupSize} on ${tourDate} at ${locationOrHotel || 'Highlands'}${includeDancers ? ' [Highland Dancers Requested]' : ''}`,
        actionUrl: '/admin'
      });
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 800);
  };

  const activeSlide = tourEvents[currentSlide] || tourEvents[0];

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
            <EditableElement
              id="tour-page-badge"
              tag="span"
              defaultContent="International Coach Holidays & Tour Group Experiences"
              label="Tour Page Badge"
              section="tour-groups"
            />
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
            <EditableElement
              id="tour-hero-btn-enquire"
              tag="a"
              defaultContent="Enquire for Tour Dates"
              defaultLinkUrl="#tour-inquiry"
              className="px-6 py-3.5 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xl hover:brightness-110 flex items-center gap-2 transition"
              label="Tour Hero Enquire Button"
              section="tour-groups"
            />
            <div className="px-6 py-3.5 bg-tartan-card hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-tartan-border flex items-center gap-2 transition shadow-lg">
              <Phone className="w-4 h-4 text-tartan-gold shrink-0" />
              <EditableElement
                id="tour-hero-dispatch-phone"
                tag="a"
                defaultContent="Direct Tour Dispatch: 07793 491367"
                defaultLinkUrl="tel:07793491367"
                className="hover:text-tartan-gold transition"
                label="Direct Tour Dispatch Phone"
                section="tour-groups"
              />
            </div>
          </div>
        </div>
      </div>

      {/* What Tour Groups Experience */}
      <section className="py-16 sm:py-24 bg-tartan-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <EditableElement
              id="tour-exp-badge"
              tag="span"
              defaultContent="Iconic Scottish Hospitality"
              className="text-xs font-bold text-tartan-gold uppercase tracking-wider"
              label="Tour Experience Badge"
              section="tour-groups"
            />
            <EditableElement
              id="tour-exp-title"
              tag="h2"
              defaultContent="What International Guests Experience"
              className="text-3xl sm:text-5xl font-extrabold text-white font-serif"
              label="Tour Experience Title"
              section="tour-groups"
            />
            <EditableElement
              id="tour-exp-subtitle"
              tag="p"
              defaultContent="For visitors travelling from North America, Europe, Australia, and Asia, hearing an authentic bagpiper in full ceremonial dress in the Highlands is the bucket-list moment of their journey."
              className="text-sm text-gray-300"
              label="Tour Experience Subtitle"
              section="tour-groups"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-tartan-card rounded-2xl p-6 border border-tartan-border hover:border-tartan-gold/60 transition shadow-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-tartan-accent/20 border border-tartan-accent/40 text-tartan-gold flex items-center justify-center">
                  <Compass className="w-6 h-6" />
                </div>
                <EditableElement
                  id="tour-feat1-title"
                  tag="h3"
                  defaultContent="Coach Arrival & Welcome"
                  className="text-lg font-bold text-white font-serif"
                  label="Feature 1 Title"
                  section="tour-groups"
                />
                <EditableElement
                  id="tour-feat1-desc"
                  tag="p"
                  defaultContent="As your coach pulls up to your hotel, castle, or visitor centre, the stirring sound of the pipes greets your guests, providing an immediate goosebumps moment and the warmest Scottish welcome."
                  className="text-xs text-gray-300 leading-relaxed"
                  label="Feature 1 Description"
                  section="tour-groups"
                />
              </div>
              <div className="text-[11px] text-tartan-gold font-bold pt-2 border-t border-tartan-border/60">
                <EditableElement
                  id="tour-feat1-timing"
                  tag="span"
                  defaultContent="15 - 30 Minute Flexible Stops"
                  label="Feature 1 Timing"
                  section="tour-groups"
                />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-tartan-card rounded-2xl p-6 border border-tartan-border hover:border-tartan-gold/60 transition shadow-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center">
                  <Camera className="w-6 h-6" />
                </div>
                <EditableElement
                  id="tour-feat2-title"
                  tag="h3"
                  defaultContent="Guest Photo Opportunities"
                  className="text-lg font-bold text-white font-serif"
                  label="Feature 2 Title"
                  section="tour-groups"
                />
                <EditableElement
                  id="tour-feat2-desc"
                  tag="p"
                  defaultContent="Spud stands in immaculate No. 1 Ceremonial Dress with Feather Bonnet, cross-belt, plaid, and horsehair sporran. Every passenger gets the chance for individual and group photographs with a genuine Highland Piper."
                  className="text-xs text-gray-300 leading-relaxed"
                  label="Feature 2 Description"
                  section="tour-groups"
                />
              </div>
              <div className="text-[11px] text-tartan-gold font-bold pt-2 border-t border-tartan-border/60">
                <EditableElement
                  id="tour-feat2-timing"
                  tag="span"
                  defaultContent="Memorable Holiday Keepsakes"
                  label="Feature 2 Timing"
                  section="tour-groups"
                />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-tartan-card rounded-2xl p-6 border border-tartan-border hover:border-tartan-gold/60 transition shadow-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-tartan-accent/20 border border-tartan-accent/40 text-tartan-gold flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <EditableElement
                  id="tour-feat3-title"
                  tag="h3"
                  defaultContent="Interactive Story & Q&A"
                  className="text-lg font-bold text-white font-serif"
                  label="Feature 3 Title"
                  section="tour-groups"
                />
                <EditableElement
                  id="tour-feat3-desc"
                  tag="p"
                  defaultContent="Spud explains how the Great Highland Bagpipe works, reveals the meaning behind tartans, clan crests, and dirks, and shares entertaining Scottish banter tailored to international holidaymakers."
                  className="text-xs text-gray-300 leading-relaxed"
                  label="Feature 3 Description"
                  section="tour-groups"
                />
              </div>
              <div className="text-[11px] text-tartan-gold font-bold pt-2 border-t border-tartan-border/60">
                <EditableElement
                  id="tour-feat3-timing"
                  tag="span"
                  defaultContent="Scottish Heritage & Humour"
                  label="Feature 3 Timing"
                  section="tour-groups"
                />
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-tartan-card rounded-2xl p-6 border border-tartan-border hover:border-tartan-gold/60 transition shadow-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center">
                  <Wine className="w-6 h-6" />
                </div>
                <EditableElement
                  id="tour-feat4-title"
                  tag="h3"
                  defaultContent="Whisky Toasts & Banquets"
                  className="text-lg font-bold text-white font-serif"
                  label="Feature 4 Title"
                  section="tour-groups"
                />
                <EditableElement
                  id="tour-feat4-desc"
                  tag="p"
                  defaultContent="Piping tour parties into gala Scottish banquets, performing the official &quot;Address to a Haggis&quot;, or playing outside during sunset drinks at historic castles and distillery tours."
                  className="text-xs text-gray-300 leading-relaxed"
                  label="Feature 4 Description"
                  section="tour-groups"
                />
              </div>
              <div className="text-[11px] text-tartan-gold font-bold pt-2 border-t border-tartan-border/60">
                <EditableElement
                  id="tour-feat4-timing"
                  tag="span"
                  defaultContent="Evening Gala Dinners"
                  label="Feature 4 Timing"
                  section="tour-groups"
                />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Live Highland Dancers & Bagpipes Feature Showcase */}
      <section className="py-20 bg-gradient-to-b from-tartan-card via-tartan-navy to-tartan-dark border-t border-tartan-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tartan-gold/15 border border-tartan-gold/30 text-tartan-gold text-xs font-semibold shadow-md">
              <Swords className="w-4 h-4 text-tartan-gold" />
              <EditableElement
                id="tour-dancers-badge"
                tag="span"
                defaultContent="Traditional Highland Dancers & Bagpipes Upgrade"
                label="Highland Dancers Badge"
                section="tour-groups"
              />
            </div>
            
            <EditableElement
              id="tour-dancers-title"
              tag="h2"
              defaultContent="Spud & Highland Dancers: The Ultimate Scottish Spectacle"
              className="text-3xl sm:text-5xl font-extrabold text-white font-serif tracking-tight"
              label="Highland Dancers Section Title"
              section="tour-groups"
            />
            
            <EditableElement
              id="tour-dancers-subtitle"
              tag="p"
              defaultContent="Bring the thrill of the Highland Games directly to your holidaymakers. Spud is accompanied by authentic, champion Highland dancers performing historic warrior dances and vibrant reels to his live piping."
              className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl mx-auto"
              label="Highland Dancers Section Subtitle"
              section="tour-groups"
            />
          </div>

          {/* Dedicated Dancers Visual Showcase Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-tartan-dark/90 rounded-3xl p-6 sm:p-8 lg:p-10 border border-tartan-gold/40 shadow-2xl">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tartan-gold/10 border border-tartan-gold/30 text-tartan-gold text-xs font-semibold">
                <Sparkles className="w-4 h-4 text-tartan-gold" />
                <EditableElement
                  id="tour-dancers-feat-badge"
                  tag="span"
                  defaultContent="Live Duo or Troupe Performance"
                  label="Dancers Feature Badge"
                  section="tour-groups"
                />
              </div>

              <EditableElement
                id="tour-dancers-banner-title"
                tag="h3"
                defaultContent="Authentic Sword Dance & High-Energy Scottish Reels"
                className="text-2xl sm:text-3xl font-extrabold text-white font-serif leading-tight"
                label="Dancers Banner Title"
                section="tour-groups"
              />

              <EditableElement
                id="tour-dancers-banner-desc"
                tag="p"
                defaultContent="While Spud plays stirring bagpipe marches and lively jigs, national champion dancers in traditional tartan kilt outfits perform high-energy leaps, precision footwork over crossed swords, and engaging ceilidh demonstrations. Dancers also pose with passengers for keepsake photos with the swords and pipes."
                className="text-xs sm:text-sm text-gray-300 leading-relaxed"
                label="Dancers Banner Description"
                section="tour-groups"
              />

              <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-bold text-gray-300">
                <span className="px-3 py-1.5 rounded-lg bg-tartan-navy border border-tartan-border text-tartan-gold flex items-center gap-1.5">
                  <Swords className="w-3.5 h-3.5" /> Ghillie Callum Sword Dance
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-tartan-navy border border-tartan-border text-tartan-gold flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5" /> Highland Fling
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-tartan-navy border border-tartan-border text-tartan-gold flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Guest Interaction & Photos
                </span>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden border border-tartan-border group shadow-xl">
                <EditableElement
                  id="tour-dancers-img-1"
                  isImage={true}
                  defaultImageUrl="https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80"
                  defaultAlt="Highland Dancers performing live with Spud the Piper"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  label="Highland Dancer Performance Image"
                  section="tour-groups"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3 text-xs font-semibold text-white bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                  <EditableElement
                    id="tour-dancers-caption-1"
                    tag="span"
                    defaultContent="Live Scottish Performance & Crossed Swords"
                    label="Dancers Caption 1"
                    section="tour-groups"
                  />
                </div>
              </div>

              <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden border border-tartan-border group shadow-xl">
                <EditableElement
                  id="tour-dancers-img-2"
                  isImage={true}
                  defaultImageUrl="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80"
                  defaultAlt="Traditional Scottish music and festival gathering"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  label="Highland Gathering Image"
                  section="tour-groups"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3 text-xs font-semibold text-white bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                  <EditableElement
                    id="tour-dancers-caption-2"
                    tag="span"
                    defaultContent="Highland Games Atmosphere at Your Tour Stop"
                    label="Dancers Caption 2"
                    section="tour-groups"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4 Feature Cards for the Dancing Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Sword Dance */}
            <div className="bg-tartan-card rounded-3xl p-6 border border-tartan-gold/40 hover:border-tartan-gold transition-all duration-300 shadow-xl space-y-4 flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-tartan-gold flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <Swords className="w-6 h-6 text-tartan-gold" />
                </div>
                <EditableElement
                  id="tour-dance1-title"
                  tag="h3"
                  defaultContent="The Sword Dance (Ghillie Callum)"
                  className="text-lg font-bold text-white font-serif"
                  label="Dance 1 Title"
                  section="tour-groups"
                />
                <EditableElement
                  id="tour-dance1-desc"
                  tag="p"
                  defaultContent="The legendary ancient Scottish warrior dance dating back to King Malcolm Canmore (1054). Two broadswords are crossed on the ground as dancers execute intricate, lightning-fast leaps over the bare blades to Spud's accelerating tempo."
                  className="text-xs text-gray-300 leading-relaxed"
                  label="Dance 1 Description"
                  section="tour-groups"
                />
              </div>
              <div className="pt-3 border-t border-tartan-border/60 flex items-center gap-1.5 text-tartan-gold text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <EditableElement
                  id="tour-dance1-badge"
                  tag="span"
                  defaultContent="The Iconic Warrior Climax"
                  label="Dance 1 Badge"
                  section="tour-groups"
                />
              </div>
            </div>

            {/* Card 2: Highland Fling & Seann Triubhas */}
            <div className="bg-tartan-card rounded-3xl p-6 border border-tartan-gold/40 hover:border-tartan-gold transition-all duration-300 shadow-xl space-y-4 flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-tartan-gold flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <Music className="w-6 h-6 text-tartan-gold" />
                </div>
                <EditableElement
                  id="tour-dance2-title"
                  tag="h3"
                  defaultContent="Highland Fling & Seann Triubhas"
                  className="text-lg font-bold text-white font-serif"
                  label="Dance 2 Title"
                  section="tour-groups"
                />
                <EditableElement
                  id="tour-dance2-desc"
                  tag="p"
                  defaultContent="Celebrated victory dances full of athleticism, precision footwork, and swirling kilts. Dancers perform in authentic competition regalia (Highland & Aboyne dress) to classic pipe marches, strathspeys, and reels."
                  className="text-xs text-gray-300 leading-relaxed"
                  label="Dance 2 Description"
                  section="tour-groups"
                />
              </div>
              <div className="pt-3 border-t border-tartan-border/60 flex items-center gap-1.5 text-tartan-gold text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <EditableElement
                  id="tour-dance2-badge"
                  tag="span"
                  defaultContent="World-Class Athletic Artistry"
                  label="Dance 2 Badge"
                  section="tour-groups"
                />
              </div>
            </div>

            {/* Card 3: Interactive Guest Ceilidh */}
            <div className="bg-tartan-card rounded-3xl p-6 border border-tartan-gold/40 hover:border-tartan-gold transition-all duration-300 shadow-xl space-y-4 flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-tartan-gold flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6 text-tartan-gold" />
                </div>
                <EditableElement
                  id="tour-dance3-title"
                  tag="h3"
                  defaultContent="Interactive Guest Ceilidh Steps"
                  className="text-lg font-bold text-white font-serif"
                  label="Dance 3 Title"
                  section="tour-groups"
                />
                <EditableElement
                  id="tour-dance3-desc"
                  tag="p"
                  defaultContent="Holidaymakers don't just watch — they can take part! Dancers gently invite coach guests up to learn basic Scottish steps and link arms for a fun, lively group reel filled with laughter, clapping, and Scottish cheer."
                  className="text-xs text-gray-300 leading-relaxed"
                  label="Dance 3 Description"
                  section="tour-groups"
                />
              </div>
              <div className="pt-3 border-t border-tartan-border/60 flex items-center gap-1.5 text-tartan-gold text-xs font-bold">
                <Heart className="w-3.5 h-3.5" />
                <EditableElement
                  id="tour-dance3-badge"
                  tag="span"
                  defaultContent="Tour Group Crowd Favourite"
                  label="Dance 3 Badge"
                  section="tour-groups"
                />
              </div>
            </div>

            {/* Card 4: Photo Opportunities */}
            <div className="bg-tartan-card rounded-3xl p-6 border border-tartan-gold/40 hover:border-tartan-gold transition-all duration-300 shadow-xl space-y-4 flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-tartan-gold flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <Camera className="w-6 h-6 text-tartan-gold" />
                </div>
                <EditableElement
                  id="tour-dance4-title"
                  tag="h3"
                  defaultContent="Piper & Dancers Photos"
                  className="text-lg font-bold text-white font-serif"
                  label="Dance 4 Title"
                  section="tour-groups"
                />
                <EditableElement
                  id="tour-dance4-desc"
                  tag="p"
                  defaultContent="Unbeatable photo opportunities! Guests pose holding the ceremonial swords, standing beside Spud in full military feather bonnet, and flanked by Highland dancers in traditional tartan attire against Scottish mountain backdrops."
                  className="text-xs text-gray-300 leading-relaxed"
                  label="Dance 4 Description"
                  section="tour-groups"
                />
              </div>
              <div className="pt-3 border-t border-tartan-border/60 flex items-center gap-1.5 text-tartan-gold text-xs font-bold">
                <Camera className="w-3.5 h-3.5" />
                <EditableElement
                  id="tour-dance4-badge"
                  tag="span"
                  defaultContent="Unforgettable Keepsake Photos"
                  label="Dance 4 Badge"
                  section="tour-groups"
                />
              </div>
            </div>

          </div>

          {/* Banner Box: How it Works & Fast Quote CTA */}
          <div className="rounded-3xl bg-tartan-dark/90 p-6 sm:p-10 border border-tartan-gold/50 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl text-center lg:text-left">
              <span className="text-xs font-bold text-tartan-gold uppercase tracking-wider flex items-center justify-center lg:justify-start gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-tartan-gold" />
                <EditableElement
                  id="tour-dancers-callout-badge"
                  tag="span"
                  defaultContent="Tailored for Coach Tour Itineraries"
                  label="Dancers Callout Badge"
                  section="tour-groups"
                />
              </span>
              <EditableElement
                id="tour-dancers-callout-title"
                tag="h3"
                defaultContent="Flexible Formats: 1 to 4+ Dancers for 15, 30, or 60 Minutes"
                className="text-2xl font-bold text-white font-serif"
                label="Dancers Callout Title"
                section="tour-groups"
              />
              <EditableElement
                id="tour-dancers-callout-desc"
                tag="p"
                defaultContent="Performances can take place outdoors on castle lawns, hotel terraces, lochside viewpoints, or indoors in hotel ballrooms and dining suites. Fully synchronized with your coach timetable."
                className="text-xs sm:text-sm text-gray-300"
                label="Dancers Callout Description"
                section="tour-groups"
              />
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap justify-center">
              <a
                href="#tour-inquiry"
                className="px-6 py-3.5 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xl hover:brightness-110 flex items-center gap-2 transition"
              >
                <Swords className="w-4 h-4" />
                <span>Enquire with Highland Dancers</span>
              </a>
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
                <EditableElement
                  id="tour-coverage-badge"
                  tag="span"
                  defaultContent="Prime Scottish Tour Corridors"
                  label="Tour Coverage Badge"
                  section="tour-groups"
                />
              </div>
              <EditableElement
                id="tour-coverage-title"
                tag="h2"
                defaultContent="Covering the Highlands, Loch Ness, Aviemore & Central Scotland"
                className="text-3xl sm:text-4xl font-extrabold text-white font-serif"
                label="Tour Coverage Title"
                section="tour-groups"
              />
              <EditableElement
                id="tour-coverage-desc"
                tag="p"
                defaultContent="Spud is centrally positioned in the Scottish Highlands (based Aviemore / Inverness-shire) with rapid access to the most popular tour routes: A9 Highland spine, Loch Ness & Urquhart Castle, Inverness, Speyside Distilleries, Cairngorms National Park, Stirling Castle, Fort William, and Edinburgh."
                className="text-sm text-gray-300 leading-relaxed"
                label="Tour Coverage Description"
                section="tour-groups"
              />
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs text-gray-200">
                <div className="bg-tartan-card p-3 rounded-xl border border-tartan-border flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-tartan-gold shrink-0" />
                  <EditableElement
                    id="tour-region-1"
                    tag="span"
                    defaultContent="Aviemore & Cairngorms"
                    label="Tour Region 1"
                    section="tour-groups"
                  />
                </div>
                <div className="bg-tartan-card p-3 rounded-xl border border-tartan-border flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-tartan-gold shrink-0" />
                  <EditableElement
                    id="tour-region-2"
                    tag="span"
                    defaultContent="Inverness & Loch Ness"
                    label="Tour Region 2"
                    section="tour-groups"
                  />
                </div>
                <div className="bg-tartan-card p-3 rounded-xl border border-tartan-border flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-tartan-gold shrink-0" />
                  <EditableElement
                    id="tour-region-3"
                    tag="span"
                    defaultContent="Speyside Whisky Trail"
                    label="Tour Region 3"
                    section="tour-groups"
                  />
                </div>
                <div className="bg-tartan-card p-3 rounded-xl border border-tartan-border flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-tartan-gold shrink-0" />
                  <EditableElement
                    id="tour-region-4"
                    tag="span"
                    defaultContent="Stirling & Trossachs"
                    label="Tour Region 4"
                    section="tour-groups"
                  />
                </div>
                <div className="bg-tartan-card p-3 rounded-xl border border-tartan-border flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-tartan-gold shrink-0" />
                  <EditableElement
                    id="tour-region-5"
                    tag="span"
                    defaultContent="Highland Castle Hotels"
                    label="Tour Region 5"
                    section="tour-groups"
                  />
                </div>
                <div className="bg-tartan-card p-3 rounded-xl border border-tartan-border flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-tartan-gold shrink-0" />
                  <EditableElement
                    id="tour-region-6"
                    tag="span"
                    defaultContent="Cruise Shore Excursions"
                    label="Tour Region 6"
                    section="tour-groups"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-tartan-card rounded-3xl p-6 sm:p-8 border border-tartan-border shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-white font-serif flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-tartan-gold shrink-0" />
                <EditableElement
                  id="tour-peace-title"
                  tag="span"
                  defaultContent="Tour Operator Peace of Mind"
                  label="Tour Peace Title"
                  section="tour-groups"
                />
              </h3>
              <ul className="space-y-3 text-xs text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-tartan-gold mt-1.5 shrink-0" />
                  <EditableElement
                    id="tour-peace-item-1"
                    tag="span"
                    defaultContent="100% Punctuality Guarantee: Synchronized with coach manifests and traffic delays."
                    label="Peace of Mind 1"
                    section="tour-groups"
                  />
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-tartan-gold mt-1.5 shrink-0" />
                  <EditableElement
                    id="tour-peace-item-2"
                    tag="span"
                    defaultContent="Weather Resilient: Accustomed to all Scottish elements (rain, mist, snow, or shine)."
                    label="Peace of Mind 2"
                    section="tour-groups"
                  />
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-tartan-gold mt-1.5 shrink-0" />
                  <EditableElement
                    id="tour-peace-item-3"
                    tag="span"
                    defaultContent="Full Public Liability Insurance: Accepted at all historic castles and state sites."
                    label="Peace of Mind 3"
                    section="tour-groups"
                  />
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-tartan-gold mt-1.5 shrink-0" />
                  <EditableElement
                    id="tour-peace-item-4"
                    tag="span"
                    defaultContent="Flexible Invoicing & Deposit Portal: Online credit card, PayPal, or BACS invoicing."
                    label="Peace of Mind 4"
                    section="tour-groups"
                  />
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

      {/* Past Tour Group Events Carousel Showcase */}
      <section className="py-20 bg-tartan-card border-b border-tartan-border relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-tartan-border/60 pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tartan-gold/10 border border-tartan-gold/30 text-tartan-gold text-xs font-semibold">
                <Camera className="w-4 h-4" />
                <EditableElement
                  id="tour-moments-badge"
                  tag="span"
                  defaultContent="Memorable Highland Moments"
                  label="Tour Moments Badge"
                  section="tour-groups"
                />
              </div>
              <EditableElement
                id="tour-carousel-title"
                tag="h2"
                defaultContent="Examples of Past Tour Group Events"
                className="text-3xl sm:text-4xl font-extrabold text-white font-serif"
                label="Tour Carousel Title"
                section="tour-groups"
              />
              <EditableElement
                id="tour-carousel-subtitle"
                tag="p"
                defaultContent="Browse real moments from coach tours, castle hotel arrivals, and Loch Ness excursions where Spud created unforgettable memories for international visitors."
                className="text-xs sm:text-sm text-gray-300 max-w-2xl"
                label="Tour Carousel Subtitle"
                section="tour-groups"
              />
            </div>

            {/* Admin Add Story Button & Carousel Navigation Controls */}
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              {canManage && (
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="px-3.5 py-2 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md hover:brightness-110 transition active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Story / Image</span>
                </button>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevSlide}
                  className="p-3 rounded-2xl bg-tartan-navy hover:bg-tartan-dark text-gray-200 hover:text-tartan-gold border border-tartan-border transition shadow-md active:scale-95"
                  title="Previous Event"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="px-3 text-xs font-bold font-mono text-tartan-gold">
                  {currentSlide + 1} / {tourEvents.length}
                </div>
                <button
                  type="button"
                  onClick={handleNextSlide}
                  className="p-3 rounded-2xl bg-tartan-navy hover:bg-tartan-dark text-gray-200 hover:text-tartan-gold border border-tartan-border transition shadow-md active:scale-95"
                  title="Next Event"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Featured Carousel Slide */}
          {activeSlide && (
            <div className="bg-tartan-dark/80 rounded-3xl overflow-hidden border border-tartan-gold/50 shadow-2xl transition-all duration-500 relative">
              
              {/* Admin Floating Controls for Current Slide */}
              {canManage && (
                <div className="absolute top-4 right-4 z-30 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md p-1.5 rounded-xl border border-tartan-border shadow-xl">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(activeSlide)}
                    className="px-2.5 py-1 text-xs font-bold text-tartan-gold bg-tartan-navy hover:bg-slate-700 rounded-lg border border-tartan-border flex items-center gap-1 transition"
                    title="Edit Title, Story, Location, and Image for this Slide"
                  >
                    <Edit3 className="w-3 h-3 text-tartan-gold" />
                    <span>Edit Slide</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventToDelete(activeSlide)}
                    className="px-2.5 py-1 text-xs font-bold text-rose-300 bg-rose-950/60 hover:bg-rose-900 rounded-lg border border-rose-800/60 flex items-center gap-1 transition"
                    title="Remove Slide from Carousel"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:h-[480px]">
                
                {/* Photo Side - Constant Height & Object-Cover */}
                <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-full bg-black overflow-hidden group">
                  <img
                    src={activeSlide.imageUrl}
                    alt={activeSlide.title}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
                  
                  {/* Origin Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-tartan-navy/90 text-tartan-gold border border-tartan-gold/50 shadow-lg flex items-center gap-1.5 backdrop-blur-md">
                      <Globe className="w-3.5 h-3.5 text-tartan-gold" />
                      <span>Origin: {activeSlide.origin}</span>
                    </span>
                  </div>

                  {/* Highlight pill */}
                  <div className="absolute bottom-4 left-4 right-4 z-10">
                    <div className="bg-slate-950/90 backdrop-blur-md p-3 rounded-xl border border-tartan-border/80 flex items-center gap-2 text-xs text-white">
                      <Sparkles className="w-4 h-4 text-tartan-gold shrink-0" />
                      <span className="font-semibold text-tartan-gold">Highlight:</span>
                      <span className="truncate">{activeSlide.highlight}</span>
                    </div>
                  </div>
                </div>

                {/* Details Side - Consistent Flex Container with scroll if needed */}
                <div className="lg:col-span-5 p-6 sm:p-8 lg:p-9 flex flex-col justify-between space-y-4 lg:h-full overflow-y-auto">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs text-tartan-gold font-bold uppercase tracking-wider">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span>{activeSlide.location}</span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-serif leading-tight">
                      {activeSlide.title}
                    </h3>

                    <div className="inline-block px-3 py-1 rounded-lg bg-tartan-navy text-xs font-semibold text-gray-300 border border-tartan-border">
                      {activeSlide.groupType}
                    </div>

                    <p className="text-sm text-gray-300 leading-relaxed pt-2">
                      {activeSlide.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-tartan-border/60 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {tourEvents.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentSlide(idx)}
                          className={`h-2.5 rounded-full transition-all ${
                            currentSlide === idx 
                              ? 'w-8 bg-tartan-gold' 
                              : 'w-2.5 bg-slate-700 hover:bg-slate-500'
                          }`}
                          title={`Jump to event ${idx + 1}`}
                        />
                      ))}
                    </div>

                    <a
                      href="#tour-inquiry"
                      className="px-4 py-2 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-xl shadow hover:brightness-110 transition"
                    >
                      Enquire for this package
                    </a>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </section>

      {/* Add / Edit Carousel Slide Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-tartan-card border border-tartan-gold rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-tartan-navy px-6 py-4 border-b border-tartan-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-tartan-gold">
                <Camera className="w-5 h-5 text-tartan-gold" />
                <div>
                  <h3 className="text-base font-bold text-white font-serif">
                    {editingEventId ? 'Edit Tour Event Slide' : 'Add New Tour Event Moment & Photo'}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Instantly syncs with the live carousel and cloud database
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitEventForm} className="p-6 space-y-4 overflow-y-auto">
              {successMessage ? (
                <div className="p-8 text-center space-y-4 animate-in fade-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500 mx-auto flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-white font-serif">{successMessage}</h4>
                  <p className="text-xs text-gray-300">
                    Your carousel slide changes are live and saved.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-tartan-gold mb-1">
                        Event Title / Headline *
                      </label>
                      <input
                        type="text"
                        required
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="e.g. North American Coach Holiday Grand Arrival"
                        className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-tartan-accent font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-tartan-gold mb-1">
                        Location / Landmark *
                      </label>
                      <input
                        type="text"
                        required
                        value={formLocation}
                        onChange={(e) => setFormLocation(e.target.value)}
                        placeholder="e.g. Cairngorms & Aviemore Highland Hotel"
                        className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-tartan-accent font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-tartan-gold mb-1">
                        Tour Group Type / Size
                      </label>
                      <input
                        type="text"
                        value={formGroupType}
                        onChange={(e) => setFormGroupType(e.target.value)}
                        placeholder="e.g. Coach Holiday Tour (48 Passengers)"
                        className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-tartan-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-tartan-gold mb-1">
                        Country / Origin of Guests
                      </label>
                      <input
                        type="text"
                        value={formOrigin}
                        onChange={(e) => setOriginCountry(e.target.value)}
                        placeholder="e.g. USA & Canada / Australia"
                        className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-tartan-accent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1">
                      Event Photo / Image URL *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        required
                        value={formImageUrl}
                        onChange={(e) => setFormImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/... or uploaded photo"
                        className="flex-1 bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-tartan-accent font-mono"
                      />
                      <label className="cursor-pointer bg-tartan-navy hover:bg-slate-700 text-tartan-gold border border-tartan-border px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0">
                        {isUploadingPhoto ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        <span>{isUploadingPhoto ? 'Uploading...' : 'Upload Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          disabled={isUploadingPhoto}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {formImageUrl && (
                      <div className="mt-2 w-32 h-20 rounded-xl overflow-hidden border border-tartan-border bg-black">
                        <img src={formImageUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1">
                      Experience Highlight
                    </label>
                    <input
                      type="text"
                      value={formHighlight}
                      onChange={(e) => setFormHighlight(e.target.value)}
                      placeholder="e.g. Full No. 1 Regalia & Personal Photos for Every Guest"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-tartan-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1">
                      Event Story / Description *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Describe the moment: how the guests reacted, tunes played, photo sessions, or castle welcome..."
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-3 text-white text-xs focus:outline-none focus:border-tartan-accent leading-relaxed"
                    />
                  </div>

                  <div className="pt-3 border-t border-tartan-border flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-tartan-border text-xs text-gray-300 hover:text-white transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving || isUploadingPhoto}
                      className="px-6 py-2.5 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      <span>{isSaving ? 'Saving...' : (editingEventId ? 'Update Slide' : 'Add to Carousel')}</span>
                    </button>
                  </div>
                </>
              )}
            </form>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-tartan-card border border-rose-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-full bg-rose-950/80 flex items-center justify-center border border-rose-800">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <h4 className="text-base font-bold text-white font-serif">Remove Carousel Event?</h4>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Are you sure you want to delete <strong>&quot;{eventToDelete.title}&quot;</strong> from the carousel? This action will remove it from the website.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEventToDelete(null)}
                className="px-4 py-2 text-xs text-gray-300 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg flex items-center gap-1.5 transition"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isDeleting ? 'Deleting...' : 'Delete Event'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tour Inquiry Form Section */}
      <section id="tour-inquiry" className="py-20 bg-tartan-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-tartan-card rounded-3xl p-6 sm:p-10 border border-tartan-gold/60 shadow-2xl space-y-6">
            
            <div className="text-center space-y-2 border-b border-tartan-border pb-6">
              <EditableElement
                id="tour-form-badge"
                tag="span"
                defaultContent="Direct Booking Diary"
                className="text-xs font-bold text-tartan-gold uppercase tracking-wider"
                label="Tour Form Badge"
                section="tour-groups"
              />
              <EditableElement
                id="tour-form-title"
                tag="h2"
                defaultContent="Tour Group Booking & Availability Inquiry"
                className="text-3xl font-extrabold text-white font-serif"
                label="Tour Form Title"
                section="tour-groups"
              />
              <EditableElement
                id="tour-form-subtitle"
                tag="p"
                defaultContent="Fill out your coach itinerary details below for a fast confirmation and competitive group rate quotation."
                className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto"
                label="Tour Form Subtitle"
                section="tour-groups"
              />
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
                  Spud will review your coach schedule for <strong>{tourDate}</strong>{includeDancers ? ' (including Highland Dancers package)' : ''} and reply via email ({email}) and telephone with confirmation and details.
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
                      <option value="Bagpipes & Highland Dancers Show (Sword Dance, Fling & Piping)">Bagpipes & Highland Dancers Show (Sword Dance, Fling & Piping)</option>
                      <option value="Interactive Piping, Stories & Photo Session">Interactive Piping, Stories & Photo Session (45-60m)</option>
                      <option value="Evening Gala Dinner / Haggis Address">Evening Gala Dinner / Haggis Address</option>
                      <option value="Whisky Distillery Toast & Outdoor Piping">Whisky Distillery Toast & Outdoor Piping</option>
                    </select>
                  </div>
                </div>

                {/* Highland Dancers Checkbox Option */}
                <div className="p-3.5 rounded-2xl bg-tartan-card border border-tartan-gold/50 flex items-start gap-3 shadow-md">
                  <input
                    type="checkbox"
                    id="includeDancers"
                    checked={includeDancers}
                    onChange={(e) => setIncludeDancers(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-tartan-border text-amber-500 focus:ring-amber-400 bg-tartan-dark cursor-pointer accent-amber-500"
                  />
                  <label htmlFor="includeDancers" className="text-xs text-gray-200 cursor-pointer space-y-0.5">
                    <span className="block font-bold text-tartan-gold flex items-center gap-1.5">
                      <Swords className="w-3.5 h-3.5" />
                      <span>Include Live Highland Dancers (Sword Dance, Fling & Traditional Reels)</span>
                    </span>
                    <span className="block text-[11px] text-gray-400">
                      Check this box to have champion Highland dancers in traditional regalia accompany Spud for your tour group event.
                    </span>
                  </label>
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

