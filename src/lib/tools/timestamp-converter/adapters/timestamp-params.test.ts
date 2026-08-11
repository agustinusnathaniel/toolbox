import { describe, expect, test } from 'vite-plus/test';

import {
  buildTimestampParams,
  buildTimestampStateFromSearch,
} from './timestamp-params';

describe('buildTimestampParams', () => {
  test('omits empty input', () => {
    const params = buildTimestampParams('');
    expect(params.toString()).toBe('');
  });

  test('includes non-empty input', () => {
    const params = buildTimestampParams('1700000000');
    expect(params.get('ts')).toBe('1700000000');
  });
});

describe('buildTimestampStateFromSearch', () => {
  test('returns the timestamp from search', () => {
    expect(buildTimestampStateFromSearch({ ts: '1700000000' })).toBe(
      '1700000000'
    );
  });

  test('returns empty string when absent', () => {
    expect(buildTimestampStateFromSearch({})).toBe('');
  });
});
