import { describe, expect, it } from 'vite-plus/test';

import {
  buildHtmlEntitiesParams,
  buildHtmlEntitiesStateFromSearch,
} from './html-entities-params';

describe('buildHtmlEntitiesParams', () => {
  it('builds params with input and default mode omitted', () => {
    const params = buildHtmlEntitiesParams('hello', 'encode');
    expect(params.get('input')).toBe('hello');
    expect(params.has('mode')).toBe(false);
  });

  it('includes mode when decode', () => {
    const params = buildHtmlEntitiesParams('hello', 'decode');
    expect(params.get('input')).toBe('hello');
    expect(params.get('mode')).toBe('decode');
  });

  it('omits empty input', () => {
    const params = buildHtmlEntitiesParams('', 'encode');
    expect(params.has('input')).toBe(false);
  });

  it('omits whitespace-only input', () => {
    const params = buildHtmlEntitiesParams('   ', 'decode');
    expect(params.has('input')).toBe(false);
  });

  it('preserves special characters in input', () => {
    const params = buildHtmlEntitiesParams('<div> & "hi"', 'encode');
    expect(params.get('input')).toBe('<div> & "hi"');
  });
});

describe('buildHtmlEntitiesStateFromSearch', () => {
  it('returns input and encode by default', () => {
    expect(buildHtmlEntitiesStateFromSearch({})).toEqual({
      input: '',
      mode: 'encode',
    });
  });

  it('parses input string', () => {
    expect(buildHtmlEntitiesStateFromSearch({ input: 'hello' })).toEqual({
      input: 'hello',
      mode: 'encode',
    });
  });

  it('parses decode mode', () => {
    expect(buildHtmlEntitiesStateFromSearch({ mode: 'decode' })).toEqual({
      input: '',
      mode: 'decode',
    });
  });

  it('defaults to encode for invalid mode', () => {
    expect(buildHtmlEntitiesStateFromSearch({ mode: 'invalid' })).toEqual({
      input: '',
      mode: 'encode',
    });
    expect(buildHtmlEntitiesStateFromSearch({ mode: '' })).toEqual({
      input: '',
      mode: 'encode',
    });
  });

  it('handles non-string input', () => {
    expect(
      buildHtmlEntitiesStateFromSearch({ input: 123 as unknown as string })
    ).toEqual({ input: '', mode: 'encode' });
  });

  it('roundtrip preserves state', () => {
    const params = buildHtmlEntitiesParams('test & <tag>', 'decode');
    const search: Record<string, unknown> = {};
    for (const [k, v] of params.entries()) {
      search[k] = v;
    }
    const state = buildHtmlEntitiesStateFromSearch(search);
    expect(state).toEqual({ input: 'test & <tag>', mode: 'decode' });
  });

  it('roundtrip with encode omits mode', () => {
    const params = buildHtmlEntitiesParams('hello world', 'encode');
    const search: Record<string, unknown> = {};
    for (const [k, v] of params.entries()) {
      search[k] = v;
    }
    const state = buildHtmlEntitiesStateFromSearch(search);
    expect(state.mode).toBe('encode');
    expect(state.input).toBe('hello world');
  });
});
