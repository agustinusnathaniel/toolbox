import { describe, expect, test } from 'vitest';

import {
  convertUnit,
  getUnitsForCategory,
  isValidCategory,
  isValidUnitForCategory,
  normalizeCategory,
  normalizeUnit,
} from './unit-converter';

describe('isValidCategory', () => {
  test('valid categories', () => {
    expect(isValidCategory('length')).toBe(true);
    expect(isValidCategory('weight')).toBe(true);
    expect(isValidCategory('temperature')).toBe(true);
    expect(isValidCategory('volume')).toBe(true);
    expect(isValidCategory('data')).toBe(true);
  });

  test('invalid', () => {
    expect(isValidCategory('invalid')).toBe(false);
    expect(isValidCategory(undefined)).toBe(false);
    expect(isValidCategory('')).toBe(false);
  });
});

describe('normalizeCategory', () => {
  test('defaults to length', () => {
    expect(normalizeCategory(undefined)).toBe('length');
    expect(normalizeCategory('bad')).toBe('length');
  });

  test('returns valid', () => {
    expect(normalizeCategory('weight')).toBe('weight');
    expect(normalizeCategory('temperature')).toBe('temperature');
  });
});

describe('isValidUnitForCategory', () => {
  test('valid units', () => {
    expect(isValidUnitForCategory('m', 'length')).toBe(true);
    expect(isValidUnitForCategory('kg', 'weight')).toBe(true);
    expect(isValidUnitForCategory('c', 'temperature')).toBe(true);
  });

  test('invalid', () => {
    expect(isValidUnitForCategory('m', 'weight')).toBe(false);
    expect(isValidUnitForCategory(undefined, 'length')).toBe(false);
    expect(isValidUnitForCategory('', 'length')).toBe(false);
  });
});

describe('normalizeUnit', () => {
  test('returns valid', () => {
    expect(normalizeUnit('km', 'length')).toBe('km');
  });

  test('fallback', () => {
    expect(normalizeUnit('bad', 'length')).toBe('mm');
    expect(normalizeUnit(undefined, 'weight')).toBe('mg');
  });
});

