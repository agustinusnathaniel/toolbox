import { describe, expect, test } from 'vite-plus/test';

import type { UrlCodecState } from './url-codec-params';
import {
  buildUrlCodecParams,
  buildUrlCodecStateFromSearch,
} from './url-codec-params';

describe('buildUrlCodecParams', () => {
  test('omits defaults and serializes only the input', () => {
    const params = buildUrlCodecParams({
      direction: 'encode',
      input: 'hello world',
      mode: 'component',
    });
    expect(params.toString()).toBe('input=hello+world');
  });

  test('serializes non-default direction and mode', () => {
    const params = buildUrlCodecParams({
      direction: 'decode',
      input: 'x',
      mode: 'full',
    });
    expect(params.toString()).toBe('input=x&direction=decode&mode=full');
  });

  test('omits the param for whitespace-only input', () => {
    const params = buildUrlCodecParams({
      direction: 'encode',
      input: '   ',
      mode: 'component',
    });
    expect(params.toString()).toBe('');
  });
});

describe('buildUrlCodecStateFromSearch', () => {
  test('returns defaults for an empty search', () => {
    expect(buildUrlCodecStateFromSearch({})).toEqual({
      direction: 'encode',
      input: '',
      mode: 'component',
    });
  });

  test('falls back to defaults for unknown direction and mode values', () => {
    expect(
      buildUrlCodecStateFromSearch({ direction: 'decode!', mode: 'bogus' })
    ).toEqual({
      direction: 'encode',
      input: '',
      mode: 'component',
    });
  });

  test('parses provided direction, input, and mode', () => {
    expect(
      buildUrlCodecStateFromSearch({
        direction: 'decode',
        input: 'a%20b',
        mode: 'full',
      })
    ).toEqual({
      direction: 'decode',
      input: 'a%20b',
      mode: 'full',
    });
  });

  test('round-trips full state through build and parse', () => {
    const state: UrlCodecState = {
      direction: 'decode',
      input: 'https://example.com/a b?x=1',
      mode: 'full',
    };
    const restored = buildUrlCodecStateFromSearch(
      Object.fromEntries(buildUrlCodecParams(state))
    );
    expect(restored).toEqual(state);
  });
});
