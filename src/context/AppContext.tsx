'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  BookingEvent, 
  Review, 
  SocialPost, 
  ChatMessage, 
  NotificationItem, 
  EditableCmsBlock, 
  BagpipeTune,
  SeoPageConfig,
  BookingStatus,
  ForumCategoryItem,
  SocialMediaLinks
} from '@/types/spud';
import { 
  initialBookings, 
  initialReviews, 
  initialSocialPosts, 
  initialChatMessages, 
  initialNotifications, 
  initialCmsBlocks, 
  initialTunes, 
  initialSeoConfig, 
  initialSeoPages, 
  initialForumCategories, 
  initialSocialLinks 
} from '@/lib/initialData';
import { bagpipeSynth } from '@/lib/bagpipeSynth';
import { db } from '@/lib/firebase';
import { collection, doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';

interface AppContextType {
  isMounted: boolean;
  // Authentication & Admin
  isAdminLoggedIn: boolean;
  loginAdmin: (pass: string) => boolean;
  logoutAdmin: () => void;

  // Visual In-Page CMS Mode
  isVisualEditMode: boolean;
  toggleVisualEditMode: () => void;
  cmsBlocks: EditableCmsBlock[];
  editingBlock: EditableCmsBlock | null;
  setEditingBlock: (block: EditableCmsBlock | null) => void;
  updateCmsBlock: (
    id: string, 
    content: string, 
    altText?: string, 
    imageUrl?: string, 
    tag?: EditableCmsBlock['tag'],
    linkUrl?: string,
    buttonColor?: string
  ) => void;
  getCmsContent: (id: string, defaultVal: string) => string;

  // Bookings & Diary
  bookings: BookingEvent[];
  createBooking: (newBooking: Omit<BookingEvent, 'id' | 'createdAt' | 'status' | 'brevoEmailSent'>) => BookingEvent;
  approveBooking: (id: string) => void;
  rejectBooking: (id: string) => void;
  markDepositPaid: (id: string, paypalOrderId?: string) => void;
  deleteBooking: (id: string) => void;

  // Reviews
  reviews: Review[];
  submitReview: (review: Omit<Review, 'id' | 'date' | 'status' | 'isFeatured'>) => void;
  approveReview: (id: string) => void;
  rejectReview: (id: string) => void;
  toggleFeatureReview: (id: string) => void;

  // Social Community & Forum
  socialPosts: SocialPost[];
  createSocialPost: (postData: {
    postType?: 'feed' | 'forum';
    title?: string;
    authorName?: string;
    authorRole?: SocialPost['authorRole'];
    authorAvatar?: string;
    content: string;
    imageUrl?: string;
    eventLocation?: string;
    region?: string;
    category?: SocialPost['category'];
    forumTopic?: string;
    tunePlayed?: string;
    tags?: string[];
  }) => void;
  likeSocialPost: (id: string) => void;
  addCommentToPost: (postId: string, commentText: string, authorName?: string, authorRole?: string) => void;
  togglePinPost?: (id: string) => void;
  deleteSocialPost?: (id: string) => void;
  forumCategories: ForumCategoryItem[];
  createForumCategory: (category: Omit<ForumCategoryItem, 'id' | 'createdAt'>) => void;
  deleteForumCategory: (id: string) => void;
  editForumCategory: (id: string, updated: Partial<ForumCategoryItem>) => void;
  socialLinks: SocialMediaLinks;
  updateSocialLinks: (links: Partial<SocialMediaLinks>) => void;

  // Live Chat
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string, sender?: 'client' | 'spud') => void;
  markChatAsRead: () => void;
  unreadChatCount: number;

  // Audio Bagpipe Player & Tune Manager
  currentPlayingTune: string | null;
  playTune: (titleOrId: string) => void;
  stopTune: () => void;
  tunesList: BagpipeTune[];
  addTune: (tune: Omit<BagpipeTune, 'id'>) => void;
  updateTune: (id: string, updated: Partial<BagpipeTune>) => void;
  deleteTune: (id: string) => void;

  // Notifications
  notifications: NotificationItem[];
  unreadNotifCount: number;
  markNotifAsRead: (id: string) => void;
  clearAllNotifs: () => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) => void;

  // Multi-Page SEO & Structured Data Studio
  seoPages: SeoPageConfig[];
  seoConfig: SeoPageConfig;
  getSeoForPage: (pageIdOrPath: string) => SeoPageConfig;
  updatePageSeo: (pageId: string, newConfig: Partial<SeoPageConfig>) => void;
  updateSeoConfig: (newConfig: Partial<SeoPageConfig>) => void;
  activeSeoDrawerPageId: string | null;
  openSeoDrawer: (pageId?: string) => void;
  closeSeoDrawer: () => void;

  // Interactive Modals
  activeBrevoEmail: {
    isOpen: boolean;
    recipientName: string;
    recipientEmail: string;
    booking: BookingEvent | null;
    paypalLink: string;
  } | null;
  openBrevoPreview: (booking: BookingEvent) => void;
  closeBrevoPreview: () => void;

  activePayPalModal: {
    isOpen: boolean;
    booking: BookingEvent | null;
  } | null;
  openPayPalModal: (booking: BookingEvent) => void;
  closePayPalModal: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'spud_the_piper_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Admin & Visual Edit state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [isVisualEditMode, setIsVisualEditMode] = useState<boolean>(false);
  const [cmsBlocks, setCmsBlocks] = useState<EditableCmsBlock[]>(initialCmsBlocks);
  const [editingBlock, setEditingBlock] = useState<EditableCmsBlock | null>(null);

  // Core entities
  const [bookings, setBookings] = useState<BookingEvent[]>(initialBookings);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>(initialSocialPosts);
  const [forumCategories, setForumCategories] = useState<ForumCategoryItem[]>(initialForumCategories);
  const [socialLinks, setSocialLinks] = useState<SocialMediaLinks>(initialSocialLinks);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [seoPages, setSeoPages] = useState<SeoPageConfig[]>(initialSeoPages);
  const [seoConfig, setSeoConfig] = useState<SeoPageConfig>(initialSeoConfig);
  const [activeSeoDrawerPageId, setActiveSeoDrawerPageId] = useState<string | null>(null);

  // Audio player state & Tunes
  const [tunesList, setTunesList] = useState<BagpipeTune[]>(initialTunes);
  const [currentPlayingTune, setCurrentPlayingTune] = useState<string | null>(null);
  const audioPlayerRef = React.useRef<HTMLAudioElement | null>(null);

  // Modal states
  const [activeBrevoEmail, setActiveBrevoEmail] = useState<{
    isOpen: boolean;
    recipientName: string;
    recipientEmail: string;
    booking: BookingEvent | null;
    paypalLink: string;
  } | null>(null);

  const [activePayPalModal, setActivePayPalModal] = useState<{
    isOpen: boolean;
    booking: BookingEvent | null;
  } | null>(null);

  // Load persisted state from localStorage on client mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const savedAdmin = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}admin`);
      if (savedAdmin === 'true') setIsAdminLoggedIn(true);

      const savedBookings = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}bookings`);
      if (savedBookings) setBookings(JSON.parse(savedBookings));

      const savedReviews = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}reviews`);
      if (savedReviews) setReviews(JSON.parse(savedReviews));

      const savedPosts = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}social`);
      if (savedPosts) {
        try {
          const parsed: SocialPost[] = JSON.parse(savedPosts);
          const initialIds = new Set(initialSocialPosts.map(p => p.id));
          // Filter out stale legacy initial post IDs so the fresh initialSocialPosts (including all forum Q&As) load
          const legacyIds = new Set(['post-1', 'post-2', 'post-3', 'post-4', 'post-5', 'post-6', 'post-7', 'post-8']);
          const userCreated = parsed.filter(p => !initialIds.has(p.id) && !legacyIds.has(p.id));
          setSocialPosts([...userCreated, ...initialSocialPosts]);
        } catch (e) {
          setSocialPosts(initialSocialPosts);
        }
      } else {
        setSocialPosts(initialSocialPosts);
      }

      const savedCats = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}forum_categories`);
      if (savedCats) {
        try {
          const parsedCats: ForumCategoryItem[] = JSON.parse(savedCats);
          const initialTopicNames = new Set(initialForumCategories.map(c => c.topicName));
          const userCreatedCats = parsedCats.filter(c => !initialTopicNames.has(c.topicName));
          setForumCategories([...initialForumCategories, ...userCreatedCats]);
        } catch (e) {
          setForumCategories(initialForumCategories);
        }
      } else {
        setForumCategories(initialForumCategories);
      }

      const savedSocialLinks = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}social_links`);
      if (savedSocialLinks) {
        try {
          setSocialLinks(JSON.parse(savedSocialLinks));
        } catch (e) {}
      }

      const savedTunes = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}tunes`);
      if (savedTunes) {
        try {
          setTunesList(JSON.parse(savedTunes));
        } catch (e) {}
      }

      const savedChat = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}chat`);
      if (savedChat) setChatMessages(JSON.parse(savedChat));

      const savedNotifs = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}notifs`);
      if (savedNotifs) setNotifications(JSON.parse(savedNotifs));

      const savedCms = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}cms`);
      if (savedCms) setCmsBlocks(JSON.parse(savedCms));

      const savedSeoPages = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}seo_pages`);
      if (savedSeoPages) {
        setSeoPages(JSON.parse(savedSeoPages));
      }

      const savedSeo = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}seo`);
      if (savedSeo) setSeoConfig(JSON.parse(savedSeo));
    } catch (err) {
      console.warn('Could not load saved state from localStorage:', err);
    }
  }, []);

  // Realtime Cloud Firestore sync listeners with automatic fallback
  useEffect(() => {
    if (!db) return;

    let unsubBookings = () => {};
    let unsubReviews = () => {};
    let unsubSocial = () => {};
    let unsubForum = () => {};
    let unsubSocialLinks = () => {};
    let unsubCms = () => {};
    let unsubSeo = () => {};
    let unsubTunes = () => {};

    try {
      unsubBookings = onSnapshot(collection(db, 'bookings'), (snapshot) => {
        if (!snapshot.empty) {
          const remoteBookings: BookingEvent[] = [];
          snapshot.forEach((d) => remoteBookings.push(d.data() as BookingEvent));
          if (remoteBookings.length > 0) {
            setBookings(remoteBookings);
          }
        }
      }, (err) => console.log('Firestore bookings listener:', err.message));

      unsubReviews = onSnapshot(collection(db, 'reviews'), (snapshot) => {
        if (!snapshot.empty) {
          const remoteReviews: Review[] = [];
          snapshot.forEach((d) => remoteReviews.push(d.data() as Review));
          if (remoteReviews.length > 0) {
            setReviews(remoteReviews);
          }
        }
      }, (err) => console.log('Firestore reviews listener:', err.message));

      unsubSocial = onSnapshot(collection(db, 'social_posts'), (snapshot) => {
        if (!snapshot.empty) {
          const remotePosts: SocialPost[] = [];
          snapshot.forEach((d) => remotePosts.push(d.data() as SocialPost));
          if (remotePosts.length > 0) {
            setSocialPosts(remotePosts);
          }
        }
      }, (err) => console.log('Firestore social_posts listener:', err.message));

      unsubForum = onSnapshot(collection(db, 'forum_categories'), (snapshot) => {
        if (!snapshot.empty) {
          const remoteCats: ForumCategoryItem[] = [];
          snapshot.forEach((d) => remoteCats.push(d.data() as ForumCategoryItem));
          if (remoteCats.length > 0) {
            setForumCategories(remoteCats);
          }
        }
      }, (err) => console.log('Firestore forum_categories listener:', err.message));

      unsubSocialLinks = onSnapshot(doc(db, 'settings', 'social_links'), (snap) => {
        if (snap.exists()) {
          setSocialLinks(snap.data() as SocialMediaLinks);
        }
      }, (err) => console.log('Firestore social_links listener:', err.message));

      unsubCms = onSnapshot(collection(db, 'cms_blocks'), (snapshot) => {
        if (!snapshot.empty) {
          const remoteCms: EditableCmsBlock[] = [];
          snapshot.forEach((d) => remoteCms.push(d.data() as EditableCmsBlock));
          if (remoteCms.length > 0) {
            setCmsBlocks(remoteCms);
          }
        }
      }, (err) => console.log('Firestore cms_blocks listener:', err.message));

      unsubSeo = onSnapshot(collection(db, 'seo_pages'), (snapshot) => {
        if (!snapshot.empty) {
          const remoteSeo: SeoPageConfig[] = [];
          snapshot.forEach((d) => remoteSeo.push(d.data() as SeoPageConfig));
          if (remoteSeo.length > 0) {
            setSeoPages(prev => {
              const merged = [...prev];
              remoteSeo.forEach(r => {
                const idx = merged.findIndex(p => p.pageId === r.pageId);
                if (idx >= 0) merged[idx] = r;
                else merged.push(r);
              });
              const homeSeo = merged.find(p => p.pageId === 'home');
              if (homeSeo) setSeoConfig(homeSeo);
              return merged;
            });
          }
        }
      }, (err) => console.log('Firestore seo_pages listener:', err.message));

      unsubTunes = onSnapshot(collection(db, 'bagpipe_tunes'), (snapshot) => {
        if (!snapshot.empty) {
          const remoteTunes: BagpipeTune[] = [];
          snapshot.forEach((d) => remoteTunes.push(d.data() as BagpipeTune));
          if (remoteTunes.length > 0) {
            setTunesList(prev => {
              const merged = [...prev];
              remoteTunes.forEach(r => {
                const idx = merged.findIndex(t => t.id === r.id);
                if (idx >= 0) merged[idx] = r;
                else merged.push(r);
              });
              return merged;
            });
          }
        }
      }, (err) => console.log('Firestore bagpipe_tunes listener:', err.message));
    } catch (e) {
      console.warn('Firebase Firestore initialization:', e);
    }

    return () => {
      unsubBookings();
      unsubReviews();
      unsubSocial();
      unsubForum();
      unsubSocialLinks();
      unsubCms();
      unsubSeo();
      unsubTunes();
    };
  }, []);

  // Helper function to sync a document to Cloud Firestore
  const syncToFirestore = async (colName: string, docId: string, data: any) => {
    if (!db) return;
    try {
      await setDoc(doc(db, colName, docId), JSON.parse(JSON.stringify(data)), { merge: true });
    } catch (err) {
      console.warn(`Firestore sync (${colName}/${docId}):`, err);
    }
  };

  const deleteFromFirestore = async (colName: string, docId: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, colName, docId));
    } catch (err) {
      console.warn(`Firestore delete (${colName}/${docId}):`, err);
    }
  };

  // Sync state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}social_links`, JSON.stringify(socialLinks));
    } catch (e) {}
  }, [socialLinks]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}forum_categories`, JSON.stringify(forumCategories));
    } catch (e) {}
  }, [forumCategories]);

  // Sync state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}bookings`, JSON.stringify(bookings));
    } catch (e) {}
  }, [bookings]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}reviews`, JSON.stringify(reviews));
    } catch (e) {}
  }, [reviews]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}social`, JSON.stringify(socialPosts));
    } catch (e) {}
  }, [socialPosts]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}chat`, JSON.stringify(chatMessages));
    } catch (e) {}
  }, [chatMessages]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}notifs`, JSON.stringify(notifications));
    } catch (e) {}
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}cms`, JSON.stringify(cmsBlocks));
    } catch (e) {}
  }, [cmsBlocks]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}seo_pages`, JSON.stringify(seoPages));
      // Keep home synced to seoConfig
      const homeSeo = seoPages.find(p => p.pageId === 'home');
      if (homeSeo) setSeoConfig(homeSeo);
    } catch (e) {}
  }, [seoPages]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}seo`, JSON.stringify(seoConfig));
    } catch (e) {}
  }, [seoConfig]);

  // Auth functions
  const loginAdmin = (pass: string) => {
    // Default pass: 'spud123' or 'admin'
    if (pass.toLowerCase() === 'spud123' || pass.toLowerCase() === 'admin') {
      setIsAdminLoggedIn(true);
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}admin`, 'true');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    setIsVisualEditMode(false);
    setActiveSeoDrawerPageId(null);
    localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}admin`);
  };

  const toggleVisualEditMode = () => {
    if (!isAdminLoggedIn) return;
    setIsVisualEditMode(prev => !prev);
  };

  const updateCmsBlock = (
    id: string, 
    content: string, 
    altText?: string, 
    imageUrl?: string, 
    tag?: EditableCmsBlock['tag'],
    linkUrl?: string,
    buttonColor?: string
  ) => {
    let updatedBlock: EditableCmsBlock | null = null;
    setCmsBlocks(prev => {
      const exists = prev.find(b => b.id === id);
      if (exists) {
        return prev.map(b => {
          if (b.id === id) {
            updatedBlock = { 
              ...b, 
              content, 
              altText: altText !== undefined ? altText : b.altText, 
              imageUrl: imageUrl !== undefined ? imageUrl : b.imageUrl, 
              tag: tag || b.tag,
              linkUrl: linkUrl !== undefined ? linkUrl : b.linkUrl,
              buttonColor: buttonColor !== undefined ? buttonColor : b.buttonColor,
              lastUpdated: new Date().toISOString() 
            };
            return updatedBlock;
          }
          return b;
        });
      } else {
        updatedBlock = {
          id,
          page: 'home',
          section: 'custom',
          tag: tag || 'p',
          label: id,
          content,
          altText,
          imageUrl,
          linkUrl,
          buttonColor,
          lastUpdated: new Date().toISOString()
        };
        return [...prev, updatedBlock];
      }
    });

    if (updatedBlock) {
      syncToFirestore('cms_blocks', id, updatedBlock);
    }
  };

  const getCmsContent = (id: string, defaultVal: string): string => {
    const block = cmsBlocks.find(b => b.id === id);
    return block ? block.content : defaultVal;
  };

  // Notification helper
  const addNotification = (item: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    if (bagpipeSynth) {
      bagpipeSynth.playAlertSound();
    }
  };

  // Booking handlers
  const createBooking = (newBookingData: Omit<BookingEvent, 'id' | 'createdAt' | 'status' | 'brevoEmailSent'>) => {
    const id = `spud-bk-${Date.now().toString().slice(-4)}`;
    const newBooking: BookingEvent = {
      ...newBookingData,
      id,
      status: 'pending',
      createdAt: new Date().toISOString(),
      brevoEmailSent: false,
      brevoEmailHistory: []
    };

    setBookings(prev => [newBooking, ...prev]);
    syncToFirestore('bookings', id, newBooking);

    // Trigger notification for Spud
    addNotification({
      type: 'booking_request',
      title: 'New Provisional Booking Request',
      message: `${newBooking.clientName} requested ${newBooking.eventType} on ${newBooking.date} at ${newBooking.venueName}.`,
      actionUrl: '/admin/bookings',
      relatedId: id
    });

    return newBooking;
  };

  const approveBooking = (id: string) => {
    const paypalLink = `https://www.paypal.com/checkout/spudthepiper/pay?id=${id}`;
    
    setBookings(prev => prev.map(b => {
      if (b.id === id) {
        const history = b.brevoEmailHistory || [];
        const updated: BookingEvent = {
          ...b,
          status: 'approved' as BookingStatus,
          approvedAt: new Date().toISOString(),
          brevoEmailSent: true,
          brevoEmailHistory: [
            ...history,
            {
              type: 'Booking Approved & PayPal Deposit Link (via Brevo)',
              sentAt: new Date().toISOString(),
              status: 'delivered',
              paypalLink
            }
          ]
        };
        syncToFirestore('bookings', id, updated);
        return updated;
      }
      return b;
    }));

    const bk = bookings.find(b => b.id === id);
    if (bk) {
      // Auto open Brevo email preview
      setActiveBrevoEmail({
        isOpen: true,
        recipientName: bk.clientName,
        recipientEmail: bk.clientEmail,
        booking: { ...bk, status: 'approved' },
        paypalLink
      });

      addNotification({
        type: 'booking_request',
        title: 'Booking Approved & Brevo Email Sent',
        message: `Brevo email sent to ${bk.clientName} with £${bk.depositAmount} PayPal deposit payment link.`,
        actionUrl: '/admin/bookings',
        relatedId: id
      });
    }
  };

  const rejectBooking = (id: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id === id) {
        const updated = { ...b, status: 'cancelled' as BookingStatus };
        syncToFirestore('bookings', id, updated);
        return updated;
      }
      return b;
    }));
  };

  const markDepositPaid = (id: string, paypalOrderId: string = `PP-TX-${Date.now().toString().slice(-6)}`) => {
    setBookings(prev => prev.map(b => {
      if (b.id === id) {
        const history = b.brevoEmailHistory || [];
        const updated: BookingEvent = {
          ...b,
          status: 'deposit_paid' as BookingStatus,
          depositPaidAt: new Date().toISOString(),
          paypalOrderId,
          brevoEmailHistory: [
            ...history,
            {
              type: 'Deposit Confirmed & Official Receipt (via Brevo)',
              sentAt: new Date().toISOString(),
              status: 'delivered'
            }
          ]
        };
        syncToFirestore('bookings', id, updated);
        return updated;
      }
      return b;
    }));

    const bk = bookings.find(b => b.id === id);
    if (bk) {
      addNotification({
        type: 'deposit_paid',
        title: `PayPal Deposit Paid: £${bk.depositAmount}.00`,
        message: `${bk.clientName} paid £${bk.depositAmount} deposit via PayPal for event on ${bk.date}. Booking is now CONFIRMED!`,
        actionUrl: '/admin/bookings',
        relatedId: id
      });
    }
  };

  const deleteBooking = (id: string) => {
    setBookings(prev => prev.filter(b => b.id !== id));
    deleteFromFirestore('bookings', id);
  };

  // Review handlers
  const submitReview = (reviewData: Omit<Review, 'id' | 'date' | 'status' | 'isFeatured'>) => {
    const newRev: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
      status: 'pending', // Requires Spud's approval in back office
      isFeatured: false
    };
    setReviews(prev => [newRev, ...prev]);
    syncToFirestore('reviews', newRev.id, newRev);

    addNotification({
      type: 'new_review',
      title: 'New Client Review Submitted',
      message: `${newRev.authorName} left a ${newRev.rating}-star review for moderation.`,
      actionUrl: '/admin/reviews',
      relatedId: newRev.id
    });
  };

  const approveReview = (id: string) => {
    setReviews(prev => prev.map(r => {
      if (r.id === id) {
        const updated = { ...r, status: 'approved' as const };
        syncToFirestore('reviews', id, updated);
        return updated;
      }
      return r;
    }));
  };

  const rejectReview = (id: string) => {
    setReviews(prev => prev.map(r => {
      if (r.id === id) {
        const updated = { ...r, status: 'rejected' as const };
        syncToFirestore('reviews', id, updated);
        return updated;
      }
      return r;
    }));
  };

  const toggleFeatureReview = (id: string) => {
    setReviews(prev => prev.map(r => {
      if (r.id === id) {
        const updated = { ...r, isFeatured: !r.isFeatured };
        syncToFirestore('reviews', id, updated);
        return updated;
      }
      return r;
    }));
  };

  // Social handlers
  const createSocialPost = (postData: {
    postType?: 'feed' | 'forum';
    title?: string;
    authorName?: string;
    authorRole?: SocialPost['authorRole'];
    authorAvatar?: string;
    content: string;
    imageUrl?: string;
    eventLocation?: string;
    region?: string;
    category?: SocialPost['category'];
    forumTopic?: SocialPost['forumTopic'];
    tunePlayed?: string;
    tags?: string[];
  }) => {
    const isSpud = isAdminLoggedIn || postData.authorRole === 'Spud the Piper';
    const newPost: SocialPost = {
      id: `post-${Date.now()}`,
      postType: postData.postType || 'feed',
      title: postData.title || (postData.content.length > 60 ? postData.content.slice(0, 60) + '...' : 'Piping Update'),
      authorName: postData.authorName || (isSpud ? 'Spud the Piper' : 'Highland Friend'),
      authorRole: isSpud ? 'Spud the Piper' : (postData.authorRole || 'Guest'),
      authorAvatar: postData.authorAvatar || (isSpud ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80' : undefined),
      content: postData.content,
      imageUrl: postData.imageUrl,
      eventLocation: postData.eventLocation,
      region: postData.region,
      category: postData.category || 'Weddings',
      forumTopic: postData.forumTopic || 'General Piping',
      tunePlayed: postData.tunePlayed,
      tags: postData.tags || (postData.eventLocation ? [`#${postData.eventLocation.split(',')[0].replace(/[^a-zA-Z0-9]/g, '')}`, '#SpudThePiper'] : ['#SpudThePiper', '#HighlandPipes']),
      likes: 0,
      comments: [],
      timestamp: 'Just now'
    };
    setSocialPosts(prev => [newPost, ...prev]);
    syncToFirestore('social_posts', newPost.id, newPost);

    addNotification({
      type: 'new_review',
      title: postData.postType === 'forum' ? 'New Forum Question Asked' : 'New Social Feed Post',
      message: `${newPost.authorName} shared a post: "${newPost.title || newPost.content.slice(0, 40)}"`,
      actionUrl: '/social',
      relatedId: newPost.id
    });
  };

  const likeSocialPost = (id: string) => {
    setSocialPosts(prev => prev.map(post => {
      if (post.id === id) {
        const isLiked = post.likedByMe;
        const updated = {
          ...post,
          likes: isLiked ? post.likes - 1 : post.likes + 1,
          likedByMe: !isLiked
        };
        syncToFirestore('social_posts', id, updated);
        return updated;
      }
      return post;
    }));
  };

  const addCommentToPost = (
    postId: string, 
    content: string, 
    authorName: string = 'Highland Friend', 
    authorRole: string = 'Guest'
  ) => {
    setSocialPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const updated = {
          ...post,
          comments: [
            ...post.comments,
            {
              id: `c-${Date.now()}`,
              authorName: isAdminLoggedIn ? 'Spud the Piper' : authorName,
              authorRole: isAdminLoggedIn ? 'Spud the Piper' : authorRole,
              content,
              createdAt: new Date().toISOString()
            }
          ]
        };
        syncToFirestore('social_posts', postId, updated);
        return updated;
      }
      return post;
    }));
  };

  const togglePinPost = (id: string) => {
    setSocialPosts(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, isPinned: !p.isPinned };
        syncToFirestore('social_posts', id, updated);
        return updated;
      }
      return p;
    }));
  };

  const deleteSocialPost = (id: string) => {
    setSocialPosts(prev => prev.filter(p => p.id !== id));
    deleteFromFirestore('social_posts', id);
  };

  // Forum Category Management (Controlled by Spud from Back Office)
  const createForumCategory = (catData: Omit<ForumCategoryItem, 'id' | 'createdAt'>) => {
    const newCat: ForumCategoryItem = {
      id: `cat-${Date.now()}`,
      topicName: catData.topicName.trim(),
      title: catData.title.trim(),
      description: catData.description.trim(),
      iconName: catData.iconName || 'MessageSquare',
      accentBadge: catData.accentBadge || 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      isCustom: true,
      createdAt: new Date().toISOString()
    };
    setForumCategories(prev => [...prev, newCat]);
    syncToFirestore('forum_categories', newCat.id, newCat);

    addNotification({
      type: 'new_review',
      title: 'New Forum Category Created',
      message: `New category created: "${newCat.title}"`,
      actionUrl: '/social'
    });
  };

  const deleteForumCategory = (id: string) => {
    setForumCategories(prev => prev.filter(c => c.id !== id));
    deleteFromFirestore('forum_categories', id);
  };

  const editForumCategory = (id: string, updated: Partial<ForumCategoryItem>) => {
    setForumCategories(prev => prev.map(c => {
      if (c.id === id) {
        const fullUpdated = { ...c, ...updated };
        syncToFirestore('forum_categories', id, fullUpdated);
        return fullUpdated;
      }
      return c;
    }));
  };

  // Social Links Management (Controlled by Spud from Back Office)
  const updateSocialLinks = (newLinks: Partial<SocialMediaLinks>) => {
    setSocialLinks(prev => {
      const full = { ...prev, ...newLinks };
      syncToFirestore('settings', 'social_links', full);
      return full;
    });
    addNotification({
      type: 'new_review',
      title: 'Social Links Updated',
      message: 'Footer and public social media links were updated successfully.',
      actionUrl: '/admin'
    });
  };

  // Chat handlers
  const sendChatMessage = (text: string, sender: 'client' | 'spud' = 'client') => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender,
      senderName: sender === 'spud' ? 'Spud the Piper' : 'Website Visitor',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: sender === 'spud',
      sessionId: 'session-demo'
    };

    setChatMessages(prev => [...prev, newMsg]);

    if (sender === 'client') {
      addNotification({
        type: 'chat_message',
        title: 'New Live Chat Inquiry',
        message: `Visitor: "${text.length > 40 ? text.slice(0, 40) + '...' : text}"`,
        actionUrl: '/admin/messages'
      });

      // Automated intelligent assistant reply after 1.5 seconds if Spud hasn't answered
      setTimeout(() => {
        const autoReplies: { [key: string]: string } = {
          wedding: 'Aye! Spud specializes in wedding ceremonies, greeting guests at castle gates, and piping the top table into the reception. Check our Booking Diary to view available dates!',
          price: 'Typical rates range from £220 for memorial laments to £450 - £650 for full wedding and castle events, depending on location and duration. You can use our instant quote calculator on the booking page!',
          tartan: 'Spud can perform in Full No. 1 Dress with Feather Bonnet, Royal Stewart Tartan, Black Watch Military, or Modern Highland Tweed. You can preview all tartans in our Attire Selector!',
          tune: 'Spud plays all classic Highland bagpipe tunes including Highland Cathedral, Scotland the Brave, Flower of Scotland, and Amazing Grace. Feel free to use the audio jukebox on our site to preview them!'
        };

        const lower = text.toLowerCase();
        let replyText = 'Thanks for your message! Spud or his assistant will reply directly shortly. You can also call or WhatsApp Spud directly on 07793 491367.';
        if (lower.includes('wedding') || lower.includes('marry') || lower.includes('bride')) {
          replyText = autoReplies.wedding;
        } else if (lower.includes('price') || lower.includes('cost') || lower.includes('quote') || lower.includes('fee')) {
          replyText = autoReplies.price;
        } else if (lower.includes('tartan') || lower.includes('dress') || lower.includes('kilt') || lower.includes('wear')) {
          replyText = autoReplies.tartan;
        } else if (lower.includes('tune') || lower.includes('song') || lower.includes('music') || lower.includes('cathedral')) {
          replyText = autoReplies.tune;
        }

        const botMsg: ChatMessage = {
          id: `msg-bot-${Date.now()}`,
          sender: 'system',
          senderName: 'Spud Instant Assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: false,
          sessionId: 'session-demo'
        };
        setChatMessages(curr => [...curr, botMsg]);
      }, 1500);
    }
  };

  const markChatAsRead = () => {
    setChatMessages(prev => prev.map(m => ({ ...m, isRead: true })));
  };

  // Audio Tune Player & Manager
  const playTune = (titleOrId: string) => {
    if (currentPlayingTune === titleOrId) {
      stopTune();
      return;
    }

    stopTune();

    const tune = tunesList.find(t => t.title === titleOrId || t.id === titleOrId);

    if (tune && tune.audioUrl) {
      try {
        if (!audioPlayerRef.current) {
          audioPlayerRef.current = new Audio();
        }
        audioPlayerRef.current.src = tune.audioUrl;
        audioPlayerRef.current.onended = () => {
          setCurrentPlayingTune(null);
        };
        audioPlayerRef.current.onerror = () => {
          console.warn('Custom audio playback error, falling back to synthesizer');
          if (bagpipeSynth) {
            bagpipeSynth.playTune(tune.title, () => setCurrentPlayingTune(null));
          }
        };
        audioPlayerRef.current.play();
        setCurrentPlayingTune(tune.title);
      } catch (e) {
        if (bagpipeSynth) {
          bagpipeSynth.playTune(tune.title, () => setCurrentPlayingTune(null));
          setCurrentPlayingTune(tune.title);
        }
      }
    } else if (bagpipeSynth) {
      bagpipeSynth.playTune(tune ? tune.title : titleOrId, () => {
        setCurrentPlayingTune(null);
      });
      setCurrentPlayingTune(tune ? tune.title : titleOrId);
    }
  };

  const stopTune = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
    }
    if (bagpipeSynth) {
      bagpipeSynth.stop();
    }
    setCurrentPlayingTune(null);
  };

  const addTune = (newTuneData: Omit<BagpipeTune, 'id'>) => {
    const newTune: BagpipeTune = {
      ...newTuneData,
      id: `tune-${Date.now()}`
    };
    setTunesList(prev => {
      const updated = [newTune, ...prev];
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}tunes`, JSON.stringify(updated));
      return updated;
    });
    syncToFirestore('bagpipe_tunes', newTune.id, newTune);
    addNotification({
      type: 'tune_added',
      title: 'New Bagpipe Tune Added',
      message: `"${newTune.title}" was added to Spud's Jukebox!`,
      actionUrl: '/tunes'
    });
  };

  const updateTune = (id: string, updated: Partial<BagpipeTune>) => {
    setTunesList(prev => {
      const updatedList = prev.map(t => {
        if (t.id === id) {
          const u = { ...t, ...updated };
          syncToFirestore('bagpipe_tunes', id, u);
          return u;
        }
        return t;
      });
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}tunes`, JSON.stringify(updatedList));
      return updatedList;
    });
  };

  const deleteTune = async (id: string) => {
    if (currentPlayingTune) {
      stopTune();
    }
    setTunesList(prev => {
      const updatedList = prev.filter(t => t.id !== id);
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}tunes`, JSON.stringify(updatedList));
      return updatedList;
    });
    if (db) {
      try {
        await deleteDoc(doc(db, 'bagpipe_tunes', id));
      } catch (e) {
        console.warn('Firestore delete tune error:', e);
      }
    }
  };

  // Notifications
  const markNotifAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const clearAllNotifs = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // SEO handlers for all 14 pages
  const getSeoForPage = (pageIdOrPath: string): SeoPageConfig => {
    const clean = pageIdOrPath.replace(/^\//, '') || 'home';
    const match = seoPages.find(p => p.pageId === clean || p.path === pageIdOrPath || p.path === `/${clean}`);
    return match || seoPages[0] || initialSeoConfig;
  };

  const updatePageSeo = (pageId: string, newConfig: Partial<SeoPageConfig>) => {
    setSeoPages(prev => {
      const updatedList = prev.map(p => {
        if (p.pageId === pageId) {
          const updated = { ...p, ...newConfig };
          if (pageId === 'home') {
            setSeoConfig(updated);
          }
          // Persist directly to Firebase Cloud Firestore
          syncToFirestore('seo_pages', pageId, updated);
          return updated;
        }
        return p;
      });
      return updatedList;
    });
  };

  const updateSeoConfig = (newConfig: Partial<SeoPageConfig>) => {
    updatePageSeo('home', newConfig);
  };

  const openSeoDrawer = (pageId: string = 'home') => {
    const clean = pageId.replace(/^\//, '') || 'home';
    setActiveSeoDrawerPageId(clean);
  };

  const closeSeoDrawer = () => {
    setActiveSeoDrawerPageId(null);
  };

  // Modal handlers
  const openBrevoPreview = (booking: BookingEvent) => {
    const paypalLink = `https://www.paypal.com/checkout/spudthepiper/pay?id=${booking.id}`;
    setActiveBrevoEmail({
      isOpen: true,
      recipientName: booking.clientName,
      recipientEmail: booking.clientEmail,
      booking,
      paypalLink
    });
  };

  const closeBrevoPreview = () => {
    setActiveBrevoEmail(null);
  };

  const openPayPalModal = (booking: BookingEvent) => {
    setActivePayPalModal({
      isOpen: true,
      booking
    });
  };

  const closePayPalModal = () => {
    setActivePayPalModal(null);
  };

  const unreadNotifCount = notifications.filter(n => !n.isRead).length;
  const unreadChatCount = chatMessages.filter(m => !m.isRead && m.sender !== 'spud').length;

  return (
    <AppContext.Provider value={{
      isMounted,
      isAdminLoggedIn,
      loginAdmin,
      logoutAdmin,
      isVisualEditMode,
      toggleVisualEditMode,
      cmsBlocks,
      editingBlock,
      setEditingBlock,
      updateCmsBlock,
      getCmsContent,
      bookings,
      createBooking,
      approveBooking,
      rejectBooking,
      markDepositPaid,
      deleteBooking,
      reviews,
      submitReview,
      approveReview,
      rejectReview,
      toggleFeatureReview,
      socialPosts,
      createSocialPost,
      likeSocialPost,
      addCommentToPost,
      deleteSocialPost,
      forumCategories,
      createForumCategory,
      deleteForumCategory,
      editForumCategory,
      socialLinks,
      updateSocialLinks,
      chatMessages,
      sendChatMessage,
      markChatAsRead,
      unreadChatCount,
      currentPlayingTune,
      playTune,
      stopTune,
      tunesList,
      addTune,
      updateTune,
      deleteTune,
      notifications,
      unreadNotifCount,
      markNotifAsRead,
      clearAllNotifs,
      addNotification,
      seoPages,
      seoConfig,
      getSeoForPage,
      updatePageSeo,
      updateSeoConfig,
      activeSeoDrawerPageId,
      openSeoDrawer,
      closeSeoDrawer,
      activeBrevoEmail,
      openBrevoPreview,
      closeBrevoPreview,
      activePayPalModal,
      openPayPalModal,
      closePayPalModal
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
