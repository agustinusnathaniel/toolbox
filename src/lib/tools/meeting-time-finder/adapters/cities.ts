export interface City {
  /** Country for search context */
  country: string;
  /** IANA timezone identifier, e.g. "America/New_York" */
  id: string;
  /** Display name, e.g. "New York" */
  name: string;
  /** IANA timezone identifier (same as id, kept separate for clarity) */
  timezone: string;
  /** Working hours end, 0-23 (exclusive) */
  workEnd: number;
  /** Working hours start, 0-23 */
  workStart: number;
}

import { CITIES } from './cities-data';

export const DEFAULT_CITY_IDS: ReadonlyArray<string> = [
  'america/los_angeles',
  'america/new_york',
  'europe/london',
  'asia/tokyo',
];

export function getCityById(id: string): City | undefined {
  return CITIES.find((c) => c.id === id);
}

export function searchCities(query: string): Array<City> {
  const q = query.toLowerCase().trim();
  if (!q) {
    return [];
  }
  return CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      c.timezone.toLowerCase().includes(q)
  );
}
