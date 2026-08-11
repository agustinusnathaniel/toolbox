export interface Base64SearchParams {
  input?: string;
}

export function buildBase64Params(input: string): URLSearchParams {
  const params = new URLSearchParams();
  if (input.trim()) {
    params.set('input', input);
  }
  return params;
}

export function buildBase64StateFromSearch(search: Base64SearchParams): string {
  return search.input ?? '';
}
