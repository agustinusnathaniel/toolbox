import { runTransform, type TransformResult } from '@/lib/utils/transform';

function bytesToBinary(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return binary;
}

function binaryToBytes(binary: string): Uint8Array {
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

const BASE64_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/;

export function encodeBase64(input: string): TransformResult {
  // Encoding preserves the raw input (including whitespace); only fully
  // empty input is rejected.
  if (!input) {
    return { error: 'Input is empty', isValid: false, output: '' };
  }
  const bytes = new TextEncoder().encode(input);
  return { isValid: true, output: btoa(bytesToBinary(bytes)) };
}

export function decodeBase64(input: string): TransformResult {
  return runTransform(input, (trimmed) => {
    if (trimmed.length % 4 !== 0) {
      throw new Error('Invalid base64: length must be a multiple of 4');
    }
    if (!BASE64_PATTERN.test(trimmed)) {
      throw new Error('Invalid base64: contains invalid characters');
    }
    return new TextDecoder('utf-8', { fatal: true }).decode(
      binaryToBytes(atob(trimmed))
    );
  });
}
