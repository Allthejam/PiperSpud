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
  SocialMediaLinks,
  ServicePackage,
  TravelExpensesConfig
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
  initialSocialLinks,
  initialServices,
  initialTravelConfig
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

  // Services Management
  services: ServicePackage[];
  createService: (service: Omit<ServicePackage, 'id'>) => Promise<void>;
  updateService: (id: string, updates: Partial<ServicePackage>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  getServiceBySlug: (slug: string) => ServicePackage | undefined;

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
    buttonColor?: string,
    imageFit?: EditableCmsBlock['imageFit'],
    imagePositionX?: number,
    imagePositionY?: number,
    imageScale?: number
  ) => void;
  getCmsContent: (id: string, defaultVal: string) => string;

  // Bookings & Diary
  bookings: BookingEvent[];
  createBooking: (newBooking: Omit<BookingEvent, 'id' | 'createdAt' | 'status' | 'brevoEmailSent'>) => BookingEvent;
  approveBooking: (id: string) => void;
  rejectBooking: (id: string) => void;
  markDepositPaid: (id: string, paypalOrderId?: string) => void;
  deleteBooking: (id: string) => void;

  // Travel Radius & Expenses Configuration
  travelConfig: TravelExpensesConfig;
  updateTravelConfig: (newConfig: Partial<TravelExpensesConfig>) => Promise<void>;

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
  updatePageSeo: (pageId: string, newConfig: Partial<SeoPageConfig>) => Promise<void>;
  updateSeoConfig: (newConfig: Partial<SeoPageConfig>) => Promise<void>;
  activeSeoDrawerPageId: string | null;
  openSeoDrawer: (pageId?: string) => void;
  closeSeoDrawer: () => void;

  // Cloud Database Sync
  isSyncingFirestore: boolean;
  syncAllToFirestore: () => Promise<{ success: boolean; count: number; error?: string }>;

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
  const [services, setServices] = useState<ServicePackage[]>(initialServices);
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
  const [travelConfig, setTravelConfig] = useState<TravelExpensesConfig>(initialTravelConfig);
  const [isSyncingFirestore, setIsSyncingFirestore] = useState<boolean>(false);

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

      const savedServices = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}services`);
      if (savedServices) {
        try {
          const parsed: ServicePackage[] = JSON.parse(savedServices);
          if (parsed && parsed.length > 0) {
            const initialIds = new Set(initialServices.map(s => s.id));
            const userCreated = parsed.filter(s => !initialIds.has(s.id));
            const merged = initialServices.map(initS => {
              const userVer = parsed.find(p => p.id === initS.id);
              return userVer ? { ...initS, ...userVer, slug: userVer.slug || initS.slug } : initS;
            });
            setServices([...merged, ...userCreated]);
          } else {
            setServices(initialServices);
          }
        } catch (e) {
          setServices(initialServices);
        }
      } else {
        setServices(initialServices);
      }

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

      const savedTravel = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}travel_config`);
      if (savedTravel) {
        try {
          setTravelConfig(JSON.parse(savedTravel));
        } catch (e) {}
      }
    } catch (err) {
      console.warn('Could not load saved state from localStorage:', err);
    }
  }, []);

  // Realtime Cloud Firestore sync listeners with automatic fallback
  useEffect(() => {
    if (!db) return;

    let unsubBookings = () => {};
    let unsubReviews = () => {};
    let unsubServices = () => {};
    let unsubSocial = () => {};
    let unsubForum = () => {};
    let unsubSocialLinks = () => {};
    let unsubCms = () => {};
    let unsubSeo = () => {};
    let unsubTunes = () => {};
    let unsubTravel = () => {};

    try {
      unsubServices = onSnapshot(collection(db, 'services'), (snapshot) => {
        if (!snapshot.empty) {
          const remoteServices: ServicePackage[] = [];
          snapshot.forEach((d) => remoteServices.push(d.data() as ServicePackage));
          if (remoteServices.length > 0) {
            setServices(remoteServices);
          }
        }
      }, (err) => console.log('Firestore services listener:', err.message));

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

      unsubTravel = onSnapshot(doc(db, 'settings', 'travel_config'), (snap) => {
        if (snap.exists()) {
          setTravelConfig(snap.data() as TravelExpensesConfig);
        }
      }, (err) => console.log('Firestore travel_config listener:', err.message));
    } catch (e) {
      console.warn('Firebase Firestore initialization:', e);
    }

    return () => {
      unsubBookings();
      unsubReviews();
      unsubServices();
      unsubSocial();
      unsubForum();
      unsubSocialLinks();
      unsubCms();
      unsubSeo();
      unsubTunes();
      unsubTravel();
    };
  }, []);

  // Helper function to sync a document to Cloud Firestore
  const syncToFirestore = async (colName: string, docId: string, data: any) => {
    if (!db) {
      console.warn(`[Firestore] Sync skipped (database instance not ready) for ${colName}/${docId}`);
      return;
    }
    try {
      const cleanData = JSON.parse(JSON.stringify(data));
      await setDoc(doc(db, colName, docId), cleanData, { merge: true });
      console.log(`[Firestore SUCCESS] Synced ${colName}/${docId}`);
    } catch (err: any) {
      console.error(`[Firestore ERROR] Write failed for ${colName}/${docId}:`, err?.message || err);
    }
  };

  const deleteFromFirestore = async (colName: string, docId: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, colName, docId));
      console.log(`[Firestore SUCCESS] Deleted ${colName}/${docId}`);
    } catch (err: any) {
      console.error(`[Firestore ERROR] Delete failed for ${colName}/${docId}:`, err?.message || err);
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
    buttonColor?: string,
    imageFit?: EditableCmsBlock['imageFit'],
    imagePositionX?: number,
    imagePositionY?: number,
    imageScale?: number
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
              imageFit: imageFit !== undefined ? imageFit : b.imageFit,
              imagePositionX: imagePositionX !== undefined ? imagePositionX : b.imagePositionX,
              imagePositionY: imagePositionY !== undefined ? imagePositionY : b.imagePositionY,
              imageScale: imageScale !== undefined ? imageScale : b.imageScale,
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
          imageFit: imageFit || 'cover',
          imagePositionX: imagePositionX !== undefined ? imagePositionX : 50,
          imagePositionY: imagePositionY !== undefined ? imagePositionY : 50,
          imageScale: imageScale !== undefined ? imageScale : 1.0,
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

  // Service Management Handlers
  const createService = async (serviceData: Omit<ServicePackage, 'id'>) => {
    const newService: ServicePackage = {
      ...serviceData,
      id: `srv-${Date.now()}`,
      isCustom: true,
      createdAt: new Date().toISOString()
    };
    const updated = [newService, ...services];
    setServices(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}services`, JSON.stringify(updated));
    }
    if (db) {
      try {
        await setDoc(doc(db, 'services', newService.id), newService);
      } catch (e) {
        console.warn('Firestore createService warning:', e);
      }
    }
    addNotification({
      type: 'system',
      title: 'New Service Created',
      message: `Package "${newService.title}" has been published.`,
      actionUrl: `/services/${newService.slug}`
    });
  };

  const updateService = async (id: string, updates: Partial<ServicePackage>) => {
    const updated = services.map(s => s.id === id ? { ...s, ...updates } : s);
    setServices(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}services`, JSON.stringify(updated));
    }
    if (db) {
      try {
        const target = updated.find(s => s.id === id);
        if (target) {
          await setDoc(doc(db, 'services', id), target, { merge: true });
        }
      } catch (e) {
        console.warn('Firestore updateService warning:', e);
      }
    }
    addNotification({
      type: 'system',
      title: 'Service Updated',
      message: `Package details updated successfully.`,
      actionUrl: '/admin'
    });
  };

  const deleteService = async (id: string) => {
    const updated = services.filter(s => s.id !== id);
    setServices(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}services`, JSON.stringify(updated));
    }
    if (db) {
      try {
        await deleteDoc(doc(db, 'services', id));
      } catch (e) {
        console.warn('Firestore deleteService warning:', e);
      }
    }
    addNotification({
      type: 'system',
      title: 'Service Removed',
      message: `Service package has been deleted.`,
      actionUrl: '/admin'
    });
  };

  const getServiceBySlug = (slug: string): ServicePackage | undefined => {
    return services.find(s => s.slug === slug || s.id === slug);
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

  const approveBooking = async (id: string) => {
    const paypalLink = `https://www.paypal.com/checkout/spudthepiper/pay?id=${id}`;
    let updatedBooking: BookingEvent | null = null;

    setBookings(prev => {
      const updatedList = prev.map(b => {
        if (b.id === id) {
          const history = b.brevoEmailHistory || [];
          updatedBooking = {
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
          return updatedBooking;
        }
        return b;
      });
      return updatedList;
    });

    if (updatedBooking) {
      await syncToFirestore('bookings', id, updatedBooking);
    }

    const bk = bookings.find(b => b.id === id) || updatedBooking;
    if (bk) {
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

  const rejectBooking = async (id: string) => {
    let updatedBooking: BookingEvent | null = null;
    setBookings(prev => {
      const updatedList = prev.map(b => {
        if (b.id === id) {
          updatedBooking = { ...b, status: 'cancelled' as BookingStatus };
          return updatedBooking;
        }
        return b;
      });
      return updatedList;
    });

    if (updatedBooking) {
      await syncToFirestore('bookings', id, updatedBooking);
    }
  };

  const markDepositPaid = async (id: string, paypalOrderId: string = `PP-TX-${Date.now().toString().slice(-6)}`) => {
    let updatedBooking: BookingEvent | null = null;
    setBookings(prev => {
      const updatedList = prev.map(b => {
        if (b.id === id) {
          const history = b.brevoEmailHistory || [];
          updatedBooking = {
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
          return updatedBooking;
        }
        return b;
      });
      return updatedList;
    });

    if (updatedBooking) {
      await syncToFirestore('bookings', id, updatedBooking);
    }

    const bk = bookings.find(b => b.id === id) || updatedBooking;
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

  const deleteBooking = async (id: string) => {
    setBookings(prev => prev.filter(b => b.id !== id));
    await deleteFromFirestore('bookings', id);
  };

  // Review handlers
  const submitReview = async (reviewData: Omit<Review, 'id' | 'date' | 'status' | 'isFeatured'>) => {
    const newRev: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
      status: 'pending', // Requires Spud's approval in back office
      isFeatured: false
    };
    setReviews(prev => [newRev, ...prev]);
    await syncToFirestore('reviews', newRev.id, newRev);

    addNotification({
      type: 'new_review',
      title: 'New Client Review Submitted',
      message: `${newRev.authorName} left a ${newRev.rating}-star review for moderation.`,
      actionUrl: '/admin/reviews',
      relatedId: newRev.id
    });
  };

  const approveReview = async (id: string) => {
    let targetRev: Review | null = null;
    setReviews(prev => {
      return prev.map(r => {
        if (r.id === id) {
          targetRev = { ...r, status: 'approved' as const };
          return targetRev;
        }
        return r;
      });
    });
    if (targetRev) {
      await syncToFirestore('reviews', id, targetRev);
    }
  };

  const rejectReview = async (id: string) => {
    let targetRev: Review | null = null;
    setReviews(prev => {
      return prev.map(r => {
        if (r.id === id) {
          targetRev = { ...r, status: 'rejected' as const };
          return targetRev;
        }
        return r;
      });
    });
    if (targetRev) {
      await syncToFirestore('reviews', id, targetRev);
    }
  };

  const toggleFeatureReview = async (id: string) => {
    let targetRev: Review | null = null;
    setReviews(prev => {
      return prev.map(r => {
        if (r.id === id) {
          targetRev = { ...r, isFeatured: !r.isFeatured };
          return targetRev;
        }
        return r;
      });
    });
    if (targetRev) {
      await syncToFirestore('reviews', id, targetRev);
    }
  };

  // Social handlers
  const createSocialPost = async (postData: {
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
    await syncToFirestore('social_posts', newPost.id, newPost);

    addNotification({
      type: 'new_review',
      title: postData.postType === 'forum' ? 'New Forum Question Asked' : 'New Social Feed Post',
      message: `${newPost.authorName} shared a post: "${newPost.title || newPost.content.slice(0, 40)}"`,
      actionUrl: '/social',
      relatedId: newPost.id
    });
  };

  const likeSocialPost = async (id: string) => {
    let updatedPost: SocialPost | null = null;
    setSocialPosts(prev => prev.map(post => {
      if (post.id === id) {
        const isLiked = post.likedByMe;
        updatedPost = {
          ...post,
          likes: isLiked ? post.likes - 1 : post.likes + 1,
          likedByMe: !isLiked
        };
        return updatedPost;
      }
      return post;
    }));
    if (updatedPost) {
      await syncToFirestore('social_posts', id, updatedPost);
    }
  };

  const addCommentToPost = async (
    postId: string, 
    content: string, 
    authorName: string = 'Highland Friend', 
    authorRole: string = 'Guest'
  ) => {
    let updatedPost: SocialPost | null = null;
    setSocialPosts(prev => prev.map(post => {
      if (post.id === postId) {
        updatedPost = {
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
        return updatedPost;
      }
      return post;
    }));
    if (updatedPost) {
      await syncToFirestore('social_posts', postId, updatedPost);
    }
  };

  const togglePinPost = async (id: string) => {
    let updatedPost: SocialPost | null = null;
    setSocialPosts(prev => prev.map(p => {
      if (p.id === id) {
        updatedPost = { ...p, isPinned: !p.isPinned };
        return updatedPost;
      }
      return p;
    }));
    if (updatedPost) {
      await syncToFirestore('social_posts', id, updatedPost);
    }
  };

  const deleteSocialPost = async (id: string) => {
    setSocialPosts(prev => prev.filter(p => p.id !== id));
    await deleteFromFirestore('social_posts', id);
  };

  // Forum Category Management (Controlled by Spud from Back Office)
  const createForumCategory = async (catData: Omit<ForumCategoryItem, 'id' | 'createdAt'>) => {
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
    await syncToFirestore('forum_categories', newCat.id, newCat);

    addNotification({
      type: 'new_review',
      title: 'New Forum Category Created',
      message: `New category created: "${newCat.title}"`,
      actionUrl: '/social'
    });
  };

  const deleteForumCategory = async (id: string) => {
    setForumCategories(prev => prev.filter(c => c.id !== id));
    await deleteFromFirestore('forum_categories', id);
  };

  const editForumCategory = async (id: string, updated: Partial<ForumCategoryItem>) => {
    let fullUpdated: ForumCategoryItem | null = null;
    setForumCategories(prev => prev.map(c => {
      if (c.id === id) {
        fullUpdated = { ...c, ...updated };
        return fullUpdated;
      }
      return c;
    }));
    if (fullUpdated) {
      await syncToFirestore('forum_categories', id, fullUpdated);
    }
  };

  // Social Links Management (Controlled by Spud from Back Office)
  const updateSocialLinks = async (newLinks: Partial<SocialMediaLinks>) => {
    let full: SocialMediaLinks | null = null;
    setSocialLinks(prev => {
      full = { ...prev, ...newLinks };
      return full;
    });
    if (full) {
      await syncToFirestore('settings', 'social_links', full);
    }
    addNotification({
      type: 'system',
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
        } else if (lower.includes('tartan') || lower.includes('dress') || lower.includes('kilt') || lower.includes('outfit')) {
          replyText = autoReplies.tartan;
        } else if (lower.includes('tune') || lower.includes('song') || lower.includes('music') || lower.includes('cathedral')) {
          replyText = autoReplies.tune;
        }

        const botMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'spud',
          senderName: 'Spud the Piper (Auto-Assist)',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: false,
          sessionId: 'session-demo'
        };
        setChatMessages(c => [...c, botMsg]);
      }, 1500);
    }
  };

  const markChatAsRead = () => {
    setChatMessages(prev => prev.map(m => ({ ...m, isRead: true })));
  };

  // Audio Bagpipe Player & Tune Manager
  const playTune = (titleOrId: string) => {
    const tune = tunesList.find(t => t.id === titleOrId || t.title.toLowerCase() === titleOrId.toLowerCase());
    
    // If the tune has an uploaded audio track URL or base64 data, use HTML5 Audio playback
    if (tune && tune.audioUrl) {
      try {
        if (audioPlayerRef.current) {
          audioPlayerRef.current.pause();
        }
        audioPlayerRef.current = new Audio(tune.audioUrl);
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

  const addTune = async (newTuneData: Omit<BagpipeTune, 'id'>) => {
    const newTune: BagpipeTune = {
      ...newTuneData,
      id: `tune-${Date.now()}`
    };
    setTunesList(prev => {
      const updated = [newTune, ...prev];
      try {
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}tunes`, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    await syncToFirestore('bagpipe_tunes', newTune.id, newTune);
    addNotification({
      type: 'tune_added',
      title: 'New Bagpipe Tune Added',
      message: `"${newTune.title}" was added to Spud's Jukebox!`,
      actionUrl: '/tunes'
    });
  };

  const updateTune = async (id: string, updated: Partial<BagpipeTune>) => {
    let updatedTune: BagpipeTune | null = null;
    setTunesList(prev => {
      const updatedList = prev.map(t => {
        if (t.id === id) {
          updatedTune = { ...t, ...updated };
          return updatedTune;
        }
        return t;
      });
      try {
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}tunes`, JSON.stringify(updatedList));
      } catch (e) {}
      return updatedList;
    });
    if (updatedTune) {
      await syncToFirestore('bagpipe_tunes', id, updatedTune);
    }
  };

  const deleteTune = async (id: string) => {
    if (currentPlayingTune) {
      stopTune();
    }
    setTunesList(prev => {
      const updatedList = prev.filter(t => t.id !== id);
      try {
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}tunes`, JSON.stringify(updatedList));
      } catch (e) {}
      return updatedList;
    });
    await deleteFromFirestore('bagpipe_tunes', id);
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

  const updatePageSeo = async (pageId: string, newConfig: Partial<SeoPageConfig>) => {
    let targetDoc: SeoPageConfig | null = null;
    setSeoPages(prev => {
      const idx = prev.findIndex(p => p.pageId === pageId);
      let updatedList: SeoPageConfig[];
      if (idx >= 0) {
        targetDoc = { ...prev[idx], ...newConfig };
        updatedList = [...prev];
        updatedList[idx] = targetDoc;
      } else {
        const fallback = initialSeoPages.find(p => p.pageId === pageId) || {
          pageId,
          pageName: pageId.charAt(0).toUpperCase() + pageId.slice(1),
          path: `/${pageId}`,
          title: `Spud the Piper | ${pageId}`,
          metaDescription: 'World-Class Scottish Bagpiper for Weddings & Events',
          keywords: ['bagpiper', 'scotland'],
          h1: `Spud the Piper - ${pageId}`,
          canonicalUrl: `https://www.spudthepiper.co.uk/${pageId}`,
          ogImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&q=80',
          schemaType: 'LocalBusiness'
        };
        targetDoc = { ...fallback, ...newConfig };
        updatedList = [...prev, targetDoc];
      }

      if (pageId === 'home') {
        setSeoConfig(targetDoc);
      }
      try {
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}seo_pages`, JSON.stringify(updatedList));
      } catch (e) {}
      return updatedList;
    });

    if (targetDoc) {
      console.log(`[Firestore] Directly persisting SEO page to seo_pages/${pageId}:`, targetDoc);
      await syncToFirestore('seo_pages', pageId, targetDoc);
    }
  };

  const updateSeoConfig = async (newConfig: Partial<SeoPageConfig>) => {
    await updatePageSeo('home', newConfig);
  };

  const openSeoDrawer = (pageId: string = 'home') => {
    const clean = pageId.replace(/^\//, '') || 'home';
    setActiveSeoDrawerPageId(clean);
  };

  const closeSeoDrawer = () => {
    setActiveSeoDrawerPageId(null);
  };

  // Full Database Seed & Sync Helper to create and populate all Firestore collections
  const syncAllToFirestore = async (): Promise<{ success: boolean; count: number; error?: string }> => {
    if (!db) {
      console.warn('[Firestore] Firebase Firestore is not initialized');
      return { success: false, count: 0, error: 'Firebase Firestore is not initialized' };
    }
    setIsSyncingFirestore(true);
    try {
      console.log('[Firestore] Initiating complete cloud sync to Firebase...');
      let totalSynced = 0;

      // 1. Sync all 14 SEO Pages
      const pagesToSync = seoPages && seoPages.length > 0 ? seoPages : initialSeoPages;
      for (const page of pagesToSync) {
        await setDoc(doc(db, 'seo_pages', page.pageId), JSON.parse(JSON.stringify(page)), { merge: true });
        totalSynced++;
      }

      // 2. Sync Bagpipe Tunes
      const tunesToSync = tunesList && tunesList.length > 0 ? tunesList : initialTunes;
      for (const tune of tunesToSync) {
        await setDoc(doc(db, 'bagpipe_tunes', tune.id), JSON.parse(JSON.stringify(tune)), { merge: true });
        totalSynced++;
      }

      // 3. Sync CMS Blocks
      const blocksToSync = cmsBlocks && cmsBlocks.length > 0 ? cmsBlocks : initialCmsBlocks;
      for (const block of blocksToSync) {
        await setDoc(doc(db, 'cms_blocks', block.id), JSON.parse(JSON.stringify(block)), { merge: true });
        totalSynced++;
      }

      // 4. Sync Forum Categories
      const catsToSync = forumCategories && forumCategories.length > 0 ? forumCategories : initialForumCategories;
      for (const cat of catsToSync) {
        await setDoc(doc(db, 'forum_categories', cat.id), JSON.parse(JSON.stringify(cat)), { merge: true });
        totalSynced++;
      }

      // 5. Sync Social Links
      await setDoc(doc(db, 'settings', 'social_links'), JSON.parse(JSON.stringify(socialLinks)), { merge: true });
      totalSynced++;

      // 6. Sync Bookings
      const bookingsToSync = bookings && bookings.length > 0 ? bookings : initialBookings;
      for (const b of bookingsToSync) {
        await setDoc(doc(db, 'bookings', b.id), JSON.parse(JSON.stringify(b)), { merge: true });
        totalSynced++;
      }

      // 7. Sync Reviews
      const reviewsToSync = reviews && reviews.length > 0 ? reviews : initialReviews;
      for (const r of reviewsToSync) {
        await setDoc(doc(db, 'reviews', r.id), JSON.parse(JSON.stringify(r)), { merge: true });
        totalSynced++;
      }

      // 8. Sync Social Posts
      const postsToSync = socialPosts && socialPosts.length > 0 ? socialPosts : initialSocialPosts;
      for (const p of postsToSync) {
        await setDoc(doc(db, 'social_posts', p.id), JSON.parse(JSON.stringify(p)), { merge: true });
        totalSynced++;
      }

      // 9. Sync Services & Packages
      const servicesToSync = services && services.length > 0 ? services : initialServices;
      for (const srv of servicesToSync) {
        await setDoc(doc(db, 'services', srv.id), JSON.parse(JSON.stringify(srv)), { merge: true });
        totalSynced++;
      }

      // 10. Sync Travel & Expense Config
      await setDoc(doc(db, 'settings', 'travel_config'), JSON.parse(JSON.stringify(travelConfig)), { merge: true });
      totalSynced++;

      console.log(`[Firestore SUCCESS] Full Cloud Sync Complete: ${totalSynced} documents verified in Firestore!`);
      addNotification({
        type: 'system',
        title: 'Firebase Firestore Fully Synced',
        message: `Successfully synchronized ${totalSynced} items across all collections (services, travel_config, seo_pages, bagpipe_tunes, cms_blocks, bookings, reviews, etc.) to Firebase!`,
        actionUrl: '/admin'
      });
      setIsSyncingFirestore(false);
      return { success: true, count: totalSynced };
    } catch (err: any) {
      console.error('[Firestore ERROR] Full sync encountered an error:', err);
      setIsSyncingFirestore(false);
      return { success: false, count: 0, error: err?.message || 'Sync encountered an error' };
    }
  };

  // Travel Config Handler
  const updateTravelConfig = async (newConfig: Partial<TravelExpensesConfig>) => {
    const updated: TravelExpensesConfig = { ...travelConfig, ...newConfig };
    setTravelConfig(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}travel_config`, JSON.stringify(updated));
    }
    if (db) {
      try {
        await setDoc(doc(db, 'settings', 'travel_config'), updated, { merge: true });
      } catch (e) {
        console.warn('Firestore updateTravelConfig warning:', e);
      }
    }
    addNotification({
      type: 'system',
      title: 'Travel & Expenses Config Saved',
      message: `Base location and radius expense tiers have been updated.`,
      actionUrl: '/admin'
    });
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
      services,
      createService,
      updateService,
      deleteService,
      getServiceBySlug,
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
      travelConfig,
      updateTravelConfig,
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
      isSyncingFirestore,
      syncAllToFirestore,
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
