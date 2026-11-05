import { NextResponse } from 'next/server';
import { parseGoogleICalFeed, ParsedCalendarEvent } from '@/lib/icalParser';
import { getLiveServerApiKeys } from '@/lib/serverApiKeys';

export const dynamic = 'force-dynamic';

const DEFAULT_ICAL_URL = 'https://calendar.google.com/calendar/ical/spudthepiper%40gmail.com/private-d12902d26d5cf53b5af20caad08f7f2d/basic.ics';

// Verified Airbnb Experience #7375032 contract sessions scheduled at Carrbridge Hotel
const SPUD_AIRBNB_EXPERIENCE_SLOTS: ParsedCalendarEvent[] = [
  {
    id: 'airbnb-exp-7375032-1',
    summary: 'Airbnb Experience: Learn to play Highland bagpipes',
    description: 'Airbnb Contract #7375032 • Carrbridge Hotel workshop with @spudthepiper (Up to 10 guests)',
    location: 'Carrbridge Hotel, Carrbridge, Highland Council, PH23 3AB',
    startDate: '2026-11-08',
    startTime: '12:00',
    endDate: '2026-11-08',
    endTime: '13:30',
    isAllDay: false,
    category: 'airbnb'
  },
  {
    id: 'airbnb-exp-7375032-2',
    summary: 'Airbnb Experience: Learn to play Highland bagpipes',
    description: 'Airbnb Contract #7375032 • Carrbridge Hotel workshop with @spudthepiper (Up to 10 guests)',
    location: 'Carrbridge Hotel, Carrbridge, Highland Council, PH23 3AB',
    startDate: '2026-11-11',
    startTime: '14:00',
    endDate: '2026-11-11',
    endTime: '15:30',
    isAllDay: false,
    category: 'airbnb'
  },
  {
    id: 'airbnb-exp-7375032-3',
    summary: 'Airbnb Experience: Learn to play Highland bagpipes',
    description: 'Airbnb Contract #7375032 • Carrbridge Hotel workshop with @spudthepiper (Up to 10 guests)',
    location: 'Carrbridge Hotel, Carrbridge, Highland Council, PH23 3AB',
    startDate: '2026-12-03',
    startTime: '10:00',
    endDate: '2026-12-03',
    endTime: '11:30',
    isAllDay: false,
    category: 'airbnb'
  },
  {
    id: 'airbnb-exp-7375032-4',
    summary: 'Airbnb Experience: Learn to play Highland bagpipes',
    description: 'Airbnb Contract #7375032 • Carrbridge Hotel workshop with @spudthepiper (Up to 10 guests)',
    location: 'Carrbridge Hotel, Carrbridge, Highland Council, PH23 3AB',
    startDate: '2026-12-04',
    startTime: '10:00',
    endDate: '2026-12-04',
    endTime: '11:30',
    isAllDay: false,
    category: 'airbnb'
  },
  {
    id: 'airbnb-exp-7375032-5',
    summary: 'Airbnb Experience: Learn to play Highland bagpipes',
    description: 'Airbnb Contract #7375032 • Carrbridge Hotel workshop with @spudthepiper (Up to 10 guests)',
    location: 'Carrbridge Hotel, Carrbridge, Highland Council, PH23 3AB',
    startDate: '2026-12-09',
    startTime: '10:00',
    endDate: '2026-12-09',
    endTime: '11:30',
    isAllDay: false,
    category: 'airbnb'
  }
];

// Cache in-memory for 3 minutes
interface CacheEntry {
  data: ParsedCalendarEvent[];
  timestamp: number;
}
let memoryCache: CacheEntry | null = null;
const CACHE_TTL_MS = 3 * 60 * 1000;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';
    const customUrl = searchParams.get('url');

    const now = Date.now();
    if (!forceRefresh && !customUrl && memoryCache && (now - memoryCache.timestamp < CACHE_TTL_MS)) {
      return NextResponse.json({
        success: true,
        cached: true,
        events: memoryCache.data,
        count: memoryCache.data.length,
        syncedAt: new Date(memoryCache.timestamp).toISOString(),
        calendarName: 'spudthepiper@gmail.com'
      });
    }

    // Determine target iCal URL
    let targetUrl: string = customUrl || '';
    if (!targetUrl) {
      const serverKeys = await getLiveServerApiKeys();
      targetUrl = (serverKeys as any).googleCalendarIcalUrl || process.env.GOOGLE_CALENDAR_ICAL_URL || DEFAULT_ICAL_URL;
    }

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'SpudThePiper-App/1.0 (+https://www.spudthepiper.com)'
      },
      next: { revalidate: 180 }
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Google Calendar returned status ${response.status}: ${response.statusText}`
        },
        { status: 502 }
      );
    }

    const rawText = await response.text();
    const parsedGoogleEvents = parseGoogleICalFeed(rawText);

    // Merge Airbnb Experience contract slots into events so they show seamlessly in availability calendar
    const allEventsMap = new Map<string, ParsedCalendarEvent>();
    for (const evt of parsedGoogleEvents) {
      allEventsMap.set(evt.id, evt);
    }
    for (const airbnbSlot of SPUD_AIRBNB_EXPERIENCE_SLOTS) {
      if (!allEventsMap.has(airbnbSlot.id)) {
        allEventsMap.set(airbnbSlot.id, airbnbSlot);
      }
    }

    // Also support optional live Airbnb iCal feed if configured in Firestore / env
    const serverKeys = await getLiveServerApiKeys();
    const airbnbIcalUrl = (serverKeys as any).airbnbIcalUrl || process.env.AIRBNB_ICAL_URL;
    if (airbnbIcalUrl && airbnbIcalUrl.startsWith('http')) {
      try {
        const abnbRes = await fetch(airbnbIcalUrl, { next: { revalidate: 300 } });
        if (abnbRes.ok) {
          const abnbText = await abnbRes.text();
          const abnbEvents = parseGoogleICalFeed(abnbText).map(e => ({ ...e, category: 'airbnb' as const }));
          for (const ae of abnbEvents) {
            allEventsMap.set(ae.id, ae);
          }
        }
      } catch (e) {
        console.warn('Optional Airbnb iCal fetch warning:', e);
      }
    }

    const events = Array.from(allEventsMap.values()).sort((a, b) => a.startDate.localeCompare(b.startDate));

    if (!customUrl) {
      memoryCache = {
        data: events,
        timestamp: now
      };
    }

    return NextResponse.json({
      success: true,
      cached: false,
      events,
      count: events.length,
      syncedAt: new Date(now).toISOString(),
      calendarName: 'spudthepiper@gmail.com + Airbnb Experience #7375032'
    });
  } catch (error: any) {
    console.error('[Google Calendar Sync API Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to sync with Google Calendar'
      },
      { status: 500 }
    );
  }
}
