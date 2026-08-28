export type HtmlEntitiesMode = 'decode' | 'encode';

const NAMED_ENTITIES: Record<string, string> = {
  '#39': "'",
  '#X27': "'",
  '#x27': "'",
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  quot: '"',
};

const NAMED_ENTITIES_ENCODE_MAP: Record<string, string> = {
  "'": '&#39;',
  '"': '&quot;',
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
};

const NAMED_ENTITY_PATTERN = /&(amp|lt|gt|quot|apos);/gi;
const NUMERIC_DECIMAL_PATTERN = /&#(\d+);/g;
const NUMERIC_HEX_PATTERN = /&#x([0-9a-f]+);/gi;

export function encodeHtmlEntities(input: string): string {
  return input.replace(
    /[&<>"']/g,
    (char) => NAMED_ENTITIES_ENCODE_MAP[char] ?? char
  );
}

export function decodeHtmlEntities(input: string): string {
  // Prefer DOM-based decoding when available for full entity coverage,
  // fallback to regex map for SSR/test environments.
  if (
    typeof window !== 'undefined' &&
    typeof window.DOMParser !== 'undefined'
  ) {
    try {
      const doc = new window.DOMParser().parseFromString(input, 'text/html');
      // DOMParser will decode entities in textContent; use body textContent
      // For plain text, parsing as text/html wraps in body
      const decoded =
        doc.documentElement.textContent ?? doc.body?.textContent ?? input;
      // DOMParser already handles most entities; but ensure numeric entities covered
      // If DOMParser succeeded, return it. For unknown entities it leaves them as-is.
      // Detect if input contained entities that DOMParser might have left; still return.
      // We use regex fallback only if DOMParser throws.
      // Note: DOMParser decodes &amp; etc. correctly.
      // To avoid double-decoding issues with already-decoded text, just return decoded
      // if it differs or if input contained &
      if (decoded !== input || !input.includes('&')) {
        // Still need to handle that DOMParser decodes numeric entities too,
        // so we can short-circuit
        // However jsdom's DOMParser may not be available in test; we already have fallback below
        // Return decoded if input had entities, otherwise original
        return decoded;
      }
    } catch {
      // fall through to regex
    }
  }

  let result = input.replace(NAMED_ENTITY_PATTERN, (_match, name: string) => {
    const key = name.toLowerCase();
    return NAMED_ENTITIES[key] ?? _match;
  });

  result = result.replace(NUMERIC_DECIMAL_PATTERN, (_match, dec: string) => {
    const code = Number.parseInt(dec, 10);
    if (Number.isNaN(code)) {
      return _match;
    }
    try {
      return String.fromCodePoint(code);
    } catch {
      return _match;
    }
  });

  result = result.replace(NUMERIC_HEX_PATTERN, (_match, hex: string) => {
    const code = Number.parseInt(hex, 16);
    if (Number.isNaN(code)) {
      return _match;
    }
    try {
      return String.fromCodePoint(code);
    } catch {
      return _match;
    }
  });

  return result;
}
