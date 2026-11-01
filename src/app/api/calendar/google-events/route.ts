import { NextResponse } from 'next/server';
import { parseGoogleICalFeed, ParsedCalendarEvent } from '@/lib/icalParser';
import { getLiveServerApiKeys } from '@/lib/serverApiKeys';

export const dynamic = 'force-dynamic';

const DEFAULT_ICAL_URL = 'https://calendar.google.com/calendar/ical/spudthepiper%40gmail.com/private-d12902d26d5cf53b5af20caad08f7f2d/basic.ics';

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
    const events = parseGoogleICalFeed(rawText);

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
      calendarName: 'spudthepiper@gmail.com'
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
