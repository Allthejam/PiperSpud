import { 
  BookingEvent, 
  Review, 
  SocialPost, 
  ChatMessage, 
  NotificationItem, 
  EditableCmsBlock, 
  BagpipeTune,
  SeoPageConfig,
  ForumCategoryItem,
  SocialMediaLinks,
  ServicePackage,
  TravelExpensesConfig
} from '@/types/spud';

export const initialBookings: BookingEvent[] = [
  {
    id: 'spud-bk-101',
    clientName: 'Fiona & Callum MacGregor',
    clientEmail: 'fiona.macgregor@scotmail.com',
    clientPhone: '07798 123456',
    eventType: 'Wedding Ceremony & Reception',
    date: '2026-09-26',
    timeSlot: '13:30 - 17:00',
    venueName: 'Dundas Castle, South Queensferry',
    venueAddress: 'South Queensferry, Edinburgh',
    venuePostcode: 'EH30 9SP',
    tartanChoice: 'Full No. 1 Dress (Feather Bonnet & Plaid)',
    estimatedPrice: 480,
    depositAmount: 100,
    status: 'deposit_paid',
    specialTunes: ['Highland Cathedral', 'Scotland the Brave', 'Mairi\'s Wedding'],
    notes: 'Piping bride down aisle, playing outside church during photos, and piping top table into wedding breakfast.',
    createdAt: '2026-08-10T11:20:00Z',
    approvedAt: '2026-08-10T14:15:00Z',
    depositPaidAt: '2026-08-11T09:40:00Z',
    paypalOrderId: 'PP-ORD-8829104',
    brevoEmailSent: true,
    brevoEmailHistory: [
      {
        type: 'Booking Approved + PayPal Deposit Invoice',
        sentAt: '2026-08-10T14:15:00Z',
        status: 'opened',
        paypalLink: 'https://www.paypal.com/checkout/spudthepiper/dep-101'
      },
      {
        type: 'Deposit Confirmation & Receipt',
        sentAt: '2026-08-11T09:40:00Z',
        status: 'delivered'
      }
    ]
  },
  {
    id: 'spud-bk-102',
    clientName: 'Lord Alistair Campbell',
    clientEmail: 'campbell.estates@inveraray.scot',
    clientPhone: '07812 345678',
    eventType: 'Corporate / Castle Event',
    date: '2026-10-03',
    timeSlot: '18:00 - 21:00',
    venueName: 'Edinburgh Castle Great Hall',
    venueAddress: 'Castlehill, Edinburgh',
    venuePostcode: 'EH1 2NG',
    tartanChoice: 'Royal Stewart Tartan (Traditional Red)',
    estimatedPrice: 650,
    depositAmount: 150,
    status: 'approved',
    specialTunes: ['Flower of Scotland', 'Black Bear', 'Highland Laddie'],
    notes: 'International VIP delegates gala dinner. Pipe-in banquet dinner and solo salute atop castle ramparts.',
    createdAt: '2026-09-12T09:00:00Z',
    approvedAt: '2026-09-14T10:30:00Z',
    brevoEmailSent: true,
    brevoEmailHistory: [
      {
        type: 'Booking Approved + PayPal Deposit Invoice',
        sentAt: '2026-09-14T10:30:00Z',
        status: 'opened',
        paypalLink: 'https://www.paypal.com/checkout/spudthepiper/dep-102'
      }
    ]
  },
  {
    id: 'spud-bk-103',
    clientName: 'Morag Henderson',
    clientEmail: 'morag.henderson@outlook.com',
    clientPhone: '07700 900123',
    eventType: 'Funeral / Memorial Service',
    date: '2026-09-22',
    timeSlot: '11:00 - 12:30',
    venueName: 'Inverness Crematorium',
    venueAddress: 'Kilvean Cemetery, Inverness',
    venuePostcode: 'IV3 8JN',
    tartanChoice: 'Black Watch Tartan (Military Green/Blue)',
    estimatedPrice: 220,
    depositAmount: 50,
    status: 'deposit_paid',
    specialTunes: ['Amazing Grace', 'Flowers of the Forest', 'Going Home'],
    notes: 'Solemn graveside piping and leading cortege with respectful lament.',
    createdAt: '2026-09-15T15:00:00Z',
    approvedAt: '2026-09-15T16:00:00Z',
    depositPaidAt: '2026-09-15T17:30:00Z',
    paypalOrderId: 'PP-ORD-9023411',
    brevoEmailSent: true,
    brevoEmailHistory: [
      {
        type: 'Deposit Confirmation & Receipt',
        sentAt: '2026-09-15T17:30:00Z',
        status: 'delivered'
      }
    ]
  },
  {
    id: 'spud-bk-104',
    clientName: 'David & Sarah Fraser',
    clientEmail: 'sarah.fraser88@gmail.com',
    clientPhone: '07955 882190',
    eventType: 'Wedding Ceremony & Reception',
    date: '2026-10-17',
    timeSlot: '14:00 - 18:30',
    venueName: 'Eilean Donan Castle',
    venueAddress: 'Dornie, Kyle of Lochalsh',
    venuePostcode: 'IV40 8DX',
    tartanChoice: 'Modern Day Highland Tweed Jacket',
    estimatedPrice: 520,
    depositAmount: 100,
    status: 'pending',
    specialTunes: ['Skye Boat Song', 'Highland Cathedral', 'Green Hills of Tyrol'],
    notes: 'Destination wedding on the bridge of Eilean Donan Castle followed by celebratory pipe tunes.',
    createdAt: '2026-09-18T08:30:00Z',
    brevoEmailSent: false
  },
  {
    id: 'spud-bk-105',
    clientName: 'Willem van den Berg & Friends (Netherlands)',
    clientEmail: 'willem.vandenberg@amsterdam-travel.nl',
    clientPhone: '+31 6 12345678',
    eventType: 'Highland Bagpipe Experience (Hands-On Workshop / Airbnb)',
    date: '2026-09-24',
    timeSlot: '15:00 - 17:00',
    venueName: 'Loch Lomond Highland Lodge Rental',
    venueAddress: 'Rowardennan, Loch Lomond',
    venuePostcode: 'G63 0AR',
    tartanChoice: 'Full No. 1 Dress (Feather Bonnet & Plaid)',
    estimatedPrice: 300,
    depositAmount: 60,
    status: 'completed',
    specialTunes: ['Scotland the Brave', 'The Black Bear', 'Auld Lang Syne'],
    notes: 'Hands-on bagpipe masterclass for 6 guys from the Netherlands. Chanter scale practice, trying the big pipes, and group kilt photos with the cutest piper this side of the Great Wall of China!',
    createdAt: '2026-09-20T10:00:00Z',
    approvedAt: '2026-09-20T11:15:00Z',
    depositPaidAt: '2026-09-20T13:00:00Z',
    paypalOrderId: 'PP-ORD-9932145',
    brevoEmailSent: true
  }
];

