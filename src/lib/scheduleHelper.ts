import { GoogleCalendarEvent, BookingEvent } from '@/types/spud';
import { isEventOnDate } from '@/lib/icalParser';

export function timeToMinutes(t?: string): number {
  if (!t) return 0;
  const parts = t.trim().split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

export function minutesToTime(mins: number): string {
  const clamped = Math.max(0, Math.min(23 * 60 + 59, mins));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function parseSlotRange(str: string): { start: number; end: number } | null {
  if (!str) return null;
  const m = str.match(/(\d{1,2}:\d{2})\s*(?:-|to)\s*(\d{1,2}:\d{2})/);
  if (!m) return null;
  return { start: timeToMinutes(m[1]), end: timeToMinutes(m[2]) };
}

export function checkTimeOverlap(s1: number, e1: number, s2: number, e2: number): boolean {
  return s1 < e2 && e1 > s2;
}

export interface BookedSlot {
  id: string;
  summary: string;
  startTime: string;
  endTime: string;
  startMins: number;
  endMins: number;
  timeLabel: string;
  categoryLabel: string;
  isAirbnb: boolean;
}

export interface DayScheduleInfo {
  dateString: string;
  isAllDayBlocked: boolean;
  isPartiallyBooked: boolean;
  isAvailable: boolean;
  bookedSlots: BookedSlot[];
  freeWindows: string[];
}

/**
 * Computes whether a day is fully available, partially booked (with times), or blocked all day.
 */
export function computeDaySchedule(
  dateString: string,
  gcalEvents: GoogleCalendarEvent[] | null | undefined,
  websiteBookings: BookingEvent[] | null | undefined,
  isGoogleCalendarBlockEnabled: boolean = true
): DayScheduleInfo {
  const dayGCal = isGoogleCalendarBlockEnabled
    ? (gcalEvents || []).filter(evt => isEventOnDate(evt, dateString))
    : [];

  const dayWebsite = (websiteBookings || []).filter(b => {
    if (!b || !b.date || b.status === 'cancelled') return false;
    const endDate = (b as any).endDate || b.date;
    return dateString >= b.date && dateString <= endDate;
  });

  // Check if any event is an All-Day block
  const isAllDayGCal = dayGCal.some(evt => {
    if (evt.isAllDay || evt.category === 'holiday') return true;
    if (!evt.startTime) return true; // untimed event in Google Calendar = full day block
    if (evt.startTime && evt.endTime) {
      const dur = timeToMinutes(evt.endTime) - timeToMinutes(evt.startTime);
      if (dur >= 8 * 60) return true; // 8+ hours = all day
    }
    return false;
  });

  const isAllDayWebsite = dayWebsite.some(b => {
    if ((b as any).isAllDay || b.entryType === 'holiday') return true;
    const slot = (b.timeSlot || '').toLowerCase();
    if (slot.includes('all day') || slot.includes('full day') || slot.includes('allday')) return true;
    return false;
  });

  if (isAllDayGCal || isAllDayWebsite) {
    return {
      dateString,
      isAllDayBlocked: true,
      isPartiallyBooked: false,
      isAvailable: false,
      bookedSlots: [],
      freeWindows: []
    };
  }

  // Parse timed booked slots
  const bookedSlots: BookedSlot[] = [];

  for (const g of dayGCal) {
    const sTime = g.startTime || '12:00';
    let eTime = g.endTime;
    if (!eTime) {
      // Default 2 hours if end time not specified
      eTime = minutesToTime(Math.min(23 * 60, timeToMinutes(sTime) + 120));
    }
    const isAbnb = g.category === 'airbnb' || (g.summary || '').toLowerCase().includes('airbnb');
    bookedSlots.push({
      id: g.id || `gcal-${Math.random()}`,
      summary: isAbnb ? 'Airbnb Bagpipe Masterclass (Carrbridge)' : 'Reserved Session',
      startTime: sTime,
      endTime: eTime,
      startMins: timeToMinutes(sTime),
      endMins: timeToMinutes(eTime),
      timeLabel: `${sTime} - ${eTime}`,
      categoryLabel: isAbnb ? 'Airbnb Masterclass' : 'Private Diary Booking',
      isAirbnb: isAbnb
    });
  }

  for (const b of dayWebsite) {
    const parsed = parseSlotRange(b.timeSlot || '');
    const sTime = parsed ? minutesToTime(parsed.start) : '13:00';
    const eTime = parsed ? minutesToTime(parsed.end) : '16:00';
    const isAbnb = b.entryType === 'airbnb';
    bookedSlots.push({
      id: b.id || `web-${Math.random()}`,
      summary: isAbnb ? 'Airbnb Bagpipe Masterclass' : (b.eventType || 'Confirmed Booking'),
      startTime: sTime,
      endTime: eTime,
      startMins: timeToMinutes(sTime),
      endMins: timeToMinutes(eTime),
      timeLabel: `${sTime} - ${eTime}`,
      categoryLabel: isAbnb ? 'Airbnb Masterclass' : 'Confirmed Gig',
      isAirbnb: isAbnb
    });
  }

  if (bookedSlots.length === 0) {
    return {
      dateString,
      isAllDayBlocked: false,
      isPartiallyBooked: false,
      isAvailable: true,
      bookedSlots: [],
      freeWindows: ['Full Day Available (08:00 - 22:00)']
    };
  }

  // Sort booked slots chronologically
  bookedSlots.sort((a, b) => a.startMins - b.startMins);

  // Compute free windows within 08:00 - 22:00
  const dayStart = timeToMinutes('08:00');
  const dayEnd = timeToMinutes('22:00');
  let cursor = dayStart;
  const freeWindows: string[] = [];

  for (const b of bookedSlots) {
    if (b.startMins > cursor + 30) {
      freeWindows.push(`${minutesToTime(cursor)} - ${minutesToTime(b.startMins)}`);
    }
    cursor = Math.max(cursor, b.endMins);
  }
  if (cursor + 30 < dayEnd) {
    freeWindows.push(`${minutesToTime(cursor)} - ${minutesToTime(dayEnd)}`);
  }

  return {
    dateString,
    isAllDayBlocked: false,
    isPartiallyBooked: true,
    isAvailable: true,
    bookedSlots,
    freeWindows: freeWindows.length > 0 ? freeWindows : ['Contact Spud for remaining gaps']
  };
}
