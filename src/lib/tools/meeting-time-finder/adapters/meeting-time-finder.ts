import type { City } from './cities';

/**
 * Get the current UTC offset in minutes for a timezone.
 * Uses Intl.DateTimeFormat for reliable DST handling.
 *
 * Offsets are memoized per timezone + UTC day: a single drag across the
 * timeline re-renders 24 header scores plus every city cell, and each
 * uncached lookup costs two toLocaleString calls.
 */
const offsetCache = new Map<string, number>();

export function getTimezoneOffsetMinutes(
  timezone: string,
  date: Date = new Date()
): number {
  const key = `${timezone}|${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
  const cached = offsetCache.get(key);
  if (cached !== undefined) {
    return cached;
  }
  if (offsetCache.size > 1000) {
    offsetCache.clear();
  }
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  const offset = (tzDate.getTime() - utcDate.getTime()) / 60_000;
  offsetCache.set(key, offset);
  return offset;
}

/**
 * Get the local hour (0-23) in a timezone for a given UTC hour.
 */
export function getLocalHour(
  utcHour: number,
  timezone: string,
  date: Date = new Date()
): number {
  const offsetMinutes = getTimezoneOffsetMinutes(timezone, date);
  const localMinutes = utcHour * 60 + offsetMinutes;
  return ((Math.floor(localMinutes / 60) % 24) + 24) % 24;
}

/**
 * Get the local time (hour + minute) in a timezone for a given UTC hour.
 * Needed for half-hour zones (e.g. Asia/Kolkata is UTC+5:30), where
 * hour-only math would silently drop the :30.
 */
export function getLocalHourMinute(
  utcHour: number,
  timezone: string,
  date: Date = new Date()
): { hour: number; minute: number } {
  const offsetMinutes = getTimezoneOffsetMinutes(timezone, date);
  const localMinutes = utcHour * 60 + offsetMinutes;
  const normalized = ((localMinutes % 1440) + 1440) % 1440;
  return {
    hour: Math.floor(normalized / 60),
    minute: normalized % 60,
  };
}

/**
 * Format a UTC hour as seen in a timezone: "14:00", or "14:30" when the
 * zone offset has a fractional hour.
 */
export function formatHourInZone(
  utcHour: number,
  timezone: string,
  date: Date = new Date()
): string {
  if (timezone === 'UTC') {
    return `${String(utcHour).padStart(2, '0')}:00`;
  }
  const { hour, minute } = getLocalHourMinute(utcHour, timezone, date);
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/**
 * Compact axis label for a UTC hour column as seen in a reference zone.
 * Whole-hour offsets render as "14", fractional ones as "14:30".
 */
export function getAxisLabel(
  utcHour: number,
  timezone: string,
  date: Date = new Date()
): string {
  if (timezone === 'UTC') {
    return String(utcHour).padStart(2, '0');
  }
  const { hour, minute } = getLocalHourMinute(utcHour, timezone, date);
  const hh = String(hour).padStart(2, '0');
  return minute === 0 ? hh : `${hh}:${String(minute).padStart(2, '0')}`;
}

/**
 * Current local time ("HH:MM") in a timezone, for search results and menus.
 */
export function getCurrentTimeLabel(
  timezone: string,
  date: Date = new Date()
): string {
  const offsetMinutes = getTimezoneOffsetMinutes(timezone, date);
  const utcMinutes =
    date.getUTCHours() * 60 + date.getUTCMinutes() + offsetMinutes;
  const normalized = ((utcMinutes % 1440) + 1440) % 1440;
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/**
 * Get the timezone offset in hours as a display string, e.g. "UTC+5:30" or "UTC-7".
 */
export function getTimezoneOffsetLabel(
  timezone: string,
  date: Date = new Date()
): string {
  const offsetMinutes = getTimezoneOffsetMinutes(timezone, date);
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMinutes);
  const hours = Math.floor(abs / 60);
  const mins = abs % 60;
  return mins === 0
    ? `UTC${sign}${hours}`
    : `UTC${sign}${hours}:${String(mins).padStart(2, '0')}`;
}

/**
 * Normalize working hours to a range that doesn't wrap around midnight.
 * Returns [start, end] where end may be > 24 for night shifts.
 */
function normalizeWorkHours(
  workStart: number,
  workEnd: number
): [number, number] {
  if (workEnd <= workStart) {
    return [workStart, workEnd + 24];
  }
  return [workStart, workEnd];
}

/**
 * Score a local hour for a city based on its working hours.
 * Returns a value from 0.0 (asleep) to 1.0 (core working hours).
 *
 * Gradient:
 * - Core hours [workStart, workEnd): 1.0
 * - Shoulder hours (2h before/after): 0.6
 * - Edge hours (2-4h before/after): 0.3
 * - Asleep: 0.0
 */
export function getHourScore(
  localHour: number,
  workStart: number,
  workEnd: number
): number {
  const [start, end] = normalizeWorkHours(workStart, workEnd);
  const hour = localHour < start ? localHour + 24 : localHour;

  if (hour >= start && hour < end) {
    return 1.0;
  }
  if (hour >= start - 2 && hour < start) {
    return 0.6;
  }
  if (hour >= end && hour < end + 2) {
    return 0.6;
  }
  if (hour >= start - 4 && hour < start - 2) {
    return 0.3;
  }
  if (hour >= end + 2 && hour < end + 4) {
    return 0.3;
  }
  return 0.0;
}

/**
 * Calculate the overall goodness score for a UTC hour across all cities.
 * Returns a value from 0.0 to 1.0.
 */
export function getOverallScore(
  utcHour: number,
  cities: ReadonlyArray<City>,
  date: Date = new Date()
): number {
  if (cities.length === 0) {
    return 0;
  }
  let total = 0;
  for (const city of cities) {
    const localHour = getLocalHour(utcHour, city.timezone, date);
    total += getHourScore(localHour, city.workStart, city.workEnd);
  }
  return total / cities.length;
}

/**
 * Calculate scores for all 24 UTC hours.
 */
export function getAllHourScores(
  cities: ReadonlyArray<City>,
  date: Date = new Date()
): Array<number> {
  const scores: Array<number> = [];
  for (let h = 0; h < 24; h++) {
    scores.push(getOverallScore(h, cities, date));
  }
  return scores;
}

export interface BestTimeResult {
  /** Human-readable label, e.g. "14:00 - 15:00 UTC" */
  label: string;
  /** Average goodness score across the duration window, 0.0-1.0 */
  score: number;
  /** UTC hour (0-23) to start the meeting */
  startHour: number;
}

/**
 * Find the best meeting time window of a given duration.
 * Scores each possible start hour by the average goodness across the window.
 */
export function findBestTime(
  cities: ReadonlyArray<City>,
  durationMinutes: number,
  date: Date = new Date()
): BestTimeResult | null {
  if (cities.length === 0) {
    return null;
  }

  const durationHours = Math.max(1, Math.ceil(durationMinutes / 60));
  const hourScores = getAllHourScores(cities, date);

  let bestStart = 0;
  let bestScore = -1;

  for (let s = 0; s < 24; s++) {
    let windowScore = 0;
    for (let i = 0; i < durationHours; i++) {
      windowScore += hourScores[(s + i) % 24];
    }
    const avgScore = windowScore / durationHours;
    if (avgScore > bestScore) {
      bestScore = avgScore;
      bestStart = s;
    }
  }

  const endHour = (bestStart + durationHours) % 24;
  const label = `${String(bestStart).padStart(2, '0')}:00 - ${String(endHour).padStart(2, '0')}:00 UTC`;

  return { label, score: bestScore, startHour: bestStart };
}

/**
 * Get a human-readable status for a city at a given UTC hour.
 */
export function getCityStatus(
  utcHour: number,
  city: City,
  date: Date = new Date()
): 'core' | 'shoulder' | 'edge' | 'asleep' {
  const localHour = getLocalHour(utcHour, city.timezone, date);
  const score = getHourScore(localHour, city.workStart, city.workEnd);
  if (score >= 1.0) {
    return 'core';
  }
  if (score >= 0.6) {
    return 'shoulder';
  }
  if (score >= 0.3) {
    return 'edge';
  }
  return 'asleep';
}

/**
 * Get the local time label for a city at a given UTC hour.
 * Returns e.g. "14:00" or "09:00 (+1 day)" or "21:00 (-1 day)".
 */
export function getLocalTimeLabel(
  utcHour: number,
  city: City,
  date: Date = new Date()
): string {
  const offsetMinutes = getTimezoneOffsetMinutes(city.timezone, date);
  const localMinutes = utcHour * 60 + offsetMinutes;
  const dayShift = Math.floor(localMinutes / 1440);
  const hour = ((Math.floor(localMinutes / 60) % 24) + 24) % 24;
  const timeStr = `${String(hour).padStart(2, '0')}:00`;

  if (dayShift > 0) {
    return `${timeStr} (+${dayShift}d)`;
  }
  if (dayShift < 0) {
    return `${timeStr} (${dayShift}d)`;
  }
  return timeStr;
}

/**
 * Get a summary of how many cities are in each status category.
 */
export function getStatusSummary(
  utcHour: number,
  cities: ReadonlyArray<City>,
  date: Date = new Date()
): { core: number; shoulder: number; edge: number; asleep: number } {
  const summary = { asleep: 0, core: 0, edge: 0, shoulder: 0 };
  for (const city of cities) {
    const status = getCityStatus(utcHour, city, date);
    summary[status]++;
  }
  return summary;
}

export type OutOfHoursRelation = 'early' | 'late';

export interface OutlierNote {
  name: string;
  relation: OutOfHoursRelation;
}

/**
 * Smart status summary: how many cities are in core hours, plus which
 * cities fall outside (and on which side). Powers the
 * "3 of 4 · early in San Francisco" status line.
 */
export function getOutlierSummary(
  utcHour: number,
  cities: ReadonlyArray<City>,
  date: Date = new Date()
): { inHours: number; total: number; outliers: Array<OutlierNote> } {
  const outliers: Array<OutlierNote> = [];
  let inHours = 0;
  for (const city of cities) {
    if (getCityStatus(utcHour, city, date) === 'core') {
      inHours++;
      continue;
    }
    const localHour = getLocalHour(utcHour, city.timezone, date);
    let relation: OutOfHoursRelation;
    if (city.workEnd <= city.workStart) {
      // Overnight schedule (e.g. 22–6): the out-of-hours gap is
      // [workEnd, workStart). Split at its midpoint.
      const midpoint = (city.workEnd + city.workStart) / 2;
      relation = localHour < midpoint ? 'late' : 'early';
    } else {
      relation = localHour < city.workStart ? 'early' : 'late';
    }
    outliers.push({ name: city.name, relation });
  }
  return { inHours, outliers, total: cities.length };
}
