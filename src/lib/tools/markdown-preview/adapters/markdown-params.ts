export interface MarkdownSearchParams {
  input?: string;
}

export function buildMarkdownParams(input: string): URLSearchParams {
  const params = new URLSearchParams();
  if (input.trim()) {
    params.set('input', input);
  }
  return params;
}

export function buildMarkdownStateFromSearch(search: MarkdownSearchParams): {
  input: string;
} {
  return { input: search.input ?? '' };
}