export const initialReviews: Review[] = [
  {
    id: 'rev-5',
    authorName: 'Willem van den Berg (Amsterdam, NL)',
    eventType: 'Highland Bagpipe Experience (Loch Lomond Lodge)',
    rating: 5,
    date: 'September 2026',
    comment: 'Six of us rented a lodge in Scotland and booked Spud for a private Highland Bagpipe Experience. It was by far the highlight of our entire trip! Spud brought practice chanters, taught us how to play the scale, and let us all have a go at the big pipes. Unbelievable fun, huge laughs, and great stories. Truly the cutest piper this side of the Great Wall of China! Bedankt Spud!',
    status: 'approved',
    isFeatured: true,
    location: 'Loch Lomond Holiday Rental'
  },
  {
    id: 'rev-1',
    authorName: 'Catriona & Jamie Robertson',
    eventType: 'Wedding at Stirling Castle',
    rating: 5,
    date: 'August 2026',
    comment: 'Spud was the absolute highlight of our wedding! His presence, warmth, and masterful piping brought tears of joy to our guests. From welcoming everyone at the gates to piping us into the reception in full No. 1 dress, he was unforgettable. Worth every single penny!',
    status: 'approved',
    isFeatured: true,
    location: 'Stirling Castle, Scotland'
  },
  {
    id: 'rev-2',
    authorName: 'Scottish Wedding Directory',
    eventType: 'Industry Award Citation',
    rating: 5,
    date: 'Annual Awards',
    comment: 'Spud the Piper is one of the wedding industry\'s best known characters. Couples were simply bowled over by his obvious musicianship and highly toned performance skills.',
    status: 'approved',
    isFeatured: true,
    location: 'Voted Best Scottish Wedding Entertainer'
  },
  {
    id: 'rev-3',
    authorName: 'Gordon & Aileen Stewart',
    eventType: 'Golden Wedding Anniversary',
    rating: 5,
    date: 'July 2026',
    comment: 'Having Spud play at our 50th Anniversary was magical. His repertoire of traditional Scottish tunes had everyone singing and tapping their feet. A true Scottish gentleman and extraordinary musician.',
    status: 'approved',
    isFeatured: true,
    location: 'Aberdeen'
  },
  {
    id: 'rev-4',
    authorName: 'The MacLeod Family',
    eventType: 'Memorial Service',
    rating: 5,
    date: 'June 2026',
    comment: 'Spud performed "Flowers of the Forest" and "Going Home" with such heartfelt dignity and grace. It provided the most touching tribute for our grandfather. We cannot thank him enough.',
    status: 'approved',
    isFeatured: false,
    location: 'Inverness'
  }
];

export const initialSocialPosts: SocialPost[] = [
  // ─── 1. REAL-TIME SOCIAL FEED POSTS (Timeline Stream) ───
  {
    id: 'feed-exp-1',
    postType: 'feed',
    authorName: 'Spud the Piper',
    authorRole: 'Spud the Piper',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80',
    content: '🇳🇱🏴󠁧󠁢󠁳󠁣󠁴󠁿 What a fantastic afternoon hosting a private Highland Bagpipe Experience for 6 great lads visiting from the Netherlands! I brought my practice chanters to their rental lodge on Loch Lomond, showed them the full anatomy of the Great Highland Bagpipe, taught them their first Scottish scale, and then they all had a shot on the big pipes! \n\nLaughter, great banter, and genuine Scottish hospitality with "the cutest piper this side of the Great Wall of China"! Now officially available for bookings across Scotland! 🎵🥃🏴󠁧󠁢󠁳󠁣󠁴󠁿\n\n#BagpipeExperience #ScotlandTravel #LochLomond #TourScotland #HighlandPiping',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1000&q=85',
    eventLocation: 'Loch Lomond Holiday Rental, Scotland',
    tunePlayed: 'Scotland the Brave',
    tags: ['#BagpipeExperience', '#ScotlandTravel', '#LochLomond', '#TourScotland', '#HighlandPiping'],
    likes: 248,
    isPinned: true,
    comments: [
      {
        id: 'c-exp1',
        authorName: 'Willem van den Berg',
        authorRole: 'Guest',
        content: 'Spud, you were absolute legend mate! The whole group had the best afternoon. My lungs are still recovering from trying to blow the drones! 😂🥃',
        createdAt: '2026-09-24T18:15:00Z'
      },
      {
        id: 'c-exp2',
        authorName: 'Lars Jansen',
        authorRole: 'Guest',
        content: 'Best experience in Scotland hands down! Highly recommend to anyone visiting! 🙌',
        createdAt: '2026-09-24T18:40:00Z'
      }
    ],
    timestamp: '2026-09-24T17:30:00Z'
  },
  {
    id: 'feed-1',
    postType: 'feed',
    authorName: 'Spud the Piper',
    authorRole: 'Spud the Piper',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80',
    content: '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Just arrived at Dundas Castle for Fiona & Callum\'s wedding ceremony! The sun is shining over the courtyard, drones are tuned, and we are ready to strike up Highland Cathedral as the guests arrive. Nothing beats a Scottish castle wedding! 🏰✨\n\n#DundasCastle #HighlandBagpiper #WeddingPiper #HighlandCathedral',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&q=85',
    eventLocation: 'Dundas Castle, South Queensferry, Edinburgh',
    tunePlayed: 'Highland Cathedral',
    tags: ['#DundasCastle', '#HighlandBagpiper', '#WeddingPiper', '#HighlandCathedral'],
    likes: 194,
    comments: [
      {
        id: 'c-f1',
        authorName: 'Callum MacGregor',
        authorRole: 'Bride/Groom',
        content: 'We can hear you tuning up from the bridal suite Spud! Sounds incredible!! 🥃',
        createdAt: '2026-09-18T11:10:00Z'
      },
      {
        id: 'c-f2',
        authorName: 'Catriona Henderson',
        authorRole: 'Guest',
        content: 'The castle courtyard looks stunning today! Can’t wait for the grand entrance.',
        createdAt: '2026-09-18T11:25:00Z'
      }
    ],
    timestamp: '45 mins ago',
    isPinned: true
  },
  {
    id: 'feed-2',
    postType: 'feed',
    authorName: 'Spud the Piper',
    authorRole: 'Spud the Piper',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80',
    content: '🗽 Throwback to marching down 5th Avenue in Manhattan for New York City Tartan Week! 40,000 people roaring as the Great Highland Bagpipes echoed between skyscrapers. Taking Scotland worldwide! Who is joining us in NYC next spring? 🇺🇸🏴󠁧󠁢󠁳󠁣󠁴󠁿\n\n#TartanWeekNYC #NewYorkCity #WorldTour #ScotlandTheBrave',
    imageUrl: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1000&q=85',
    eventLocation: '5th Avenue & Central Park, New York City',
    tunePlayed: 'Scotland the Brave & The Black Bear',
    tags: ['#TartanWeekNYC', '#NewYorkCity', '#WorldTour', '#ScotlandTheBrave'],
    likes: 342,
    comments: [
      {
        id: 'c-nyc-1',
        authorName: 'Liam O\'Connor',
        authorRole: 'Client',
        content: 'Best day of the year in NYC! You brought the house down Spud!',
        createdAt: '2026-09-17T19:00:00Z'
      }
    ],
    timestamp: 'Yesterday at 3:45 PM',
    isPinned: false
  },
  {
    id: 'feed-3',
    postType: 'feed',
    authorName: 'Emma & Scott Ross',
    authorRole: 'Bride/Groom',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80',
    content: 'Still on cloud nine from our Isle of Skye elopement! Having Spud hike up by the Fairy Pools with his bagpipes and play "Skye Boat Song" as we exchanged vows was the most magical moment of our lives. Thank you Spud! ❤️🏴󠁧󠁢󠁳󠁣󠁴󠁿\n\n#IsleOfSkye #FairyPools #ScottishElopement #SkyeBoatSong',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000&q=85',
    eventLocation: 'Fairy Pools, Glenbrittle, Isle of Skye',
    tunePlayed: 'Skye Boat Song',
    tags: ['#IsleOfSkye', '#FairyPools', '#ScottishElopement', '#SkyeBoatSong'],
    likes: 278,
    comments: [
      {
        id: 'c-skye-1',
        authorName: 'Spud the Piper',
        authorRole: 'Spud the Piper',
        content: 'Pure magic Emma & Scott! The mountain acoustic on Skye was unforgettable. Wishing you both a lifetime of happiness! Slàinte! 🥃',
        createdAt: '2026-09-16T16:30:00Z'
      }
    ],
    timestamp: '2 days ago',
    isPinned: false
  },
  {
    id: 'feed-4',
    postType: 'feed',
    authorName: 'Spud the Piper',
    authorRole: 'Spud the Piper',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80',
    content: 'Sunset salute atop the ramparts of Edinburgh Castle tonight before the VIP banquet in the Great Hall. Full No. 1 feather bonnet and polished silver regalia. 🏰🥃\n\n#EdinburghCastle #RampartsSalute #FlowerOfScotland #HighlandDress',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1000&q=85',
    eventLocation: 'Edinburgh Castle Ramparts & Great Hall, Edinburgh',
    tunePlayed: 'Flower of Scotland',
    tags: ['#EdinburghCastle', '#RampartsSalute', '#FlowerOfScotland', '#HighlandDress'],
    likes: 215,
    comments: [
      {
        id: 'c-ed-1',
        authorName: 'Lord Alistair Campbell',
        authorRole: 'Client',
        content: 'The international delegates were spellbound Spud. First class performance as always.',
        createdAt: '2026-09-15T21:00:00Z'
      }
    ],
    timestamp: '4 days ago',
    isPinned: false
  },

  // ─── 2. HIGHLAND FORUM & COMMUNITY DISCUSSIONS ───
  {
    id: 'forum-1',
    postType: 'forum',
    forumTopic: 'Wedding Music & Entrance',
    title: 'What is the best tune for walking down the aisle in a stone church / castle?',
    authorName: 'Jennifer & Marcus',
    authorRole: 'Bride/Groom',
    content: 'We are getting married in a stone-walled chapel with vaulted ceilings. We love both "Highland Cathedral" and "Mairi\'s Wedding". What is Spud\'s recommendation for the entrance walk versus the confetti recessional exit?',
    eventLocation: 'Stirling Castle Chapel, Stirling',
    likes: 64,
    comments: [
      {
        id: 'c-f1',
        authorName: 'Spud the Piper',
        authorRole: 'Spud the Piper',
        content: 'Hi Jennifer & Marcus! For the entrance processional, "Highland Cathedral" is unbeatable—it is majestic, emotional, and builds slowly so you can pace your walk perfectly. Then for the recessional exit as husband & wife, "Mairi\'s Wedding" or "Scotland the Brave" gives that joyful, upbeat celebration tempo as guests cheer and throw confetti!',
        createdAt: '2026-09-15T12:00:00Z'
      }
    ],
    timestamp: '3 days ago'
  },
  {
    id: 'forum-2',
    postType: 'forum',
    forumTopic: 'Venue Acoustics & Castle Lore',
    title: 'Surprise Bagpipe Welcome & Acoustics at Atholl Palace Hotel, Pitlochry',
    authorName: 'Emma & Scott Ross',
    authorRole: 'Bride/Groom',
    content: 'We kept Spud a complete secret from our wedding guests until the double doors swung open after our vows! Having Spud pipe us down the staircase in full No. 1 feather bonnet regalia was the best decision we made. How do the acoustics in Atholl Palace Great Hall compare to other Scottish venues?',
    eventLocation: 'Atholl Palace Hotel, Pitlochry, Perthshire',
    likes: 48,
    comments: [
      {
        id: 'c-f-atholl',
        authorName: 'Spud the Piper',
        authorRole: 'Spud the Piper',
        content: 'Atholl Palace has magnificent natural resonance due to its high ceilings and timber staircase. The pipes carry with warm harmonics without overpowering the room. Ideal for surprise entrances!',
        createdAt: '2026-09-14T14:20:00Z'
      }
    ],
    timestamp: '4 days ago'
  },
  {
    id: 'forum-3',
    postType: 'forum',
    forumTopic: 'Bagpipe Tuning & Tech',
    title: 'Tuning bagpipes with church pipe organs (Pitch & Frequency tips)',
    authorName: 'Alasdair Fraser',
    authorRole: 'Student',
    content: 'What is the recommended approach when asked to play alongside a church organ in concert pitch (A=440Hz), given standard Highland pipes are tuned around 476-482Hz?',
    eventLocation: 'Glasgow Cathedral, Glasgow',
    likes: 53,
    comments: [
      {
        id: 'c-f2',
        authorName: 'Spud the Piper',
        authorRole: 'Spud the Piper',
        content: 'Standard pipe chanters sit near modern Bb (~478Hz). When collaborating with church organs or string quartets in concert pitch, I switch to a specially calibrated A=440Hz wooden pipe chanter with matching drone reeds. This achieves perfect harmonic unison with church organs!',
        createdAt: '2026-09-14T09:30:00Z'
      }
    ],
    timestamp: '5 days ago'
  },
  {
    id: 'forum-4',
    postType: 'forum',
    forumTopic: 'Destination Weddings',
    title: 'Flying internationally with bagpipes (Airlines, Drone reeds & Traveling)',
    authorName: 'David MacLean',
    authorRole: 'Client',
    content: 'We are planning a destination wedding in Italy (Lake Como) and want Spud to travel over. How do bagpipes travel on commercial flights?',
    eventLocation: 'Lake Como, Italy & Worldwide',
    likes: 72,
    comments: [
      {
        id: 'c-f3',
        authorName: 'Spud the Piper',
        authorRole: 'Spud the Piper',
        content: 'I frequently travel across Europe, the US, and Middle East for destination weddings! The Great Highland Bagpipes travel with me in custom reinforced flight hand-luggage cases to protect sensitive cane reeds and African blackwood from pressure/temperature changes. Everything is seamless!',
        createdAt: '2026-09-13T16:00:00Z'
      }
    ],
    timestamp: '1 week ago'
  }
];

