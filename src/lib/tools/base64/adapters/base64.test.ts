import { describe, expect, test } from 'vite-plus/test';

import { decodeBase64, encodeBase64 } from './base64';

describe('encodeBase64', () => {
  test('encodes plain ASCII', () => {
    const result = encodeBase64('Hello World');
    expect(result.isValid).toBe(true);
    expect(result.output).toBe('SGVsbG8gV29ybGQ=');
  });

  test('encodes Unicode text', () => {
    const result = encodeBase64('héllo wörld');
    expect(result.isValid).toBe(true);
    expect(result.output).toBe('aMOpbGxvIHfDtnJsZA==');
  });

  test('encodes emoji', () => {
    const result = encodeBase64('🚀');
    expect(result.isValid).toBe(true);
    expect(result.output).toBe('8J+agA==');
  });

  test('returns error for empty input', () => {
    const result = encodeBase64('');
    expect(result.isValid).toBe(false);
    expect(result.output).toBe('');
    expect(result.error).toBe('Input is empty');
  });
});

describe('decodeBase64', () => {
  test('decodes valid ASCII base64', () => {
    const result = decodeBase64('SGVsbG8gV29ybGQ=');
    expect(result.isValid).toBe(true);
    expect(result.output).toBe('Hello World');
  });

  test('decodes Unicode base64', () => {
    const result = decodeBase64('8J+agA==');
    expect(result.isValid).toBe(true);
    expect(result.output).toBe('🚀');
  });

  test('round-trips ASCII', () => {
    const encoded = encodeBase64('Hello World');
    const decoded = decodeBase64(encoded.output);
    expect(decoded.isValid).toBe(true);
    expect(decoded.output).toBe('Hello World');
  });

  test('round-trips Unicode', () => {
    const encoded = encodeBase64('héllo wörld 🚀');
    const decoded = decodeBase64(encoded.output);
    expect(decoded.isValid).toBe(true);
    expect(decoded.output).toBe('héllo wörld 🚀');
  });

  test('handles whitespace around valid base64', () => {
    const result = decodeBase64('  SGVsbG8gV29ybGQ=  ');
    expect(result.isValid).toBe(true);
    expect(result.output).toBe('Hello World');
  });

  test('returns error for invalid base64 without throwing', () => {
    const result = decodeBase64('not@@base64!');
    expect(result.isValid).toBe(false);
    expect(result.output).toBe('');
    expect(result.error).toBeDefined();
  });

  test('returns error for valid base64 that is not valid UTF-8', () => {
    const result = decodeBase64('/w==');
    expect(result.isValid).toBe(false);
    expect(result.output).toBe('');
    expect(result.error).toBeDefined();
  });

  test('returns error for invalid padding', () => {
    const result = decodeBase64('SGVsbG8gV29ybGQ');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  test('returns error for empty input', () => {
    const result = decodeBase64('');
    expect(result.isValid).toBe(false);
    expect(result.output).toBe('');
    expect(result.error).toBe('Input is empty');
  });

  test('returns error for whitespace only', () => {
    const result = decodeBase64('   ');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Input is empty');
  });
});
