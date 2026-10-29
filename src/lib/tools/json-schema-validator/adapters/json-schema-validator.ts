import Ajv, { type ErrorObject, type ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';

export interface SchemaValidationIssue {
  message: string;
  path: string;
}

export interface SchemaValidationResult {
  error?: string;
  issues: Array<SchemaValidationIssue>;
  isValid: boolean;
  truncated: boolean;
}

export interface JsonSchemaExample {
  document: string;
  /** Expected verdict — tests pin this so edited examples can't silently flip. */
  expectValid: boolean;
  /** Short button label. */
  label: string;
  schema: string;
}

const EXAMPLE_USER_SCHEMA = JSON.stringify(
  {
    properties: {
      age: { minimum: 0, type: 'integer' },
      name: { type: 'string' },
    },
    required: ['name'],
    type: 'object',
  },
  null,
  2
);

/**
 * One-click starters (mirrors the cron-parser CRON_EXAMPLES pattern). The
 * pair shares one schema so users see both verdict states with one click
 * each — the tool's empty-empty starting state otherwise forces newcomers to
 * invent two coordinated inputs before the first Validate.
 */
export const JSON_SCHEMA_EXAMPLES: Array<JsonSchemaExample> = [
  {
    document: JSON.stringify({ age: 30, name: 'Ada' }, null, 2),
    expectValid: true,
    label: 'Valid user',
    schema: EXAMPLE_USER_SCHEMA,
  },
  {
    document: JSON.stringify({ age: -1 }, null, 2),
    expectValid: false,
    label: 'Invalid user',
    schema: EXAMPLE_USER_SCHEMA,
  },
];

const MAX_REPORTED_ISSUES = 50;

/**
 * Shared Ajv instance. Draft 2020-12 semantics, non-strict so schemas using
 * retired draft-07 keywords validate instead of throwing, plus the official
 * format pack (email, date-time, uri, uuid, ...) most real-world schemas rely
 * on. Ajv v8 still implements draft-07 staples like `dependencies`, so one
 * instance covers the schemas people actually paste.
 */
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

function toIssue(error: ErrorObject): SchemaValidationIssue {
  return {
    message: error.message ?? 'Invalid value',
    path: error.instancePath ? error.instancePath : '(root)',
  };
}

function failure(error: string): SchemaValidationResult {
  return { error, issues: [], isValid: false, truncated: false };
}

/**
 * Validate a JSON document against a JSON Schema. Both inputs are raw text —
 * parse failures are reported as tool errors, not validation issues, so the
 * UI can tell "your JSON is broken" apart from "your JSON fails the schema".
 */
export function validateJsonAgainstSchema(
  schemaText: string,
  documentText: string
): SchemaValidationResult {
  if (!schemaText.trim()) {
    return failure('Enter a JSON Schema to validate against.');
  }
  if (!documentText.trim()) {
    return failure('Enter a JSON document to validate.');
  }
  let schema: unknown;
  try {
    schema = JSON.parse(schemaText) as unknown;
  } catch {
    return failure('Schema is not valid JSON.');
  }
  if (
    typeof schema !== 'boolean' &&
    (typeof schema !== 'object' || schema === null || Array.isArray(schema))
  ) {
    return failure('Schema must be a JSON object (or boolean).');
  }
  let document: unknown;
  try {
    document = JSON.parse(documentText) as unknown;
  } catch {
    return failure('Document is not valid JSON.');
  }
  // The shared Ajv instance remembers compiled `$id`s across validations
  // (the worker reuses this module). Evict the previous registration so
  // clicking Validate twice on the same `$id` schema recompiles instead of
  // throwing "schema with key or id already exists".
  if (typeof schema === 'object' && schema !== null && !Array.isArray(schema)) {
    const schemaId = (schema as { $id?: unknown }).$id;
    if (typeof schemaId === 'string' && schemaId) {
      ajv.removeSchema(schemaId);
    }
  }
  let validate: ValidateFunction;
  try {
    validate = ajv.compile(schema);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return failure(`Invalid JSON Schema: ${detail}`);
  }
  const valid = validate(document);
  if (valid) {
    return { issues: [], isValid: true, truncated: false };
  }
  const all = (validate.errors ?? []).map(toIssue);
  return {
    issues: all.slice(0, MAX_REPORTED_ISSUES),
    isValid: false,
    truncated: all.length > MAX_REPORTED_ISSUES,
  };
}