export const initialChatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'system',
    senderName: 'Spud Assistant Bot',
    text: 'Failte! Welcome to Spud the Piper. Ask any question about event bookings, available dates, pricing, or custom tunes, or chat directly with Spud!',
    timestamp: '12:00 PM',
    isRead: true,
    sessionId: 'session-demo'
  },
  {
    id: 'msg-2',
    sender: 'client',
    senderName: 'Sarah Fraser',
    text: 'Hi Spud! Do you travel to Skye and the Western Isles for weddings in October?',
    timestamp: '12:05 PM',
    isRead: true,
    sessionId: 'session-demo'
  },
  {
    id: 'msg-3',
    sender: 'spud',
    senderName: 'Spud the Piper',
    text: 'Aye Sarah! Absolutely. I travel all across the Highlands, Islands, and worldwide. If you check our booking calendar you can reserve your slot provisionally!',
    timestamp: '12:08 PM',
    isRead: true,
    sessionId: 'session-demo'
  }
];

export const initialTunes: BagpipeTune[] = [
  {
    id: 'tune-1',
    title: 'Highland Cathedral',
    category: 'Wedding',
    description: 'The definitive Scottish wedding processional. Majestic, emotive, and stirring.',
    duration: '2:45',
    audioNotes: [440, 493.88, 554.37, 587.33, 659.25, 587.33, 554.37, 493.88, 440]
  },
  {
    id: 'tune-2',
    title: 'Scotland the Brave',
    category: 'Celebration / March',
    description: 'The world-famous rousing patriotic march. Perfect for energetic celebratory exits and greetings.',
    duration: '2:15',
    audioNotes: [440, 440, 493.88, 554.37, 587.33, 554.37, 493.88, 440]
  },
  {
    id: 'tune-3',
    title: 'Flower of Scotland',
    category: 'Traditional Scottish',
    description: 'The beloved national anthem of Scotland. Ideal for banquets, Burns suppers, and international guests.',
    duration: '3:00',
    audioNotes: [440, 587.33, 587.33, 554.37, 493.88, 440, 392, 440]
  },
  {
    id: 'tune-4',
    title: 'Amazing Grace',
    category: 'Lament / Funeral',
    description: 'Deeply moving and soulful. A timeless hymn for memorial services and reverent occasions.',
    duration: '3:10',
    audioNotes: [587.33, 783.99, 493.88, 783.99, 493.88, 440, 783.99, 659.25, 587.33]
  },
  {
    id: 'tune-5',
    title: 'Skye Boat Song',
    category: 'Traditional Scottish',
    description: 'The iconic lullaby and Outlander theme recounting Bonnie Prince Charlie\'s journey over the sea to Skye.',
    duration: '2:30',
    audioNotes: [440, 554.37, 440, 783.99, 739.99, 659.25, 587.33, 554.37, 440]
  }
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'booking_request',
    title: 'New Provisional Booking Request',
    message: 'David & Sarah Fraser submitted a request for Eilean Donan Castle on 17 Oct 2026.',
    timestamp: '15 mins ago',
    isRead: false,
    actionUrl: '/admin/bookings',
    relatedId: 'spud-bk-104'
  },
  {
    id: 'notif-2',
    type: 'deposit_paid',
    title: 'PayPal Deposit Received (£100.00)',
    message: 'Fiona & Callum MacGregor completed their deposit payment for Dundas Castle.',
    timestamp: '2 hours ago',
    isRead: false,
    actionUrl: '/admin/bookings',
    relatedId: 'spud-bk-101'
  },
  {
    id: 'notif-3',
    type: 'chat_message',
    title: 'New Chat Message from Sarah',
    message: '"Do you travel to Skye and the Western Isles in October?"',
    timestamp: '4 hours ago',
    isRead: true,
    actionUrl: '/admin/messages'
  }
];

