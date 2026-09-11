import {
  base64url,
  compactVerify,
  decodeJwt as decodeJoseJwt,
  decodeProtectedHeader,
  errors,
} from 'jose';

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

const HMAC_ALGORITHM = /^HS(256|384|512)$/;

function decodeSegment(segment: string): string {
  return new TextDecoder().decode(base64url.decode(segment));
}

function invalidDecode(error: string): JwtDecodeResult {
  return {
    alg: '',
    claims: [],
    error,
    header: {},
    headerRaw: '',
    isValid: false,
    payload: {},
    payloadRaw: '',
  };
}

export function decodeJwt(token: string): JwtDecodeResult {
  const trimmed = token.trim();
  if (trimmed.split('.').length !== 3) {
    return invalidDecode(
      'Invalid JWT: expected 3 dot-separated parts (header.payload.signature).'
    );
  }
  const [headerSegment, payloadSegment] = trimmed.split('.');
  try {
    const header = decodeProtectedHeader(trimmed);
    const payload = decodeJoseJwt(trimmed);
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
      header: { ...header },
      headerRaw: decodeSegment(headerSegment),
      isValid: true,
      payload,
      payloadRaw: decodeSegment(payloadSegment),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    return invalidDecode(
      message === 'Invalid JWT Claims Set'
        ? 'Invalid JWT: header and payload must be JSON objects'
        : `Invalid JWT: ${message || 'could not decode.'}`
    );
  }
}

export async function verifyJwtSignature(
  token: string,
  secret: string
): Promise<JwtVerifyResult> {
  const trimmed = token.trim();
  if (trimmed.split('.').length !== 3) {
    return { isValid: false, message: 'Invalid JWT: expected 3 parts.' };
  }
  if (!secret) {
    return {
      isValid: false,
      message: 'Enter a secret to verify the signature.',
    };
  }
  let alg = '';
  try {
    const header = decodeProtectedHeader(trimmed);
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
    // Copy into the active realm: jose checks the key with `instanceof Uint8Array`.
    // compactVerify checks the signature only; it does not validate JWT claims
    // such as `exp` or `nbf`, which are the caller's concern.
    const { protectedHeader } = await compactVerify(
      trimmed,
      Uint8Array.from(new TextEncoder().encode(secret)),
      {
        algorithms: ['HS256', 'HS384', 'HS512'],
      }
    );
    return {
      isValid: true,
      message: `Signature is valid for ${protectedHeader.alg ?? alg}.`,
    };
  } catch (err) {
    if (err instanceof errors.JWSSignatureVerificationFailed) {
      return {
        isValid: false,
        message:
          'Signature verification failed: the token does not match this secret.',
      };
    }
    return {
      error: err instanceof Error ? err.message : 'Unknown verification error.',
      isValid: false,
      message: `Verification error: ${err instanceof Error ? err.message : 'unknown'}`,
    };
  }
}
