import { describe, expect, test } from 'vitest';

import {
  formatLocalDateTimeString,
  generateGoogleCalendarLink,
} from './calendar';

const DATETIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

describe('generateGoogleCalendarLink', () => {
  test('generates correct URL with title and dates', () => {
    const result = generateGoogleCalendarLink({
      title: 'Team Meeting',
      start: '2026-05-01T10:00',
      end: '2026-05-01T11:00',
    });

    expect(result.provider).toBe('google');
    expect(result.url).toContain(
      'https://www.google.com/calendar/render?action=TEMPLATE'
    );
    expect(result.url).toContain('text=Team%20Meeting');
    expect(result.url).toContain('dates=');
  });

  test('includes description and location when provided', () => {
    const result = generateGoogleCalendarLink({
      title: 'Conference',
      description: 'Annual conference',
      location: 'Convention Center',
      start: '2026-06-01T09:00',
      end: '2026-06-03T17:00',
    });

    expect(result.url).toContain('details=Annual%20conference');
    expect(result.url).toContain('location=Convention%20Center');
  });

  test('encodes special characters in title', () => {
    const result = generateGoogleCalendarLink({
      title: 'Party & Dinner @ 7pm',
      start: '2026-07-04T19:00',
      end: '2026-07-04T22:00',
    });

    expect(result.url).toContain(encodeURIComponent('Party & Dinner @ 7pm'));
  });
});

describe('formatLocalDateTimeString', () => {
  test('returns correct format for a known date', () => {
    const result = formatLocalDateTimeString(new Date('2026-03-15T14:30:00'));
    expect(result).toBe('2026-03-15T14:30');
  });

  test('returns a string without calling with undefined', () => {
    const result = formatLocalDateTimeString();
    expect(result).toMatch(DATETIME_REGEX);
  });
});