export const initialCmsBlocks: EditableCmsBlock[] = [
  {
    id: 'hero-h1',
    page: 'home',
    section: 'hero',
    tag: 'h1',
    label: 'Hero Main Title',
    content: 'Award-Winning Scottish Highland Bagpiper'
  },
  {
    id: 'hero-sub',
    page: 'home',
    section: 'hero',
    tag: 'p',
    label: 'Hero Subtitle / Credo',
    content: 'Renowned worldwide for stirring wedding ceremonies, solemn memorial laments, castle galas, and VIP celebrations. Over 15 years of exceptional musical craft.'
  },
  {
    id: 'hero-quote',
    page: 'home',
    section: 'hero',
    tag: 'p',
    label: 'Hero Industry Quote',
    content: '"Spud the Piper is one of the wedding industry\'s best known characters. Couples were simply bowled over by his obvious musicianship and highly toned performance skills." — The Scottish Wedding Directory'
  },
  {
    id: 'piper-stars-h2',
    page: 'home',
    section: 'stars',
    tag: 'h2',
    label: 'Piper to the Stars Header',
    content: 'Piper to the Stars & Royalty'
  },
  {
    id: 'piper-stars-desc',
    page: 'home',
    section: 'stars',
    tag: 'p',
    label: 'Celebrity Credibility Text',
    content: 'Trusted by Hollywood icons such as Jamie Lee Curtis, Scottish royalty, dignitaries, and top wedding venues throughout Scotland, the UK, Europe, and America.'
  },
  {
    id: 'livestream-desc',
    page: 'home',
    section: 'livestream',
    tag: 'p',
    label: 'Facebook Live Schedule Text',
    content: 'Every Tuesday & Friday 6:00 PM – 6:30 PM (UK Time). Join thousands of fans worldwide for live tune requests, Highland stories, and Scottish banter!'
  }
];

