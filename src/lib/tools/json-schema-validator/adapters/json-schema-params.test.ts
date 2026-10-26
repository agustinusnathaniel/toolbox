import { describe, expect, test } from 'vite-plus/test';

import type { JsonSchemaValidatorSearchParams } from './json-schema-params';
import {
  buildJsonSchemaParams,
  buildJsonSchemaStateFromSearch,
} from './json-schema-params';

describe('buildJsonSchemaParams', () => {
  test('carries schema and document under their keys', () => {
    const params = buildJsonSchemaParams({
      document: '{"name":"Ada"}',
      schema: '{"type":"object"}',
    });
    expect(params.get('schema')).toBe('{"type":"object"}');
    expect(params.get('input')).toBe('{"name":"Ada"}');
  });

  test('drops blank panes so the share link stays short', () => {
    expect(
      buildJsonSchemaParams({ document: '   ', schema: '  ' }).toString()
    ).toBe('');
    expect(
      buildJsonSchemaParams({
        document: '{"a":1}',
        schema: '  ',
      }).toString()
    ).toBe('input=%7B%22a%22%3A1%7D');
  });
});

describe('buildJsonSchemaStateFromSearch', () => {
  test('restores both panes verbatim', () => {
    expect(
      buildJsonSchemaStateFromSearch({
        input: '{"name":"Ada"}',
        schema: '{"type":"object"}',
      })
    ).toEqual({
      document: '{"name":"Ada"}',
      schema: '{"type":"object"}',
    });
  });

  test('defaults missing panes to empty', () => {
    expect(buildJsonSchemaStateFromSearch({})).toEqual({
      document: '',
      schema: '',
    });
  });

  test('falls back to empty for coerced non-string values', () => {
    expect(
      buildJsonSchemaStateFromSearch({
        input: 123,
        schema: 456,
      } as unknown as JsonSchemaValidatorSearchParams)
    ).toEqual({
      document: '',
      schema: '',
    });
  });

  test('preserves numeric-looking string input', () => {
    expect(
      buildJsonSchemaStateFromSearch({ input: '123', schema: '456' })
    ).toEqual({
      document: '123',
      schema: '456',
    });
  });

  test('round-trips state through share-link params', () => {
    const params = buildJsonSchemaParams({
      document: '{"name":"Ada"}',
      schema: '{"type":"object"}',
    });
    const search: JsonSchemaValidatorSearchParams = {};
    for (const [key, value] of params.entries()) {
      search[key as keyof JsonSchemaValidatorSearchParams] = value;
    }
    expect(buildJsonSchemaStateFromSearch(search)).toEqual({
      document: '{"name":"Ada"}',
      schema: '{"type":"object"}',
    });
  });
});
