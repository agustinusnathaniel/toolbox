import { describe, expect, test } from 'vite-plus/test';

import { buildCsvParams, buildCsvStateFromSearch } from './csv-params';

describe('buildCsvParams', () => {
  test('returns empty params for empty input and default mode', () => {
    expect(buildCsvParams({ input: '', mode: 'csv-to-json' }).toString()).toBe(
      ''
    );
  });

  test('sets input when provided', () => {
    const params = buildCsvParams({ input: 'a,b', mode: 'csv-to-json' });
    expect(params.toString()).toBe('input=a%2Cb');
  });

  test('omits mode for the default csv-to-json', () => {
    const params = buildCsvParams({ input: 'a,b', mode: 'csv-to-json' });
    expect(params.get('mode')).toBeNull();
  });

  test('sets mode when json-to-csv', () => {
    const params = buildCsvParams({ input: 'a,b', mode: 'json-to-csv' });
    expect(params.get('mode')).toBe('json-to-csv');
  });

  test('sets both keys for non-default values', () => {
    const params = buildCsvParams({ input: 'a,b', mode: 'json-to-csv' });
    expect(params.get('input')).toBe('a,b');
    expect(params.get('mode')).toBe('json-to-csv');
  });
});

describe('buildCsvStateFromSearch', () => {
  test('returns defaults for empty search', () => {
    expect(buildCsvStateFromSearch({})).toEqual({
      input: '',
      mode: 'csv-to-json',
    });
  });

  test('returns provided values for a valid search', () => {
    expect(
      buildCsvStateFromSearch({ input: 'a,b', mode: 'json-to-csv' })
    ).toEqual({
      input: 'a,b',
      mode: 'json-to-csv',
    });
  });

  test('falls back to csv-to-json for unknown modes', () => {
    expect(buildCsvStateFromSearch({ mode: 'xlsx' })).toEqual({
      input: '',
      mode: 'csv-to-json',
    });
  });
});
