export type BookingStatus = 'pending' | 'approved' | 'deposit_paid' | 'completed' | 'cancelled';

export type EventType = string;

export type HighlandDressOption = 
  | 'Full No. 1 Dress (Feather Bonnet & Plaid)'
  | 'Royal Stewart Tartan (Traditional Red)'
  | 'Black Watch Tartan (Military Green/Blue)'
  | 'Modern Day Highland Tweed Jacket'
  | 'Isle of Skye Tartan (Purple/Heather/Green)';

export interface BookingAuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string; // e.g. "Spud (Admin)" | "Client (Website)" | "System / PayPal"
  details?: string;
  type?: 'system' | 'status_change' | 'price_adjustment' | 'message_sent' | 'surcharge_adjusted' | 'note_added';
}

export interface BookingMessage {
  id: string;
  timestamp: string;
  sender: 'spud' | 'client' | 'admin' | 'system';
  senderName: string;
  channel: 'email' | 'chat' | 'sms' | 'portal';
  subject?: string;
  body: string;
  status?: 'queued' | 'sent' | 'delivered' | 'read';
}

export interface BookingEvent {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  eventType: EventType;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "13:00 - 15:30"
  venueName: string;
  venueAddress: string;
  venuePostcode: string;
  tartanChoice: HighlandDressOption;
  estimatedPrice: number;
  depositAmount: number;
  status: BookingStatus;
  specialTunes: string[];
  notes?: string;
  createdAt: string;
  approvedAt?: string;
  depositPaidAt?: string;
  depositAmountPaid?: number;
  depositPaymentMethod?: string;
  paypalOrderId?: string;
  depositPayerEmail?: string;
  remainingBalance?: number;
  remainingBalancePaid?: boolean;
  remainingBalancePaidAt?: string;
  remainingBalancePaymentMethod?: string;
  remainingBalanceTransactionId?: string;
  balanceDueDate?: string;
  sevenDayReminderSent?: boolean;
  sevenDayReminderSentAt?: string;
  oneDayReminderSent?: boolean;
  oneDayReminderSentAt?: string;
  spudSevenDayAlertSent?: boolean;
  spudSevenDayAlertSentAt?: string;
  spudOneDayAlertSent?: boolean;
  spudOneDayAlertSentAt?: string;
  brevoEmailSent: boolean;
  brevoEmailHistory?: {
    type: string;
    sentAt: string;
    status: 'delivered' | 'opened' | 'clicked';
    paypalLink?: string;
  }[];
  // Travel & Distance Expense Breakdown
  distanceMiles?: number;
  travelExpense?: number;
  isOvernightRequired?: boolean;
  overnightExpense?: number;
  isOverseasOrCustomQuote?: boolean;
  travelBreakdownText?: string;
  preferredContactMethod?: 'email' | 'telephone';
  // Comprehensive Back Office Management & Audit Log
  auditTrail?: BookingAuditEntry[];
  messages?: BookingMessage[];
  adminNotes?: string;
  travelWaived?: boolean;
  customSurcharge?: number;
  customSurchargeReason?: string;
  discountAmount?: number;
  discountReason?: string;
  declineReason?: string;
  basePackagePrice?: number;
}

export interface CustomTravelZone {
  id: string;
  name: string;
  minMiles: number;
  maxMiles: number;
  ratePerMile?: number; // optional custom per mile rate
  fixedSurcharge?: number; // optional fixed zone surcharge
  enableOvernight?: boolean;
  overnightFee?: number;
  color?: string; // e.g. '#a855f7', '#ec4899', '#06b6d4'
  description?: string;
}

