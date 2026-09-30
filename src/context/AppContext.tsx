'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  BookingEvent, 
  Review, 
  SocialPost, 
  ChatMessage, 
  ChatSession,
  QuickResponse,
  NotificationItem, 
  EditableCmsBlock, 
  BagpipeTune,
  SeoPageConfig,
  BookingStatus,
  ForumCategoryItem,
  SocialMediaLinks,
  ServicePackage,
  TravelExpensesConfig,
  MailingContact,
  EmailCampaign,
  AdminUserRecord,
  UserRecord,
  UserPermissions,
  FaqItem,
  PricingConfig
} from '@/types/spud';
import { 
  initialBookings, 
  initialReviews, 
  initialSocialPosts, 
  initialChatMessages, 
  initialChatSessions,
  initialQuickResponses,
  initialNotifications, 
  initialCmsBlocks, 
  initialTunes, 
  initialSeoConfig, 
  initialSeoPages, 
  initialForumCategories, 
  initialSocialLinks,
  initialServices,
  initialTravelConfig,
  initialMailingContacts,
  initialCampaigns,
  initialAdminWhitelist,
  initialUsers,
  defaultPermissions,
  initialFaqs,
  initialPricingConfig
} from '@/lib/initialData';
import { bagpipeSynth } from '@/lib/bagpipeSynth';
import { db, auth } from '@/lib/firebase';
import { collection, doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged, 
  sendPasswordResetEmail,
  User 
} from 'firebase/auth';

interface AppContextType {
  isMounted: boolean;
  // Authentication & Admin (Live Firebase Auth + Google + Users Collection & Permissions)
  isAdminLoggedIn: boolean;
  firebaseUser: User | null;
  users: UserRecord[];
  adminWhitelist: AdminUserRecord[];
  addUser: (email: string, name?: string, role?: 'owner' | 'admin' | 'editor', permissions?: Partial<UserPermissions>) => Promise<boolean>;
  updateUser: (id: string, updates: Partial<UserRecord>) => Promise<boolean>;
  updateUserPermissions: (id: string, permissions: Partial<UserPermissions>) => Promise<boolean>;
  toggleUserOnlineStatus: (id: string, isOnline: boolean) => Promise<void>;
  removeUser: (idOrEmail: string) => Promise<boolean>;
  addAuthorizedAdmin: (email: string, name?: string, role?: 'owner' | 'admin' | 'editor') => Promise<boolean>;
  removeAuthorizedAdmin: (idOrEmail: string) => Promise<boolean>;
  isEmailAuthorized: (email: string) => boolean;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  registerWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  loginAdmin: (pass: string) => boolean;
  logoutAdmin: () => Promise<void>;

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

  // Public Pricing & Price on Application (POA) Configuration
  pricingConfig: PricingConfig;
  updatePricingConfig: (newConfig: Partial<PricingConfig>) => Promise<void>;

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

  // Live Chat & Message Center
  isSpudOnline: boolean;
  toggleSpudOnline: () => void;
  setSpudOnline: (online: boolean) => void;
  quickResponses: QuickResponse[];
  addQuickResponse: (qr: Omit<QuickResponse, 'id'>) => void;
  updateQuickResponse: (id: string, qr: Partial<QuickResponse>) => void;
  deleteQuickResponse: (id: string) => void;
  chatSessions: ChatSession[];
  activeChatSessionId: string;
  setActiveChatSessionId: (id: string) => void;
  chatMessages: ChatMessage[];
  sendChatMessage: (
    text: string, 
    sender?: 'client' | 'spud' | 'system', 
    sessionId?: string, 
    visitorName?: string, 
    visitorEmail?: string, 
    visitorPhone?: string
  ) => void;
  submitOfflineInquiry: (inquiry: {
    name: string;
    email: string;
    phone?: string;
    eventDate?: string;
    eventType?: string;
    question: string;
  }) => void;
  markChatAsRead: (sessionId?: string) => void;
  markSessionResolved: (sessionId: string) => void;
  deleteChatSession: (sessionId: string) => void;
  clearAllChatHistory: () => void;
  waitingChatSessionsCount: number;
  unreadChatCount: number;

