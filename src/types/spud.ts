export type BookingStatus = 'pending' | 'approved' | 'deposit_paid' | 'completed' | 'cancelled';

export type EventType = 
  | 'Wedding Ceremony & Reception'
  | 'Wedding Ceremony Only'
  | 'Funeral / Memorial Service'
  | 'Burns Supper / Hogmanay'
  | 'Corporate / Castle Event'
  | 'Birthday / Private Party'
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
