import { describe, expect, test } from 'vite-plus/test';

import { convertJsonToYaml, convertYamlToJson } from './yaml-converter';

describe('convertJsonToYaml', () => {
  test('converts valid JSON object to YAML', () => {
    const result = convertJsonToYaml('{"name":"John","age":30}');
    expect(result.isValid).toBe(true);
    expect(result.output).toContain('name: John');
    expect(result.output).toContain('age: 30');
  });

  test('converts valid JSON array to YAML', () => {
    const result = convertJsonToYaml('[1, 2, 3]');
    expect(result.isValid).toBe(true);
    expect(result.output).toContain('1');
    expect(result.output).toContain('2');
  });

  test('converts nested objects', () => {
    const result = convertJsonToYaml(
      '{"person":{"name":"John","address":{"city":"NYC"}}}'
    );
    expect(result.isValid).toBe(true);
    expect(result.output).toContain('person:');
    expect(result.output).toContain('city: NYC');
  });

  test('converts JSON string primitive', () => {
    const result = convertJsonToYaml('"hello"');
    expect(result.isValid).toBe(true);
    expect(result.output.trim()).toBe('hello');
  });

  test('converts JSON null', () => {
    const result = convertJsonToYaml('null');
    expect(result.isValid).toBe(true);
    expect(result.output.trim()).toBe('null');
  });

  test('returns error for invalid JSON', () => {
    const result = convertJsonToYaml('{"name":}');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.output).toBe('');
  });

  test('returns error for trailing comma', () => {
    const result = convertJsonToYaml('{"a":1,}');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  test('returns error for empty string', () => {
    const result = convertJsonToYaml('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Input is empty');
  });

  test('returns error for whitespace only', () => {
    const result = convertJsonToYaml('   ');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Input is empty');
  });
});

describe('convertYamlToJson', () => {
  test('converts valid YAML object to JSON', () => {
    const yaml = 'name: John\nage: 30\n';
    const result = convertYamlToJson(yaml);
    expect(result.isValid).toBe(true);
    expect(JSON.parse(result.output)).toEqual({ age: 30, name: 'John' });
  });

  test('converts YAML array to JSON', () => {
    const yaml = '- 1\n- 2\n- 3\n';
    const result = convertYamlToJson(yaml);
    expect(result.isValid).toBe(true);
    expect(JSON.parse(result.output)).toEqual([1, 2, 3]);
  });

  test('converts nested YAML', () => {
    const yaml = 'person:\n  name: John\n  address:\n    city: NYC\n';
    const result = convertYamlToJson(yaml);
    expect(result.isValid).toBe(true);
    expect(JSON.parse(result.output)).toEqual({
      person: { address: { city: 'NYC' }, name: 'John' },
    });
  });

  test('formats JSON with 2-space indent', () => {
    const result = convertYamlToJson('a: 1\nb: 2\n');
    expect(result.isValid).toBe(true);
    expect(result.output).toBe('{\n  "a": 1,\n  "b": 2\n}');
  });

  test('returns error for invalid YAML', () => {
    const result = convertYamlToJson('key: [unclosed');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.output).toBe('');
  });

  test('returns error for empty string', () => {
    const result = convertYamlToJson('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Input is empty');
  });

  test('returns error for whitespace only', () => {
    const result = convertYamlToJson('   \n  ');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Input is empty');
  });

  test('round-trip JSON -> YAML -> JSON', () => {
    const original = { foo: 'bar', nested: { a: true }, nums: [1, 2] };
    const json = JSON.stringify(original);
    const yamlResult = convertJsonToYaml(json);
    expect(yamlResult.isValid).toBe(true);
    const jsonResult = convertYamlToJson(yamlResult.output);
    expect(jsonResult.isValid).toBe(true);
    expect(JSON.parse(jsonResult.output)).toEqual(original);
  });
});
