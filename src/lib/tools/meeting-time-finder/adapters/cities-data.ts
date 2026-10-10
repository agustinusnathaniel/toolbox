import type { City } from './cities';
import { AMERICAS_CITIES } from './cities-data-americas';
import { ASIA_OCEANIA_CITIES } from './cities-data-asia-oceania';
import { EUROPE_AFRICA_CITIES } from './cities-data-europe-africa';

export const CITIES: ReadonlyArray<City> = [
  ...AMERICAS_CITIES,
  ...ASIA_OCEANIA_CITIES,
  ...EUROPE_AFRICA_CITIES,
];
