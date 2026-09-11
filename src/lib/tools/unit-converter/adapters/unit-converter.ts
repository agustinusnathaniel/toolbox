import type { Unit } from 'convert';
import { convert } from 'convert';

export type UnitCategory =
  | 'length'
  | 'weight'
  | 'temperature'
  | 'volume'
  | 'data';

interface UnitDef {
  id: string;
  label: string;
  symbol: string;
}

interface CategoryDef {
  id: UnitCategory;
  label: string;
  units: Array<UnitDef>;
}

export const UNIT_CATEGORIES: Array<CategoryDef> = [
  {
    id: 'length',
    label: 'Length',
    units: [
      { id: 'mm', label: 'Millimeter', symbol: 'mm' },
      { id: 'cm', label: 'Centimeter', symbol: 'cm' },
      { id: 'm', label: 'Meter', symbol: 'm' },
      { id: 'km', label: 'Kilometer', symbol: 'km' },
      { id: 'inch', label: 'Inch', symbol: 'in' },
      { id: 'foot', label: 'Foot', symbol: 'ft' },
      { id: 'yard', label: 'Yard', symbol: 'yd' },
      { id: 'mile', label: 'Mile', symbol: 'mi' },
    ],
  },
  {
    id: 'weight',
    label: 'Weight',
    units: [
      { id: 'mg', label: 'Milligram', symbol: 'mg' },
      { id: 'g', label: 'Gram', symbol: 'g' },
      { id: 'kg', label: 'Kilogram', symbol: 'kg' },
      { id: 'tonne', label: 'Tonne', symbol: 't' },
      { id: 'oz', label: 'Ounce', symbol: 'oz' },
      { id: 'lb', label: 'Pound', symbol: 'lb' },
    ],
  },
  {
    id: 'temperature',
    label: 'Temperature',
    units: [
      { id: 'c', label: 'Celsius', symbol: '°C' },
      { id: 'f', label: 'Fahrenheit', symbol: '°F' },
      { id: 'k', label: 'Kelvin', symbol: 'K' },
    ],
  },
  {
    id: 'volume',
    label: 'Volume',
    units: [
      { id: 'ml', label: 'Milliliter', symbol: 'ml' },
      { id: 'l', label: 'Liter', symbol: 'l' },
      { id: 'cup', label: 'Cup (US)', symbol: 'cup' },
      { id: 'pint', label: 'Pint (US)', symbol: 'pt' },
      { id: 'quart', label: 'Quart (US)', symbol: 'qt' },
      { id: 'gallon', label: 'Gallon (US)', symbol: 'gal' },
      { id: 'm3', label: 'Cubic Meter', symbol: 'm³' },
      { id: 'fl-oz', label: 'Fluid Ounce (US)', symbol: 'fl oz' },
    ],
  },
  {
    id: 'data',
    label: 'Data Storage',
    units: [
      { id: 'B', label: 'Byte', symbol: 'B' },
      { id: 'KB', label: 'Kilobyte', symbol: 'KB' },
      { id: 'MB', label: 'Megabyte', symbol: 'MB' },
      { id: 'GB', label: 'Gigabyte', symbol: 'GB' },
      { id: 'TB', label: 'Terabyte', symbol: 'TB' },
    ],
  },
];

const PACKAGE_UNITS: Record<UnitCategory, Record<string, Unit | undefined>> = {
  data: { B: 'B', GB: 'GiB', KB: 'KiB', MB: 'MiB', TB: 'TiB' },
  length: {
    cm: 'cm',
    foot: 'foot',
    inch: 'inch',
    km: 'km',
    m: 'm',
    mile: 'mile',
    mm: 'mm',
    yard: 'yard',
  },
  temperature: { c: 'C', f: 'F', k: 'K' },
  volume: {
    cup: 'cup',
    'fl-oz': 'fl oz',
    gallon: 'gallon',
    l: 'l',
    m3: 'm3',
    ml: 'ml',
    pint: 'pint',
    quart: 'quart',
  },
  weight: { g: 'g', kg: 'kg', lb: 'lb', mg: 'mg', oz: 'oz', tonne: 'tonne' },
};

