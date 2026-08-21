export type HashAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

export const HASH_ALGORITHMS: ReadonlyArray<HashAlgorithm> = [
  'SHA-1',
  'SHA-256',
  'SHA-384',
  'SHA-512',
];

export interface HashResult {
  error?: string;
  isValid: boolean;
  output: string;
}

export interface HashInput {
  algorithm: HashAlgorithm;
  text: string;
}

export function bytesToHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashText(input: HashInput): Promise<HashResult> {
  if (!input.text.trim()) {
    return { error: 'Enter some text to hash', isValid: false, output: '' };
  }
  const data = new TextEncoder().encode(input.text);
  const digest = await crypto.subtle.digest(input.algorithm, data);
  return { isValid: true, output: bytesToHex(digest) };
}

export async function hashBytes(
  bytes: Uint8Array<ArrayBuffer>,
  algorithm: HashAlgorithm
): Promise<HashResult> {
  const digest = await crypto.subtle.digest(algorithm, bytes);
  return { isValid: true, output: bytesToHex(digest) };
}

export function normalizeDigest(raw: string): string {
  return raw.toLowerCase().replace(/\s+/g, '');
}

export function compareDigests(computed: string, expectedRaw: string): boolean {
  return normalizeDigest(computed) === normalizeDigest(expectedRaw);
}