export const initialSeoPages: SeoPageConfig[] = [
  {
    pageId: 'home',
    pageName: 'Home Page',
    path: '/',
    title: 'Spud the Piper | Award-Winning Scottish Highland Bagpiper For Hire',
    metaDescription: 'Scotland\'s premier award-winning Highland Bagpiper for weddings, funerals, castle events, corporate banquets & tuition. Check live availability and book online.',
    keywords: ['Spud the Piper', 'Scottish Bagpiper for Hire', 'Wedding Bagpiper Scotland', 'Edinburgh Castle Piper', 'Highland Bagpipe Music', 'Funeral Bagpiper Scotland', 'Glasgow Bagpiper'],
    canonicalUrl: 'https://www.spudthepiper.co.uk',
    ogImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&q=80',
    h1: 'Award-Winning Scottish Highland Bagpiper',
    schemaType: 'LocalBusiness, MusicGroup'
  },
  {
    pageId: 'about',
    pageName: 'About Spud',
    path: '/about',
    title: 'About Spud the Piper | 15+ Years Highland Craft & Celebrity Piper',
    metaDescription: 'Discover the story behind Spud the Piper - trusted by Hollywood celebrities like Jamie Lee Curtis, Scottish castles, and hundreds of happy couples worldwide.',
    keywords: ['About Spud the Piper', 'Celebrity Bagpiper', 'Scottish Piper Biography', 'Highland Bagpiper Experience', 'Jamie Lee Curtis Piper'],
    canonicalUrl: 'https://www.spudthepiper.co.uk/about',
    ogImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&q=80',
    h1: 'The Story of Spud the Piper',
    schemaType: 'AboutPage, Person'
  },
  {
    pageId: 'services',
    pageName: 'Services & Rates',
    path: '/services',
    title: 'Bagpiper Hire Services | Weddings, Funerals, Castle Galas & Tuition',
    metaDescription: 'Explore Spud\'s bespoke piping packages: full wedding day ceremonies, solemn funeral laments, corporate banquets, Burns Suppers, and 1-on-1 bagpipe tuition.',
    keywords: ['Bagpipe Wedding Packages', 'Funeral Piper Scotland', 'Corporate Bagpiper Hire', 'Burns Supper Piper', 'Bagpipe Lessons Scotland'],
    canonicalUrl: 'https://www.spudthepiper.co.uk/services',
    ogImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80',
    h1: 'Highland Bagpiping Services & Packages',
    schemaType: 'Service, OfferCatalog'
  },
  {
    pageId: 'tunes',
    pageName: 'Tunes & Jukebox',
    path: '/tunes',
    title: 'Bagpipe Tunes & Repertoire | Listen Online & Request Custom Songs',
    metaDescription: 'Listen to Highland Cathedral, Scotland the Brave, Flower of Scotland, and Amazing Grace with our authentic bagpipe jukebox and choose custom ceremony tunes.',
    keywords: ['Scottish Bagpipe Tunes', 'Highland Cathedral Bagpipes', 'Scotland the Brave Audio', 'Wedding Bagpipe Music', 'Bagpipe Jukebox'],
    canonicalUrl: 'https://www.spudthepiper.co.uk/tunes',
    ogImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80',
    h1: 'Repertoire & Bagpipe Audio Jukebox',
    schemaType: 'MusicPlaylist, MusicRecording'
  },
  {
    pageId: 'attire',
    pageName: 'Tartan & Attire Studio',
    path: '/attire',
    title: 'Highland Dress & Tartan Studio | Authentic Scottish Bagpiper Attire',
    metaDescription: 'Preview Spud in Full No. 1 Feather Bonnet dress, Royal Stewart, Black Watch Military, or Modern Day Highland Tweed to match your wedding or gala color scheme.',
    keywords: ['Highland Dress Bagpiper', 'Royal Stewart Tartan Kilt', 'Feather Bonnet Piper', 'Black Watch Bagpiper', 'Highland Tweed Jacket'],
    canonicalUrl: 'https://www.spudthepiper.co.uk/attire',
    ogImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&q=80',
    h1: 'Highland Dress & Tartan Studio',
    schemaType: 'ItemPage, VisualArtwork'
  },
  {
    pageId: 'booking',
    pageName: 'Live Diary & Booking',
    path: '/booking',
    title: 'Check Live Availability & Book Spud the Piper Online',
    metaDescription: 'View Spud\'s real-time diary calendar, calculate instant quotes for your venue, and submit provisional bookings with instant PayPal deposit confirmation.',
    keywords: ['Book Scottish Bagpiper', 'Bagpiper Availability Diary', 'Bagpipe Hire Quote', 'Edinburgh Wedding Piper Booking', 'Online Piper Calendar'],
    canonicalUrl: 'https://www.spudthepiper.co.uk/booking',
    ogImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80',
    h1: 'Live Diary & Online Booking System',
    schemaType: 'ReserveAction, Event'
  },
  {
    pageId: 'social',
    pageName: 'Social Community & Live',
    path: '/social',
    title: 'Highland Social Wall & Facebook Live | Spud the Piper Community',
    metaDescription: 'Join thousands of fans on our Highland Social Wall. Share event photos, comment on gigs, and watch Spud\'s Facebook Live streams every Tuesday & Friday.',
    keywords: ['Spud the Piper Facebook Live', 'Scottish Bagpipe Community', 'Highland Social Wall', 'Bagpipe Livestream'],
    canonicalUrl: 'https://www.spudthepiper.co.uk/social',
    ogImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80',
    h1: 'Highland Social Wall & Livestreams',
    schemaType: 'SocialMediaPosting, BroadcastEvent'
  },
  {
    pageId: 'reviews',
    pageName: '5-Star Reviews & Awards',
    path: '/reviews',
    title: '5-Star Client Reviews & Awards | Spud the Piper Testimonials',
    metaDescription: 'Read verified 5-star reviews from brides, grooms, castle venues, and corporate clients across Scotland. Rated 5.0 / 5.0 for unforgettable Scottish piping.',
    keywords: ['Spud the Piper Reviews', 'Wedding Bagpiper Ratings', 'Scottish Wedding Awards Piper', 'Highland Bagpipe Testimonials'],
    canonicalUrl: 'https://www.spudthepiper.co.uk/reviews',
    ogImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&q=80',
    h1: '5-Star Reviews & Industry Accolades',
    schemaType: 'Review, AggregateRating'
  },
  {
    pageId: 'faq',
    pageName: 'FAQ & Pricing Guide',
    path: '/faq',
    title: 'Bagpiper Hire FAQ & Pricing Guide | Spud the Piper',
    metaDescription: 'Get instant answers about bagpiper pricing, travel across the Highlands & Islands, attire choices, ceremony timings, and custom tune requests.',
    keywords: ['How much does a bagpiper cost in Scotland', 'Bagpiper FAQ', 'Wedding Bagpipe Timings', 'Bagpiper Travel Distance Scotland'],
    canonicalUrl: 'https://www.spudthepiper.co.uk/faq',
    ogImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80',
    h1: 'Frequently Asked Questions & Pricing Guide',
    schemaType: 'FAQPage'
  },
  {
    pageId: 'contact',
    pageName: 'Contact & Inquiries',
    path: '/contact',
    title: 'Contact Spud the Piper | Direct Phone, WhatsApp & Email Inquiries',
    metaDescription: 'Get in touch directly with Spud the Piper for fast quotes and bookings. Call or WhatsApp 07793 491367 or send a message via our 24/7 instant chat.',
    keywords: ['Contact Spud the Piper', 'Bagpiper Phone Number', 'Bagpiper WhatsApp Scotland', 'Hire Bagpiper Edinburgh Glasgow'],
    canonicalUrl: 'https://www.spudthepiper.co.uk/contact',
    ogImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&q=80',
    h1: 'Contact Spud the Piper',
    schemaType: 'ContactPage, LocalBusiness'
  },
  {
    pageId: 'terms',
    pageName: 'Terms & Conditions',
    path: '/terms',
    title: 'Terms & Conditions | Spud the Piper Performance Agreements',
    metaDescription: 'Read the official booking and performance terms, client expectations, and service commitments for Spud the Piper.',
    keywords: ['Bagpiper Terms and Conditions', 'Spud the Piper Performance Agreement'],
    canonicalUrl: 'https://www.spudthepiper.co.uk/terms',
    ogImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&q=80',
    h1: 'Terms & Conditions of Service',
    schemaType: 'WebPage'
  },
  {
    pageId: 'privacy',
    pageName: 'Privacy Policy',
    path: '/privacy',
    title: 'Privacy Policy | Spud the Piper Data Protection & GDPR',
    metaDescription: 'Learn how Spud the Piper handles and protects your personal booking information, contact details, and payment security.',
    keywords: ['Spud the Piper Privacy Policy', 'GDPR Compliance Scottish Piper'],
    canonicalUrl: 'https://www.spudthepiper.co.uk/privacy',
    ogImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&q=80',
    h1: 'Privacy Policy & Data Protection',
    schemaType: 'WebPage'
  },
  {
    pageId: 'cookies',
    pageName: 'Cookie Policy',
    path: '/cookies',
    title: 'Cookie Policy | Spud the Piper Website Tracking Preferences',
    metaDescription: 'Understand how cookies, analytics, and session preferences are utilized on the Spud the Piper PWA and website.',
    keywords: ['Cookie Policy', 'Spud the Piper Cookies'],
    canonicalUrl: 'https://www.spudthepiper.co.uk/cookies',
    ogImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&q=80',
    h1: 'Cookie & Tracking Policy',
    schemaType: 'WebPage'
  },
  {
    pageId: 'booking-policy',
    pageName: 'Booking & Deposit Policy',
    path: '/booking-policy',
    title: 'Booking & Deposit Policy | PayPal Invoicing & Cancellation Terms',
    metaDescription: 'Clear details on provisional holds, PayPal deposit payments, Brevo automated confirmation emails, and date rescheduling guidelines.',
    keywords: ['Bagpipe Deposit Policy', 'PayPal Bagpiper Booking', 'Cancellation Policy Spud the Piper'],
    canonicalUrl: 'https://www.spudthepiper.co.uk/booking-policy',
    ogImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&q=80',
    h1: 'Booking, Deposits & Rescheduling Terms',
    schemaType: 'WebPage'
  },
  {
    pageId: 'install',
    pageName: 'How to Install App (PWA)',
    path: '/install',
    title: 'How to Install Spud the Piper App | Mobile & Desktop PWA Guide',
    metaDescription: 'Step-by-step instructions for installing Spud the Piper on iOS Safari, Android Chrome, and Desktop PC/Mac for 1-tap offline sound samples and diary bookings.',
    keywords: ['Install Spud the Piper', 'Spud the Piper App', 'Scottish Bagpiper PWA', 'Download Bagpiper App'],
    canonicalUrl: 'https://www.spudthepiper.co.uk/install',
    ogImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&q=80',
    h1: 'How to Install Spud the Piper App',
    schemaType: 'WebPage, SoftwareApplication'
  }
];

export const initialSeoConfig: SeoPageConfig = initialSeoPages[0];

