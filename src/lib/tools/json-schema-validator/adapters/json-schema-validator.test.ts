import { describe, expect, test } from 'vite-plus/test';

import { validateJsonAgainstSchema } from './json-schema-validator';

const USER_SCHEMA = JSON.stringify({
  properties: {
    age: { minimum: 0, type: 'integer' },
    email: { format: 'email', type: 'string' },
    name: { type: 'string' },
  },
  required: ['email', 'name'],
  type: 'object',
});

const VALID_USER = JSON.stringify({
  age: 30,
  email: 'ada@example.com',
  name: 'Ada',
});

const INVALID_SCHEMA_PREFIX = /^Invalid JSON Schema: /;

describe('validateJsonAgainstSchema verdicts', () => {
  test('accepts a document that satisfies the schema', () => {
    expect(validateJsonAgainstSchema(USER_SCHEMA, VALID_USER)).toEqual({
      issues: [],
      isValid: true,
      truncated: false,
    });
  });

  test('reports missing required properties with JSON-pointer paths', () => {
    const result = validateJsonAgainstSchema(
      USER_SCHEMA,
      JSON.stringify({ name: 'Ada' })
    );
    expect(result.isValid).toBe(false);
    expect(result.error).toBeUndefined();
    expect(result.issues).toContainEqual({
      message: "must have required property 'email'",
      path: '(root)',
    });
  });

  test('reports type and format violations on nested paths', () => {
    const result = validateJsonAgainstSchema(
      USER_SCHEMA,
      JSON.stringify({ age: -1, email: 'not-an-email', name: 'Ada' })
    );
    expect(result.isValid).toBe(false);
    const paths = result.issues.map((issue) => issue.path);
    expect(paths).toContain('/age');
    expect(paths).toContain('/email');
  });

  test('resolves local $ref targets', () => {
    const schema = JSON.stringify({
      $defs: {
        name: { minLength: 1, type: 'string' },
      },
      $ref: '#/$defs/name',
    });
    expect(validateJsonAgainstSchema(schema, '"Ada"').isValid).toBe(true);
    const result = validateJsonAgainstSchema(schema, '""');
    expect(result.isValid).toBe(false);
    expect(result.issues).toHaveLength(1);
  });

  test('supports boolean schemas', () => {
    expect(validateJsonAgainstSchema('true', 'null').isValid).toBe(true);
    const result = validateJsonAgainstSchema('false', 'null');
    expect(result.isValid).toBe(false);
    expect(result.issues).toHaveLength(1);
  });

  test('still enforces retired draft-07 keywords like dependencies', () => {
    const schema = JSON.stringify({ dependencies: { a: ['b'] } });
    expect(validateJsonAgainstSchema(schema, '{"a":1,"b":2}').isValid).toBe(
      true
    );
    expect(validateJsonAgainstSchema(schema, '{"a":1}').isValid).toBe(false);
  });

  test('caps the reported issues and flags truncation', () => {
    const required = Array.from({ length: 60 }, (_, i) => `field${i}`);
    const schema = JSON.stringify({ required, type: 'object' });
    const result = validateJsonAgainstSchema(schema, '{}');
    expect(result.isValid).toBe(false);
    expect(result.issues).toHaveLength(50);
    expect(result.truncated).toBe(true);
  });
});

describe('validateJsonAgainstSchema $id handling', () => {
  test('re-validates schemas carrying an $id without stale-registration errors', () => {
    const schema = JSON.stringify({
      $id: 'https://example.com/regression-schema',
      properties: { name: { type: 'string' } },
      required: ['name'],
      type: 'object',
    });
    expect(validateJsonAgainstSchema(schema, '{"name":"Ada"}')).toEqual({
      issues: [],
      isValid: true,
      truncated: false,
    });
    const repeat = validateJsonAgainstSchema(schema, '{"name":"Ada"}');
    expect(repeat.error).toBeUndefined();
    expect(repeat.isValid).toBe(true);
    const failing = validateJsonAgainstSchema(schema, '{}');
    expect(failing.isValid).toBe(false);
    expect(failing.error).toBeUndefined();
    expect(failing.issues).toContainEqual({
      message: "must have required property 'name'",
      path: '(root)',
    });
  });
});

describe('validateJsonAgainstSchema input errors', () => {
  test('rejects a document that is not JSON', () => {
    const result = validateJsonAgainstSchema(USER_SCHEMA, '{oops}');
    expect(result).toEqual({
      error: 'Document is not valid JSON.',
      issues: [],
      isValid: false,
      truncated: false,
    });
  });

  test('rejects a schema that is not JSON', () => {
    const result = validateJsonAgainstSchema('{oops}', VALID_USER);
    expect(result.error).toBe('Schema is not valid JSON.');
    expect(result.isValid).toBe(false);
  });

  test('rejects a schema that is neither an object nor a boolean', () => {
    expect(validateJsonAgainstSchema('42', VALID_USER).error).toBe(
      'Schema must be a JSON object (or boolean).'
    );
    expect(validateJsonAgainstSchema('"string"', VALID_USER).error).toBe(
      'Schema must be a JSON object (or boolean).'
    );
  });

  test('reports an uncompilable schema as a schema error', () => {
    const result = validateJsonAgainstSchema(
      JSON.stringify({ type: 'nonsense' }),
      VALID_USER
    );
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(INVALID_SCHEMA_PREFIX);
  });

  test('asks for a schema when none is given', () => {
    expect(validateJsonAgainstSchema('   ', VALID_USER).error).toBe(
      'Enter a JSON Schema to validate against.'
    );
  });

  test('asks for a document when none is given', () => {
    expect(validateJsonAgainstSchema(USER_SCHEMA, '  ').error).toBe(
      'Enter a JSON document to validate.'
    );
  });
});
