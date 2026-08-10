export interface ColorSearchParams {
  c?: string;
}

export function buildColorParams(input: string): URLSearchParams {
  const params = new URLSearchParams();
  if (input.trim()) {
    params.set('c', input);
  }
  return params;
}

export function buildColorStateFromSearch(search: ColorSearchParams): string {
  return search.c ?? '';
}