export const initialForumCategories: ForumCategoryItem[] = [
  {
    id: 'cat-wedding-music',
    topicName: 'Wedding Music & Entrance',
    title: 'Wedding Music, Entrances & Laments',
    description: 'Aisle processional tunes, celebratory confetti recessional marches, church organ duets, solemn laments & bespoke musical requests.',
    iconName: 'Music',
    accentBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    isCustom: false
  },
  {
    id: 'cat-venue-acoustics',
    topicName: 'Venue Acoustics & Castle Lore',
    title: 'Castles, Historic Venues & Acoustics',
    description: 'Castle stone resonance, grand staircase surprises, outdoor Highland grounds, coordinator planning & weather contingencies.',
    iconName: 'Castle',
    accentBadge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    isCustom: false
  },
  {
    id: 'cat-bagpipe-tech',
    topicName: 'Bagpipe Tuning & Tech',
    title: 'Bagpipe Tuning, Pitch & Tuition',
    description: 'Chanter pitch (A=440Hz concert pitch vs 480Hz standard), drone reed setup, moisture control, practice routines & student tuition.',
    iconName: 'Volume2',
    accentBadge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    isCustom: false
  },
  {
    id: 'cat-destination-weddings',
    topicName: 'Destination Weddings',
    title: 'International Travel & Destination Events',
    description: 'Flying with Great Highland Bagpipes, NYC Tartan Week on 5th Ave, European destination weddings, airline luggage & customs.',
    iconName: 'Globe',
    accentBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    isCustom: false
  },
  {
    id: 'cat-general-piping',
    topicName: 'General Piping',
    title: 'Scottish Lore, Tartan Etiquette & Banter',
    description: 'Clan tartans, traditional Highland dress etiquette, Burns Supper addresses, toasts, ceilidh folklore & Scottish banter.',
    iconName: 'MessageSquare',
    accentBadge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    isCustom: false
  }
];

export const initialSocialLinks: SocialMediaLinks = {
  facebook: 'https://www.facebook.com/spudthepiper/',
  twitter: 'https://twitter.com/spudthepiper',
  pinterest: 'https://www.pinterest.com/spudthepiper/',
  instagram: 'https://www.instagram.com/spudthepiper/',
  linkedin: 'https://www.linkedin.com/in/spudthepiper/',
  tiktok: 'https://www.tiktok.com/@spudthepiper',
  trustpilot: 'https://www.trustpilot.com/review/spudthepiper.co.uk'
};

