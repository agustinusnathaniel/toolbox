import { describe, expect, test } from 'vite-plus/test';

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
});
