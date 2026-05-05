import type { CalendarEvent, CalendarLinkResult } from '../types';
import { GOOGLE_CAL_TEMPLATE_LINK, trimmedIsoString } from '../utils/iso-dates';

function buildQueryString(event: CalendarEvent): string {
  const parts: string[] = [];

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

export function generateGoogleCalendarLink(event: CalendarEvent): CalendarLinkResult {
  const queryString = buildQueryString(event);
  const url = `${GOOGLE_CAL_TEMPLATE_LINK}&${queryString}`;

  return {
    url,
    provider: 'google',
  };
}
