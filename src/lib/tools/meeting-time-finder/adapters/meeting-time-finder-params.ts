import type { City } from './cities';
import { getCityById } from './cities';

/**
 * URL search params for the meeting time finder.
 * Cities are encoded as "id:workStart:workEnd" joined by commas.
 * Duration is in minutes.
 */
export interface MeetingTimeFinderParams {
  cities: Array<City>;
  duration: number;
}

const DEFAULT_DURATION = 60;

/**
 * Parse cities from a URL param string.
 * Format: "id:workStart:workEnd,id:workStart:workEnd"
 */
export function parseCitiesParam(value: string | undefined): Array<City> {
  if (!value) {
    return [];
  }
  const ids = value.split(',').filter(Boolean);
  const cities: Array<City> = [];
  for (const id of ids) {
    const city = getCityById(id);
    if (city) {
      cities.push(city);
    }
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
 * Build URL search params from meeting state.
 */
export function buildMeetingParams(
  cities: ReadonlyArray<City>,
  duration: number
): URLSearchParams {
  const params = new URLSearchParams();
  const citiesStr = serializeCitiesParam(cities);
  if (citiesStr) {
    params.set('cities', citiesStr);
  }
  params.set('duration', String(duration));
  return params;
}

/**
 * Parse URL search params into meeting state.
 */
export function parseMeetingParams(search: {
  cities?: string;
  duration?: string;
}): MeetingTimeFinderParams {
  return {
    cities: parseCitiesParam(search.cities),
    duration: parseDurationParam(search.duration),
  };
}
