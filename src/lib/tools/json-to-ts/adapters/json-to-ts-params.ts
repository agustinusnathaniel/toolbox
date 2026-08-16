export interface JsonToTsSearchParams {
  input?: string;
}

export function buildJsonToTsParams(input: string): URLSearchParams {
  const params = new URLSearchParams();
  if (input.trim()) {
    params.set('input', input);
  }
  return params;
}

export function buildJsonToTsStateFromSearch(
  search: JsonToTsSearchParams
): string {
  return search.input ?? '';
}
