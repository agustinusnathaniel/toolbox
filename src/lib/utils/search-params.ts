/**
 * String-preserving search (de)serialization for TanStack Router.
 *
 * The router's default `parseSearchWith(JSON.parse)` / `stringifySearchWith`
 * pair coerces any search value that is a valid JSON literal: `?count=3`
 * arrives as the number `3`, and a string `'3'` is re-serialized as `"3"` with
 * quotes. Every URL-state tool in this app validates search with `z.string()`
 * schemas and reads values through string-typed adapters
 * (`buildUuidStateFromSearch`, `buildYamlStateFromSearch`, ...), so a
 * numeric-looking share link (`/uuid-generator?count=3&uppercase=1&version=v7`,
 * `/base64?input=123`, `/text-diff?original=123`) failed validation, threw in
 * `validateSearch`, and landed on the error boundary.
 *
 * Keeping all values as strings on both sides fixes the whole class. Routes
 * that need numbers use `z.coerce.number()` (ev-charging), which accepts both
 * strings and numbers.
 */

export function parseSearchParams(search: string): Record<string, unknown> {
  return Object.fromEntries(new URLSearchParams(search));
}

export function stringifySearchParams(search: Record<string, unknown>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (value === undefined) {
      continue;
    }
    params.set(key, typeof value === 'string' ? value : JSON.stringify(value));
  }
  const searchStr = params.toString();
  return searchStr ? `?${searchStr}` : '';
}

/**
 * Returns the value when it is one of the allowed strings, otherwise the
 * fallback. Used by share-link adapters to validate enum-like params.
 */
export function coerceEnum<T extends string>(
  value: unknown,
  allowed: ReadonlySet<T>,
  fallback: T
): T {
  if (typeof value === 'string' && allowed.has(value as T)) {
    return value as T;
  }
  return fallback;
}

/**
 * Parses a base-10 integer and clamps it to `[min, max]`. Missing,
 * non-numeric, or unparseable values return the fallback instead of clamping,
 * so an absent param keeps the tool default.
 */
export function parseIntClamped(
  value: string | undefined,
  min: number,
  max: number,
  fallback: number
): number {
  if (value === undefined) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  if (parsed < min) {
    return min;
  }
  if (parsed > max) {
    return max;
  }
  return Math.floor(parsed);
}

/**
 * Reads the `'1'`/`'0'` URL convention. Any other value (including missing)
 * returns the caller's default, so absent params keep the tool default.
 */
export function readFlag(
  value: string | undefined,
  defaultValue: boolean
): boolean {
  if (value === '1') {
    return true;
  }
  if (value === '0') {
    return false;
  }
  return defaultValue;
}

export function writeFlag(value: boolean): '1' | '0' {
  return value ? '1' : '0';
}

export function readString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

/**
 * Builds a URL search-param setter for a single optional string field. The key
 * is omitted only when the trimmed value is empty; the original value
 * (including surrounding whitespace) is written verbatim when present.
 */
export function singleStringParam(
  key: string
): (value: string) => URLSearchParams {
  return (value) => {
    const params = new URLSearchParams();
    if (value.trim()) {
      params.set(key, value);
    }
    return params;
  };
}
