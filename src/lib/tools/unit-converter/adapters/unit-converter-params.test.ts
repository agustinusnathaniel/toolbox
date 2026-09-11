import { describe, expect, test } from 'vite-plus/test';

import type { UnitCategory } from './unit-converter';
import type { UnitConverterSearchParams } from './unit-converter-params';
import {
  buildUnitConverterParams,
  buildUnitConverterStateFromSearch,
} from './unit-converter-params';

const PARAM_CASES: Array<{
  args: [string, UnitCategory, string, string];
  expected: Record<string, string | null>;
  name: string;
}> = [
  {
    args: ['10', 'length', 'mm', 'cm'],
    expected: { category: null, from: null, to: null, value: '10' },
    name: 'omits defaults for length',
  },
  {
    args: ['10', 'weight', 'mg', 'g'],
    expected: { category: 'weight', from: null, to: null, value: '10' },
    name: 'includes non-default category',
  },
  {
    args: ['10', 'length', 'm', 'km'],
    expected: { category: null, from: 'm', to: 'km', value: '10' },
    name: 'includes non-default units',
  },
  {
    args: ['   ', 'length', 'mm', 'cm'],
    expected: { value: null },
    name: 'omits empty value',
  },
  {
    args: ['100', 'temperature', 'f', 'k'],
    expected: { category: 'temperature', from: 'f', to: 'k', value: '100' },
    name: 'includes value and category and units',
  },
  {
    args: ['5', 'data', 'B', 'MB'],
    expected: { from: null, to: 'MB', value: '5' },
    name: 'omits defaults but includes non-default to',
  },
];

const STATE_CASES: Array<{
  expected: Record<string, string>;
  name: string;
  search: UnitConverterSearchParams;
}> = [
  {
    expected: { category: 'length', fromUnit: 'mm', toUnit: 'cm', value: '' },
    name: 'defaults to length mm->cm',
    search: {},
  },
  {
    expected: {
      category: 'weight',
      fromUnit: 'kg',
      toUnit: 'lb',
      value: '10',
    },
    name: 'parses valid',
    search: { category: 'weight', from: 'kg', to: 'lb', value: '10' },
  },
  {
    expected: { category: 'length' },
    name: 'falls back on invalid category',
    search: { category: 'bad' },
  },
  {
    expected: { fromUnit: 'mm', toUnit: 'cm' },
    name: 'falls back on invalid units',
    search: { category: 'length', from: 'bad', to: 'bad2' },
  },
  {
    expected: { fromUnit: 'KB', toUnit: 'KB' },
    name: 'invalid to falls back to second unit',
    search: { category: 'data', from: 'KB', to: 'invalid' },
  },
];

describe('buildUnitConverterParams', () => {
  test.each(PARAM_CASES)('$name', ({ args, expected }) => {
    const p = buildUnitConverterParams(...args);
    for (const [key, value] of Object.entries(expected)) {
      expect(p.get(key)).toBe(value);
    }
  });
});

describe('buildUnitConverterStateFromSearch', () => {
  test.each(STATE_CASES)('$name', ({ search, expected }) => {
    const s = buildUnitConverterStateFromSearch(search);
    for (const [key, value] of Object.entries(expected)) {
      expect(s[key as keyof typeof s]).toBe(value);
    }
  });
});
