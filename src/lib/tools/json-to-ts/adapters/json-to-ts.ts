export interface JsonToTsResult {
  error?: string;
  isValid: boolean;
  output: string;
}

interface TypeContext {
  interfaces: Array<string>;
  usedNames: Set<string>;
}

const PASCAL_SPLIT_PATTERN = /[^A-Za-z0-9]+/;
const LEADING_DIGIT_PATTERN = /^[0-9]/;
const IDENTIFIER_PATTERN = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function pascalCase(key: string): string {
  const words = key.split(PASCAL_SPLIT_PATTERN).filter(Boolean);
  const name = words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
  if (!name) {
    return 'Anonymous';
  }
  return LEADING_DIGIT_PATTERN.test(name) ? `_${name}` : name;
}

function uniqueName(base: string, used: Set<string>): string {
  if (!used.has(base)) {
    used.add(base);
    return base;
  }
  let i = 2;
  while (used.has(`${base}${i}`)) {
    i += 1;
  }
  used.add(`${base}${i}`);
  return `${base}${i}`;
}

function isIdentifier(key: string): boolean {
  return IDENTIFIER_PATTERN.test(key);
}

function quoteKey(key: string): string {
  return isIdentifier(key) ? key : JSON.stringify(key);
}

function arrayItemName(key: string): string {
  // Best-effort English singularization for interface naming.
  // Order matters: longer suffixes first.
  let singular = key;
  if (key.endsWith('sses')) {
    singular = key.slice(0, -2); // addresses -> address, classes -> class
  } else if (
    key.endsWith('ches') ||
    key.endsWith('shes') ||
    key.endsWith('xes')
  ) {
    singular = key.slice(0, -2); // matches -> match, wishes -> wish, boxes -> box
  } else if (key.endsWith('ies') && key.length > 4) {
    singular = `${key.slice(0, -3)}y`; // categories -> category
  } else if (key.endsWith('s') && !key.endsWith('ss')) {
    singular = key.slice(0, -1); // users -> user, items -> item, tags -> tag
  }
  return pascalCase(singular);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function mergeObjectElements(
  elements: Array<Record<string, unknown>>
): Record<string, unknown> {
  const merged: Record<string, unknown> = {};
  for (const element of elements) {
    for (const key of Object.keys(element)) {
      if (!(key in merged)) {
        merged[key] = element[key];
      }
    }
  }
  return merged;
}

function arrayType(
  value: Array<unknown>,
  key: string,
  ctx: TypeContext
): string {
  const objectElements = value.filter(isPlainObject);
  const otherTypes = new Set<string>();
  for (const element of value) {
    if (isPlainObject(element)) {
      continue;
    }
    otherTypes.add(valueType(element, key, ctx));
  }
  const parts: Array<string> = [];
  if (objectElements.length > 0) {
    const name = uniqueName(arrayItemName(key), ctx.usedNames);
    emitObjectInterface(mergeObjectElements(objectElements), name, ctx);
    parts.push(name);
  }
  for (const t of otherTypes) {
    parts.push(t);
  }
  return parts.length === 1 ? `${parts[0]}[]` : `Array<${parts.join(' | ')}>`;
}

function valueType(value: unknown, key: string, ctx: TypeContext): string {
  if (value === null) {
    return 'null';
  }
  if (Array.isArray(value)) {
    return value.length === 0 ? 'unknown[]' : arrayType(value, key, ctx);
  }
  switch (typeof value) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'object': {
      const name = uniqueName(arrayItemName(key), ctx.usedNames);
      emitObjectInterface(value as Record<string, unknown>, name, ctx);
      return name;
    }
    default:
      return 'unknown';
  }
}

function emitObjectInterface(
  obj: Record<string, unknown>,
  name: string,
  ctx: TypeContext
): void {
  const keys = Object.keys(obj);
  if (keys.length === 0) {
    ctx.interfaces.push(
      `export interface ${name} extends Record<string, unknown> {}`
    );
    return;
  }
  const lines = keys.map((key) => {
    const tsType = valueType(obj[key], key, ctx);
    return `  ${quoteKey(key)}: ${tsType};`;
  });
  ctx.interfaces.push(`export interface ${name} {\n${lines.join('\n')}\n}`);
}

export const JSON_TO_TS_MAX_CHARS = 500_000;

export function jsonToTypescript(input: string): JsonToTsResult {
  if (input.length > JSON_TO_TS_MAX_CHARS) {
    return {
      error: 'Input is limited to 500,000 characters.',
      isValid: false,
      output: '',
    };
  }
  const trimmed = input.trim();
  if (!trimmed) {
    return { error: 'Input is empty', isValid: false, output: '' };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch (e) {
    return { error: (e as Error).message, isValid: false, output: '' };
  }
  if (Array.isArray(parsed)) {
    const ctx: TypeContext = { interfaces: [], usedNames: new Set() };
    if (parsed.length === 0) {
      return { isValid: true, output: 'export type Root = unknown[];\n' };
    }
    const elementTypes = new Set<string>();
    for (const element of parsed) {
      elementTypes.add(valueType(element, 'Item', ctx));
    }
    const types = [...elementTypes];
    const rootType =
      types.length === 1 ? `${types[0]}[]` : `Array<${types.join(' | ')}>`;
    const body = `${ctx.interfaces.join('\n\n')}\n\nexport type Root = ${rootType};`;
    return { isValid: true, output: `${body}\n` };
  }
  if (!isPlainObject(parsed)) {
    return {
      error: 'Top-level JSON must be an object or array',
      isValid: false,
      output: '',
    };
  }
  const ctx: TypeContext = { interfaces: [], usedNames: new Set() };
  const rootName = uniqueName('Root', ctx.usedNames);
  emitObjectInterface(parsed, rootName, ctx);
  return { isValid: true, output: `${ctx.interfaces.join('\n\n')}\n` };
}
