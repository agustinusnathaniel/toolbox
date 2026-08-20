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

function uuidBytesToHex(bytes: Uint8Array): string {
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'));
  return [
    hex.slice(0, 4).join(''),
    hex.slice(4, 6).join(''),
    hex.slice(6, 8).join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10, 16).join(''),
  ].join('-');
}

export function generateUuidV4(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  // biome-ignore lint/suspicious/noBitwiseOperators: RFC 9562 UUID version and variant bits require bitwise ops
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  // biome-ignore lint/suspicious/noBitwiseOperators: RFC 9562 UUID version and variant bits require bitwise ops
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return uuidBytesToHex(bytes);
}

export function generateUuidV7(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const ms = BigInt(Date.now());
  // biome-ignore lint/suspicious/noBitwiseOperators: RFC 9562 v7 timestamp packing requires bitwise ops
  bytes[0] = Number((ms >> 40n) & 0xffn);
  // biome-ignore lint/suspicious/noBitwiseOperators: RFC 9562 v7 timestamp packing requires bitwise ops
  bytes[1] = Number((ms >> 32n) & 0xffn);
  // biome-ignore lint/suspicious/noBitwiseOperators: RFC 9562 v7 timestamp packing requires bitwise ops
  bytes[2] = Number((ms >> 24n) & 0xffn);
  // biome-ignore lint/suspicious/noBitwiseOperators: RFC 9562 v7 timestamp packing requires bitwise ops
  bytes[3] = Number((ms >> 16n) & 0xffn);
  // biome-ignore lint/suspicious/noBitwiseOperators: RFC 9562 v7 timestamp packing requires bitwise ops
  bytes[4] = Number((ms >> 8n) & 0xffn);
  // biome-ignore lint/suspicious/noBitwiseOperators: RFC 9562 v7 timestamp packing requires bitwise ops
  bytes[5] = Number(ms & 0xffn);
  // biome-ignore lint/suspicious/noBitwiseOperators: RFC 9562 UUID version and variant bits require bitwise ops
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  // biome-ignore lint/suspicious/noBitwiseOperators: RFC 9562 UUID version and variant bits require bitwise ops
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return uuidBytesToHex(bytes);
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
