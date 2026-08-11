export interface UaSearchParams {
  ua?: string;
}

export function buildUaParams(ua: string): URLSearchParams {
  const params = new URLSearchParams();
  if (ua.trim()) {
    params.set('ua', ua);
  }
  return params;
}

export function buildUaStateFromSearch(search: UaSearchParams): string {
  return search.ua ?? '';
}
