import { describe, expect, test } from 'vite-plus/test';

import { DEFAULT_CHMOD_OCTAL } from './chmod-calculator';
import type { ChmodCalculatorSearchParams } from './chmod-calculator-params';
import {
  buildChmodCalculatorParams,
  buildChmodCalculatorStateFromSearch,
} from './chmod-calculator-params';

describe('buildChmodCalculatorParams', () => {
  test('omits the default mode so the link stays short', () => {
    expect(
      buildChmodCalculatorParams({ mode: DEFAULT_CHMOD_OCTAL }).toString()
    ).toBe('');
  });

  test('carries a custom mode under the mode key', () => {
    expect(buildChmodCalculatorParams({ mode: '4755' }).get('mode')).toBe(
      '4755'
    );
  });
});

describe('buildChmodCalculatorStateFromSearch', () => {
  test('starts from the default when no mode is shared', () => {
    const state = buildChmodCalculatorStateFromSearch({});
    expect(state.mode).toBe(DEFAULT_CHMOD_OCTAL);
  });

  test('restores a shared mode', () => {
    const search: ChmodCalculatorSearchParams = { mode: '1777' };
    expect(buildChmodCalculatorStateFromSearch(search).mode).toBe('1777');
  });

  test('falls back to default on invalid share-link values', () => {
    expect(buildChmodCalculatorStateFromSearch({ mode: '888' }).mode).toBe(
      DEFAULT_CHMOD_OCTAL
    );
    expect(buildChmodCalculatorStateFromSearch({ mode: '' }).mode).toBe(
      DEFAULT_CHMOD_OCTAL
    );
    expect(
      buildChmodCalculatorStateFromSearch({ mode: 'rwxr-xr-x' }).mode
    ).toBe(DEFAULT_CHMOD_OCTAL);
  });

  test('params round-trip through state', () => {
    const state = buildChmodCalculatorStateFromSearch({ mode: '2755' });
    expect(buildChmodCalculatorParams(state).get('mode')).toBe('2755');
  });
});
