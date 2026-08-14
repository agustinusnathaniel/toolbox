export interface CaseSearchParams {
  input?: string;
}

export function buildCaseParams(input: string): URLSearchParams {
  const params = new URLSearchParams();
  if (input.trim()) {
    params.set('input', input);
  }
  return params;
}

export function buildCaseStateFromSearch(search: CaseSearchParams): {
  input: string;
} {
  return { input: search.input ?? '' };
}
