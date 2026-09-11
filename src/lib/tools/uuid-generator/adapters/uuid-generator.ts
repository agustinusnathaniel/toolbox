import { v4, v7 } from 'uuid';

export type UuidVersion = 'v4' | 'v7';

export interface UuidOptions {
  count: number;
  hyphens: boolean;
  uppercase: boolean;
  version: UuidVersion;
}

export interface UuidResult {
  error?: string;
  isValid: boolean;
  uuids: Array<string>;
}

const UUID_MAX_COUNT = 1000;

export const UUID_VERSION_OPTIONS: ReadonlyArray<{
  id: UuidVersion;
  label: string;
}> = [
  { id: 'v4', label: 'UUID v4 (Random)' },
  { id: 'v7', label: 'UUID v7 (Time-ordered)' },
];

export const DEFAULT_UUID_OPTIONS: UuidOptions = {
  count: 1,
  hyphens: true,
  uppercase: false,
  version: 'v4',
};

export function generateUuidV4(): string {
  return v4();
}

function generateUuidV7(): string {
  return v7();
}

export function generateUuids(options: UuidOptions): UuidResult {
  const isValidCount =
    Number.isInteger(options.count) &&
    options.count >= 1 &&
    options.count <= UUID_MAX_COUNT;
  if (!isValidCount) {
    return {
      error: 'Count must be between 1 and 1000',
      isValid: false,
      uuids: [],
    };
  }
  const generate = options.version === 'v7' ? generateUuidV7 : generateUuidV4;
  const uuids = Array.from({ length: options.count }, () => {
    let uuid = generate();
    if (!options.hyphens) {
      uuid = uuid.replaceAll('-', '');
    }
    if (options.uppercase) {
      uuid = uuid.toUpperCase();
    }
    return uuid;
  });
  return { isValid: true, uuids };
}
