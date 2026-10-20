import { describe, expect, test } from 'vite-plus/test';

import { inspectUrl } from './url-inspector';

const FULL_URL =
  'https://user:secret@example.com:8443/docs/search?q=toolbox&q=dev&lang=en#results';

describe('inspectUrl', () => {
  test('splits a full URL into every part', () => {
    const result = inspectUrl(FULL_URL);

    expect(result.isValid).toBe(true);
    expect(result.usedSchemeFallback).toBe(false);
    expect(result.inspected?.protocol).toBe('https:');
    expect(result.inspected?.username).toBe('user');
    expect(result.inspected?.password).toBe('secret');
    expect(result.inspected?.hostname).toBe('example.com');
    expect(result.inspected?.port).toBe('8443');
    expect(result.inspected?.host).toBe('example.com:8443');
    expect(result.inspected?.pathname).toBe('/docs/search');
    expect(result.inspected?.hash).toBe('#results');
  });

  test('keeps repeated query keys in order', () => {
    const result = inspectUrl(FULL_URL);

    expect(result.inspected?.queryParams).toEqual([
      { name: 'q', value: 'toolbox' },
      { name: 'q', value: 'dev' },
      { name: 'lang', value: 'en' },
    ]);
  });

  test('splits the path into segments', () => {
    const result = inspectUrl('https://example.com/docs/search/');

    expect(result.inspected?.pathSegments).toEqual(['docs', 'search']);
  });

  test('prefixes a bare host with https and flags the assumption', () => {
    const result = inspectUrl('example.com?a=1');

    expect(result.isValid).toBe(true);
    expect(result.usedSchemeFallback).toBe(true);
    expect(result.inspected?.protocol).toBe('https:');
    expect(result.inspected?.hostname).toBe('example.com');
    expect(result.inspected?.queryParams).toEqual([{ name: 'a', value: '1' }]);
  });

  test('rejects input that parses no known way', () => {
    const result = inspectUrl('::::');

    expect(result.isValid).toBe(false);
    expect(result.inspected).toBeNull();
    expect(typeof result.error).toBe('string');
  });

  test('leaves userinfo empty when absent', () => {
    const result = inspectUrl('https://example.com/');

    expect(result.inspected?.username).toBe('');
    expect(result.inspected?.password).toBe('');
    expect(result.inspected?.queryParams).toEqual([]);
  });
});
