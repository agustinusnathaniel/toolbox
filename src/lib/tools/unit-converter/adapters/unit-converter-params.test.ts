import { describe, expect, test } from 'vitest';

import {
  buildUnitConverterParams,
  buildUnitConverterStateFromSearch,
} from './unit-converter-params';

describe('buildUnitConverterParams', () => {
  test('omits defaults for length', () => {
    const p = buildUnitConverterParams('10', 'length', 'mm', 'cm');
    // default from mm and to cm are first two units of length
    expect(p.get('value')).toBe('10');
    expect(p.get('category')).toBeNull();
    expect(p.get('from')).toBeNull();
    expect(p.get('to')).toBeNull();
  });

  test('includes non-default category', () => {
    const p = buildUnitConverterParams('10', 'weight', 'mg', 'g');
    expect(p.get('category')).toBe('weight');
    expect(p.get('value')).toBe('10');
    expect(p.get('from')).toBeNull();
    expect(p.get('to')).toBeNull();
  });

  test('includes non-default units', () => {
    const p = buildUnitConverterParams('10', 'length', 'm', 'km');
    expect(p.get('from')).toBe('m');
    expect(p.get('to')).toBe('km');
    expect(p.get('category')).toBeNull();
  });

  test('omits empty value', () => {
    const p = buildUnitConverterParams('   ', 'length', 'mm', 'cm');
    expect(p.get('value')).toBeNull();
  });

  test('includes value and category and units', () => {
    const p = buildUnitConverterParams('100', 'temperature', 'f', 'k');
    expect(p.get('value')).toBe('100');
    expect(p.get('category')).toBe('temperature');
    expect(p.get('from')).toBe('f');
    // temperature default to is f, so to k is non-default
    expect(p.get('to')).toBe('k');
  });

  test('omits defaults but includes non-default to', () => {
    const p = buildUnitConverterParams('5', 'data', 'B', 'MB');
    expect(p.get('from')).toBeNull();
    expect(p.get('to')).toBe('MB');
  });
});

describe('buildUnitConverterStateFromSearch', () => {
  test('defaults to length mm->cm', () => {
    const s = buildUnitConverterStateFromSearch({});
    expect(s.category).toBe('length');
    expect(s.fromUnit).toBe('mm');
    expect(s.toUnit).toBe('cm');
    expect(s.value).toBe('');
  });

  test('parses valid', () => {
    const s = buildUnitConverterStateFromSearch({
      category: 'weight',
      from: 'kg',
      to: 'lb',
      value: '10',
    });
    expect(s.category).toBe('weight');
    expect(s.fromUnit).toBe('kg');
    expect(s.toUnit).toBe('lb');
    expect(s.value).toBe('10');
  });

  test('falls back on invalid category', () => {
    const s = buildUnitConverterStateFromSearch({ category: 'bad' });
    expect(s.category).toBe('length');
  });

  test('falls back on invalid units', () => {
    const s = buildUnitConverterStateFromSearch({
      category: 'length',
      from: 'bad',
      to: 'bad2',
    });
    expect(s.fromUnit).toBe('mm');
    expect(s.toUnit).toBe('cm');
  });

  test('handles temperature', () => {
    const s = buildUnitConverterStateFromSearch({
      category: 'temperature',
      from: 'c',
      to: 'f',
      value: '100',
    });
    expect(s.category).toBe('temperature');
    expect(s.fromUnit).toBe('c');
    expect(s.toUnit).toBe('f');
  });

  test('invalid to falls back to second unit', () => {
    const s = buildUnitConverterStateFromSearch({
      category: 'data',
      from: 'KB',
      to: 'invalid',
    });
    expect(s.fromUnit).toBe('KB');
    expect(s.toUnit).toBe('KB'); // Wait data second unit is KB? Actually first B second KB
    // For data: from KB valid, to invalid -> fallback to KB (second unit)
    expect(s.toUnit).toBe('KB');
  });
});
