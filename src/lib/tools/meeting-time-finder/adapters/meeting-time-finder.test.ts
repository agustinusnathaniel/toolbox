import { describe, expect, test } from 'vite-plus/test';

import { getCityById } from './cities';
import {
  formatCopyText,
  formatHourInZone,
  getAxisLabel,
  getCurrentTimeLabel,
  getOutlierSummary,
  hourFromStripX,
} from './meeting-time-finder';

// Fixed reference date (a Wednesday, no DST ambiguity for these zones).
const DATE = new Date('2026-10-07T14:00:00Z');
const TIME_SHAPE = /^\d{2}:\d{2}$/;

function city(id: string) {
  const c = getCityById(id);
  if (!c) {
    throw new Error(`unknown city ${id}`);
  }
  return c;
}

describe('formatHourInZone', () => {
  test('UTC passes through', () => {
    expect(formatHourInZone(14, 'UTC', DATE)).toBe('14:00');
  });

  test('whole-hour zone shifts', () => {
    // 14:00 UTC = 07:00 in San Francisco (UTC-7 in October).
    expect(formatHourInZone(14, 'America/Los_Angeles', DATE)).toBe('07:00');
    // 14:00 UTC = 15:00 in London (UTC+1, BST).
    expect(formatHourInZone(14, 'Europe/London', DATE)).toBe('15:00');
  });

  test('half-hour zone keeps minutes', () => {
    // 14:00 UTC = 19:30 in Kolkata (UTC+5:30).
    expect(formatHourInZone(14, 'Asia/Kolkata', DATE)).toBe('19:30');
  });
});

describe('getAxisLabel', () => {
  test('UTC renders compact hours', () => {
    expect(getAxisLabel(6, 'UTC', DATE)).toBe('06');
  });

  test('zone shifts the label', () => {
    expect(getAxisLabel(0, 'Asia/Jakarta', DATE)).toBe('07');
  });

  test('fractional offset keeps minutes', () => {
    expect(getAxisLabel(0, 'Asia/Kolkata', DATE)).toBe('05:30');
  });
});

describe('getCurrentTimeLabel', () => {
  test('matches HH:MM shape', () => {
    expect(getCurrentTimeLabel('Asia/Jakarta', DATE)).toMatch(TIME_SHAPE);
  });

  test('known instant converts', () => {
    // DATE is 14:00 UTC; Jakarta is UTC+7.
    expect(getCurrentTimeLabel('Asia/Jakarta', DATE)).toBe('21:00');
  });
});

describe('getOutlierSummary', () => {
  test('names the early outlier', () => {
    const cities = [city('asia/jakarta'), city('america/new_york')];
    // 16:00 UTC = 23:00 Jakarta (late), 12:00 New York (core).
    const summary = getOutlierSummary(16, cities, DATE);
    expect(summary.inHours).toBe(1);
    expect(summary.total).toBe(2);
    expect(summary.outliers).toEqual([{ name: 'Jakarta', relation: 'late' }]);
  });

  test('all in hours means no outliers', () => {
    // 02:00 UTC = 09:00 Jakarta, 22:00 New York (previous day)... pick an
    // hour core for both: 13:00 UTC = 20:00 Jakarta — no. Use UTC-friendly
    // pair instead: London + UTC at 10:00 UTC.
    const cities = [city('europe/london')];
    const summary = getOutlierSummary(10, cities, DATE);
    expect(summary.inHours).toBe(1);
    expect(summary.outliers).toEqual([]);
  });
});

describe('formatCopyText', () => {
  test('all in hours reports works for everyone', () => {
    const text = formatCopyText([city('europe/london')], 10, 60, DATE);
    const lines = text.split('\n');
    expect(lines[0]).toBe(
      'Meeting 10:00–11:00 UTC (60 min) · 1 of 1 works for everyone'
    );
    expect(lines[1]).toBe('London: 11:00 (UTC+1)');
  });

  test('outlier hour names the outlier with day shift', () => {
    const cities = [city('asia/jakarta'), city('america/new_york')];
    const text = formatCopyText(cities, 16, 120, DATE);
    const lines = text.split('\n');
    expect(lines[0]).toContain('Meeting 16:00–18:00 UTC (120 min)');
    expect(lines[0]).toContain('1 of 2 in hours · late in Jakarta');
    expect(lines[1]).toBe('Jakarta: 23:00 (UTC+7)');
    expect(lines[2]).toBe('New York: 12:00 (UTC-4)');
  });
});

describe('hourFromStripX', () => {
  // Strip at x=100, 240px wide → 10px per hour.
  test('maps edges and interior hours', () => {
    expect(hourFromStripX(100, 240, 100)).toBe(0);
    expect(hourFromStripX(100, 240, 109)).toBe(0);
    expect(hourFromStripX(100, 240, 110)).toBe(1);
    expect(hourFromStripX(100, 240, 220)).toBe(12);
    expect(hourFromStripX(100, 240, 339)).toBe(23);
  });

  test('clamps outside positions instead of wrapping', () => {
    expect(hourFromStripX(100, 240, 40)).toBe(0);
    expect(hourFromStripX(100, 240, 500)).toBe(23);
  });

  test('zero-width strip selects midnight', () => {
    expect(hourFromStripX(100, 0, 150)).toBe(0);
  });
});
