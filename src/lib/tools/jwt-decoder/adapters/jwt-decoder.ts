interface DecodedClaim {
  key: string;
  value: string;
}

export interface JwtDecodeResult {
  alg: string;
  claims: Array<DecodedClaim>;
  error?: string;
  header: Record<string, unknown>;
  headerRaw: string;
  isValid: boolean;
  payload: Record<string, unknown>;
  payloadRaw: string;
}

export interface JwtVerifyResult {
  error?: string;
  isValid: boolean;
  message: string;
}

const BASE64URL_DASH = /-/g;
const BASE64URL_UNDERSCORE = /_/g;
const BASE64_PLUS = /\+/g;
const BASE64_SLASH = /\//g;
const BASE64_PADDING = /[=]+$/;
const HMAC_ALGORITHM = /^HS(256|384|512)$/;

function base64UrlToBytes(input: string): Uint8Array<ArrayBuffer> {
  const base64 = input
    .replace(BASE64URL_DASH, '+')
    .replace(BASE64URL_UNDERSCORE, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(BASE64_PLUS, '-')
    .replace(BASE64_SLASH, '_')
    .replace(BASE64_PADDING, '');
}

export function decodeJwt(token: string): JwtDecodeResult {
  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    return {
      alg: '',
      claims: [],
      error:
        'Invalid JWT: expected 3 dot-separated parts (header.payload.signature).',
      header: {},
      headerRaw: '',
      isValid: false,
      payload: {},
      payloadRaw: '',
    };
  }
  const [headerRaw, payloadRaw] = parts;
  try {
    const headerBytes = base64UrlToBytes(headerRaw);
    const payloadBytes = base64UrlToBytes(payloadRaw);
    const headerText = new TextDecoder().decode(headerBytes);
    const payloadText = new TextDecoder().decode(payloadBytes);
    const header = JSON.parse(headerText) as Record<string, unknown>;
    const payload = JSON.parse(payloadText) as Record<string, unknown>;
    if (
      typeof header !== 'object' ||
      header === null ||
      typeof payload !== 'object' ||
      payload === null
    ) {
      throw new Error('header and payload must be JSON objects');
    }
    const claims: Array<DecodedClaim> = Object.entries(payload).map(
      ([key, value]) => ({
        key,
        value:
          typeof value === 'object' && value !== null
            ? JSON.stringify(value)
            : String(value),
      })
    );
    return {
      alg: typeof header.alg === 'string' ? header.alg : '',
      claims,
      header,
      headerRaw: headerText,
      isValid: true,
      payload,
      payloadRaw: payloadText,
    };
  } catch (err) {
    return {
      alg: '',
      claims: [],
      error:
        err instanceof Error
          ? `Invalid JWT: ${err.message}`
          : 'Invalid JWT: could not decode.',
      header: {},
      headerRaw: '',
      isValid: false,
      payload: {},
      payloadRaw: '',
    };
  }
}

export async function verifyJwtSignature(
  token: string,
  secret: string
): Promise<JwtVerifyResult> {
  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    return { isValid: false, message: 'Invalid JWT: expected 3 parts.' };
  }
  if (!secret) {
    return {
      isValid: false,
      message: 'Enter a secret to verify the signature.',
    };
  }
  const [headerRaw, payloadRaw, signatureRaw] = parts;
  let alg = '';
  try {
    const header = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(headerRaw))
    ) as { alg?: unknown };
    alg = typeof header.alg === 'string' ? header.alg : '';
  } catch {
    return { isValid: false, message: 'Invalid JWT: bad header.' };
  }
  if (!HMAC_ALGORITHM.test(alg)) {
    return {
      isValid: false,
      message: `Unsupported algorithm "${alg || 'unknown'}": only HS256/HS384/HS512 (HMAC) can be verified with a shared secret.`,
    };
  }
  try {
    const hashName = `SHA-${alg.slice(2)}` as 'SHA-256' | 'SHA-384' | 'SHA-512';
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { hash: hashName, name: 'HMAC' },
      false,
      ['verify']
    );
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      base64UrlToBytes(signatureRaw),
      new TextEncoder().encode(`${headerRaw}.${payloadRaw}`)
    );
    return valid
      ? { isValid: true, message: `Signature is valid for ${alg}.` }
      : {
          isValid: false,
          message:
            'Signature verification failed: the token does not match this secret.',
        };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Unknown verification error.',
      isValid: false,
      message: `Verification error: ${err instanceof Error ? err.message : 'unknown'}`,
    };
  }
}
