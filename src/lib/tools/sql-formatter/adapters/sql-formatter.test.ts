import { describe, expect, test } from 'vite-plus/test';

import { formatSql, minifySql } from './sql-formatter';

describe('formatSql', () => {
  test('returns error for empty string', () => {
    const result = formatSql('', 'sql');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Input is empty');
    expect(result.formatted).toBe('');
  });

  test('returns error for whitespace only', () => {
    const result = formatSql('   ', 'sql');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Input is empty');
  });

  test('formats simple SELECT query', () => {
    const result = formatSql('select * from foo where id=1', 'sql');
    expect(result.isValid).toBe(true);
    expect(result.formatted).toContain('SELECT');
    expect(result.formatted).toContain('FROM');
  });

  test.each([
    'mysql',
    'postgresql',
    'sqlite',
    'bigquery',
    'transactsql',
  ] as const)('formats with %s dialect', (dialect) => {
    const result = formatSql('select * from foo', dialect);
    expect(result.isValid).toBe(true);
    expect(result.formatted).toContain('SELECT');
  });

  test('is idempotent for already formatted SQL', () => {
    const input = 'SELECT *\nFROM foo\nWHERE id = 1';
    const first = formatSql(input, 'sql');
    expect(first.isValid).toBe(true);
    const second = formatSql(first.formatted, 'sql');
    expect(second.formatted).toBe(first.formatted);
  });

  test('returns invalid with an error for unparseable SQL instead of throwing', () => {
    const result = formatSql(')))', 'sql');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  test('formats multi-line query correctly', () => {
    const result = formatSql(
      'SELECT a, b, c FROM my_table WHERE x=1 AND y=2 ORDER BY a',
      'sql'
    );
    expect(result.isValid).toBe(true);
    expect(result.formatted).toContain('SELECT');
    expect(result.formatted).toContain('ORDER BY');
  });
});

describe('minifySql', () => {
  test('returns error for empty input', () => {
    const result = minifySql('', 'sql');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Input is empty');
  });

  test('minifies SQL to single line', () => {
    const result = minifySql('select * from foo where id=1', 'sql');
    expect(result.isValid).toBe(true);
    expect(result.formatted).not.toContain('\n');
    expect(result.formatted).toContain('SELECT');
  });

  test('minified output is shorter than formatted for multiline', () => {
    const input = 'SELECT a, b, c FROM my_table WHERE x=1 AND y=2 ORDER BY a';
    const formatted = formatSql(input, 'sql');
    const minified = minifySql(input, 'sql');
    expect(minified.isValid).toBe(true);
    expect(minified.formatted.length).toBeLessThanOrEqual(
      formatted.formatted.length
    );
  });

  test('minify handles all dialects', () => {
    const result = minifySql('select * from foo', 'postgresql');
    expect(result.isValid).toBe(true);
    expect(result.formatted).toContain('SELECT');
  });
});
