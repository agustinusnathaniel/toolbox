import type { UnitCategory } from './unit-converter';
import {
  getUnitsForCategory,
  normalizeCategory,
  normalizeUnit,
} from './unit-converter';

export interface UnitConverterSearchParams {
  category?: string;
  from?: string;
  to?: string;
  value?: string;
}

export function buildUnitConverterParams(
  value: string,
  category: UnitCategory,
  fromUnit: string,
  toUnit: string
): URLSearchParams {
  const params = new URLSearchParams();
  if (value.trim()) {
    params.set('value', value);
  }
  if (category !== 'length') {
    params.set('category', category);
  }
  const defaultFrom = getUnitsForCategory(category)[0].id;
  const defaultTo =
    getUnitsForCategory(category)[1]?.id ?? getUnitsForCategory(category)[0].id;
  if (fromUnit !== defaultFrom) {
    params.set('from', fromUnit);
  }
  if (toUnit !== defaultTo) {
    params.set('to', toUnit);
  }
  return params;
}

export function buildUnitConverterStateFromSearch(
  search: UnitConverterSearchParams
): {
  category: UnitCategory;
  value: string;
  fromUnit: string;
  toUnit: string;
} {
  const category = normalizeCategory(search.category);
  const units = getUnitsForCategory(category);
  const fromUnit = normalizeUnit(search.from, category);
  const fallbackTo = units[1]?.id ?? units[0].id;
  let toUnit: string;
  if (search.to && units.some((u) => u.id === search.to)) {
    toUnit = search.to;
  } else {
    toUnit = fallbackTo;
  }
  return {
    category,
    fromUnit,
    toUnit,
    value: search.value ?? '',
  };
}
