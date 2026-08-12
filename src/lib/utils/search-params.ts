/**
 * String-preserving search (de)serialization for TanStack Router.
 *
 * The router's default `parseSearchWith(JSON.parse)` / `stringifySearchWith`
 * pair coerces any search value that is a valid JSON literal: `?count=3`
 * arrives as the number `3`, and a string `'3'` is re-serialized as `"3"` with
 * quotes. Every URL-state tool in this app validates search with `z.string()`
 * schemas and reads values through string-typed adapters
 * (`buildUuidStateFromSearch`, `buildBase64StateFromSearch`, ...), so a
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
