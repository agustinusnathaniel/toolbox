export interface TextStatsSearchParams {
  input?: string;
}

export function buildTextStatsParams(input: string): URLSearchParams {
  const params = new URLSearchParams();
  if (input.trim()) {
    params.set('input', input);
  }
  return params;
}

export function buildTextStatsStateFromSearch(search: TextStatsSearchParams): {
  input: string;
} {
  return { input: search.input ?? '' };
}
