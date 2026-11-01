import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { initialBookings } from '@/lib/initialData';
import { BookingEvent } from '@/types/spud';

export const dynamic = 'force-dynamic';

function formatIcsText(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n/g, '\\n')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\n');
}

function parseTimeSlotToHours(timeSlot?: string): { startH: number; startM: number; endH: number; endM: number } {
  const defaultTimes = { startH: 13, startM: 0, endH: 16, endM: 0 };
  if (!timeSlot) return defaultTimes;

  const parts = timeSlot.split('-');
  if (parts.length >= 2) {
    const startMatch = parts[0].trim().match(/(\d{1,2}):(\d{2})/);
    const endMatch = parts[1].trim().match(/(\d{1,2}):(\d{2})/);

    if (startMatch && endMatch) {
      return {
        startH: parseInt(startMatch[1], 10),
        startM: parseInt(startMatch[2], 10),
        endH: parseInt(endMatch[1], 10),
        endM: parseInt(endMatch[2], 10)
      };
    }
  }

  return defaultTimes;
}

function formatIcsDateTime(dateStr: string, hour: number, minute: number): string {
  // dateStr is YYYY-MM-DD
  const clean = dateStr.replace(/-/g, '');
  const hh = String(hour).padStart(2, '0');
  const mm = String(minute).padStart(2, '0');
  return `${clean}T${hh}${mm}00`;
}

export async function GET() {
  try {
    let bookingsList: BookingEvent[] = [];

    // Attempt to query live bookings from Firestore
    if (db) {
      try {
        const snap = await getDocs(collection(db, 'bookings'));
        if (!snap.empty) {
          bookingsList = snap.docs.map(d => ({ id: d.id, ...d.data() } as BookingEvent));
        }
      } catch (e) {
        console.warn('[Calendar Export] Firestore fetch error, falling back to initialBookings:', e);
      }
    }

    if (bookingsList.length === 0) {
      bookingsList = initialBookings;
    }

    // Filter out cancelled bookings
    const activeBookings = bookingsList.filter(b => b.status !== 'cancelled' && b.date);

    const nowStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const icsLines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Spud The Piper//Highland Booking Diary//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Spud the Piper - Bookings & Gigs',
      'X-WR-TIMEZONE:Europe/London'
    ];

    for (const b of activeBookings) {
      const times = parseTimeSlotToHours(b.timeSlot);
      const dtStart = formatIcsDateTime(b.date, times.startH, times.startM);
      const dtEnd = formatIcsDateTime(b.date, times.endH, times.endM);

      const statusBadge = b.status === 'deposit_paid' ? 'LOCKED / DEPOSIT PAID' : b.status.toUpperCase();
      const location = [b.venueName, b.venueAddress, b.venuePostcode].filter(Boolean).join(', ');
      
      const descParts = [
        `STATUS: ${statusBadge}`,
        `CLIENT: ${b.clientName}`,
        `PHONE: ${b.clientPhone}`,
        `EMAIL: ${b.clientEmail}`,
        `EVENT: ${b.eventType}`,
        `TIME SLOT: ${b.timeSlot}`,
        `TOTAL FEE: £${b.estimatedPrice}`,
        `DEPOSIT: £${b.depositAmount}`,
        `TARTAN / ATTIRE: ${b.tartanChoice}`,
        b.specialTunes && b.specialTunes.length > 0 ? `TUNES: ${b.specialTunes.join(', ')}` : '',
        b.notes ? `NOTES: ${b.notes}` : '',
        `ONLINE BOOKING ID: #${b.id}`
      ].filter(Boolean).join('\n');

      let summaryText = `Piper: ${b.clientName} (${b.eventType})`;
      if (b.entryType === 'holiday') {
        summaryText = `🏖️ Holiday: ${b.clientName || 'Time Off'}`;
      } else if (b.entryType === 'family') {
        summaryText = `👨‍👩‍👧‍👦 Family: ${b.clientName || 'Family Event'}`;
      } else if (b.entryType === 'other') {
        summaryText = `📌 Other: ${b.clientName || 'Personal Event'}`;
      }

      icsLines.push(
        'BEGIN:VEVENT',
        `UID:spud-booking-${b.id}@spudthepiper.com`,
        `DTSTAMP:${nowStamp}`,
        `DTSTART;TZID=Europe/London:${dtStart}`,
        `DTEND;TZID=Europe/London:${dtEnd}`,
        `SUMMARY:${formatIcsText(summaryText)}`,
        `LOCATION:${formatIcsText(location)}`,
        `DESCRIPTION:${formatIcsText(descParts)}`,
        `STATUS:${b.status === 'deposit_paid' ? 'CONFIRMED' : 'TENTATIVE'}`,
        'END:VEVENT'
      );
    }

    icsLines.push('END:VCALENDAR');

    const icsBody = icsLines.join('\r\n');

    return new Response(icsBody, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="spud-diary.ics"',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (err: any) {
    console.error('[Calendar Export Error]:', err);
    return new Response('Error generating calendar feed', { status: 500 });
  }
}
