export type BookingStatus = 'pending' | 'approved' | 'deposit_paid' | 'completed' | 'cancelled';

export type EventType = 
  | 'Wedding Ceremony & Reception'
  | 'Wedding Ceremony Only'
  | 'Funeral / Memorial Service'
  | 'Burns Supper / Hogmanay'
  | 'Corporate / Castle Event'
  | 'Birthday / Private Party'
  | 'Highland Bagpipe Experience (Hands-On Workshop / Airbnb)'
  | 'Bagpipe Tuition / Lesson';

export type HighlandDressOption = 
  | 'Full No. 1 Dress (Feather Bonnet & Plaid)'
  | 'Royal Stewart Tartan (Traditional Red)'
  | 'Black Watch Tartan (Military Green/Blue)'
  | 'Modern Day Highland Tweed Jacket'
  | 'Isle of Skye Tartan (Purple/Heather/Green)';

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
  paypalOrderId?: string;
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

export interface ChatMessage {
  id: string;
  sender: 'client' | 'spud' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  sessionId: string;
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
  category: 'Wedding' | 'Lament / Funeral' | 'Celebration / March' | 'Traditional Scottish';
  description: string;
  duration: string;
  audioNotes?: number[]; // frequencies or midi steps for WebAudio bagpipe synth
  audioUrl?: string; // High-res MP3/WAV/audio recording URL or uploaded base64
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


