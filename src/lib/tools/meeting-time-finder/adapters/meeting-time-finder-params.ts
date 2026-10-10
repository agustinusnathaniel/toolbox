import type { City } from './cities';
import { getCityById } from './cities';

/**
 * URL search params for the meeting time finder.
 * Cities are encoded as "id:workStart:workEnd" joined by commas.
 * Duration is in minutes. Hour is the selected UTC hour (0-23).
 */
export interface MeetingTimeFinderParams {
  cities: Array<City>;
  duration: number;
  hour: number | null;
}

const DEFAULT_DURATION = 60;

function parseWorkHour(raw: string | undefined, fallback: number): number {
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 23) {
    return fallback;
  }
  return parsed;
}

/**
 * Parse cities from a URL param string.
 * Format: "id:workStart:workEnd,id:workStart:workEnd".
 * Entries with unknown ids are dropped; invalid hours fall back to defaults.
 */
export function parseCitiesParam(value: string | undefined): Array<City> {
  if (!value) {
    return [];
  }
  const cities: Array<City> = [];
  for (const entry of value.split(',').filter(Boolean)) {
    const [id, startRaw, endRaw] = entry.split(':');
    const base = getCityById(id);
    if (!base) {
      continue;
    }
    cities.push({
      ...base,
      workEnd: parseWorkHour(endRaw, base.workEnd),
      workStart: parseWorkHour(startRaw, base.workStart),
    });
  }
  return cities;
}

/**
 * Serialize cities to a URL param string.
 */
export function serializeCitiesParam(cities: ReadonlyArray<City>): string {
  return cities.map((c) => `${c.id}:${c.workStart}:${c.workEnd}`).join(',');
}

/**
 * Parse duration from a URL param string (in minutes).
 */
export function parseDurationParam(value: string | undefined): number {
  if (!value) {
    return DEFAULT_DURATION;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 15) {
    return DEFAULT_DURATION;
  }
  return Math.min(parsed, 480); // Max 8 hours
}

/**
 * Parse the selected UTC hour (0-23). Null means "not specified".
 */
export function parseHourParam(value: string | undefined): number | null {
  if (value === undefined || value === '') {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 23) {
    return null;
  }
  return parsed;
}

/**
 * Build URL search params from meeting state.
 */
export function buildMeetingParams(
  cities: ReadonlyArray<City>,
  duration: number,
  hour: number
): URLSearchParams {
  const params = new URLSearchParams();
  const citiesStr = serializeCitiesParam(cities);
  if (citiesStr) {
    params.set('cities', citiesStr);
  }
  params.set('duration', String(duration));
  params.set('hour', String(hour));
  return params;
}

/**
 * Parse URL search params into meeting state.
 */
export function parseMeetingParams(search: {
  cities?: string;
  duration?: string;
  hour?: string;
}): MeetingTimeFinderParams {
  return {
    cities: parseCitiesParam(search.cities),
    duration: parseDurationParam(search.duration),
    hour: parseHourParam(search.hour),
  };
}
