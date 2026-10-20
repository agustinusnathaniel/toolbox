import { describe, expect, test } from 'vite-plus/test';

import {
  buildSubnetCalculatorParams,
  buildSubnetCalculatorStateFromSearch,
} from './subnet-calculator-params';

describe('buildSubnetCalculatorParams', () => {
  test('keeps a non-empty input', () => {
    expect(
      buildSubnetCalculatorParams({ input: '192.168.1.0/24' }).toString()
    ).toBe('input=192.168.1.0%2F24');
  });

  test('drops blank input so the share link stays short', () => {
    expect(buildSubnetCalculatorParams({ input: '   ' }).toString()).toBe('');
  });
});

describe('buildSubnetCalculatorStateFromSearch', () => {
  test('restores the input verbatim', () => {
    expect(
      buildSubnetCalculatorStateFromSearch({ input: '10.0.0.0/8' })
    ).toEqual({
      input: '10.0.0.0/8',
    });
  });

  test('defaults a missing input to empty', () => {
    expect(buildSubnetCalculatorStateFromSearch({})).toEqual({ input: '' });
  });
});
