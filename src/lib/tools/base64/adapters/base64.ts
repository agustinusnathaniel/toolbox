export interface Base64Result {
  error?: string;
  isValid: boolean;
  output: string;
}

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

export function encodeBase64(input: string): Base64Result {
  if (!input) {
    return { error: 'Input is empty', isValid: false, output: '' };
  }
  const bytes = new TextEncoder().encode(input);
  return { isValid: true, output: btoa(bytesToBinary(bytes)) };
}

export function decodeBase64(input: string): Base64Result {
  const trimmed = input.trim();
  if (!trimmed) {
    return { error: 'Input is empty', isValid: false, output: '' };
  }
  if (trimmed.length % 4 !== 0) {
    return {
      error: 'Invalid base64: length must be a multiple of 4',
      isValid: false,
      output: '',
    };
  }
  if (!BASE64_PATTERN.test(trimmed)) {
    return {
      error: 'Invalid base64: contains invalid characters',
      isValid: false,
      output: '',
    };
  }
  try {
    const bytes = binaryToBytes(atob(trimmed));
    const output = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return { isValid: true, output };
  } catch (e) {
    return { error: (e as Error).message, isValid: false, output: '' };
  }
}
