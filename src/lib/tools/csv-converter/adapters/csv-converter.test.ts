import { describe, expect, test } from 'vite-plus/test';

import { csvToJson, jsonToCsv } from './csv-converter';

describe('csvToJson', () => {
  test('returns an error for empty input', () => {
    const result = csvToJson('   ');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Input is empty');
    expect(result.output).toBe('');
  });

  test('converts a basic CSV to JSON', () => {
    const result = csvToJson('name,age\nAlice,30\nBob,25');
    expect(result.isValid).toBe(true);
    expect(result.output).toBe(
      '[\n  {\n    "name": "Alice",\n    "age": "30"\n  },\n  {\n    "name": "Bob",\n    "age": "25"\n  }\n]'
    );
  });

  test('returns an error for invalid CSV', () => {
    const result = csvToJson('name,age\n"unclosed');
    expect(result.isValid).toBe(false);
    expect(result.output).toBe('');
  });

  test('returns an error when the CSV has no rows', () => {
    const result = csvToJson('name,age');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('No rows found in CSV');
    expect(result.output).toBe('');
  });
});

describe('jsonToCsv', () => {
  test('returns an error for empty input', () => {
    const result = jsonToCsv('   ');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Input is empty');
    expect(result.output).toBe('');
  });

  test('returns an error for invalid JSON', () => {
    const result = jsonToCsv('{ not json');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeTruthy();
    expect(result.output).toBe('');
  });

  test('returns an error for non-array JSON', () => {
    const result = jsonToCsv('{"name":"Alice"}');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('JSON must be a non-empty array');
    expect(result.output).toBe('');
  });

  test('returns an error for an empty array', () => {
    const result = jsonToCsv('[]');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('JSON must be a non-empty array');
    expect(result.output).toBe('');
  });

  test('returns an error when array items are not objects', () => {
    const result = jsonToCsv('[1, 2]');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('JSON array items must be objects');
    expect(result.output).toBe('');
  });

  test('converts a JSON array to CSV with headers', () => {
    const result = jsonToCsv(
      '[{"name":"Alice","age":30},{"name":"Bob","age":25}]'
    );
    expect(result.isValid).toBe(true);
    expect(result.output).toBe('name,age\r\nAlice,30\r\nBob,25');
  });

  test('unions keys across rows', () => {
    const result = jsonToCsv(
      '[{"name":"Alice","age":30},{"name":"Bob","city":"NYC"}]'
    );
    expect(result.isValid).toBe(true);
    expect(result.output).toBe('name,age,city\r\nAlice,30,\r\nBob,,NYC');
  });

  test('stringifies nested objects and handles null values', () => {
    const result = jsonToCsv('[{"name":"Alice","tags":["a","b"],"meta":null}]');
    expect(result.isValid).toBe(true);
    expect(result.output).toBe('name,tags,meta\r\nAlice,"[""a"",""b""]",');
  });

  test('converts booleans to strings', () => {
    const result = jsonToCsv('[{"name":"Alice","active":true}]');
    expect(result.isValid).toBe(true);
    expect(result.output).toBe('name,active\r\nAlice,true');
  });
});
