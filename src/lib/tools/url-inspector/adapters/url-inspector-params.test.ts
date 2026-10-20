import { describe, expect, test } from 'vite-plus/test';

import {
  buildUrlInspectorParams,
  buildUrlInspectorStateFromSearch,
} from './url-inspector-params';

describe('buildUrlInspectorParams', () => {
  test('keeps a non-empty input', () => {
    expect(
      buildUrlInspectorParams({ input: 'https://example.com/?a=1' }).toString()
    ).toBe('input=https%3A%2F%2Fexample.com%2F%3Fa%3D1');
  });

  test('drops blank input so the share link stays short', () => {
    expect(buildUrlInspectorParams({ input: '   ' }).toString()).toBe('');
  });
});

describe('buildUrlInspectorStateFromSearch', () => {
  test('restores the input verbatim', () => {
    expect(
      buildUrlInspectorStateFromSearch({ input: 'https://example.com/?a=1' })
    ).toEqual({
      input: 'https://example.com/?a=1',
    });
  });

  test('defaults a missing input to empty', () => {
    expect(buildUrlInspectorStateFromSearch({})).toEqual({ input: '' });
  });
});
