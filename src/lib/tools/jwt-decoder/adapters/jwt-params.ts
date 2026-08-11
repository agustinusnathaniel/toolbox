export interface JwtSearchParams {
  token?: string;
}

export function buildJwtParams(token: string): URLSearchParams {
  const params = new URLSearchParams();
  if (token.trim()) {
    params.set('token', token);
  }
  return params;
}

export function buildJwtStateFromSearch(search: JwtSearchParams): string {
  return search.token ?? '';
}
