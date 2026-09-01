import { describe, expect, test } from 'vite-plus/test';

import { buildYamlParams, buildYamlStateFromSearch } from './yaml-params';

describe('buildYamlParams', () => {
  test('builds params with input and mode', () => {
    const params = buildYamlParams('{"a":1}', 'json-to-yaml');
    expect(params.get('input')).toBe('{"a":1}');
    expect(params.get('mode')).toBe('json-to-yaml');
  });

  test('builds params with yaml-to-json mode', () => {
    const params = buildYamlParams('a: 1', 'yaml-to-json');
    expect(params.get('input')).toBe('a: 1');
    expect(params.get('mode')).toBe('yaml-to-json');
  });

  test('includes mode even when input empty', () => {
    const params = buildYamlParams('', 'json-to-yaml');
    expect(params.get('mode')).toBe('json-to-yaml');
    expect(params.has('input')).toBe(false);
  });
});

describe('buildYamlStateFromSearch', () => {
  test('parses valid search', () => {
    const state = buildYamlStateFromSearch({
      input: 'hello',
      mode: 'yaml-to-json',
    });
    expect(state.input).toBe('hello');
    expect(state.mode).toBe('yaml-to-json');
  });

  test('defaults input to empty string', () => {
    const state = buildYamlStateFromSearch({ mode: 'json-to-yaml' });
    expect(state.input).toBe('');
    expect(state.mode).toBe('json-to-yaml');
  });

  test('defaults mode when invalid', () => {
    const state = buildYamlStateFromSearch({
      input: 'test',
      mode: 'invalid-mode',
    });
    expect(state.mode).toBe('json-to-yaml');
  });

  test('handles empty search', () => {
    const state = buildYamlStateFromSearch({});
    expect(state.input).toBe('');
    expect(state.mode).toBe('json-to-yaml');
  });

  test('handles non-string input', () => {
    const state = buildYamlStateFromSearch({
      input: 123,
      mode: 'yaml-to-json',
    });
    expect(state.input).toBe('');
    expect(state.mode).toBe('yaml-to-json');
  });

  test('round-trip build -> parse', () => {
    const params = buildYamlParams('{"x":1}', 'yaml-to-json');
    const search: Record<string, unknown> = {};
    for (const [k, v] of params.entries()) {
      search[k] = v;
    }
    const state = buildYamlStateFromSearch(search);
    expect(state.input).toBe('{"x":1}');
    expect(state.mode).toBe('yaml-to-json');
  });
});
