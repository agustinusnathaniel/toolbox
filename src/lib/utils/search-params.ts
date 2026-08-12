/**
 * String-preserving search parser for TanStack Router.
 *
 * The router's default `parseSearchWith(JSON.parse)` coerces any search value
 * that is a valid JSON literal: `?count=3` arrives as the number `3`,
 * `?uppercase=1` as `1`. Every URL-state tool in this app validates search
 * with `z.string()` schemas and reads values through string-typed adapters
 * (`buildUuidStateFromSearch`, `buildBase64StateFromSearch`, ...), so a
 * numeric-looking share link (`/uuid-generator?count=3&uppercase=1&version=v7`,
 * `/base64?input=123`, `/text-diff?original=123`) failed validation, threw in
 * `validateSearch`, and landed on the error boundary.
 *
 * Keeping all values as strings matches what the adapters expect and fixes the
 * whole class. Routes that need numbers use `z.coerce.number()` (ev-charging),
 * which accepts both strings and numbers.
 */
export function parseSearchParams(search: string): Record<string, unknown> {
  return Object.fromEntries(new URLSearchParams(search));
}
