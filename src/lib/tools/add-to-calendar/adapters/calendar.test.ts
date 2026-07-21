import { describe, expect, test } from 'vite-plus/test';

import {
  buildCalendarSearchParams,
  formatLocalDateTimeString,
  generateGoogleCalendarLink,
} from './calendar';

const DATETIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const DATES_PARAM_REGEX = /dates=([^&]+)/;
const DATE_TIME_FMT_REGEX = /^\d{8}T\d{6}Z$/;

describe('generateGoogleCalendarLink', () => {
  test('generates correct URL with title and dates', () => {
    const result = generateGoogleCalendarLink({
      end: '2026-05-01T11:00',
      start: '2026-05-01T10:00',
      title: 'Team Meeting',
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
      description: 'Annual conference',
      end: '2026-06-03T17:00',
      location: 'Convention Center',
      start: '2026-06-01T09:00',
      title: 'Conference',
    });

    expect(result.url).toContain('details=Annual%20conference');
    expect(result.url).toContain('location=Convention%20Center');
  });

  test('encodes special characters in title', () => {
    const result = generateGoogleCalendarLink({
      end: '2026-07-04T22:00',
      start: '2026-07-04T19:00',
      title: 'Party & Dinner @ 7pm',
    });

    expect(result.url).toContain(encodeURIComponent('Party & Dinner @ 7pm'));
  });

  test('dates parameter uses YYYYMMDDTHHMMSSZ format without millisecond suffix', () => {
    const result = generateGoogleCalendarLink({
      end: '2026-06-27T13:30:00',
      start: '2026-06-27T12:00:00',
      title: 'Test',
    });

    // Extract the dates parameter value
    const datesMatch = result.url.match(DATES_PARAM_REGEX);
    expect(datesMatch).not.toBeNull();
    const dates = (datesMatch as RegExpMatchArray)[1];
    // The dates value is start%2Fend (URL-encoded forward slash)
    const [startDate, endDate] = dates.split('%2F');

    // Format should be YYYYMMDDTHHMMSSZ — no periods (no .NNN suffix)
    expect(startDate).toMatch(DATE_TIME_FMT_REGEX);
    expect(endDate).toMatch(DATE_TIME_FMT_REGEX);
    expect(startDate).not.toContain('.');
    expect(endDate).not.toContain('.');
  });
});

test('handles invalid date strings gracefully', () => {
  const result = generateGoogleCalendarLink({
    end: 'also-invalid',
    start: 'not-a-date',
    title: 'Test',
  });

  expect(result.url).toContain('text=Test');
  expect(result.url).not.toContain('dates=');
});

test('handles mix of valid and invalid dates', () => {
  const result = generateGoogleCalendarLink({
    end: 'invalid',
    start: '2026-05-01T10:00',
    title: 'Test',
  });

  expect(result.url).toContain('text=Test');
  expect(result.url).not.toContain('dates=');
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

describe('buildCalendarSearchParams', () => {
  test('returns object with all fields', () => {
    const result = buildCalendarSearchParams({
      description: 'Weekly sync',
      end: '2026-06-01T11:00',
      location: 'Room 1',
      start: '2026-06-01T10:00',
      title: 'Team Meeting',
    });
    expect(result).toEqual({
      desc: 'Weekly sync',
      end: '2026-06-01T11:00',
      loc: 'Room 1',
      start: '2026-06-01T10:00',
      title: 'Team Meeting',
    });
  });

  test('omits empty fields', () => {
    const result = buildCalendarSearchParams({
      description: '',
      end: '',
      location: '',
      start: '',
      title: '',
    });
    expect(result).toEqual({
      desc: undefined,
      end: undefined,
      loc: undefined,
      start: undefined,
      title: undefined,
    });
  });

  test('handles partial inputs', () => {
    const result = buildCalendarSearchParams({
      title: 'Conference',
    });
    expect(result).toEqual({
      desc: undefined,
      end: undefined,
      loc: undefined,
      start: undefined,
      title: 'Conference',
    });
  });
});
