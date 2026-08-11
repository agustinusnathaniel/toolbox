export interface TimestampSearchParams {
  ts?: string;
}

export function buildTimestampParams(input: string): URLSearchParams {
  const params = new URLSearchParams();
  if (input.trim()) {
    params.set('ts', input);
  }
  return params;
}

export function buildTimestampStateFromSearch(
  search: TimestampSearchParams
): string {
  return search.ts ?? '';
}
