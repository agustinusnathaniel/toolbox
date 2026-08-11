import { describe, expect, test } from 'vite-plus/test';

import {
  buildTextDiffParams,
  buildTextDiffStateFromSearch,
} from './text-diff-params';

describe('buildTextDiffParams', () => {
  test('sets original when provided', () => {
    const params = buildTextDiffParams('a', '');
    expect(params.get('original')).toBe('a');
  });

  test('sets modified when provided', () => {
    const params = buildTextDiffParams('', 'b');
    expect(params.get('modified')).toBe('b');
  });

  test('skips whitespace-only original', () => {
    const params = buildTextDiffParams('   ', 'b');
    expect(params.get('original')).toBeNull();
  });

  test('returns empty params when both inputs empty', () => {
    expect(buildTextDiffParams('', '').toString()).toBe('');
  });
});

describe('buildTextDiffStateFromSearch', () => {
  test('returns values from search', () => {
    expect(
      buildTextDiffStateFromSearch({ modified: 'y', original: 'x' })
    ).toEqual({ modified: 'y', original: 'x' });
  });

  test('returns empty strings when missing', () => {
    expect(buildTextDiffStateFromSearch({})).toEqual({
      modified: '',
      original: '',
    });
  });
});
