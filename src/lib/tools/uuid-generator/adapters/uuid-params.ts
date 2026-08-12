import {
  DEFAULT_UUID_OPTIONS,
  UUID_VERSION_OPTIONS,
  type UuidOptions,
  type UuidVersion,
} from './uuid-generator';

export interface UuidSearchParams {
  count?: string;
  hyphens?: string;
  uppercase?: string;
  version?: string;
}

export function buildUuidParams(options: UuidOptions): URLSearchParams {
  const params = new URLSearchParams();
  if (options.count !== DEFAULT_UUID_OPTIONS.count) {
    params.set('count', String(options.count));
  }
  if (options.hyphens !== DEFAULT_UUID_OPTIONS.hyphens) {
    params.set('hyphens', options.hyphens ? '1' : '0');
  }
  if (options.uppercase !== DEFAULT_UUID_OPTIONS.uppercase) {
    params.set('uppercase', options.uppercase ? '1' : '0');
  }
  if (options.version !== DEFAULT_UUID_OPTIONS.version) {
    params.set('version', options.version);
  }
  return params;
}

export function buildUuidStateFromSearch(
  search: UuidSearchParams
): UuidOptions {
  const version = UUID_VERSION_OPTIONS.some((o) => o.id === search.version)
    ? (search.version as UuidVersion)
    : DEFAULT_UUID_OPTIONS.version;
  const count = Number(search.count);
  return {
    count:
      Number.isInteger(count) && count >= 1 && count <= 1000
        ? count
        : DEFAULT_UUID_OPTIONS.count,
    hyphens: search.hyphens === '0' ? false : DEFAULT_UUID_OPTIONS.hyphens,
    uppercase: search.uppercase === '1' ? true : DEFAULT_UUID_OPTIONS.uppercase,
    version,
  };
}
