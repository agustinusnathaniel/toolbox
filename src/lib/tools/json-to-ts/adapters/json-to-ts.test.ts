import { describe, expect, test } from 'vite-plus/test';

import { JSON_TO_TS_MAX_CHARS, jsonToTypescript } from './json-to-ts';

describe('jsonToTypescript', () => {
  test('returns an invalid result for empty input', () => {
    expect(jsonToTypescript('')).toEqual({
      error: 'Input is empty',
      isValid: false,
      output: '',
    });
    expect(jsonToTypescript('   ')).toEqual({
      error: 'Input is empty',
      isValid: false,
      output: '',
    });
  });

  test('returns an invalid result for invalid JSON', () => {
    const result = jsonToTypescript('{"a":}');
    expect(result.isValid).toBe(false);
    expect(result.output).toBe('');
    expect(result.error?.length).toBeGreaterThan(0);
  });

  test('rejects a top-level primitive', () => {
    const expected = {
      error: 'Top-level JSON must be an object or array',
      isValid: false,
      output: '',
    };
    expect(jsonToTypescript('"hello"')).toEqual(expected);
    expect(jsonToTypescript('42')).toEqual(expected);
    expect(jsonToTypescript('null')).toEqual(expected);
  });

  test('generates an interface for a flat object', () => {
    const result = jsonToTypescript('{"name":"x","age":1,"active":true}');
    expect(result.isValid).toBe(true);
    expect(result.output).toBe(
      `export interface Root {
  name: string;
  age: number;
  active: boolean;
}
`
    );
  });

  test('generates nested interfaces for nested objects', () => {
    const result = jsonToTypescript(
      '{"user":{"name":"x","address":{"city":"Y"}}}'
    );
    expect(result.isValid).toBe(true);
    expect(result.output).toBe(
      `export interface Address {
  city: string;
}

export interface User {
  name: string;
  address: Address;
}

export interface Root {
  user: User;
}
`
    );
  });

  test('singularizes array-of-object keys', () => {
    const result = jsonToTypescript(
      '{"users":[{"id":1,"name":"a"},{"id":2,"name":"b"}]}'
    );
    expect(result.isValid).toBe(true);
    expect(result.output).toBe(
      `export interface User {
  id: number;
  name: string;
}

export interface Root {
  users: User[];
}
`
    );
  });

  test('handles irregular plurals', () => {
    const addresses = jsonToTypescript('{"addresses":[{"street":"x"}]}');
    expect(addresses.output).toContain('export interface Address {');
    expect(addresses.output).toContain('addresses: Address[];');

    const classes = jsonToTypescript('{"classes":[{"name":"x"}]}');
    expect(classes.output).toContain('export interface Class {');

    const categories = jsonToTypescript('{"categories":[{"name":"x"}]}');
    expect(categories.output).toContain('export interface Category {');

    const boxes = jsonToTypescript('{"boxes":[{"label":"x"}]}');
    expect(boxes.output).toContain('export interface Box {');
  });

  test('types arrays of primitives', () => {
    const tags = jsonToTypescript('{"tags":["a","b"]}');
    expect(tags.output).toContain('  tags: string[];');

    const matrix = jsonToTypescript('{"matrix":[[1,2],[3,4]]}');
    expect(matrix.output).toContain('  matrix: number[][];');
  });

  test('types empty arrays as unknown[]', () => {
    const result = jsonToTypescript('{"items":[]}');
    expect(result.output).toContain('  items: unknown[];');
  });

  test('types null fields', () => {
    const result = jsonToTypescript('{"nickname":null}');
    expect(result.output).toContain('  nickname: null;');
  });

  test('unions mixed array element types', () => {
    const result = jsonToTypescript('{"vals":[1,"a",true]}');
    expect(result.output).toContain(
      '  vals: Array<number | string | boolean>;'
    );
  });

  test('quotes invalid property keys', () => {
    const result = jsonToTypescript('{"some-key":"v","2fa":true}');
    expect(result.output).toContain('  "some-key": string;');
    expect(result.output).toContain('  "2fa": boolean;');
  });

  test('dedupes colliding interface names', () => {
    const result = jsonToTypescript(
      '{"user":{"a":1},"userData":{"user":{"b":2}}}'
    );
    expect(result.output).toContain('export interface User {');
    expect(result.output).toContain('export interface User2 {');
  });

  test('handles empty objects', () => {
    const result = jsonToTypescript('{"meta":{}}');
    expect(result.output).toContain(
      'export interface Meta extends Record<string, unknown> {}'
    );
  });

  test('handles top-level arrays', () => {
    const result = jsonToTypescript('[{"id":1}]');
    expect(result.isValid).toBe(true);
    expect(result.output).toBe(
      `export interface Item {
  id: number;
}

export type Root = Item[];
`
    );
  });

  test('unions mixed top-level array elements', () => {
    const result = jsonToTypescript('[{"id":1},"x"]');
    expect(result.output).toContain('export type Root = Array<Item | string>;');
  });

  test('rejects input over the character limit', () => {
    expect(jsonToTypescript('x'.repeat(JSON_TO_TS_MAX_CHARS + 1))).toEqual({
      error: 'Input is limited to 500,000 characters.',
      isValid: false,
      output: '',
    });
  });

  test('accepts input at exactly the character limit', () => {
    const input = `{"a":"${'x'.repeat(JSON_TO_TS_MAX_CHARS - 8)}"}`;
    expect(input.length).toBe(JSON_TO_TS_MAX_CHARS);
    const result = jsonToTypescript(input);
    expect(result.isValid).toBe(true);
    expect(result.output).toContain('  a: string;');
  });
});
