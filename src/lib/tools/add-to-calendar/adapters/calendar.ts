export interface CalendarEvent {
  description?: string;
  end: string;
  location?: string;
  start: string;
  title: string;
}

type CalendarProvider = 'google';

export interface CalendarLinkResult {
  provider: CalendarProvider;
  url: string;
}

const GOOGLE_CAL_TEMPLATE_LINK =
  'https://www.google.com/calendar/render?action=TEMPLATE';

const COLON_REGEX = /T/;

function trimmedIsoString(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }
  return parsed.toISOString().replace(/[-:]/g, '').replace(COLON_REGEX, '');
}

export function formatLocalDateTimeString(date?: Date | string): string {
  const d = new Date(date ?? new Date());
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function buildQueryString(event: CalendarEvent): string {
  const parts: Array<string> = [];

  if (event.title) {
    parts.push(`text=${encodeURIComponent(event.title)}`);
  }
  if (event.description) {
    parts.push(`details=${encodeURIComponent(event.description)}`);
  }
  if (event.location) {
    parts.push(`location=${encodeURIComponent(event.location)}`);
  }

  const startStr = trimmedIsoString(event.start);
  const endStr = trimmedIsoString(event.end);
  if (startStr && endStr) {
    const dates = `${startStr}%2F${endStr}`;
    parts.push(`dates=${dates}`);
  }

  return parts.join('&');
}

export function generateGoogleCalendarLink(
  event: CalendarEvent
): CalendarLinkResult {
  const queryString = buildQueryString(event);
  const url = `${GOOGLE_CAL_TEMPLATE_LINK}&${queryString}`;

  return {
    url,
    provider: 'google',
  };
}