const ABSOLUTE_ZERO_TOLERANCE = -1e-9;

const TRAILING_ZEROS_RE = /0+$/;
const TRAILING_DOT_RE = /\.$/;
const FIXED_TRIM_RE = /\.?0+$/;

export function getUnitsForCategory(category: UnitCategory): Array<UnitDef> {
  const found = UNIT_CATEGORIES.find((c) => c.id === category);
  return found ? found.units : UNIT_CATEGORIES[0].units;
}

export function isValidCategory(value: string | undefined): boolean {
  if (!value) {
    return false;
  }
  return UNIT_CATEGORIES.some((c) => c.id === value);
}

export function normalizeCategory(value: string | undefined): UnitCategory {
  if (value && isValidCategory(value)) {
    return value as UnitCategory;
  }
  return 'length';
}

export function isValidUnitForCategory(
  unit: string | undefined,
  category: UnitCategory
): boolean {
  if (!unit) {
    return false;
  }
  const units = getUnitsForCategory(category);
  return units.some((u) => u.id === unit);
}

export function normalizeUnit(
  unit: string | undefined,
  category: UnitCategory
): string {
  if (unit && isValidUnitForCategory(unit, category)) {
    return unit;
  }
  return getUnitsForCategory(category)[0].id;
}

function formatFixed(value: number): string {
  let fixed = value.toFixed(10);
  fixed = fixed.replace(FIXED_TRIM_RE, '');
  if (fixed === '-0') {
    return '0';
  }
  return fixed;
}

function formatExponential(value: number): string {
  let s = value.toPrecision(10);
  if (s.includes('e')) {
    const [mantissa, exponent] = s.split('e');
    let clean = mantissa;
    if (clean.includes('.')) {
      clean = clean.replace(TRAILING_ZEROS_RE, '').replace(TRAILING_DOT_RE, '');
    }
    return `${clean}e${exponent}`;
  }
  if (s.includes('.')) {
    s = s.replace(TRAILING_ZEROS_RE, '').replace(TRAILING_DOT_RE, '');
  }
  return s;
}

function formatResult(value: number): string {
  if (!Number.isFinite(value)) {
    return String(value);
  }
  if (value === 0) {
    return '0';
  }
  const abs = Math.abs(value);
  if (abs >= 1e12 || (abs < 1e-6 && abs !== 0)) {
    return formatExponential(value);
  }
  return formatFixed(value);
}

// The package composes temperature conversions from ratios and offsets, which
// leaves tiny residue at exact reference points (32 F to C yields ~5.7e-14).
// Collapse values that round to zero at the formatter's precision so they
// display as 0 instead of an exponential artifact.
function normalizeTemperatureResult(value: number): number {
  return Number(value.toFixed(10)) === 0 ? 0 : value;
}

export function convertUnit(
  value: string,
  fromUnit: string,
  toUnit: string,
  category: UnitCategory
): { result: string; isValid: boolean; error?: string } {
  const trimmed = value.trim();
  if (!trimmed) {
    return { isValid: false, result: '' };
  }
  const num = Number(trimmed);
  if (Number.isNaN(num) || !Number.isFinite(num)) {
    return { error: 'Invalid number', isValid: false, result: '' };
  }

  const units = PACKAGE_UNITS[category];
  const from = units[fromUnit];
  const to = units[toUnit];
  if (from === undefined || to === undefined) {
    return { error: 'Invalid number', isValid: false, result: '' };
  }
  if (category === 'temperature') {
    if (convert(num, from).to('K') < ABSOLUTE_ZERO_TOLERANCE) {
      return {
        error: 'Temperature below absolute zero',
        isValid: false,
        result: '',
      };
    }
    const result = convert(num, from).to(to);
    return {
      isValid: true,
      result: formatResult(normalizeTemperatureResult(result)),
    };
  }
  return { isValid: true, result: formatResult(convert(num, from).to(to)) };
}