  // Audio Bagpipe Player & Tune Manager
  currentPlayingTune: string | null;
  playTune: (titleOrId: string) => void;
  playSampleTune: () => void;
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
  deleteNotification: (id: string) => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) => void;
  testDeviceNotificationAlert: () => void;
  requestNotificationPermission: () => Promise<boolean>;

  // Multi-Page SEO & Structured Data Studio
  seoPages: SeoPageConfig[];
  seoConfig: SeoPageConfig;
  getSeoForPage: (pageIdOrPath: string) => SeoPageConfig;
  updatePageSeo: (pageId: string, newConfig: Partial<SeoPageConfig>) => Promise<void>;
  updateSeoConfig: (newConfig: Partial<SeoPageConfig>) => Promise<void>;
  activeSeoDrawerPageId: string | null;
  openSeoDrawer: (pageId?: string) => void;
  closeSeoDrawer: () => void;

  // FAQs Knowledgebase
  faqs: FaqItem[];
  addFaq: (faq: Omit<FaqItem, 'id'>) => Promise<void>;
  updateFaq: (id: string, updates: Partial<FaqItem>) => Promise<void>;
  deleteFaq: (id: string) => Promise<void>;
  reorderFaqs: (newOrderedList: FaqItem[]) => Promise<void>;

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

  // Mailing List & Seasonal Campaign Studio
  mailingContacts: MailingContact[];
  emailCampaigns: EmailCampaign[];
  addMailingContact: (contact: Omit<MailingContact, 'id'>) => MailingContact;
  removeMailingContact: (id: string) => void;
  updateMailingContact: (id: string, updated: Partial<MailingContact>) => void;
  saveEmailCampaign: (campaign: EmailCampaign) => void;
  dispatchBroadcastCampaign: (campaign: EmailCampaign, recipients: MailingContact[]) => Promise<{ success: boolean; sentCount?: number; error?: string }>;
  // Live Stream Visibility & Control
  showLiveStream: boolean;
  toggleLiveStream: () => void;
  setShowLiveStream: (show: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'spud_the_piper_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Admin & Visual Edit state (Firebase Auth + Fallback)
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLegacyAdminLoggedIn, setIsLegacyAdminLoggedIn] = useState<boolean>(false);
  const [isVisualEditMode, setIsVisualEditMode] = useState<boolean>(false);
  const [cmsBlocks, setCmsBlocks] = useState<EditableCmsBlock[]>(initialCmsBlocks);
  const [editingBlock, setEditingBlock] = useState<EditableCmsBlock | null>(null);

  const isAdminLoggedIn = !!firebaseUser || isLegacyAdminLoggedIn;

  // Users & Admin Security state (Synced with Firestore 'users' collection)
  const [users, setUsers] = useState<UserRecord[]>(initialUsers);
  const adminWhitelist = users;

  // Listen to Firebase Live Auth state
  const usersRef = React.useRef(users);
  usersRef.current = users;

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user && user.email) {
          const email = user.email.toLowerCase();
          const currentUsers = usersRef.current || [];
          const isAllowed = 
            email === 'piperspud@gmail.com' || 
            currentUsers.some(u => u && u.email && u.email.trim().toLowerCase() === email);

          if (isAllowed) {
            setFirebaseUser(user);
            setIsLegacyAdminLoggedIn(true);
          } else {
            // If unauthorized Google/Email user tried to session persist
            try {
              if (auth) await signOut(auth);
            } catch (e) {}
            setFirebaseUser(null);
            setIsLegacyAdminLoggedIn(false);
            if (typeof window !== 'undefined') localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}admin`);
          }
        } else if (!user) {
          setFirebaseUser(null);
        }
      } catch (e) {
        console.warn('onAuthStateChanged error:', e);
      }
    });
    return () => unsubscribe();
  }, []);

  // Core entities
  const [services, setServices] = useState<ServicePackage[]>(initialServices);
  const [bookings, setBookings] = useState<BookingEvent[]>(initialBookings);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>(initialSocialPosts);
  const [forumCategories, setForumCategories] = useState<ForumCategoryItem[]>(initialForumCategories);
  const [socialLinks, setSocialLinks] = useState<SocialMediaLinks>(initialSocialLinks);
  
  // Live Chat & Message Center state (Online/Offline status synced with Firestore 'users' and 'settings/chat_status')
  const [isSpudOnline, setIsSpudOnlineState] = useState<boolean>(false);
  const [quickResponses, setQuickResponses] = useState<QuickResponse[]>(initialQuickResponses);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(initialChatSessions);
  const [activeChatSessionId, setActiveChatSessionId] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatMessages);

  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [seoPages, setSeoPages] = useState<SeoPageConfig[]>(initialSeoPages);
  const [seoConfig, setSeoConfig] = useState<SeoPageConfig>(initialSeoConfig);
  const [activeSeoDrawerPageId, setActiveSeoDrawerPageId] = useState<string | null>(null);
  const [travelConfig, setTravelConfig] = useState<TravelExpensesConfig>(initialTravelConfig);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>(initialPricingConfig);
  const [mailingContacts, setMailingContacts] = useState<MailingContact[]>(initialMailingContacts);
  const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>(initialCampaigns);
  const [faqs, setFaqs] = useState<FaqItem[]>(initialFaqs);
  const [showLiveStream, setShowLiveStreamState] = useState<boolean>(true);
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
      if (savedAdmin === 'true') setIsLegacyAdminLoggedIn(true);

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
      if (savedBookings) {
        try {
          const parsedBookings: BookingEvent[] = JSON.parse(savedBookings);
          if (Array.isArray(parsedBookings)) {
            const mockBookingIds = new Set(['spud-bk-101', 'spud-bk-102', 'spud-bk-103', 'spud-bk-104', 'spud-bk-105']);
            const clean = parsedBookings.filter(b => !mockBookingIds.has(b.id));
            setBookings(clean);
          }
        } catch (e) {}
      }

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
          const parsedTunes: BagpipeTune[] = JSON.parse(savedTunes);
          if (Array.isArray(parsedTunes) && parsedTunes.length > 0) {
            const validParsed = parsedTunes.filter(Boolean);
            const initialMap = new Map(initialTunes.map(t => [t.id, t]));
            const initialTitleMap = new Map(initialTunes.map(t => [(t.title || '').toLowerCase(), t]));
            
            // Merge initial tunes with any user overrides while preserving full rich fields and audioUrl
            const mergedInitial = initialTunes.map(initTune => {
              const initTitle = (initTune.title || '').toLowerCase();
              const userVer = validParsed.find(p => p && (p.id === initTune.id || ((p.title || '').toLowerCase() === initTitle)));
              if (userVer) {
                return {
                  ...initTune,
                  ...userVer,
                  description: (userVer.description && userVer.description.trim().length > 0) ? userVer.description : initTune.description,
                  funFact: (userVer.funFact && userVer.funFact.trim().length > 0) ? userVer.funFact : initTune.funFact,
                  weddingMoment: userVer.weddingMoment || initTune.weddingMoment,
                  tempo: userVer.tempo || initTune.tempo,
                  instrumentRecommended: userVer.instrumentRecommended || initTune.instrumentRecommended,
                  duration: userVer.duration || initTune.duration,
                  showOnHomePage: userVer.showOnHomePage !== undefined ? userVer.showOnHomePage : initTune.showOnHomePage,
                  audioUrl: userVer.audioUrl && userVer.audioUrl.trim().length > 0 ? userVer.audioUrl : initTune.audioUrl
                };
              }
              return initTune;
            });

            // Keep any brand new tunes added by user
            const customTunes = validParsed.filter(p => p && !initialMap.has(p.id) && !initialTitleMap.has((p.title || '').toLowerCase()));
            setTunesList([...mergedInitial, ...customTunes]);
          } else {
            setTunesList(initialTunes);
          }
        } catch (e) {
          setTunesList(initialTunes);
        }
      } else {
        setTunesList(initialTunes);
      }

      const savedSpudOnline = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}spud_online`);
      if (savedSpudOnline !== null) {
        setIsSpudOnlineState(savedSpudOnline === 'true');
      }

      const savedQuickResponses = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}quick_responses`);
      if (savedQuickResponses) {
        try {
          const parsedQr: QuickResponse[] = JSON.parse(savedQuickResponses);
          if (Array.isArray(parsedQr) && parsedQr.length > 0) {
            const initialIds = new Set(initialQuickResponses.map(q => q.id));
            const userAdded = parsedQr.filter(q => !initialIds.has(q.id));
            const merged = initialQuickResponses.map(initQ => {
              const u = parsedQr.find(p => p.id === initQ.id);
              return u || initQ;
            });
            setQuickResponses([...merged, ...userAdded]);
          }
        } catch (e) {}
      }

      const savedChatSessions = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}chat_sessions`);
      if (savedChatSessions) {
        try {
          const parsedSessions: ChatSession[] = JSON.parse(savedChatSessions);
          if (Array.isArray(parsedSessions)) {
            const mockSessionIds = new Set(['session-demo', 'session-calum', 'session-inquiry-1', 'session-lord-campbell']);
            const realUserSessions = parsedSessions.filter(s => !mockSessionIds.has(s.id));
            setChatSessions(realUserSessions);
            if (realUserSessions.length > 0) {
              setActiveChatSessionId(realUserSessions[0].id);
            }
          }
        } catch (e) {}
      }

      const savedChat = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}chat`);
      if (savedChat) {
        try {
          const parsedMessages: ChatMessage[] = JSON.parse(savedChat);
          if (Array.isArray(parsedMessages)) {
            const mockMessageIds = new Set(['msg-1', 'msg-2', 'msg-3', 'msg-c-1', 'msg-inq-1', 'msg-campbell-1', 'msg-campbell-2', 'msg-campbell-3']);
            const mockSessionIds = new Set(['session-demo', 'session-calum', 'session-inquiry-1', 'session-lord-campbell']);
            const realUserMsgs = parsedMessages.filter(m => !mockMessageIds.has(m.id) && (!m.sessionId || !mockSessionIds.has(m.sessionId)));
            setChatMessages(realUserMsgs);
          }
        } catch (e) {}
      }

      const savedNotifs = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}notifs`);
      if (savedNotifs) {
        try {
          const parsedNotifs: NotificationItem[] = JSON.parse(savedNotifs);
          if (Array.isArray(parsedNotifs)) {
            const mockIds = new Set(['notif-1', 'notif-2', 'notif-3']);
            const clean = parsedNotifs.filter(n => 
              n && n.id && !mockIds.has(n.id) && 
              !(n.title && (n.title.includes('Spud is Now ONLINE') || n.title.includes('Spud is Now OFFLINE') || n.title.includes('Live Chat Status') || n.title.includes('ONLINE') || n.title.includes('OFFLINE')))
            );
            setNotifications(clean);
          }
        } catch (e) {}
      }

      const savedCms = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}cms`);
      if (savedCms) {
        try {
          const parsed = JSON.parse(savedCms);
          if (Array.isArray(parsed) && parsed.length > 0) setCmsBlocks(parsed);
        } catch (e) {}
      }

      const savedSeoPages = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}seo_pages`);
      if (savedSeoPages) {
        try {
          const parsed = JSON.parse(savedSeoPages);
          if (Array.isArray(parsed) && parsed.length > 0) setSeoPages(parsed);
        } catch (e) {}
      }

      const savedSeo = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}seo`);
      if (savedSeo) {
        try {
          const parsed = JSON.parse(savedSeo);
          if (parsed && typeof parsed === 'object') setSeoConfig(parsed);
        } catch (e) {}
      }

      const savedTravel = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}travel_config`);
      if (savedTravel) {
        try {
          const parsed = JSON.parse(savedTravel);
          if (parsed && typeof parsed === 'object') {
            setTravelConfig({ ...initialTravelConfig, ...parsed });
          }
        } catch (e) {
          setTravelConfig(initialTravelConfig);
        }
      }

      const savedPricing = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}pricing_config`);
      if (savedPricing) {
        try {
          const parsedPricing = JSON.parse(savedPricing);
          if (parsedPricing && typeof parsedPricing === 'object') {
            setPricingConfig({ ...initialPricingConfig, ...parsedPricing });
          }
        } catch (e) {
          setPricingConfig(initialPricingConfig);
        }
      }

      const savedMailing = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}mailing_contacts`);
      if (savedMailing) {
        try {
          const parsedMailing: MailingContact[] = JSON.parse(savedMailing);
          if (Array.isArray(parsedMailing)) {
            const mockContactIds = new Set(['mc-1', 'mc-2', 'mc-3', 'mc-4', 'mc-5', 'mc-6']);
            const clean = parsedMailing.filter(m => !mockContactIds.has(m.id));
            setMailingContacts(clean);
          }
        } catch (e) {}
      }

      const savedCampaigns = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}campaigns`);
      if (savedCampaigns) {
        try {
          const parsedCamp = JSON.parse(savedCampaigns);
          if (Array.isArray(parsedCamp)) setEmailCampaigns(parsedCamp);
        } catch (e) {}
      }

      const savedFaqs = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}faqs`);
      if (savedFaqs) {
        try {
          const parsedFaqs: FaqItem[] = JSON.parse(savedFaqs);
          if (Array.isArray(parsedFaqs) && parsedFaqs.length > 0) {
            setFaqs(parsedFaqs);
          }
        } catch (e) {}
      }

      const savedStream = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}show_livestream`);
      if (savedStream !== null) {
        setShowLiveStreamState(savedStream === 'true');
      }

      const savedUsers = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}users`);
      if (savedUsers) {
        try {
          const parsedUsers: UserRecord[] = JSON.parse(savedUsers);
          if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
            setUsers(parsedUsers);
          }
        } catch (e) {}
      } else {
        const savedWhitelist = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}admin_whitelist`);
        if (savedWhitelist) {
          try {
            const parsedWhitelist = JSON.parse(savedWhitelist);
            if (Array.isArray(parsedWhitelist) && parsedWhitelist.length > 0) {
              const converted: UserRecord[] = parsedWhitelist.map((w: any) => ({
                id: w.id || `user-${Date.now()}`,
                email: w.email || '',
                name: w.name || w.email?.split('@')[0] || 'Admin',
                displayName: w.displayName || w.name || w.email?.split('@')[0] || 'Admin',
                role: w.role || 'admin',
                isOnline: w.isOnline || false,
                status: w.status || 'offline',
                addedAt: w.addedAt || new Date().toISOString(),
                lastActive: w.lastActive || new Date().toISOString(),
                permissions: w.permissions || (defaultPermissions[w.role as 'owner' | 'admin' | 'editor'] || defaultPermissions.admin)
              }));
              setUsers(converted);
            }
          } catch (e) {}
        }
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
    let unsubPricing = () => {};
    let unsubUsers = () => {};
    let unsubChatStatus = () => {};
    let unsubChatSessions = () => {};
    let unsubChatMessages = () => {};
    let unsubNotifications = () => {};
    let unsubMailing = () => {};
    let unsubCampaigns = () => {};
    let unsubFaqs = () => {};

    try {
      // Real-time Firestore listener for 'users' collection
      unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
        if (!snapshot.empty) {
          const remoteUsers: UserRecord[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as UserRecord;
            if (data) remoteUsers.push({ ...data, id: data.id || d.id });
          });
          if (remoteUsers.length > 0) {
            setUsers(prev => {
              const merged = [...(prev || [])];
              remoteUsers.forEach(r => {
                if (!r) return;
                const rEmail = (r.email || '').toLowerCase();
                const idx = merged.findIndex(u => u && (u.id === r.id || (rEmail && u.email && u.email.toLowerCase() === rEmail)));
                if (idx >= 0) merged[idx] = { ...merged[idx], ...r };
                else merged.push(r);
              });
              if (typeof window !== 'undefined') {
                try {
                  localStorage.setItem(`${LOCAL_STORAGE_PREFIX}users`, JSON.stringify(merged));
                  localStorage.setItem(`${LOCAL_STORAGE_PREFIX}admin_whitelist`, JSON.stringify(merged));
                } catch (e) {}
              }
              return merged;
            });

            // Check if primary owner or spud has isOnline set in users collection
            const spudRemote = remoteUsers.find(u => u && (((u.email || '').toLowerCase() === 'piperspud@gmail.com') || u.role === 'owner'));
            if (spudRemote && typeof spudRemote.isOnline === 'boolean') {
              setIsSpudOnlineState(spudRemote.isOnline);
            }
          }
        }
      }, (err) => console.log('Firestore users listener:', err.message));

      // Real-time Firestore listener for global chat_status setting
      unsubChatStatus = onSnapshot(doc(db, 'settings', 'chat_status'), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data && typeof data.isSpudOnline === 'boolean') {
            setIsSpudOnlineState(data.isSpudOnline);
            if (typeof window !== 'undefined') {
              localStorage.setItem(`${LOCAL_STORAGE_PREFIX}spud_online`, data.isSpudOnline ? 'true' : 'false');
            }
          }
        }
      }, (err) => console.log('Firestore chat_status listener:', err.message));

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
          const mockIds = new Set(['spud-bk-101', 'spud-bk-102', 'spud-bk-103', 'spud-bk-104', 'spud-bk-105']);
          const clean = remoteBookings.filter(b => !mockIds.has(b.id));
          clean.sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime());
          setBookings(clean);
        } else {
          setBookings([]);
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
          snapshot.forEach((d) => {
            const data = d.data() as BagpipeTune;
            if (data) remoteTunes.push(data);
          });
          if (remoteTunes.length > 0) {
            setTunesList(prev => {
              const currentList = prev && prev.length > 0 ? prev : initialTunes;
              const merged = [...currentList];
              remoteTunes.forEach(r => {
                if (!r) return;
                const rTitle = (r.title || '').toLowerCase();
                const idx = merged.findIndex(t => t && (t.id === r.id || ((t.title || '').toLowerCase() === rTitle)));
                const initT = initialTunes.find(it => it && (it.id === r.id || ((it.title || '').toLowerCase() === rTitle)));
                if (idx >= 0) {
                  const p = merged[idx] || {};
                  merged[idx] = {
                    ...initT,
                    ...p,
                    ...r,
                    title: r.title || p.title || initT?.title || '',
                    category: r.category || p.category || initT?.category || 'Wedding',
                    weddingMoment: r.weddingMoment || p.weddingMoment || initT?.weddingMoment,
                    instrumentRecommended: r.instrumentRecommended || p.instrumentRecommended || initT?.instrumentRecommended,
                    tempo: r.tempo || p.tempo || initT?.tempo,
                    duration: r.duration || p.duration || initT?.duration || '2:30',
                    description: (r.description && r.description.trim().length > 0) ? r.description : (p.description || initT?.description || ''),
                    funFact: (r.funFact && r.funFact.trim().length > 0) ? r.funFact : (p.funFact || initT?.funFact || ''),
                    audioUrl: (r.audioUrl && r.audioUrl.trim().length > 0) ? r.audioUrl : (p.audioUrl || initT?.audioUrl || ''),
                    showOnHomePage: r.showOnHomePage !== undefined ? r.showOnHomePage : (p.showOnHomePage !== undefined ? p.showOnHomePage : initT?.showOnHomePage),
                  };
                } else {
                  merged.push(r);
                }
              });
              return merged;
            });
          }
        }
      }, (err) => console.log('Firestore bagpipe_tunes listener:', err.message));

      unsubTravel = onSnapshot(doc(db, 'settings', 'travel_config'), (snap) => {
        if (snap.exists()) {
          const remote = snap.data() as TravelExpensesConfig;
          if (remote) {
            setTravelConfig({ ...initialTravelConfig, ...remote });
          }
        }
      }, (err) => console.log('Firestore travel_config listener:', err.message));

      unsubPricing = onSnapshot(doc(db, 'settings', 'pricing_config'), (snap) => {
        if (snap.exists()) {
          const remote = snap.data() as PricingConfig;
          if (remote) {
            setPricingConfig({ ...initialPricingConfig, ...remote });
            if (typeof window !== 'undefined') {
              localStorage.setItem(`${LOCAL_STORAGE_PREFIX}pricing_config`, JSON.stringify({ ...initialPricingConfig, ...remote }));
            }
          }
        }
      }, (err) => console.log('Firestore pricing_config listener:', err.message));

      // Real-time Firestore listener for live notifications
      unsubNotifications = onSnapshot(collection(db, 'notifications'), (snapshot) => {
        if (!snapshot.empty) {
          const remoteNotifs: NotificationItem[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as NotificationItem;
            if (data) remoteNotifs.push({ ...data, id: data.id || d.id });
          });
          if (remoteNotifs.length > 0) {
            const mockIds = new Set(['notif-1', 'notif-2', 'notif-3']);
            const cleanNotifs = remoteNotifs.filter(n => 
              n && n.id && !mockIds.has(n.id) && 
              !(n.title && (n.title.includes('Spud is Now ONLINE') || n.title.includes('Spud is Now OFFLINE') || n.title.includes('Live Chat Status') || n.title.includes('ONLINE') || n.title.includes('OFFLINE')))
            );
            cleanNotifs.sort((a, b) => {
              const timeA = a.id?.startsWith('notif-') ? parseInt(a.id.split('-')[1]) || 0 : 0;
              const timeB = b.id?.startsWith('notif-') ? parseInt(b.id.split('-')[1]) || 0 : 0;
              return timeB - timeA;
            });
            setNotifications(cleanNotifs);
          }
        } else {
          setNotifications([]);
        }
      }, (err) => console.log('Firestore notifications listener:', err.message));

      // Real-time Firestore listener for mailing_contacts
      unsubMailing = onSnapshot(collection(db, 'mailing_contacts'), (snapshot) => {
        if (!snapshot.empty) {
          const remoteContacts: MailingContact[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as MailingContact;
            if (data) remoteContacts.push({ ...data, id: data.id || d.id });
          });
          const mockIds = new Set(['mc-1', 'mc-2', 'mc-3', 'mc-4', 'mc-5', 'mc-6']);
          const clean = remoteContacts.filter(m => m && m.id && !mockIds.has(m.id));
          clean.sort((a, b) => new Date(b.addedAt || 0).getTime() - new Date(a.addedAt || 0).getTime());
          setMailingContacts(clean);
        } else {
          setMailingContacts([]);
        }
      }, (err) => console.log('Firestore mailing_contacts listener:', err.message));

      // Real-time Firestore listener for email_campaigns
      unsubCampaigns = onSnapshot(collection(db, 'email_campaigns'), (snapshot) => {
        if (!snapshot.empty) {
          const remoteCampaigns: EmailCampaign[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as EmailCampaign;
            if (data) remoteCampaigns.push({ ...data, id: data.id || d.id });
          });
          if (remoteCampaigns.length > 0) {
            setEmailCampaigns(remoteCampaigns);
          }
        }
      }, (err) => console.log('Firestore email_campaigns listener:', err.message));

      // Real-time Firestore listener for faqs
      unsubFaqs = onSnapshot(collection(db, 'faqs'), (snapshot) => {
        if (!snapshot.empty) {
          const remoteFaqs: FaqItem[] = [];
          snapshot.forEach((d) => remoteFaqs.push({ ...(d.data() as FaqItem), id: d.id }));
          remoteFaqs.sort((a, b) => (a.order || 0) - (b.order || 0));
          setFaqs(remoteFaqs);
          if (typeof window !== 'undefined') {
            localStorage.setItem(`${LOCAL_STORAGE_PREFIX}faqs`, JSON.stringify(remoteFaqs));
          }
        }
      }, (err) => console.log('Firestore faqs listener:', err.message));

      // Real-time Firestore listener for chat_sessions
      unsubChatSessions = onSnapshot(collection(db, 'chat_sessions'), (snapshot) => {
        if (!snapshot.empty) {
          const remoteSessions: ChatSession[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as ChatSession;
            if (data && data.id) remoteSessions.push({ ...data, id: data.id || d.id });
          });
          const mockSessionIds = new Set(['session-demo', 'session-calum', 'session-inquiry-1', 'session-lord-campbell']);
          const cleanSessions = remoteSessions.filter(s => s && s.id && !mockSessionIds.has(s.id));
          cleanSessions.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          
          if (cleanSessions.length > 0) {
            setChatSessions(cleanSessions);
            setActiveChatSessionId(prev => {
              if (prev && cleanSessions.some(s => s.id === prev)) return prev;
              return cleanSessions[0].id;
            });
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem(`${LOCAL_STORAGE_PREFIX}chat_sessions`, JSON.stringify(cleanSessions));
              } catch (e) {}
            }
          }
        }
      }, (err) => console.log('Firestore chat_sessions listener:', err.message));

      // Real-time Firestore listener for chat_messages
      unsubChatMessages = onSnapshot(collection(db, 'chat_messages'), (snapshot) => {
        if (!snapshot.empty) {
          const remoteMsgs: ChatMessage[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as ChatMessage;
            if (data && data.id) remoteMsgs.push({ ...data, id: data.id || d.id });
          });
          const mockMsgIds = new Set(['msg-1', 'msg-2', 'msg-3', 'msg-c-1', 'msg-inq-1', 'msg-campbell-1', 'msg-campbell-2', 'msg-campbell-3']);
          const cleanMsgs = remoteMsgs.filter(m => m && m.id && !mockMsgIds.has(m.id));
          
          cleanMsgs.sort((a, b) => {
            const timeA = a.id?.startsWith('msg-') ? parseInt(a.id.split('-')[1]) || 0 : 0;
            const timeB = b.id?.startsWith('msg-') ? parseInt(b.id.split('-')[1]) || 0 : 0;
            return timeA - timeB;
          });

          if (cleanMsgs.length > 0) {
            setChatMessages(cleanMsgs);
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem(`${LOCAL_STORAGE_PREFIX}chat`, JSON.stringify(cleanMsgs));
              } catch (e) {}
            }
          }
        }
      }, (err) => console.log('Firestore chat_messages listener:', err.message));
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
      unsubPricing();
      unsubUsers();
      unsubChatStatus();
      unsubChatSessions();
      unsubChatMessages();
      unsubNotifications();
      unsubMailing();
      unsubCampaigns();
      unsubFaqs();
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

  // Live Notification Dispatcher & Management (Firestore Synced)
  const addNotification = async (item: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    
    // 1. Audio Chime Ping (Synthesized Multi-Tone Web Audio API)
    if (bagpipeSynth) {
      try {
        bagpipeSynth.playAlertSound();
      } catch (e) {
        console.warn('Notification audio alert error:', e);
      }
    }

    // 2. Mobile Device Haptic Vibration Ping
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate([250, 100, 250, 100, 300]);
      } catch (e) {}
    }

    // 3. Browser & Desktop Push Notification (if permission is granted)
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`Spud the Piper: ${item.title}`, {
          body: item.message,
          icon: '/apple-touch-icon.png',
          badge: '/favicon.ico',
          tag: newNotif.id
        });
      } catch (e) {
        console.warn('Browser desktop notification error:', e);
      }
    }

    if (typeof window !== 'undefined') {
      try {
        const currentSaved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}notifs`);
        const parsed = currentSaved ? JSON.parse(currentSaved) : [];
        const updated = [newNotif, ...(Array.isArray(parsed) ? parsed : [])];
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}notifs`, JSON.stringify(updated));
      } catch (e) {}
    }
    if (db) {
      await setDoc(doc(db, 'notifications', newNotif.id), newNotif).catch(e => console.warn(e));
    }
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    try {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    } catch (e) {
      return false;
    }
  };

  const testDeviceNotificationAlert = () => {
    if (bagpipeSynth) {
      bagpipeSynth.playAlertSound();
    }
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate([250, 100, 250, 100, 300]);
      } catch (e) {}
    }
    addNotification({
      type: 'system',
      title: '🔔 Test Notification & Audio Ping',
      message: 'Your browser audio chime and mobile vibration ping are working perfectly!',
      actionUrl: '/admin'
    });
  };

  const markNotifAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    if (db) {
      await setDoc(doc(db, 'notifications', id), { isRead: true }, { merge: true }).catch(e => console.warn(e));
    }
  };

  const clearAllNotifs = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    if (db) {
      for (const n of notifications) {
        if (!n.isRead) {
          setDoc(doc(db, 'notifications', n.id), { isRead: true }, { merge: true }).catch(e => console.warn(e));
        }
      }
    }
  };

  const deleteNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (typeof window !== 'undefined') {
      try {
        const updated = notifications.filter(n => n.id !== id);
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}notifs`, JSON.stringify(updated));
      } catch (e) {}
    }
    if (db) {
      await deleteDoc(doc(db, 'notifications', id)).catch(e => console.warn(e));
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

  // Users, Whitelist & Security Handlers (Firestore 'users' collection)
  const isEmailAuthorized = (emailToCheck: string): boolean => {
    if (!emailToCheck) return false;
    const clean = emailToCheck.trim().toLowerCase();
    // Default authorized primary owner
    if (clean === 'piperspud@gmail.com') return true;
    return (users || []).some(u => u && u.email && u.email.trim().toLowerCase() === clean);
  };

  const addUser = async (
    emailToAdd: string, 
    name?: string, 
    role: 'owner' | 'admin' | 'editor' = 'admin',
    permissions?: Partial<UserPermissions>
  ): Promise<boolean> => {
    const cleanEmail = (emailToAdd || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) return false;

    const existing = (users || []).find(a => a && a.email && a.email.toLowerCase() === cleanEmail);
    const userPerms: UserPermissions = {
      ...(defaultPermissions[role] || defaultPermissions.admin),
      ...(permissions || {})
    };

    const id = existing ? existing.id : `user-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const newUser: UserRecord = {
      id,
      email: cleanEmail,
      name: name || cleanEmail.split('@')[0],
      displayName: name || cleanEmail.split('@')[0],
      role,
      isOnline: existing ? existing.isOnline : false,
      status: existing ? existing.status : 'offline',
      addedAt: existing ? existing.addedAt : new Date().toISOString(),
      lastActive: new Date().toISOString(),
      permissions: userPerms
    };

    const updated = existing ? (users || []).map(u => u.id === id ? newUser : u) : [...(users || []), newUser];
    setUsers(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}users`, JSON.stringify(updated));
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}admin_whitelist`, JSON.stringify(updated));
    }
    if (db) {
      try {
        await setDoc(doc(db, 'users', id), newUser, { merge: true });
        await setDoc(doc(db, 'settings', 'admin_whitelist'), { admins: updated }, { merge: true });
      } catch (e) {
        console.warn('Firestore user save warning:', e);
      }
    }
    addNotification({
      type: 'system',
      title: 'Admin Access Granted',
      message: `Granted Back Office access to ${cleanEmail} (${role}).`,
      actionUrl: '/admin'
    });
    return true;
  };

  const updateUser = async (id: string, updates: Partial<UserRecord>): Promise<boolean> => {
    let targetUser: UserRecord | null = null;
    const updated = (users || []).map(u => {
      if (u.id === id) {
        targetUser = { ...u, ...updates, lastActive: new Date().toISOString() };
        return targetUser;
      }
      return u;
    });
    setUsers(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}users`, JSON.stringify(updated));
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}admin_whitelist`, JSON.stringify(updated));
    }
    if (db && targetUser) {
      try {
        await setDoc(doc(db, 'users', id), targetUser, { merge: true });
        await setDoc(doc(db, 'settings', 'admin_whitelist'), { admins: updated }, { merge: true });
        
        // If updating online status for primary owner or spud, also keep settings/chat_status synchronized
        if (updates.isOnline !== undefined && ((targetUser as UserRecord).role === 'owner' || ((targetUser as UserRecord).email && (targetUser as UserRecord).email.toLowerCase() === 'piperspud@gmail.com'))) {
          setIsSpudOnlineState(updates.isOnline);
          await setDoc(doc(db, 'settings', 'chat_status'), { isSpudOnline: updates.isOnline, updatedAt: new Date().toISOString() }, { merge: true });
        }
      } catch (e) {
        console.warn('Firestore updateUser warning:', e);
      }
    }
    return true;
  };

  const updateUserPermissions = async (id: string, permissions: Partial<UserPermissions>): Promise<boolean> => {
    const target = (users || []).find(u => u && u.id === id);
    if (!target) return false;
    const newPerms: UserPermissions = { ...target.permissions, ...permissions };
    return await updateUser(id, { permissions: newPerms });
  };

  const toggleUserOnlineStatus = async (id: string, isOnline: boolean): Promise<void> => {
    await updateUser(id, { isOnline, status: isOnline ? 'online' : 'offline' });
  };

  const removeUser = async (idOrEmail: string): Promise<boolean> => {
    const clean = (idOrEmail || '').trim().toLowerCase();
    const target = (users || []).find(a => a && (a.id === idOrEmail || (a.email && a.email.toLowerCase() === clean)));
    if (target && target.email && target.email.toLowerCase() === 'piperspud@gmail.com' && target.role === 'owner') {
      return false; // Cannot delete primary owner
    }

    const updated = (users || []).filter(a => a && a.id !== idOrEmail && (!a.email || a.email.toLowerCase() !== clean));
    setUsers(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}users`, JSON.stringify(updated));
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}admin_whitelist`, JSON.stringify(updated));
    }
    if (db) {
      try {
        if (target?.id) {
          await deleteDoc(doc(db, 'users', target.id));
        }
        await setDoc(doc(db, 'settings', 'admin_whitelist'), { admins: updated }, { merge: true });
      } catch (e) {
        console.warn('Firestore user remove warning:', e);
      }
    }
    addNotification({
      type: 'system',
      title: 'Admin Access Revoked',
      message: `Revoked Back Office access for ${target?.email || idOrEmail}.`,
      actionUrl: '/admin'
    });
    return true;
  };

  const addAuthorizedAdmin = async (
    emailToAdd: string, 
    name?: string, 
    role: 'owner' | 'admin' | 'editor' = 'admin'
  ): Promise<boolean> => {
    return await addUser(emailToAdd, name, role);
  };

  const removeAuthorizedAdmin = async (idOrEmail: string): Promise<boolean> => {
    return await removeUser(idOrEmail);
  };

  // Auth functions (Live Firebase Auth + Google + Email/Password + Passcode fallback)
  const loginWithEmail = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!auth) {
      if (pass.toLowerCase() === 'spud123' || pass.toLowerCase() === 'admin') {
        setIsLegacyAdminLoggedIn(true);
        if (typeof window !== 'undefined') localStorage.setItem(`${LOCAL_STORAGE_PREFIX}admin`, 'true');
        return { success: true };
      }
      return { success: false, error: 'Firebase Auth is not configured in this environment.' };
    }
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      const userEmail = cred.user.email?.toLowerCase();
      
      // Whitelist check
      if (userEmail && !isEmailAuthorized(userEmail) && userEmail !== 'piperspud@gmail.com') {
        if (auth) await signOut(auth);
        setFirebaseUser(null);
        setIsLegacyAdminLoggedIn(false);
        if (typeof window !== 'undefined') localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}admin`);
        return { 
          success: false, 
          error: `Access Denied: ${userEmail} is not on the authorized admin list. Please contact Spud to grant access.` 
        };
      }

      setFirebaseUser(cred.user);
      setIsLegacyAdminLoggedIn(true);
      if (typeof window !== 'undefined') localStorage.setItem(`${LOCAL_STORAGE_PREFIX}admin`, 'true');
      return { success: true };
    } catch (err: any) {
      let msg = 'Invalid credentials or login error.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = 'Invalid email or password. Please check your credentials.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Access temporarily disabled due to many failed attempts. Try again later or reset password.';
      } else if (err.message) {
        msg = err.message;
      }
      return { success: false, error: msg };
    }
  };

  const registerWithEmail = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!auth) return { success: false, error: 'Firebase Auth is not configured in this environment.' };
    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      // Auto-whitelist if registered via admin
      await addAuthorizedAdmin(cleanEmail, cleanEmail.split('@')[0], 'admin');
      setFirebaseUser(cred.user);
      setIsLegacyAdminLoggedIn(true);
      if (typeof window !== 'undefined') localStorage.setItem(`${LOCAL_STORAGE_PREFIX}admin`, 'true');
      return { success: true };
    } catch (err: any) {
      let msg = 'Registration failed.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password is too weak. Please use at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      } else if (err.message) {
        msg = err.message;
      }
      return { success: false, error: msg };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    if (!auth) return { success: false, error: 'Firebase Auth is not configured in this environment.' };
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      const userEmail = cred.user.email?.toLowerCase();

      // Check if user is in whitelist
      if (userEmail && !isEmailAuthorized(userEmail) && userEmail !== 'piperspud@gmail.com') {
        if (auth) await signOut(auth);
        setFirebaseUser(null);
        setIsLegacyAdminLoggedIn(false);
        if (typeof window !== 'undefined') localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}admin`);
        return { 
          success: false, 
          error: `Access Denied: ${userEmail} is not on the authorized admin list. Please contact Spud to grant access.` 
        };
      }

      setFirebaseUser(cred.user);
      setIsLegacyAdminLoggedIn(true);
      if (typeof window !== 'undefined') localStorage.setItem(`${LOCAL_STORAGE_PREFIX}admin`, 'true');
      return { success: true };
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        return { success: false, error: 'Google sign-in popup was closed.' };
      }
      if (err.code === 'auth/unauthorized-domain') {
        return { 
          success: false, 
          error: 'Firebase (auth/unauthorized-domain): This domain/host is not in your Firebase Authorized Domains list. In Firebase Console > Authentication > Settings > Authorized Domains, add your domain (e.g., localhost, 127.0.0.1, or your live domain). You can also sign in below using Email/Password or Quick Passcode!' 
        };
      }
      return { success: false, error: err.message || 'Google sign-in failed.' };
    }
  };

  const sendPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!auth) return { success: false, error: 'Firebase Auth is not configured in this environment.' };
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { success: true };
    } catch (err: any) {
      let msg = 'Failed to send password reset email.';
      if (err.code === 'auth/user-not-found') {
        msg = 'No user found with this email address.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please provide a valid email address.';
      } else if (err.message) {
        msg = err.message;
      }
      return { success: false, error: msg };
    }
  };

  const loginAdmin = (pass: string) => {
    // Default pass: 'spud123' or 'admin'
    if (pass.toLowerCase() === 'spud123' || pass.toLowerCase() === 'admin') {
      setIsLegacyAdminLoggedIn(true);
      if (typeof window !== 'undefined') localStorage.setItem(`${LOCAL_STORAGE_PREFIX}admin`, 'true');
      return true;
    }
    return false;
  };

  const logoutAdmin = async () => {
    if (auth && firebaseUser) {
      try {
        await signOut(auth);
      } catch (e) {
        console.warn('Sign out warning:', e);
      }
    }
    setFirebaseUser(null);
    setIsLegacyAdminLoggedIn(false);
    setIsVisualEditMode(false);
    setActiveSeoDrawerPageId(null);
    if (typeof window !== 'undefined') localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}admin`);
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
    const block = Array.isArray(cmsBlocks) ? cmsBlocks.find(b => b && b.id === id) : undefined;
    return (block && block.content !== undefined) ? block.content : defaultVal;
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

    // Dispatch background Brevo email notification
    try {
      if (typeof window !== 'undefined') {
        fetch('/api/brevo/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'booking_created',
            booking: newBooking
          })
        }).catch(err => console.warn('Background Brevo notify error:', err));
      }
    } catch (e) {
      console.warn(e);
    }

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
      // Dispatch live transactional email via Brevo
      try {
        if (typeof window !== 'undefined') {
          fetch('/api/brevo/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'booking_approved',
              booking: { ...bk, status: 'approved' },
              paypalLink
            })
          }).catch(err => console.warn('Live Brevo dispatch warning:', err));
        }
      } catch (e) {
        console.warn(e);
      }

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

      // Dispatch live deposit receipt email via Brevo
      try {
        if (typeof window !== 'undefined') {
          fetch('/api/brevo/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'deposit_received',
              booking: updatedBooking
            })
          }).catch(err => console.warn('Brevo receipt dispatch warning:', err));
        }
      } catch (e) {
        console.warn(e);
      }
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

  // Live Chat & Message Center Handlers
  const setSpudOnline = (online: boolean) => {
    setIsSpudOnlineState(online);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}spud_online`, online ? 'true' : 'false');
      } catch (e) {}
    }
    
    // Update active Spud / Owner user state safely
    setUsers(prev => {
      const currentList = Array.isArray(prev) ? prev : [];
      const updated = currentList.map(u => {
        if (!u) return u;
        const uEmail = (u.email || '').toLowerCase();
        if (uEmail === 'piperspud@gmail.com' || u.role === 'owner') {
          return { ...u, isOnline: online, status: (online ? 'online' : 'offline') as 'online' | 'offline', lastActive: new Date().toISOString() };
        }
        return u;
      });
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`${LOCAL_STORAGE_PREFIX}users`, JSON.stringify(updated));
          localStorage.setItem(`${LOCAL_STORAGE_PREFIX}admin_whitelist`, JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    if (db) {
      try {
        // 1. Sync global chat status setting
        setDoc(doc(db, 'settings', 'chat_status'), { isSpudOnline: online, updatedAt: new Date().toISOString() }, { merge: true }).catch(e => console.warn(e));
        
        // 2. Sync to Spud's user doc in 'users' collection
        const currentUsers = Array.isArray(users) ? users : [];
        const spudUser = currentUsers.find(u => u && (((u.email || '').toLowerCase() === 'piperspud@gmail.com') || u.role === 'owner')) || currentUsers[0];
        const spudDocId = spudUser?.id || 'user-spud';
        setDoc(doc(db, 'users', spudDocId), { 
          isOnline: online, 
          status: online ? 'online' : 'offline', 
          lastActive: new Date().toISOString() 
        }, { merge: true }).catch(e => console.warn(e));
      } catch (e) {
        console.warn('Firestore setSpudOnline error:', e);
      }
    }
    // Note: Online/offline notifications intentionally omitted per user request
  };

  const toggleSpudOnline = () => {
    setSpudOnline(!isSpudOnline);
  };

  const addQuickResponse = (qrData: Omit<QuickResponse, 'id'>) => {
    const newQr: QuickResponse = {
      ...qrData,
      id: `qr-${Date.now()}`
    };
    const updated = [...quickResponses, newQr];
    setQuickResponses(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}quick_responses`, JSON.stringify(updated));
    }
    if (db) {
      setDoc(doc(db, 'quick_responses', newQr.id), newQr).catch(e => console.warn(e));
    }
    addNotification({
      type: 'system',
      title: 'Quick Response Added',
      message: `Canned response "${newQr.title}" saved.`,
      actionUrl: '/admin/messages'
    });
  };

  const updateQuickResponse = (id: string, updates: Partial<QuickResponse>) => {
    const updated = quickResponses.map(q => q.id === id ? { ...q, ...updates } : q);
    setQuickResponses(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}quick_responses`, JSON.stringify(updated));
    }
    if (db) {
      const target = updated.find(q => q.id === id);
      if (target) {
        setDoc(doc(db, 'quick_responses', id), target, { merge: true }).catch(e => console.warn(e));
      }
    }
  };

  const deleteQuickResponse = (id: string) => {
    const updated = quickResponses.filter(q => q.id !== id);
    setQuickResponses(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}quick_responses`, JSON.stringify(updated));
    }
    if (db) {
      deleteDoc(doc(db, 'quick_responses', id)).catch(e => console.warn(e));
    }
  };

  const sendChatMessage = (
    text: string, 
    sender: 'client' | 'spud' | 'system' = 'client',
    targetSessionId?: string,
    visitorName: string = 'Website Visitor',
    visitorEmail?: string,
    visitorPhone?: string
  ) => {
    let currentSessionId = targetSessionId || activeChatSessionId;
    if (!currentSessionId) {
      if (typeof window !== 'undefined') {
        let storedId = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}visitor_session_id`);
        if (!storedId) {
          storedId = `session-visitor-${Date.now()}`;
          localStorage.setItem(`${LOCAL_STORAGE_PREFIX}visitor_session_id`, storedId);
        }
        currentSessionId = storedId;
      } else {
        currentSessionId = `session-visitor-${Date.now()}`;
      }
    }

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender,
      senderName: sender === 'spud' ? 'Spud the Piper' : visitorName,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: sender === 'spud',
      sessionId: currentSessionId,
      visitorEmail,
      visitorPhone
    };

    const updatedMessages = [...chatMessages, newMsg];
    setChatMessages(updatedMessages);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}chat`, JSON.stringify(updatedMessages));
    }

    // Update or create corresponding session
    let sessionToSave: ChatSession | null = null;
    setChatSessions(prev => {
      const existing = prev.find(s => s.id === currentSessionId);
      if (existing) {
        const updated = prev.map(s => {
          if (s.id === currentSessionId) {
            sessionToSave = {
              ...s,
              lastMessage: text,
              lastTimestamp: 'Just now',
              isWaitingForSpud: sender === 'client',
              unreadCount: sender === 'client' ? (s.unreadCount || 0) + 1 : 0,
              visitorEmail: visitorEmail || s.visitorEmail,
              visitorPhone: visitorPhone || s.visitorPhone
            };
            return sessionToSave;
          }
          return s;
        });
        return updated;
      } else {
        sessionToSave = {
          id: currentSessionId,
          visitorName,
          visitorEmail,
          visitorPhone,
          lastMessage: text,
          lastTimestamp: 'Just now',
          unreadCount: sender === 'client' ? 1 : 0,
          isWaitingForSpud: sender === 'client',
          status: 'active',
          activePage: 'Website Live Chat',
          ipOrLocation: 'Scotland / Worldwide',
          device: typeof navigator !== 'undefined' ? (navigator.userAgent.includes('Mobile') ? 'Mobile Phone' : 'Desktop Browser') : 'Online Visitor',
          createdAt: new Date().toISOString()
        };
        return [sessionToSave, ...prev];
      }
    });

    // Cloud Firestore synchronization
    syncToFirestore('chat_messages', newMsg.id, newMsg).catch(e => console.warn(e));
    if (sessionToSave) {
      syncToFirestore('chat_sessions', currentSessionId, sessionToSave).catch(e => console.warn(e));
    }

    if (sender === 'client') {
      addNotification({
        type: 'chat_message',
        title: `Live Chat from ${visitorName}`,
        message: `"${text.length > 40 ? text.slice(0, 40) + '...' : text}"`,
        actionUrl: '/admin/messages',
        relatedId: currentSessionId
      });

      // Dispatch instant Brevo alert to Spud@spudthepiper.com
      if (typeof window !== 'undefined') {
        fetch('/api/brevo/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'admin_chat_alert',
            name: visitorName,
            recipientEmail: visitorEmail,
            visitorPhone,
            messageContent: text
          })
        }).catch(err => console.warn('Brevo admin chat alert error:', err));
      }

      // If Spud is offline, post an immediate courteous system reply
      if (!isSpudOnline) {
        setTimeout(() => {
          const offlineBotMsg: ChatMessage = {
            id: `msg-${Date.now() + 1}`,
            sender: 'system',
            senderName: 'Spud the Piper (Away Notice)',
            text: `Failte! Spud is currently away performing at a Highland venue or event. Your question has been delivered to his Live Message Center. If you would like an email reply, please use the "Email Us / Leave Question" tab!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isRead: false,
            sessionId: currentSessionId
          };
          setChatMessages(c => [...c, offlineBotMsg]);
          syncToFirestore('chat_messages', offlineBotMsg.id, offlineBotMsg).catch(e => console.warn(e));
        }, 800);
      } else {
        // Auto-reply assistant if Spud is online but hasn't picked up after 1.5s
        setTimeout(() => {
          const autoReplies: { [key: string]: string } = {
            wedding: 'Aye! Spud specializes in wedding ceremonies, greeting guests at castle gates, and piping the top table into the reception. Check our Booking Diary to view available dates!',
            price: 'Typical rates range from £220 for memorial laments to £450 - £650 for full wedding and castle events, depending on location and duration. You can use our instant quote calculator on the booking page!',
            tartan: 'Spud can perform in Full No. 1 Dress with Feather Bonnet, Royal Stewart Tartan, Black Watch Military, or Modern Highland Tweed. You can preview all tartans in our Attire Selector!',
            tune: 'Spud plays all classic Highland bagpipe tunes including Highland Cathedral, Scotland the Brave, Flower of Scotland, and Amazing Grace. Feel free to use the audio jukebox on our site to preview them!'
          };

          const lower = text.toLowerCase();
          let replyText = 'Thanks for your message! Spud will reply to your conversation directly in a moment. You can also call or WhatsApp Spud directly on 07793 491367.';
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
            sessionId: currentSessionId
          };
          setChatMessages(c => [...c, botMsg]);
          syncToFirestore('chat_messages', botMsg.id, botMsg).catch(e => console.warn(e));
        }, 1500);
      }
    }
  };

  const submitOfflineInquiry = (inquiry: {
    name: string;
    email: string;
    phone?: string;
    eventDate?: string;
    eventType?: string;
    question: string;
  }) => {
    const sessionId = `session-inquiry-${Date.now()}`;
    const newSession: ChatSession = {
      id: sessionId,
      visitorName: `${inquiry.name} (Offline Inquiry)`,
      visitorEmail: inquiry.email,
      visitorPhone: inquiry.phone,
      lastMessage: inquiry.question,
      lastTimestamp: 'Just now',
      unreadCount: 1,
      isWaitingForSpud: true,
      status: 'offline_inquiry',
      activePage: 'Offline Question Form',
      ipOrLocation: 'Direct Email Inquiry',
      device: typeof navigator !== 'undefined' ? (navigator.userAgent.includes('Mobile') ? 'Mobile Phone' : 'Desktop') : 'Website Inquiry',
      createdAt: new Date().toISOString(),
      eventType: inquiry.eventType || 'General Inquiry',
      eventDate: inquiry.eventDate
    };

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'client',
      senderName: inquiry.name,
      text: `OFFLINE INQUIRY: ${inquiry.question} ${inquiry.eventDate ? `[Date: ${inquiry.eventDate}]` : ''} ${inquiry.eventType ? `[Type: ${inquiry.eventType}]` : ''} [Reply to: ${inquiry.email}]`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      sessionId,
      visitorEmail: inquiry.email,
      visitorPhone: inquiry.phone
    };

    const updatedSessions = [newSession, ...chatSessions];
    const updatedMessages = [...chatMessages, newMsg];

    setChatSessions(updatedSessions);
    setChatMessages(updatedMessages);

    if (typeof window !== 'undefined') {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}chat_sessions`, JSON.stringify(updatedSessions));
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}chat`, JSON.stringify(updatedMessages));
    }

    // Sync to Cloud Firestore
    syncToFirestore('chat_sessions', sessionId, newSession).catch(e => console.warn(e));
    syncToFirestore('chat_messages', newMsg.id, newMsg).catch(e => console.warn(e));

    // Capture into mailing list contacts
    addMailingContact({
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      source: 'enquiry',
      status: 'subscribed',
      tags: ['LiveChat', 'OfflineInquiry', inquiry.eventType || 'General'],
      eventType: inquiry.eventType,
      eventDate: inquiry.eventDate,
      addedAt: new Date().toISOString().split('T')[0],
      brevoSynced: false,
      notes: `Offline Question: "${inquiry.question}"`
    });

    addNotification({
      type: 'chat_message',
      title: 'New Offline Inquiry Received',
      message: `${inquiry.name} asked: "${inquiry.question.slice(0, 45)}..."`,
      actionUrl: '/admin/messages',
      relatedId: sessionId
    });

    // Dispatch instant Brevo alert to Spud@spudthepiper.com
    if (typeof window !== 'undefined') {
      fetch('/api/brevo/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'admin_inquiry_alert',
          name: inquiry.name,
          recipientEmail: inquiry.email,
          visitorPhone: inquiry.phone,
          eventType: inquiry.eventType,
          eventDate: inquiry.eventDate,
          originalQuestion: inquiry.question,
          messageContent: inquiry.question
        })
      }).catch(err => console.warn('Brevo admin inquiry alert error:', err));
    }
  };

  const markChatAsRead = (sessionId?: string) => {
    const targetSessionId = sessionId || activeChatSessionId;
    setChatMessages(prev => {
      const hasUnread = prev.some(m => (!targetSessionId || m.sessionId === targetSessionId) && !m.isRead);
      if (!hasUnread) return prev;
      return prev.map(m => {
        if (!targetSessionId || m.sessionId === targetSessionId) {
          return { ...m, isRead: true };
        }
        return m;
      });
    });

    setChatSessions(prev => {
      const hasUnread = prev.some(s => (!targetSessionId || s.id === targetSessionId) && s.unreadCount > 0);
      if (!hasUnread) return prev;
      return prev.map(s => {
        if (!targetSessionId || s.id === targetSessionId) {
          return { ...s, unreadCount: 0 };
        }
        return s;
      });
    });

    if (targetSessionId && db) {
      setDoc(doc(db, 'chat_sessions', targetSessionId), { unreadCount: 0, isWaitingForSpud: false }, { merge: true }).catch(e => console.warn(e));
    }
  };

  const markSessionResolved = (sessionId: string) => {
    setChatSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        return { ...s, status: 'resolved', isWaitingForSpud: false, unreadCount: 0 };
      }
      return s;
    }));

    if (sessionId && db) {
      setDoc(doc(db, 'chat_sessions', sessionId), { status: 'resolved', isWaitingForSpud: false, unreadCount: 0 }, { merge: true }).catch(e => console.warn(e));
    }

    addNotification({
      type: 'system',
      title: 'Chat Session Resolved',
      message: `Conversation has been marked as completed.`,
      actionUrl: '/admin/messages'
    });
  };

  const deleteChatSession = (sessionId: string) => {
    setChatSessions(prev => {
      const remaining = prev.filter(s => s.id !== sessionId);
      if (activeChatSessionId === sessionId) {
        setActiveChatSessionId(remaining.length > 0 ? remaining[0].id : '');
      }
      return remaining;
    });
    setChatMessages(prev => prev.filter(m => m.sessionId !== sessionId));

    if (sessionId && db) {
      deleteDoc(doc(db, 'chat_sessions', sessionId)).catch(e => console.warn(e));
    }
  };

  const clearAllChatHistory = () => {
    chatSessions.forEach(s => {
      if (s && s.id) deleteFromFirestore('chat_sessions', s.id).catch(e => console.warn(e));
    });
    chatMessages.forEach(m => {
      if (m && m.id) deleteFromFirestore('chat_messages', m.id).catch(e => console.warn(e));
    });

    setChatSessions([]);
    setChatMessages([]);
    setActiveChatSessionId('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}chat`);
      localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}chat_sessions`);
    }
    addNotification({
      type: 'system',
      title: 'Chat History Cleared',
      message: 'All test chat messages and sessions have been reset for live testing.',
      actionUrl: '/admin/messages'
    });
  };

  // Audio Bagpipe Player & Tune Manager
  const playTune = (titleOrId: string) => {
    const targetQuery = (titleOrId || '').toLowerCase();
    const tune = (tunesList || []).find(t => 
      t && (t.id === titleOrId || (t.title && t.title.toLowerCase() === targetQuery))
    );
    
    // Stop any existing audio or synth first
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      audioPlayerRef.current = null;
    }
    if (bagpipeSynth) {
      bagpipeSynth.stop();
    }

    // If the tune has an audio track URL, stream the authentic audio recording
    if (tune && tune.audioUrl && tune.audioUrl.trim().length > 0) {
      try {
        const audio = new Audio(tune.audioUrl);
        audioPlayerRef.current = audio;
        audio.onended = () => {
          setCurrentPlayingTune(null);
        };
        audio.onerror = (e) => {
          console.warn('Real audio playback error, falling back to synthesizer:', e);
          if (bagpipeSynth) {
            bagpipeSynth.playTune(tune.title, () => setCurrentPlayingTune(null));
          }
        };
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setCurrentPlayingTune(tune.title);
            })
            .catch(err => {
              console.warn('Audio autoplay/play promise error:', err);
              if (bagpipeSynth) {
                bagpipeSynth.playTune(tune.title, () => setCurrentPlayingTune(null));
                setCurrentPlayingTune(tune.title);
              }
            });
        }
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

  const playSampleTune = () => {
    // 1. Find all tunes that have real audio uploaded in Firebase Storage
    const storageTunes = tunesList.filter(t => t.audioUrl && t.audioUrl.trim().length > 0);
    
    if (storageTunes.length > 0) {
      // Pick a random real audio track from Firebase Storage
      const randomTune = storageTunes[Math.floor(Math.random() * storageTunes.length)];
      playTune(randomTune.title);
    } else {
      // Fallback to iconic Highland Cathedral
      playTune('Highland Cathedral');
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
          canonicalUrl: `https://www.spudthepiper.com/${pageId}`,
          ogImage: 'https://www.spudthepiper.com/og-image.png',
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

      // 11. Sync Users Collection
      const usersToSync = users && users.length > 0 ? users : initialUsers;
      for (const u of usersToSync) {
        await setDoc(doc(db, 'users', u.id), JSON.parse(JSON.stringify(u)), { merge: true });
        totalSynced++;
      }

      // 12. Sync Admin Whitelist Settings Doc
      await setDoc(doc(db, 'settings', 'admin_whitelist'), { admins: usersToSync }, { merge: true });
      totalSynced++;

      // 13. Sync Chat Status Setting
      await setDoc(doc(db, 'settings', 'chat_status'), { isSpudOnline, updatedAt: new Date().toISOString() }, { merge: true });
      totalSynced++;

      // 14. Sync Chat Sessions & Messages
      for (const session of chatSessions) {
        if (session && session.id) {
          await setDoc(doc(db, 'chat_sessions', session.id), JSON.parse(JSON.stringify(session)), { merge: true });
          totalSynced++;
        }
      }
      for (const msg of chatMessages) {
        if (msg && msg.id) {
          await setDoc(doc(db, 'chat_messages', msg.id), JSON.parse(JSON.stringify(msg)), { merge: true });
          totalSynced++;
        }
      }

      console.log(`[Firestore SUCCESS] Full Cloud Sync Complete: ${totalSynced} documents verified in Firestore!`);
      addNotification({
        type: 'system',
        title: 'Firebase Firestore Fully Synced',
        message: `Successfully synchronized ${totalSynced} items across all collections (users, services, travel_config, seo_pages, bagpipe_tunes, cms_blocks, bookings, reviews, etc.) to Firebase!`,
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

  // Public Pricing & POA Config Handler
  const updatePricingConfig = async (newConfig: Partial<PricingConfig>) => {
    const updated: PricingConfig = { ...pricingConfig, ...newConfig };
    setPricingConfig(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}pricing_config`, JSON.stringify(updated));
    }
    if (db) {
      try {
        await setDoc(doc(db, 'settings', 'pricing_config'), updated, { merge: true });
      } catch (e) {
        console.warn('Firestore updatePricingConfig warning:', e);
      }
    }
    addNotification({
      type: 'system',
      title: updated.hidePrices ? 'Price on Application (POA) Mode Enabled' : 'Public Fixed Prices Mode Enabled',
      message: updated.hidePrices 
        ? `Website is now displaying "${updated.poaLabel}" on all services and booking calendar.` 
        : `Fixed service prices are now displayed publicly.`,
      actionUrl: '/admin'
    });
  };

  // Mailing List Handlers
  const addMailingContact = (contactData: Omit<MailingContact, 'id'>) => {
    const id = `mc-${Date.now().toString().slice(-6)}`;
    const newContact: MailingContact = {
      ...contactData,
      id,
      addedAt: contactData.addedAt || new Date().toISOString(),
      brevoSynced: true
    };
    setMailingContacts(prev => {
      const exists = prev.find(c => c.email.toLowerCase() === newContact.email.toLowerCase());
      if (exists) {
        return prev.map(c => c.email.toLowerCase() === newContact.email.toLowerCase() ? { ...c, ...newContact } : c);
      }
      const updated = [newContact, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}mailing_contacts`, JSON.stringify(updated));
      }
      return updated;
    });
    syncToFirestore('mailing_contacts', id, newContact);
    return newContact;
  };

  const removeMailingContact = (id: string) => {
    setMailingContacts(prev => {
      const updated = prev.filter(c => c.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}mailing_contacts`, JSON.stringify(updated));
      }
      return updated;
    });
    if (db) {
      deleteDoc(doc(db, 'mailing_contacts', id)).catch(e => console.warn(e));
    }
  };

  const updateMailingContact = async (id: string, updated: Partial<MailingContact>) => {
    let fullContact: MailingContact | null = null;
    setMailingContacts(prev => {
      const next = prev.map(c => {
        if (c.id === id) {
          fullContact = { ...c, ...updated };
          return fullContact;
        }
        return c;
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}mailing_contacts`, JSON.stringify(next));
      }
      return next;
    });
    if (db && fullContact) {
      await setDoc(doc(db, 'mailing_contacts', id), fullContact, { merge: true }).catch(e => console.warn(e));
    }
  };

  const saveEmailCampaign = async (campaign: EmailCampaign) => {
    setEmailCampaigns(prev => {
      const exists = prev.some(c => c.id === campaign.id);
      const updated = exists ? prev.map(c => c.id === campaign.id ? campaign : c) : [campaign, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}campaigns`, JSON.stringify(updated));
      }
      return updated;
    });
    if (db) {
      await setDoc(doc(db, 'email_campaigns', campaign.id), campaign, { merge: true }).catch(e => console.warn(e));
    }
  };

  const dispatchBroadcastCampaign = async (campaign: EmailCampaign, recipients: MailingContact[]) => {
    try {
      const res = await fetch('/api/brevo/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign, recipients })
      });
      const data = await res.json();
      if (data?.success) {
        const updatedCamp: EmailCampaign = {
          ...campaign,
          status: 'sent',
          sentAt: new Date().toISOString(),
          recipientCount: data.sentCount || recipients.length
        };
        saveEmailCampaign(updatedCamp);
        addNotification({
          type: 'system',
          title: 'Seasonal Broadcast Dispatched via Brevo',
          message: `Campaign "${campaign.title}" successfully sent to ${data.sentCount || recipients.length} clients!`,
          actionUrl: '/admin'
        });
      }
      return data;
    } catch (err: any) {
      console.error('Dispatch campaign failed:', err);
      return { success: false, error: err?.message };
    }
  };

  // FAQ Handlers (Firestore Synced)
  const addFaq = async (faqData: Omit<FaqItem, 'id'>) => {
    const id = `faq-${Date.now()}`;
    const newFaq: FaqItem = {
      ...faqData,
      id,
      order: faqData.order ?? (faqs.length + 1),
      showOnHome: faqData.showOnHome ?? true,
      updatedAt: new Date().toISOString()
    };
    setFaqs(prev => {
      const updated = [...prev, newFaq];
      if (typeof window !== 'undefined') {
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}faqs`, JSON.stringify(updated));
      }
      return updated;
    });
    await syncToFirestore('faqs', id, newFaq);
    addNotification({
      type: 'system',
      title: 'New FAQ Question Published',
      message: `Added: "${newFaq.question.slice(0, 45)}..."`,
      actionUrl: '/admin'
    });
  };

  const updateFaq = async (id: string, updates: Partial<FaqItem>) => {
    let targetFaq: FaqItem | null = null;
    setFaqs(prev => {
      const updated = prev.map(f => {
        if (f.id === id) {
          targetFaq = { ...f, ...updates, updatedAt: new Date().toISOString() };
          return targetFaq;
        }
        return f;
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}faqs`, JSON.stringify(updated));
      }
      return updated;
    });
    if (targetFaq) {
      await syncToFirestore('faqs', id, targetFaq);
    }
  };

  const deleteFaq = async (id: string) => {
    setFaqs(prev => {
      const updated = prev.filter(f => f.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}faqs`, JSON.stringify(updated));
      }
      return updated;
    });
    await deleteFromFirestore('faqs', id);
  };

  const reorderFaqs = async (newOrderedList: FaqItem[]) => {
    const updated = newOrderedList.map((f, idx) => ({ ...f, order: idx + 1 }));
    setFaqs(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}faqs`, JSON.stringify(updated));
    }
    if (db) {
      for (const f of updated) {
        await syncToFirestore('faqs', f.id, f);
      }
    }
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

  const setShowLiveStream = (show: boolean) => {
    setShowLiveStreamState(show);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}show_livestream`, show ? 'true' : 'false');
    }
    if (db) {
      setDoc(doc(db, 'settings', 'livestream'), { showLiveStream: show }, { merge: true }).catch(e => console.warn(e));
    }
  };

  const toggleLiveStream = () => {
    setShowLiveStream(!showLiveStream);
  };

  const unreadNotifCount = (notifications || []).filter(n => n && !n.isRead).length;
  const unreadChatCount = (chatMessages || []).filter(m => m && !m.isRead && m.sender !== 'spud').length;

  return (
    <AppContext.Provider value={{
      isMounted,
      isAdminLoggedIn,
      firebaseUser,
      users,
      adminWhitelist,
      addUser,
      updateUser,
      updateUserPermissions,
      toggleUserOnlineStatus,
      removeUser,
      addAuthorizedAdmin,
      removeAuthorizedAdmin,
      isEmailAuthorized,
      loginWithEmail,
      registerWithEmail,
      loginWithGoogle,
      sendPasswordReset,
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
      pricingConfig,
      updatePricingConfig,
      mailingContacts,
      emailCampaigns,
      addMailingContact,
      removeMailingContact,
      updateMailingContact,
      saveEmailCampaign,
      dispatchBroadcastCampaign,
      showLiveStream,
      toggleLiveStream,
      setShowLiveStream,
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
      
      // Live Chat & Message Center
      isSpudOnline,
      toggleSpudOnline,
      setSpudOnline,
      quickResponses,
      addQuickResponse,
      updateQuickResponse,
      deleteQuickResponse,
      chatSessions,
      activeChatSessionId,
      setActiveChatSessionId,
      chatMessages,
      sendChatMessage,
      submitOfflineInquiry,
      markChatAsRead,
      markSessionResolved,
      deleteChatSession,
      clearAllChatHistory,
      waitingChatSessionsCount: chatSessions.filter(s => s.isWaitingForSpud).length,
      unreadChatCount,

      currentPlayingTune,
      playTune,
      playSampleTune,
      stopTune,
      tunesList,
      addTune,
      updateTune,
      deleteTune,
      notifications,
      unreadNotifCount,
      markNotifAsRead,
      clearAllNotifs,
      deleteNotification,
      addNotification,
      testDeviceNotificationAlert,
      requestNotificationPermission,
      seoPages,
      seoConfig,
      getSeoForPage,
      updatePageSeo,
      updateSeoConfig,
      activeSeoDrawerPageId,
      openSeoDrawer,
      closeSeoDrawer,
      faqs,
      addFaq,
      updateFaq,
      deleteFaq,
      reorderFaqs,
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