export interface TravelExpensesConfig {
  baseLocationName: string; // e.g. "Spud's Highland Home Base (Aviemore)"
  publicBaseDisplay: string; // e.g. "Aviemore, Highlands" (publicly visible)
  exactAddressPrivate?: string; // Private admin reference (never shown to public)
  basePostcode: string; // e.g. "PH22 1UJ" (used for backend distance calculations)
  baseLatitude: number; // e.g. 57.1955
  baseLongitude: number; // e.g. -3.8350
  freeRadiusMiles: number; // e.g. 50 miles free travel
  costPerMileAboveFree: number; // e.g. £0.65 per mile
  chargeType: 'one_way' | 'return'; // standard 'return' (round trip)
  overnightThresholdMiles: number; // e.g. 120 miles
  overnightFee: number; // e.g. £120.00 accommodation fee
  enableOvernightStay: boolean;
  customZones?: CustomTravelZone[]; // Dynamic intermediate zones (e.g. Zone 4 between Zone 3 & Max Safeguard)
  maxBookingRadiusMiles: number; // e.g. 250 miles
  islandFerrySurcharge: number; // e.g. £85.00
  overseasEnquiryOnly: boolean; // convert >maxRadius or non-UK to bespoke enquiry
  customTravelNotes?: string;
}

export interface Review {
  id: string;
  authorName: string;
  eventType: string;
  rating: number; // 1 to 5
  date: string;
  comment: string;
  photoUrl?: string;
  status: 'approved' | 'pending' | 'rejected';
  isFeatured: boolean;
  location?: string;
}

export interface ForumCategoryItem {
  id: string;
  topicName: string;
  title: string;
  description: string;
  iconName?: string;
  accentBadge?: string;
  isCustom?: boolean;
  createdAt?: string;
}

export interface SocialPost {
  id: string;
  postType?: 'feed' | 'forum';
  title?: string;
  authorName: string;
  authorRole: 'Spud the Piper' | 'Client' | 'Guest' | 'Bride/Groom' | 'Student';
  authorAvatar?: string;
  content: string;
  imageUrl?: string;
  eventLocation?: string;
  region?: string;
  category?: 'Weddings' | 'Castle Galas' | 'Tune Requests' | 'Highland Stories' | 'Tuition & Tips';
  forumTopic?: string;
  tunePlayed?: string;
  tags?: string[];
  likes: number;
  likedByMe?: boolean;
  comments: {
    id: string;
    authorName: string;
    authorRole?: string;
    content: string;
    createdAt: string;
  }[];
  timestamp: string;
  isPinned?: boolean;
}

export interface QuickResponse {
  id: string;
  category: 'Weddings' | 'Pricing' | 'Travel' | 'Attire' | 'Tunes' | 'Booking' | 'General';
  title: string;
  text: string;
}

export interface ChatSession {
  id: string;
  visitorName: string;
  visitorEmail?: string;
  visitorPhone?: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
  isWaitingForSpud: boolean;
  status: 'active' | 'waiting' | 'offline_inquiry' | 'resolved';
  activePage?: string;
  ipOrLocation?: string;
  device?: string;
  createdAt: string;
  eventType?: string;
  eventDate?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'client' | 'spud' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  sessionId: string;
  visitorEmail?: string;
  visitorPhone?: string;
}

export interface NotificationItem {
  id: string;
  type: 'booking_request' | 'deposit_paid' | 'new_review' | 'chat_message' | 'gig_reminder' | 'tune_added' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  relatedId?: string;
}

export interface EditableCmsBlock {
  id: string;
  page: string;
  section: string;
  tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'button' | 'image' | 'blockquote' | 'a' | 'div';
  label: string;
  content: string;
  altText?: string;
  imageUrl?: string;
  linkUrl?: string;
  buttonColor?: string;
  imageFit?: 'cover' | 'contain' | 'fill' | 'none';
  imagePositionX?: number; // 0 to 100 (%) default 50
  imagePositionY?: number; // 0 to 100 (%) default 50
  imageScale?: number; // 0.5 to 3.0 (default 1.0)
  lastUpdated?: string;
}

export interface BagpipeTune {
  id: string;
  title: string;
  category: string;
  weddingMoment?: string;
  description: string;
  funFact?: string;
  instrumentRecommended?: string;
  tempo?: string;
  duration: string;
  audioNotes?: number[];
  audioUrl?: string;
  isPopular?: boolean;
  showOnHomePage?: boolean;
}