describe('getUnitsForCategory', () => {
  test('returns units', () => {
    expect(getUnitsForCategory('length').length).toBeGreaterThan(0);
    expect(getUnitsForCategory('data').map((u) => u.id)).toEqual([
      'B',
      'KB',
      'MB',
      'GB',
      'TB',
    ]);
  });
});

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: data-driven pure-function tests
describe('convertUnit', () => {
  test('empty input', () => {
    const r = convertUnit('', 'm', 'km', 'length');
    expect(r.isValid).toBe(false);
    expect(r.result).toBe('');
    expect(r.error).toBeUndefined();
  });

  test('whitespace empty', () => {
    const r = convertUnit('   ', 'm', 'km', 'length');
    expect(r.isValid).toBe(false);
    expect(r.result).toBe('');
  });

  test('invalid number', () => {
    const r = convertUnit('abc', 'm', 'km', 'length');
    expect(r.isValid).toBe(false);
    expect(r.error).toBe('Invalid number');
  });

  test('length m to km', () => {
    const r = convertUnit('1000', 'm', 'km', 'length');
    expect(r.isValid).toBe(true);
    expect(r.result).toBe('1');
  });

  test('length km to m', () => {
    const r = convertUnit('1', 'km', 'm', 'length');
    expect(r.isValid).toBe(true);
    expect(r.result).toBe('1000');
  });

  test('length inch to cm', () => {
    const r = convertUnit('1', 'inch', 'cm', 'length');
    expect(r.isValid).toBe(true);
    expect(r.result).toBe('2.54');
  });

  test('length mm to m', () => {
    const r = convertUnit('1000', 'mm', 'm', 'length');
    expect(r.result).toBe('1');
  });

  test('length mile to km', () => {
    const r = convertUnit('1', 'mile', 'km', 'length');
    expect(r.isValid).toBe(true);
    // 1.609344
    expect(r.result).toBe('1.609344');
  });

  test('weight kg to lb', () => {
    const r = convertUnit('1', 'kg', 'lb', 'weight');
    expect(r.isValid).toBe(true);
    expect(r.result).toBe('2.2046244202');
  });

  test('weight lb to kg', () => {
    const r = convertUnit('1', 'lb', 'kg', 'weight');
    expect(r.result).toBe('0.453592');
  });

  test('weight g to mg', () => {
    const r = convertUnit('1', 'g', 'mg', 'weight');
    expect(r.result).toBe('1000');
  });

  test('temperature C to F', () => {
    const r = convertUnit('0', 'c', 'f', 'temperature');
    expect(r.result).toBe('32');
    const r2 = convertUnit('100', 'c', 'f', 'temperature');
    expect(r2.result).toBe('212');
  });

  test('temperature C to K', () => {
    const r = convertUnit('0', 'c', 'k', 'temperature');
    expect(r.result).toBe('273.15');
  });

  test('temperature F to C', () => {
    const r = convertUnit('32', 'f', 'c', 'temperature');
    expect(r.result).toBe('0');
  });

  test('temperature K to C', () => {
    const r = convertUnit('273.15', 'k', 'c', 'temperature');
    expect(r.result).toBe('0');
  });

  test('temperature -273.15C is 0K', () => {
    const r = convertUnit('-273.15', 'c', 'k', 'temperature');
    expect(r.isValid).toBe(true);
    expect(r.result).toBe('0');
  });

  test('temperature below absolute zero error C', () => {
    const r = convertUnit('-274', 'c', 'k', 'temperature');
    expect(r.isValid).toBe(false);
    expect(r.error).toBe('Temperature below absolute zero');
  });

  test('temperature below absolute zero Kelvin direct', () => {
    const r = convertUnit('-1', 'k', 'c', 'temperature');
    expect(r.isValid).toBe(false);
    expect(r.error).toBe('Temperature below absolute zero');
  });

  test('temperature K below zero via F', () => {
    const r = convertUnit('-500', 'f', 'k', 'temperature');
    expect(r.isValid).toBe(false);
    expect(r.error).toBe('Temperature below absolute zero');
  });

  test('volume l to gallon', () => {
    const r = convertUnit('3.78541', 'l', 'gallon', 'volume');
    expect(r.isValid).toBe(true);
    expect(r.result).toBe('1');
  });

  test('volume gallon to l', () => {
    const r = convertUnit('1', 'gallon', 'l', 'volume');
    expect(r.result).toBe('3.78541');
  });

  test('volume ml to l', () => {
    const r = convertUnit('1000', 'ml', 'l', 'volume');
    expect(r.result).toBe('1');
  });

  test('volume m3 to l', () => {
    const r = convertUnit('1', 'm3', 'l', 'volume');
    expect(r.result).toBe('1000');
  });

  test('data KB to B', () => {
    const r = convertUnit('1', 'KB', 'B', 'data');
    expect(r.result).toBe('1024');
  });

  test('data MB to KB', () => {
    const r = convertUnit('1', 'MB', 'KB', 'data');
    expect(r.result).toBe('1024');
  });

  test('data B to KB', () => {
    const r = convertUnit('1024', 'B', 'KB', 'data');
    expect(r.result).toBe('1');
  });

  test('data TB to GB', () => {
    const r = convertUnit('1', 'TB', 'GB', 'data');
    expect(r.result).toBe('1024');
  });

  test('large value formatting', () => {
    const r = convertUnit('1000000000000', 'mm', 'km', 'length');
    // 1e12 mm = 1e9 m = 1e6 km => 1000000
    expect(r.isValid).toBe(true);
    expect(r.result).toBe('1000000');
  });

  test('very large uses exponent formatting', () => {
    const r = convertUnit('1e15', 'mm', 'mm', 'length');
    expect(r.isValid).toBe(true);
    expect(r.result).toContain('e');
  });

  test('very small uses exponent', () => {
    const r = convertUnit('0.0000001', 'm', 'm', 'length');
    expect(r.isValid).toBe(true);
    // 1e-7 < 1e-6 so should use exponential?
    // Actually 0.0000001 = 1e-7 -> exponential
    expect(r.result).toContain('e');
  });

  test('trailing zeros trimmed', () => {
    const r = convertUnit('1', 'm', 'm', 'length');
    expect(r.result).toBe('1');
  });

  test('max 10 decimals', () => {
    const r = convertUnit('1', 'inch', 'cm', 'length');
    // exact 2.54
    expect(r.result).toBe('2.54');
    const r2 = convertUnit('10', 'inch', 'cm', 'length');
    expect(r2.result).toBe('25.4');
  });

  test('same unit returns same value trimmed', () => {
    const r = convertUnit('  42  ', 'm', 'm', 'length');
    expect(r.result).toBe('42');
  });
});
