import { describe, expect, test } from 'vite-plus/test';

import { formatJson, minifyJson, validateJson } from './json-formatter';

const VALID_OBJECT = '{"name":"John","age":30}';
const VALID_ARRAY = '[1,2,3]';
const VALID_STRING = '"hello"';
const VALID_NUMBER = '42';
const VALID_BOOLEAN = 'true';
const VALID_NULL = 'null';
const VALID_NESTED =
  '{"person":{"name":"John","address":{"city":"NYC","zip":10001}}}';

const INVALID_TRAILING_COMMA = '{"name":"John",}';
const INVALID_UNQUOTED_KEY = '{name:"John"}';
const INVALID_TRUNCATED = '{"name":"John"';
const EMPTY_STRING = '';
const WHITESPACE_ONLY = '   ';

describe('formatJson', () => {
  test('formats valid JSON object', () => {
    const result = formatJson(VALID_OBJECT);
    expect(result.isValid).toBe(true);
    expect(result.formatted).toBe('{\n  "name": "John",\n  "age": 30\n}');
  });

  test('formats valid JSON array', () => {
    const result = formatJson(VALID_ARRAY);
    expect(result.isValid).toBe(true);
    expect(result.formatted).toBe('[\n  1,\n  2,\n  3\n]');
  });

  test('formats JSON string', () => {
    const result = formatJson(VALID_STRING);
    expect(result.isValid).toBe(true);
    expect(result.formatted).toBe('"hello"');
  });

  test('formats JSON number', () => {
    const result = formatJson(VALID_NUMBER);
    expect(result.isValid).toBe(true);
    expect(result.formatted).toBe('42');
  });

  test('formats JSON boolean', () => {
    const result = formatJson(VALID_BOOLEAN);
    expect(result.isValid).toBe(true);
    expect(result.formatted).toBe('true');
  });

  test('formats JSON null', () => {
    const result = formatJson(VALID_NULL);
    expect(result.isValid).toBe(true);
    expect(result.formatted).toBe('null');
  });

  test('formats nested objects with proper indentation', () => {
    const result = formatJson(VALID_NESTED);
    expect(result.isValid).toBe(true);
    expect(result.formatted).toBe(
      '{\n  "person": {\n    "name": "John",\n    "address": {\n      "city": "NYC",\n      "zip": 10001\n    }\n  }\n}'
    );
  });

  test('uses custom indent size', () => {
    const result = formatJson(VALID_OBJECT, 4);
    expect(result.isValid).toBe(true);
    expect(result.formatted).toBe('{\n    "name": "John",\n    "age": 30\n}');
  });

  test('returns error for trailing comma', () => {
    const result = formatJson(INVALID_TRAILING_COMMA);
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  test('returns error for unquoted keys', () => {
    const result = formatJson(INVALID_UNQUOTED_KEY);
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  test('returns error for truncated JSON', () => {
    const result = formatJson(INVALID_TRUNCATED);
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  test('returns error for empty string', () => {
    const result = formatJson(EMPTY_STRING);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Input is empty');
  });

  test('returns error for whitespace only', () => {
    const result = formatJson(WHITESPACE_ONLY);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Input is empty');
  });
});

describe('validateJson', () => {
  test('returns valid for valid JSON', () => {
    const result = validateJson(VALID_OBJECT);
    expect(result.isValid).toBe(true);
  });

  test('returns normalized formatted output', () => {
    const result = validateJson('  {"name":"John"}  ');
    expect(result.isValid).toBe(true);
    expect(result.formatted).toBe('{"name":"John"}');
  });

  test('returns invalid for malformed JSON', () => {
    const result = validateJson(INVALID_TRAILING_COMMA);
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  test('returns error for empty string', () => {
    const result = validateJson(EMPTY_STRING);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Input is empty');
  });
});

describe('minifyJson', () => {
  test('minifies formatted JSON', () => {
    const result = minifyJson(VALID_NESTED);
    expect(result.isValid).toBe(true);
    expect(result.formatted).toBe(VALID_NESTED);
  });

  test('minifies whitespace-heavy JSON', () => {
    const input = '{\n  "a": 1,\n  "b": 2\n}';
    const result = minifyJson(input);
    expect(result.isValid).toBe(true);
    expect(result.formatted).toBe('{"a":1,"b":2}');
  });

  test('reduces size compared to formatted version', () => {
    const formatted = formatJson(VALID_NESTED);
    const minified = minifyJson(VALID_NESTED);
    expect(minified.formatted.length).toBeLessThan(formatted.formatted.length);
  });

  test('returns error for invalid JSON', () => {
    const result = minifyJson(INVALID_UNQUOTED_KEY);
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  test('returns error for empty string', () => {
    const result = minifyJson(EMPTY_STRING);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Input is empty');
  });
});
