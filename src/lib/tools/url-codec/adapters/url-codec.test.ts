import { describe, expect, test } from 'vite-plus/test';

import { decodeUrl, encodeUrl } from './url-codec';

describe('encodeUrl', () => {
  test('component mode encodes every reserved character', () => {
    expect(encodeUrl('https://example.com/a b?x=1&y=2', 'component')).toBe(
      'https%3A%2F%2Fexample.com%2Fa%20b%3Fx%3D1%26y%3D2'
    );
  });

  test('full mode preserves the URL structure and only encodes unsafe characters', () => {
    expect(encodeUrl('https://example.com/a b?x=1', 'full')).toBe(
      'https://example.com/a%20b?x=1'
    );
  });

  test('returns empty output for empty input', () => {
    expect(encodeUrl('', 'component')).toBe('');
    expect(encodeUrl('', 'full')).toBe('');
  });

  test('unicode text survives an encode-decode round-trip in component mode', () => {
    const input = 'héllo 世界 🌍';
    expect(decodeUrl(encodeUrl(input, 'component'), 'component')).toEqual({
      isValid: true,
      output: input,
    });
  });

  test('unicode text survives an encode-decode round-trip in full mode', () => {
    const input = 'https://example.com/世界 🌍';
    expect(decodeUrl(encodeUrl(input, 'full'), 'full')).toEqual({
      isValid: true,
      output: input,
    });
  });
});

describe('decodeUrl', () => {
  test('decodes valid percent-encoded input', () => {
    expect(decodeUrl('https%3A%2F%2Fexample.com%2Fa%20b', 'component')).toEqual(
      {
        isValid: true,
        output: 'https://example.com/a b',
      }
    );
  });

  test('round-trips fixtures back to their original value', () => {
    const fixtures = [
      'https://example.com/a b?x=1&y=2',
      '/relative/path?query=value#fragment',
      'name=Müller&city=München',
    ];
    for (const fixture of fixtures) {
      expect(decodeUrl(encodeUrl(fixture, 'component'), 'component')).toEqual({
        isValid: true,
        output: fixture,
      });
    }
  });

  test.each(['%zz', '%', '%E0%A4%A'])(
    'reports malformed input %s instead of throwing',
    (input) => {
      const result = decodeUrl(input, 'component');
      expect(result.isValid).toBe(false);
      expect(result.output).toBe('');
      expect(result.error).toBeTruthy();
    }
  );

  test('empty input decodes to empty output', () => {
    expect(decodeUrl('', 'component')).toEqual({
      isValid: true,
      output: '',
    });
  });
});
