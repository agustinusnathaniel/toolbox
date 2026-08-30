export type UnitCategory =
  | 'length'
  | 'weight'
  | 'temperature'
  | 'volume'
  | 'data';

export type UnitId = string;

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

const LENGTH_FACTORS: Record<string, number> = {
  cm: 0.01,
  foot: 0.3048,
  inch: 0.0254,
  km: 1000,
  m: 1,
  mile: 1609.344,
  mm: 0.001,
  yard: 0.9144,
};

const WEIGHT_FACTORS: Record<string, number> = {
  g: 0.001,
  kg: 1,
  lb: 0.453_592,
  mg: 0.000_001,
  oz: 0.028_349_5,
  tonne: 1000,
};

const VOLUME_FACTORS: Record<string, number> = {
  cup: 0.236_588,
  'fl-oz': 0.029_573_5,
  gallon: 3.785_41,
  l: 1,
  m3: 1000,
  ml: 0.001,
  pint: 0.473_176,
  quart: 0.946_353,
};

const DATA_FACTORS: Record<string, number> = {
  B: 1,
  GB: 1_073_741_824,
  KB: 1024,
  MB: 1_048_576,
  TB: 1_099_511_627_776,
};

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

function getFactor(category: UnitCategory, unit: string): number | undefined {
  if (category === 'length') {
    return LENGTH_FACTORS[unit];
  }
  if (category === 'weight') {
    return WEIGHT_FACTORS[unit];
  }
  if (category === 'volume') {
    return VOLUME_FACTORS[unit];
  }
  if (category === 'data') {
    return DATA_FACTORS[unit];
  }
  return undefined;
}

function toCelsius(value: number, fromUnit: string): number {
  if (fromUnit === 'c') {
    return value;
  }
  if (fromUnit === 'f') {
    return (value - 32) * (5 / 9);
  }
  return value - 273.15;
}

function fromCelsius(value: number, toUnit: string): number {
  if (toUnit === 'c') {
    return value;
  }
  if (toUnit === 'f') {
    return value * (9 / 5) + 32;
  }
  return value + 273.15;
}

function convertTemperature(
  value: number,
  fromUnit: string,
  toUnit: string
): number {
  const celsius = toCelsius(value, fromUnit);
  return fromCelsius(celsius, toUnit);
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

  if (category === 'temperature') {
    if (!isValidUnitForCategory(fromUnit, category)) {
      return { error: 'Invalid number', isValid: false, result: '' };
    }
    if (!isValidUnitForCategory(toUnit, category)) {
      return { error: 'Invalid number', isValid: false, result: '' };
    }
    const fromKelvin =
      fromUnit === 'k' ? num : toCelsius(num, fromUnit) + 273.15;
    if (fromKelvin < 0 && fromKelvin < -1e-9) {
      return {
        error: 'Temperature below absolute zero',
        isValid: false,
        result: '',
      };
    }
    const result = convertTemperature(num, fromUnit, toUnit);
    const resultKelvin =
      toUnit === 'k' ? result : toCelsius(result, toUnit) + 273.15;
    if (resultKelvin < 0 && resultKelvin < -1e-9) {
      return {
        error: 'Temperature below absolute zero',
        isValid: false,
        result: '',
      };
    }
    return { isValid: true, result: formatResult(result) };
  }

  const fromFactor = getFactor(category, fromUnit);
  const toFactor = getFactor(category, toUnit);
  if (fromFactor === undefined || toFactor === undefined) {
    return { error: 'Invalid number', isValid: false, result: '' };
  }
  const baseValue = num * fromFactor;
  const resultValue = baseValue / toFactor;
  return { isValid: true, result: formatResult(resultValue) };
}
