export type HtmlEntitiesMode = 'decode' | 'encode';

const NAMED_ENTITIES_ENCODE_MAP: Record<string, string> = {
  "'": '&#39;',
  '"': '&quot;',
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
};

export function encodeHtmlEntities(input: string): string {
  return input.replace(
    /[&<>"']/g,
    (char) => NAMED_ENTITIES_ENCODE_MAP[char] ?? char
  );
}

export function decodeHtmlEntities(input: string): string {
  // DOM-based decoding gives full named/numeric entity coverage. This adapter
  // is browser-only (SPA mode, no SSR) — Node environments fail loudly rather
  // than silently mis-decoding.
  const doc = new DOMParser().parseFromString(input, 'text/html');
  return doc.documentElement.textContent ?? input;
}