export const initialServices: ServicePackage[] = [
  {
    id: 'srv-weddings',
    slug: 'service-1',
    icon: 'Heart',
    title: 'Scottish Castle & Highland Weddings',
    tagline: 'The complete romantic ceremony & reception musical experience',
    priceEstimate: 'From £320 - £480',
    basePrice: 480,
    depositAmount: 100,
    deposit: '£100 Deposit',
    popularBadge: true,
    badgeText: 'Most Requested',
    heroImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80',
    description: 'Create spine-tingling wedding memories with the iconic sound of the Highland pipes. Spud welcomes your arriving guests, pipes the bridal party down the aisle, plays during photography, and triumphantly pipes the newlyweds into dinner.',
    fullDescription: 'Nothing evokes the timeless romance of Scotland quite like the stirring resonance of the Highland bagpipe echoing through castle stone walls and scenic lochs. Spud the Piper brings decades of experience, impeccable musicality, and majestic ceremonial presence to your wedding day. Whether you are hosting an intimate elopement on the Isle of Skye or a grand 400-guest celebration at Edinburgh Castle, Spud orchestrates every musical moment with flawless timing.',
    features: [
      'Greeting arriving wedding guests with traditional welcoming tunes',
      'Piping the Bride down the aisle with Highland Cathedral',
      'Lively exit march for the newly married couple',
      'Atmospheric piping during photo sessions & drinks reception',
      'Official pipe-in of the Top Table into the wedding breakfast'
    ],
    itinerary: [
      {
        stepOrTime: '45 Mins Before Ceremony',
        title: 'Guest Arrival & Atmospheric Welcome',
        description: 'Spud stands in full No. 1 Highland dress at the main entrance, creating an unforgettable first impression and building anticipation with classic welcoming airs.'
      },
      {
        stepOrTime: 'Ceremony Start',
        title: 'Bridal Party & Aisle Processional',
        description: 'A spine-tingling rendition of Highland Cathedral or your chosen processional melody as the bride and bridal party make their grand entrance.'
      },
      {
        stepOrTime: 'Signing of the Register',
        title: 'Quiet Background Harmony or Organ Duet',
        description: 'Subtle, melodic piping during the official register signing and vows.'
      },
      {
        stepOrTime: 'Ceremony Recessional',
        title: 'Newlywed Triumphant Exit March',
        description: 'Upbeat, celebratory marches (e.g. Mairi\'s Wedding, Scotland the Brave) as the happy couple walk back down the aisle showered in confetti.'
      },
      {
        stepOrTime: 'Drinks & Photography',
        title: 'Courtyard & Drinks Reception Piping',
        description: 'Lively jigs and reels to entertain guests during champagne and professional photographs.'
      },
      {
        stepOrTime: 'Wedding Breakfast',
        title: 'Top Table Grand Entrance Pipe-In',
        description: 'Spud leads the newlyweds and bridal party into the dining hall to a standing ovation from all their guests.'
      }
    ],
    galleryImages: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80'
    ],
    recommendedTunes: [
      'Highland Cathedral',
      'Mairi\'s Wedding',
      'Scotland the Brave',
      'Skye Boat Song',
      'The Rowan Tree'
    ],
    faqs: [
      {
        question: 'Can Spud coordinate with our church organist or string quartet?',
        answer: 'Yes! Spud frequently collaborates with organists and musicians, ensuring concert pitch coordination (A=440Hz / Bb) for harmonic duets.'
      },
      {
        question: 'What if our wedding running times run slightly late?',
        answer: 'Spud is completely flexible and experienced with wedding day logistics. He stays on-site until all scheduled piping duties are perfectly completed.'
      }
    ],
    seoTitle: 'Scottish Wedding Bagpiper Hire | Spud the Piper Castle Weddings',
    seoDescription: 'Hire Scotland\'s premier wedding bagpiper. Full No. 1 Highland dress, aisle processional, photo session piping, and reception grand entrance across Edinburgh, Glasgow & the Highlands.',
    seoKeywords: ['Wedding Bagpiper Scotland', 'Castle Wedding Piper Edinburgh', 'Highland Cathedral Wedding Aisle', 'Hire a Piper for Wedding Scotland']
  },
  {
    id: 'srv-experience',
    slug: 'service-2',
    icon: 'Sparkles',
    title: 'The Ultimate Highland Bagpipe Experience',
    tagline: 'Hands-on workshop, storytelling & piping masterclass with the cutest piper this side of the Great Wall of China',
    priceEstimate: 'From £250 - £350 (Group Rate)',
    basePrice: 280,
    depositAmount: 60,
    deposit: '£60 Deposit',
    popularBadge: true,
    badgeText: 'New & Trending',
    heroImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&q=80',
    description: 'The ultimate interactive Scottish entertainment experience for tourists, tour groups, Airbnb / holiday home rentals, stag & hen parties, and corporate retreats! Spud visits your accommodation or venue to reveal the secrets of the Great Highland Bagpipe, hands out practice chanters so everyone learns the Scottish scale, lets everyone have a shot on the big pipes, performs a private concert, and poses for unforgettable group photos in full ceremonial kilt regalia.',
    fullDescription: 'Looking for a genuine, unforgettable Scottish experience that goes far beyond simply watching a performance? The Highland Bagpipe Experience is an interactive, laughter-packed masterclass brought straight to your holiday home, castle lodge, Airbnb, hotel, or private venue across Scotland. Spud the Piper—warm, charismatic, and widely known as "the cutest piper this side of the Great Wall of China"—will guide your group through the ancient mechanics of the pipes, teach everyone how to play the Scottish scale on practice chanters, let every brave guest try blowing the full Great Highland Bagpipes, and deliver a stirring private concert followed by souvenir photos in full ceremonial Number 1 kilt regalia.',
    features: [
      'Interactive demo: how the bag, blowpipe, drones & reed mechanics work',
      'Hands-on practice chanter workshop (learn your first Scottish scale)',
      '"Have a Shot on the Big Pipes" (everyone gets to hold and blow the Highland pipes)',
      'Private close-up mini concert & personal Scottish tune requests',
      'Souvenir group photo shoot with Spud in Full Highland No. 1 Dress',
      'Hilarious storytelling & legendary tales from Spud\'s global travels',
      'Spud travels directly to your rented holiday home, lodge, Airbnb, or venue'
    ],
    itinerary: [
      {
        stepOrTime: 'Step 1 • 15 Mins',
        title: 'Ceremonial Welcome & Anatomy of the Pipes',
        description: 'Spud arrives in full Highland regalia, strikes up a welcoming march, and gives an engaging walkthrough of the bagpipe components: the pipe bag, blowpipe, drones, chanter, and delicate cane reeds.'
      },
      {
        stepOrTime: 'Step 2 • 25 Mins',
        title: 'Hands-On Practice Chanter Workshop',
        description: 'Spud distributes individual practice chanters to every guest. He teaches finger placement, scale progressions, and simple Scottish ornaments, guiding everyone to play their first Scottish notes together.'
      },
      {
        stepOrTime: 'Step 3 • 25 Mins',
        title: '"Have a Shot on the Big Pipes!"',
        description: 'Each guest gets to step into the piper\'s shoes! Spud helps you strap in, find the balance, strike the bag, and squeeze the air through the drones. Expect huge laughs and iconic videos.'
      },
      {
        stepOrTime: 'Step 4 • 15 Mins',
        title: 'Private Mini-Concert & Scottish Storytelling',
        description: 'Spud performs a bespoke selection of Scotland\'s greatest anthems up close, taking custom tune requests while sharing hilarious stories from his world tours and royal performances.'
      },
      {
        stepOrTime: 'Step 5 • 10 Mins',
        title: 'Souvenir Group Photo Session & Farewell',
        description: 'Pose for photos with Spud in full military feather bonnet or glengarry, holding the pipes or chanters. A perfect keepsake of your Scottish journey.'
      }
    ],
    galleryImages: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80'
    ],
    recommendedTunes: [
      'Scotland the Brave',
      'The Black Bear',
      'Highland Cathedral',
      'Auld Lang Syne',
      'Flower of Scotland'
    ],
    faqs: [
      {
        question: 'Where can the Highland Bagpipe Experience take place?',
        answer: 'Spud travels anywhere across Scotland directly to your rented holiday lodge, cottage, Airbnb, hotel, private garden, castle grounds, or corporate retreat.'
      },
      {
        question: 'Do we need any musical experience or prior knowledge?',
        answer: 'None whatsoever! Spud breaks down the techniques with warmth, patience, and humor so that complete beginners of all ages have a brilliant time.'
      },
      {
        question: 'Are instruments and chanters provided?',
        answer: 'Yes! Spud brings sanitized practice chanters for your group to use during the session along with his Great Highland Bagpipe.'
      }
    ],
    seoTitle: 'Highland Bagpipe Experience Scotland | Hands-On Workshop with Spud the Piper',
    seoDescription: 'Book an interactive Highland Bagpipe Experience in Scotland. Learn the chanter, have a shot on the big pipes, enjoy private piping, and hear hilarious Scottish stories.',
    seoKeywords: ['Bagpipe Experience Scotland', 'Hands on Bagpipe Lesson', 'Airbnb Bagpipe Workshop Edinburgh', 'Scottish Entertainment for Tour Groups', 'Spud the Piper Masterclass']
  },
  {
    id: 'srv-elopements',
    slug: 'service-3',
    icon: 'Heart',
    title: 'Highland Elopements & Intimate Vows',
    tagline: 'Soul-stirring mountain, lochside & castle cliffside elopement piping',
    priceEstimate: 'From £350',
    basePrice: 350,
    depositAmount: 80,
    deposit: '£80 Deposit',
    popularBadge: true,
    badgeText: 'Romantic Special',
    heroImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80',
    description: 'Looking to elope in the wild Scottish Highlands, Isle of Skye, Glencoe, or atop a cliffside castle ruin? Spud brings unmatched romantic magic, piping the couple down secret glen trails and accompanying their vows with haunting acoustic echoes.',
    fullDescription: 'Scotland is the elopement capital of the world. For couples seeking a deeply intimate, wild ceremony in Glencoe, the Quiraing on the Isle of Skye, Loch Ness, or Dunnottar Castle ruins, Spud the Piper delivers majestic, spine-tingling acoustic romance. Wearing ceremonial Highland dress, Spud will hike to your chosen location, play processional melodies through the mist, pipe during your handfasting or vow exchange, and lead a celebratory dram toast.',
    features: [
      'Travel to wild remote scenic Highland & island elopement spots (Glencoe, Skye, Lochs)',
      'Full ceremonial kilt attire perfectly suited for breathtaking outdoor wedding photos',
      'Processional piping across glen trails & cliff tops',
      'Acoustic background melody for Scottish handfasting and vow exchange',
      'Celebratory quaich / whisky toast piping'
    ],
    itinerary: [
      {
        stepOrTime: 'Pre-Ceremony Hike / Arrival',
        title: 'Scenic Location Setup & Sound Echo Check',
        description: 'Spud arrives at the outdoor glen or castle viewpoint in full kilt dress, tuning drones to harmonize with the mountain wind.'
      },
      {
        stepOrTime: 'Vow Procession',
        title: 'Piping the Couple to the Vow Altar',
        description: 'A magical, atmospheric rendition of Skye Boat Song or Highland Cathedral as you walk through the heather.'
      },
      {
        stepOrTime: 'The Vows & Handfasting',
        title: 'Scottish Handfasting & Ring Exchange',
        description: 'Gentle, romantic piping to accompany traditional Scottish Celtic rituals.'
      },
      {
        stepOrTime: 'Celebration & Quaich Toast',
        title: 'Quaich Toast & Wild Photos',
        description: 'Joyful Scottish jigs as you pop champagne and take iconic photos amidst Scotland\'s dramatic peaks.'
      }
    ],
    recommendedTunes: [
      'Skye Boat Song',
      'Highland Cathedral',
      'My Love is Like a Red, Red Rose',
      'Wild Mountain Thyme',
      'Mairi\'s Wedding'
    ],
    seoTitle: 'Highland Elopement Bagpiper Scotland | Isle of Skye & Glencoe Piper',
    seoDescription: 'Hire an authentic Highland bagpiper for romantic elopements and vow renewals in Glencoe, Isle of Skye, Loch Lomond, and Scottish castle ruins.',
    seoKeywords: ['Highland Elopement Piper', 'Isle of Skye Elopement Bagpipes', 'Glencoe Wedding Piper', 'Scottish Elopement Music']
  },
  {
    id: 'srv-burns',
    slug: 'service-4',
    icon: 'Sparkles',
    title: 'Burns Suppers & Hogmanay Celebrations',
    tagline: 'Rousing Scottish energy, piping in the Haggis & Auld Lang Syne',
    priceEstimate: 'From £450',
    basePrice: 450,
    depositAmount: 100,
    deposit: '£100 Deposit',
    heroImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
    description: 'Celebrate the Bard in true Highland style! Spud provides the dramatic musical entrance for the Haggis, traditional reels for the dinner, and high-energy anthems to ring in the New Year.',
    fullDescription: 'From January Burns Suppers to midnight Hogmanay celebrations, Scottish parties require unmatched musical energy. Spud the Piper delivers the quintessential Scottish celebration: piping in the chef and Haggis with full ceremonial pomp, performing entertaining musical interludes between toasts, and bringing the house down with a rousing midnight rendition of Auld Lang Syne.',
    features: [
      'Grand entrance piping in the Haggis with "A Man\'s a Man for A\' That"',
      'Entertaining musical interludes between speeches and toasts',
      'Rousing reels and jigs to get the party dancing',
      'Midnight chimes & stirring rendition of "Auld Lang Syne"'
    ],
    recommendedTunes: [
      'A Man\'s a Man for A\' That',
      'Auld Lang Syne',
      'The Green Hills of Tyrol',
      'Cock o\' the North',
      'The Atholl Highlanders'
    ],
    seoTitle: 'Burns Supper & Hogmanay Bagpiper Hire Scotland | Spud the Piper',
    seoDescription: 'Hire an energetic Scottish bagpiper for Burns Night Suppers, Piping in the Haggis, and Hogmanay New Year celebrations across Scotland and the UK.',
    seoKeywords: ['Burns Night Bagpiper', 'Pipe in the Haggis Piper', 'Hogmanay Bagpiper Hire Scotland', 'Scottish New Year Piper']
  },
  {
    id: 'srv-corporate',
    slug: 'service-5',
    icon: 'Castle',
    title: 'Corporate Banquets & Castle VIP Galas',
    tagline: 'State-level Highland grandeur for international guests & brands',
    priceEstimate: 'From £550',
    basePrice: 550,
    depositAmount: 150,
    deposit: '£150 Deposit',
    heroImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&q=80',
    description: 'Impress international delegates, royalty, and VIP clients with authentic Scottish majesty. Spud adds unmistakable grandeur to award galas, product launches, castle dinners, and corporate summits.',
    fullDescription: 'When hosting international VIP delegates, global executives, or state banquets, make a bold Scottish statement. Spud the Piper provides regal musical fanfare, red-carpet welcomes in Full Number 1 Highland Dress, solo concert salutes atop historic battlements, and pipe-ins for dignitaries.',
    features: [
      'VIP red carpet greeting with Full Number 1 Highland Dress',
      'Banquet pipe-in and solo concert performance',
      'Highland salute atop castle ramparts or main stage',
      'Photo opportunities with delegates and guests'
    ],
    recommendedTunes: [
      'Scotland the Brave',
      'Highland Laddie',
      'The Black Bear',
      'Flower of Scotland',
      'Loch Lomond'
    ],
    seoTitle: 'Corporate Event Bagpiper Scotland | Castle Banquets & VIP Galas',
    seoDescription: 'High-impact Scottish entertainment for corporate dinners, award galas, brand launches, and castle VIP receptions with master piper Spud the Piper.',
    seoKeywords: ['Corporate Bagpiper Scotland', 'Castle Banquet Piper', 'VIP Event Bagpiper Edinburgh', 'International Conference Scottish Entertainment']
  },
  {
    id: 'srv-funerals',
    slug: 'service-6',
    icon: 'Flame',
    title: 'Funerals, Memorials & Graveside Laments',
    tagline: 'A respectful, heartfelt tribute to honour your loved one',
    priceEstimate: 'From £220',
    basePrice: 220,
    depositAmount: 50,
    deposit: '£50 Deposit',
    heroImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80',
    description: 'The mournful resonance of the Highland bagpipe provides a deeply moving and dignified farewell. Spud can lead the cortege, play before and after the service, and perform soulful laments at the graveside or crematorium.',
    fullDescription: 'During times of grief, the ancient voice of the Highland bagpipe conveys what words often cannot. Spud the Piper brings the highest degree of compassion, respect, and dignified decorum to funeral and memorial services. From leading the hearse cortege to playing moving laments at the graveside, crematorium chapel, or scattering of ashes, Spud provides a fitting and unforgettable farewell.',
    features: [
      'Solemn greeting as family and mourners arrive at the chapel',
      'Leading the hearse and cortege with respectful ceremony',
      'Soulful rendition of "Flowers of the Forest" or "Going Home"',
      'Graveside final salute with "Amazing Grace"',
      'Discreet, dignified, and compassionate presence throughout'
    ],
    recommendedTunes: [
      'Amazing Grace',
      'Flowers of the Forest',
      'Going Home',
      'The Mist Covered Mountains',
      'Sleep, Dearie, Sleep'
    ],
    seoTitle: 'Funeral Bagpiper Scotland | Respectful Graveside Laments by Spud the Piper',
    seoDescription: 'Compassionate and dignified funeral bagpiper hire in Scotland. Solemn cortege leading, chapel entrance, and graveside laments including Amazing Grace and Flowers of the Forest.',
    seoKeywords: ['Funeral Bagpiper Scotland', 'Graveside Lament Bagpipes', 'Hire Piper for Funeral Edinburgh Glasgow', 'Amazing Grace Bagpipes Funeral']
  },
  {
    id: 'srv-private',
    slug: 'service-7',
    icon: 'Users',
    title: 'Anniversaries, Birthdays & Surprise Gigs',
    tagline: 'Highland surprise performances for milestones and celebrations',
    priceEstimate: 'From £350',
    basePrice: 350,
    depositAmount: 80,
    deposit: '£80 Deposit',
    heroImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80',
    description: 'Surprise your family or friends with a dramatic entrance from Spud the Piper! Perfect for milestone birthdays (40th, 50th, 60th), golden anniversaries, graduations, and private garden ceilidhs.',
    fullDescription: 'Make your loved one\'s special day unforgettable! Spud arrives unannounced, striking up hearty Scottish anthems that will stun and delight the guest of honor. Ideal for milestone birthdays, wedding anniversaries, family reunions, and retirement parties.',
    features: [
      'Unannounced surprise dramatic bagpipe entrance',
      'Happy Birthday in Highland bagpipe harmony',
      'Special tune requests and personal dedication',
      'Photos with the guest of honor in full Scottish kilt regalia'
    ],
    recommendedTunes: [
      'Happy Birthday Highland Style',
      'Scotland the Brave',
      'Mari\'s Wedding',
      'Auld Lang Syne'
    ],
    seoTitle: 'Surprise Bagpiper for Birthdays & Anniversaries | Spud the Piper',
    seoDescription: 'Hire Spud the Piper for surprise milestone birthdays, wedding anniversaries, graduations, and private parties across Scotland.',
    seoKeywords: ['Surprise Bagpiper Hire', 'Birthday Bagpiper Scotland', 'Anniversary Piper Edinburgh Glasgow', 'Surprise Scottish Piper']
  }
];

export const initialTravelConfig: TravelExpensesConfig = {
  baseLocationName: 'Spud\'s Highland Home Base (Aviemore, Cairngorms)',
  publicBaseDisplay: 'Aviemore, Highlands',
  exactAddressPrivate: '16 Lodge Lane High Burnside, Aviemore, PH22 1UJ United Kingdom (Confidential)',
  basePostcode: 'PH22 1UJ',
  baseLatitude: 57.1955,
  baseLongitude: -3.8350,
  freeRadiusMiles: 50,
  costPerMileAboveFree: 0.65,
  chargeType: 'return',
  overnightThresholdMiles: 120,
  overnightFee: 120,
  enableOvernightStay: true,
  customZones: [],
  maxBookingRadiusMiles: 250,
  islandFerrySurcharge: 85,
  overseasEnquiryOnly: true,
  customTravelNotes: 'Standard 50-mile free travel radius radiating from Aviemore includes Inverness, Speyside, Loch Ness, Cairngorms National Park, Pitlochry, and surrounding Highland glens. Fair mileage reimbursement applied for extended travel across Scotland. Bespoke long-distance & overseas expeditions welcome.'
};


