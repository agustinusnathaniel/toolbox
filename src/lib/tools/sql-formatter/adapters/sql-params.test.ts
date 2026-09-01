import { describe, expect, test } from 'vite-plus/test';

import { buildSqlParams, buildSqlStateFromSearch } from './sql-params';

describe('buildSqlParams', () => {
  test('builds params with input, dialect, action', () => {
    const params = buildSqlParams('SELECT * FROM foo', 'sql', 'format');
    expect(params.get('input')).toBe('SELECT * FROM foo');
    expect(params.get('dialect')).toBe('sql');
    expect(params.get('action')).toBe('format');
  });

  test('builds params with minify action', () => {
    const params = buildSqlParams('SELECT 1', 'mysql', 'minify');
    expect(params.get('action')).toBe('minify');
    expect(params.get('dialect')).toBe('mysql');
  });

  test('omits input when empty', () => {
    const params = buildSqlParams('', 'sql', 'format');
    expect(params.has('input')).toBe(false);
    expect(params.get('dialect')).toBe('sql');
    expect(params.get('action')).toBe('format');
  });

  test('preserves all dialect values', () => {
    for (const dialect of [
      'sql',
      'mysql',
      'postgresql',
      'sqlite',
      'bigquery',
      'transactsql',
    ] as const) {
      const params = buildSqlParams('x', dialect, 'format');
      expect(params.get('dialect')).toBe(dialect);
    }
  });
});

describe('buildSqlStateFromSearch', () => {
  test('parses valid search', () => {
    const state = buildSqlStateFromSearch({
      action: 'minify',
      dialect: 'mysql',
      input: 'SELECT 1',
    });
    expect(state.input).toBe('SELECT 1');
    expect(state.dialect).toBe('mysql');
    expect(state.action).toBe('minify');
  });

  test('defaults dialect when invalid', () => {
    const state = buildSqlStateFromSearch({
      dialect: 'invalid',
      input: 'test',
    });
    expect(state.dialect).toBe('sql');
  });

  test('defaults action when invalid', () => {
    const state = buildSqlStateFromSearch({ action: 'invalid', input: 'test' });
    expect(state.action).toBe('format');
  });

  test('handles empty search', () => {
    const state = buildSqlStateFromSearch({});
    expect(state.input).toBe('');
    expect(state.dialect).toBe('sql');
    expect(state.action).toBe('format');
  });

  test('handles non-string input', () => {
    const state = buildSqlStateFromSearch({
      action: 'format',
      dialect: 'sql',
      input: 123,
    });
    expect(state.input).toBe('');
    expect(state.dialect).toBe('sql');
  });

  test('preserves numeric-looking string input', () => {
    const state = buildSqlStateFromSearch({
      action: 'format',
      dialect: 'sql',
      input: '123',
    });
    expect(state.input).toBe('123');
    expect(typeof state.input).toBe('string');
  });

  test('round-trip build -> parse', () => {
    const params = buildSqlParams('SELECT * FROM foo', 'postgresql', 'minify');
    const search: Record<string, unknown> = {};
    for (const [k, v] of params.entries()) {
      search[k] = v;
    }
    const state = buildSqlStateFromSearch(search);
    expect(state.input).toBe('SELECT * FROM foo');
    expect(state.dialect).toBe('postgresql');
    expect(state.action).toBe('minify');
  });

  test('round-trip with numeric-looking input', () => {
    const params = buildSqlParams('123', 'sql', 'format');
    const search: Record<string, unknown> = {};
    for (const [k, v] of params.entries()) {
      search[k] = v;
    }
    const state = buildSqlStateFromSearch(search);
    expect(state.input).toBe('123');
    expect(typeof state.input).toBe('string');
  });
});
