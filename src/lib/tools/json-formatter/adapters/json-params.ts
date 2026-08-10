export interface JsonSearchParams {
  input?: string;
}

export function buildJsonParams(input: string): URLSearchParams {
  const params = new URLSearchParams();
  if (input.trim()) {
    params.set('input', input);
  }
  return params;
}

export function buildJsonStateFromSearch(search: JsonSearchParams): string {
  return search.input ?? '';
}
