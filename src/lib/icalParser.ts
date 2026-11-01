export interface ParsedCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  startDate: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endDate: string; // YYYY-MM-DD
  endTime?: string; // HH:mm
  isAllDay: boolean;
  status?: string;
}

/**
 * Unfold RFC 5545 iCalendar content lines
 * Lines folded with CRLF + whitespace (space or tab) are joined.
 */
function unfoldICal(rawText: string): string[] {
  const normalized = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rawLines = normalized.split('\n');
  const unfolded: string[] = [];

  for (const line of rawLines) {
    if (line.startsWith(' ') || line.startsWith('\t')) {
      if (unfolded.length > 0) {
        unfolded[unfolded.length - 1] += line.slice(1);
      }
    } else {
      unfolded.push(line);
    }
  }

  return unfolded;
}

/**
 * Unescape iCal text formatting (\,, \;, \n, \\)
 */
function unescapeICalText(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
    .trim();
}

/**
 * Parse a raw iCal date string into { date: YYYY-MM-DD, time?: HH:mm, isAllDay: boolean }
 */
function parseICalDate(rawProp: string, rawVal: string): { date: string; time?: string; isAllDay: boolean } {
  const isDateOnly = rawProp.includes('VALUE=DATE') || (!rawVal.includes('T') && rawVal.length === 8);
  const cleanVal = rawVal.trim();

  if (isDateOnly) {
    // Format: YYYYMMDD
    const y = cleanVal.slice(0, 4);
    const m = cleanVal.slice(4, 6);
    const d = cleanVal.slice(6, 8);
    return {
      date: `${y}-${m}-${d}`,
      isAllDay: true
    };
  }

  // Format: YYYYMMDDTHHMMSS or YYYYMMDDTHHMMSSZ
  const parts = cleanVal.split('T');
  if (parts.length >= 2) {
    const dStr = parts[0];
    const tStr = parts[1].replace('Z', '');
    const y = dStr.slice(0, 4);
    const m = dStr.slice(4, 6);
    const d = dStr.slice(6, 8);
    const hh = tStr.slice(0, 2);
    const mm = tStr.slice(2, 4);

    return {
      date: `${y}-${m}-${d}`,
      time: `${hh}:${mm}`,
      isAllDay: false
    };
  }

  return {
    date: cleanVal.slice(0, 10),
    isAllDay: false
  };
}

/**
 * Parses raw iCalendar text into a list of events filtered within a given date window.
 * Default window: 90 days in the past to 1,000 days in the future (approx 3 years).
 */
export function parseGoogleICalFeed(
  rawText: string,
  options?: {
    minDate?: string; // YYYY-MM-DD
    maxDate?: string; // YYYY-MM-DD
  }
): ParsedCalendarEvent[] {
  const lines = unfoldICal(rawText);
  const events: ParsedCalendarEvent[] = [];

  const now = new Date();
  const defaultPast = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const defaultFuture = new Date(now.getTime() + 1095 * 24 * 60 * 60 * 1000);

  const minDateStr = options?.minDate || defaultPast.toISOString().split('T')[0];
  const maxDateStr = options?.maxDate || defaultFuture.toISOString().split('T')[0];

  let currentEvent: Partial<ParsedCalendarEvent> | null = null;
  let rawDtStartProp = '';
  let rawDtStartVal = '';
  let rawDtEndProp = '';
  let rawDtEndVal = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed === 'BEGIN:VEVENT') {
      currentEvent = {};
      rawDtStartProp = '';
      rawDtStartVal = '';
      rawDtEndProp = '';
      rawDtEndVal = '';
      continue;
    }

    if (trimmed === 'END:VEVENT') {
      if (currentEvent && currentEvent.status !== 'CANCELLED' && rawDtStartVal) {
        const startParsed = parseICalDate(rawDtStartProp, rawDtStartVal);
        const endParsed = rawDtEndVal ? parseICalDate(rawDtEndProp, rawDtEndVal) : startParsed;

        // Date window filter
        const startDate = startParsed.date;
        const endDate = endParsed.date;

        if (startDate >= minDateStr && startDate <= maxDateStr) {
          events.push({
            id: currentEvent.id || `gcal-${Math.random().toString(36).substring(2, 9)}`,
            summary: currentEvent.summary || 'Spud Google Calendar Event',
            description: currentEvent.description,
            location: currentEvent.location,
            startDate,
            startTime: startParsed.time,
            endDate,
            endTime: endParsed.time,
            isAllDay: startParsed.isAllDay,
            status: currentEvent.status || 'CONFIRMED'
          });
        }
      }
      currentEvent = null;
      continue;
    }

    if (!currentEvent) continue;

    // Parse property and value
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;

    const propHeader = trimmed.slice(0, colonIdx);
    const propVal = trimmed.slice(colonIdx + 1);

    const propName = propHeader.split(';')[0].toUpperCase();

    switch (propName) {
      case 'UID':
        currentEvent.id = propVal.trim();
        break;
      case 'SUMMARY':
        currentEvent.summary = unescapeICalText(propVal);
        break;
      case 'DESCRIPTION':
        currentEvent.description = unescapeICalText(propVal);
        break;
      case 'LOCATION':
        currentEvent.location = unescapeICalText(propVal);
        break;
      case 'STATUS':
        currentEvent.status = propVal.trim().toUpperCase();
        break;
      case 'DTSTART':
        rawDtStartProp = propHeader;
        rawDtStartVal = propVal;
        break;
      case 'DTEND':
        rawDtEndProp = propHeader;
        rawDtEndVal = propVal;
        break;
    }
  }

  // Sort chronologically
  events.sort((a, b) => a.startDate.localeCompare(b.startDate));

  return events;
}

/**
 * Checks whether a calendar event spans or occurs on a specific target date (YYYY-MM-DD)
 */
export function isEventOnDate(evt: ParsedCalendarEvent, targetDate: string): boolean {
  if (!evt || !evt.startDate) return false;
  
  if (evt.isAllDay) {
    // In iCalendar standard, all-day events have exclusive DTEND
    if (!evt.endDate || evt.startDate === evt.endDate) {
      return evt.startDate === targetDate;
    }
    return targetDate >= evt.startDate && targetDate < evt.endDate;
  }

  // For timed events, DTEND date is inclusive if multi-day
  const end = evt.endDate || evt.startDate;
  return targetDate >= evt.startDate && targetDate <= end;
}

