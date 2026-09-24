import { describe, expect, test } from 'vite-plus/test';

import type { UnitCategory } from './unit-converter';
import { convertUnit, getUnitsForCategory } from './unit-converter';

const MAPPING_CASES: Array<{
  category: UnitCategory;
  pairs: Array<[string, string, string, string]>;
}> = [
  {
    category: 'length',
    pairs: [
      ['mm', 'm', '1', '0.001'],
      ['cm', 'm', '1', '0.01'],
      ['m', 'mm', '1', '1000'],
      ['km', 'm', '1', '1000'],
      ['inch', 'm', '1', '0.0254'],
      ['foot', 'm', '1', '0.3048'],
      ['yard', 'm', '1', '0.9144'],
      ['mile', 'm', '1', '1609.344'],
    ],
  },
  {
    category: 'weight',
    pairs: [
      ['mg', 'g', '1', '0.001'],
      ['g', 'kg', '1', '0.001'],
      ['kg', 'g', '1', '1000'],
      ['tonne', 'kg', '1', '1000'],
      ['oz', 'g', '1', '28.349523125'],
      ['lb', 'g', '1', '453.59237'],
    ],
  },
  {
    category: 'temperature',
    pairs: [
      ['c', 'k', '1', '274.15'],
      ['f', 'k', '32', '273.15'],
      ['k', 'c', '273.15', '0'],
    ],
  },
  {
    category: 'volume',
    pairs: [
      ['ml', 'l', '1', '0.001'],
      ['l', 'ml', '1', '1000'],
      ['cup', 'ml', '1', '236.5882365'],
      ['pint', 'ml', '1', '473.176473'],
      ['quart', 'ml', '1', '946.352946'],
      ['gallon', 'ml', '1', '3785.411784'],
      ['m3', 'l', '1', '1000'],
      ['fl-oz', 'ml', '1', '29.5735295625'],
    ],
  },
  {
    category: 'data',
    pairs: [
      ['B', 'KB', '1024', '1'],
      ['KB', 'B', '1', '1024'],
      ['MB', 'KB', '1', '1024'],
      ['GB', 'MB', '1', '1024'],
      ['TB', 'GB', '1', '1024'],
    ],
  },
];

const ZERO_GUARD_CASES: Array<{
  from: string;
  input: string;
  label: string;
  to: string;
}> = [
  { from: 'f', input: '32', label: 'F to C', to: 'c' },
  { from: 'k', input: '273.15', label: 'K to C', to: 'c' },
  { from: 'c', input: '-273.15', label: 'C to K', to: 'k' },
];

const FORMATTING_CASES: Array<{
  containsExponent?: boolean;
  expected?: string;
  from: string;
  input: string;
  to: string;
}> = [
  { expected: '1000000', from: 'mm', input: '1000000000000', to: 'km' },
  { containsExponent: true, from: 'mm', input: '1e15', to: 'mm' },
  { containsExponent: true, from: 'm', input: '0.0000001', to: 'm' },
  { expected: '1', from: 'm', input: '1', to: 'm' },
  { expected: '25.4', from: 'inch', input: '10', to: 'cm' },
  { expected: '42', from: 'm', input: '  42  ', to: 'm' },
];

describe('getUnitsForCategory', () => {
  test('returns units', () => {
    expect(getUnitsForCategory('data').map((u) => u.id)).toEqual([
      'B',
      'KB',
      'MB',
      'GB',
      'TB',
    ]);
  });
});

describe('convertUnit input validation', () => {
  test('returns invalid for empty or whitespace input', () => {
    for (const input of ['', '   ']) {
      const r = convertUnit(input, 'm', 'km', 'length');
      expect(r.isValid).toBe(false);
      expect(r.result).toBe('');
      expect(r.error).toBeUndefined();
    }
  });

  test('invalid number', () => {
    const r = convertUnit('abc', 'm', 'km', 'length');
    expect(r.isValid).toBe(false);
    expect(r.error).toBe('Invalid number');
  });
});

describe('convertUnit mappings and guards', () => {
  test.each(MAPPING_CASES)(
    'maps every $category unit through the package',
    ({ category, pairs }) => {
      for (const [from, to, value, expected] of pairs) {
        const r = convertUnit(value, from, to, category);
        expect(r.isValid).toBe(true);
        expect(r.error).toBeUndefined();
        expect(r.result).toBe(expected);
      }
    }
  );

  test.each(ZERO_GUARD_CASES)(
    '$label collapses to 0 instead of -0',
    ({ from, input, to }) => {
      const r = convertUnit(input, from, to, 'temperature');
      expect(r.isValid).toBe(true);
      expect(r.result).toBe('0');
    }
  );

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
});

describe('convertUnit formatting', () => {
  test('volume l to cup stays US customary', () => {
    const r = convertUnit('1', 'l', 'cup', 'volume');
    expect(r.result).toBe('4.2267528377');
  });

  test('data GB to MB stays binary', () => {
    const r = convertUnit('1', 'GB', 'MB', 'data');
    expect(r.result).toBe('1024');
  });

  test.each(FORMATTING_CASES)(
    'formats $input $from -> $to',
    ({ containsExponent, expected, from, input, to }) => {
      const r = convertUnit(input, from, to, 'length');
      expect(r.isValid).toBe(true);
      if (containsExponent) {
        expect(r.result).toContain('e');
      } else {
        expect(r.result).toBe(expected);
      }
    }
  );

  test('invalid unit', () => {
    const r = convertUnit('1', 'bad', 'm', 'length');
    expect(r.isValid).toBe(false);
    expect(r.error).toBe('Invalid number');
  });
});
