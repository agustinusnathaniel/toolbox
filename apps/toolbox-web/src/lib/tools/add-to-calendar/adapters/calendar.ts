export interface CalendarEvent {
  description?: string;
  end: string;
  location?: string;
  start: string;
  title: string;
}

export type CalendarProvider = 'google';

export interface CalendarLinkResult {
  provider: CalendarProvider;
  url: string;
}

const GOOGLE_CAL_TEMPLATE_LINK =
  'https://www.google.com/calendar/render?action=TEMPLATE';

const COLON_REGEX = /T/;

function trimmedIsoString(date: string): string {
  return new Date(date)
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(COLON_REGEX, '');
}

export function formatLocalDateTimeString(date?: Date | string): string {
  const d = new Date(date ?? new Date());
  const dateStr = d.toISOString().slice(0, 10);
  const timeStr = d
    .toLocaleTimeString('EN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    .slice(0, 5);
  return `${dateStr}T${timeStr}`;
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

  const dates = `${trimmedIsoString(event.start)}%2F${trimmedIsoString(event.end)}`;
  parts.push(`dates=${dates}`);

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
