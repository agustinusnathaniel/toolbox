export interface UrlQueryParam {
  name: string;
  value: string;
}

export interface InspectedUrl {
  hash: string;
  host: string;
  hostname: string;
  href: string;
  origin: string;
  password: string;
  pathname: string;
  pathSegments: Array<string>;
  port: string;
  protocol: string;
  queryParams: Array<UrlQueryParam>;
  search: string;
  username: string;
}

export interface UrlInspectResult {
  error?: string;
  inspected: InspectedUrl | null;
  isValid: boolean;
  usedSchemeFallback: boolean;
}

function toInspected(url: URL): InspectedUrl {
  return {
    hash: url.hash,
    host: url.host,
    hostname: url.hostname,
    href: url.href,
    origin: url.origin === 'null' ? '' : url.origin,
    password: url.password,
    pathname: url.pathname,
    pathSegments: url.pathname.split('/').filter((segment) => segment !== ''),
    port: url.port,
    protocol: url.protocol,
    queryParams: [...url.searchParams.entries()].map(([name, value]) => ({
      name,
      value,
    })),
    search: url.search,
    username: url.username,
  };
}

function tryParse(raw: string): URL | null {
  try {
    return new URL(raw);
  } catch {
    return null;
  }
}

/**
 * Splits a URL into its structural parts using the platform URL parser.
 * Bare hosts and paths without a scheme (`example.com?a=1`) are retried
 * with an `https://` prefix and flagged via `usedSchemeFallback` so the UI
 * can say what assumption it made. Returns `inspected: null` with an error
 * message when nothing parses.
 */
export function inspectUrl(input: string): UrlInspectResult {
  const raw = input.trim();
  const direct = tryParse(raw);
  if (direct) {
    return {
      inspected: toInspected(direct),
      isValid: true,
      usedSchemeFallback: false,
    };
  }
  if (!raw.includes('://')) {
    const fallback = tryParse(`https://${raw}`);
    if (fallback) {
      return {
        inspected: toInspected(fallback),
        isValid: true,
        usedSchemeFallback: true,
      };
    }
  }
  return {
    error: 'That does not parse as a URL',
    inspected: null,
    isValid: false,
    usedSchemeFallback: false,
  };
}