export interface SeoPageConfig {
  pageId: string;
  pageName: string;
  path: string;
  title: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl: string;
  ogImage: string;
  h1: string;
  schemaType: string;
  customSchemaJson?: string;
}

export interface SocialMediaLinks {
  facebook: string;
  twitter: string; // X
  pinterest: string;
  instagram: string;
  linkedin: string;
  tiktok: string;
  trustpilot: string;
  hiddenPlatforms?: {
    facebook?: boolean;
    twitter?: boolean;
    pinterest?: boolean;
    instagram?: boolean;
    linkedin?: boolean;
    tiktok?: boolean;
    trustpilot?: boolean;
  };
}

export interface PricingConfig {
  hidePrices: boolean; // if true, hide fixed prices site-wide and show Price on Application
  poaLabel: string; // e.g. "Price on Application", "Bespoke Quote on Request"
  poaDescription: string; // explanation shown on booking and service pages
}

export interface ServiceItineraryStep {
  stepOrTime: string;
  title: string;
  description: string;
}

export interface ServicePackage {
  id: string;
  slug: string;
  icon: string; // e.g. 'Heart', 'Sparkles', 'Flame', 'Castle', 'GraduationCap', 'Users'
  title: string;
  tagline: string;
  priceEstimate: string;
  basePrice: number;
  depositAmount: number;
  deposit: string;
  popularBadge?: boolean;
  badgeText?: string;
  heroImage?: string;
  description: string;
  fullDescription: string;
  features: string[];
  itinerary?: ServiceItineraryStep[];
  galleryImages?: string[];
  recommendedTunes?: string[];
  faqs?: { question: string; answer: string }[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  isCustom?: boolean;
  createdAt?: string;
}

export interface MailingContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  source: 'booking' | 'enquiry' | 'newsletter' | 'manual';
  status: 'subscribed' | 'unsubscribed';
  tags: string[];
  eventType?: string;
  eventDate?: string;
  venueName?: string;
  location?: string;
  addedAt: string;
  brevoSynced: boolean;
  notes?: string;
}

export interface EmailCampaign {
  id: string;
  title: string;
  subject: string;
  previewText?: string;
  heading: string;
  bodyContent: string;
  ctaText?: string;
  ctaUrl?: string;
  segment: 'all' | 'bookings_only' | 'enquiries_only' | 'weddings' | 'corporate' | 'subscribers';
  status: 'draft' | 'sent';
  sentAt?: string;
  recipientCount?: number;
  templateType: 'christmas' | 'burns_night' | 'anniversary' | 'custom';
}

export interface UserPermissions {
  canManageBookings: boolean;
  canEditTunes: boolean;
  canEditCms: boolean;
  canManageSecurity: boolean;
  canChat: boolean;
}

export interface UserRecord {
  id: string;
  uid?: string;
  email: string;
  name?: string;
  displayName?: string;
  role: 'owner' | 'admin' | 'editor';
  isOnline: boolean;
  status: 'online' | 'offline' | 'away';
  lastActive?: string;
  addedAt: string;
  lastLogin?: string;
  avatarUrl?: string;
  permissions: UserPermissions;
}

export type AdminUserRecord = UserRecord;

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  showOnHome?: boolean;
  order?: number;
  updatedAt?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  martOrVenueName: string;
  eventType: string;
  location: string;
  description: string;
  date: string;
  imageUrl: string;
  isFeatured?: boolean;
  likes?: number;
  createdAt?: string;
}

export interface PartnerItem {
  id: string;
  name: string;
  tagline: string;
  category: 'Highland Attire & Kilts' | 'Scottish Community & Apps' | 'Estate & Geospatial Tech' | 'Castles & Historic Venues' | 'Wedding Suppliers & Film';
  description: string;
  websiteUrl: string;
  logoUrl?: string;
  heroImageUrl?: string;
  location: string;
  badge?: string;
  specialPerk?: string;
  isFeatured?: boolean;
  reciprocalBacklink?: boolean;
  tags: string[];
}



