import { google } from 'calendar-link';

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
  'https://calendar.google.com/calendar/render?action=TEMPLATE';

export function formatLocalDateTimeString(date?: Date | string): string {
  const d = new Date(date ?? new Date());
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export interface CalendarSearchInputs {
  description?: string;
  end?: string;
  location?: string;
  start?: string;
  title?: string;
}

export function buildCalendarSearchParams(
  inputs: CalendarSearchInputs
): Record<string, string | undefined> {
  return {
    desc: inputs.description || undefined,
    end: inputs.end || undefined,
    loc: inputs.location || undefined,
    start: inputs.start || undefined,
    title: inputs.title || undefined,
  };
}

function hasValidDates(event: CalendarEvent): boolean {
  return [event.start, event.end].every(
    (date) => !Number.isNaN(new Date(date).getTime())
  );
}

export function generateGoogleCalendarLink(
  event: CalendarEvent
): CalendarLinkResult {
  // calendar-link serializes unparseable dates into the URL, so the dates
  // param is only delegated when both bounds parse; otherwise a link without
  // dates is returned.
  if (!hasValidDates(event)) {
    const query = [
      event.title && `text=${encodeURIComponent(event.title)}`,
      event.description && `details=${encodeURIComponent(event.description)}`,
      event.location && `location=${encodeURIComponent(event.location)}`,
    ]
      .filter(Boolean)
      .join('&');
    return {
      provider: 'google',
      url: query
        ? `${GOOGLE_CAL_TEMPLATE_LINK}&${query}`
        : GOOGLE_CAL_TEMPLATE_LINK,
    };
  }
  return { provider: 'google', url: google(event) };
}
