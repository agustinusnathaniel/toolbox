import { SignJWT } from 'jose';

export type JwtEncoderAlg = 'HS256' | 'HS384' | 'HS512';

export const JWT_ENCODER_ALGS: ReadonlyArray<JwtEncoderAlg> = [
  'HS256',
  'HS384',
  'HS512',
];

export const JWT_ENCODER_ALG_SET: ReadonlySet<JwtEncoderAlg> = new Set(
  JWT_ENCODER_ALGS
);

export interface JwtEncodeInput {
  alg: JwtEncoderAlg;
  header: string;
  payload: string;
  secret: string;
}

export interface JwtEncodeResult {
  error?: string;
  isValid: boolean;
  token?: string;
}

export interface JwtEncoderExample {
  alg: JwtEncoderAlg;
  header: string;
  label: string;
  payload: string;
  secret: string;
}

export const JWT_ENCODER_DEFAULT_HEADER = `{
  "alg": "HS256",
  "typ": "JWT"
}`;

export const JWT_ENCODER_DEFAULT_PAYLOAD = `{
  "sub": "1234567890",
  "name": "Ada Lovelace",
  "iat": 1516239022
}`;

export const JWT_ENCODER_EXAMPLES: ReadonlyArray<JwtEncoderExample> = [
  {
    alg: 'HS256',
    header: JWT_ENCODER_DEFAULT_HEADER,
    label: 'Sample claims',
    payload: JWT_ENCODER_DEFAULT_PAYLOAD,
    secret: 'your-256-bit-secret',
  },
];

function parseJsonObject(
  raw: string,
  label: string
): { error: string } | { value: Record<string, unknown> } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return { error: `${label} is not valid JSON.` };
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { error: `${label} must be a JSON object.` };
  }
  return { value: parsed as Record<string, unknown> };
}

function invalidEncode(error: string): JwtEncodeResult {
  return { error, isValid: false };
}

export async function encodeJwt(
  input: JwtEncodeInput
): Promise<JwtEncodeResult> {
  if (!input.secret) {
    return invalidEncode('Enter a secret to sign the token.');
  }
  const header = parseJsonObject(input.header, 'Header');
  if ('error' in header) {
    return invalidEncode(header.error);
  }
  const payload = parseJsonObject(input.payload, 'Payload');
  if ('error' in payload) {
    return invalidEncode(payload.error);
  }
  try {
    // Copy into the active realm: jose checks the key with
    // `instanceof Uint8Array`, which fails for cross-realm buffers
    // (jsdom/happy-dom test envs, some workers).
    const key = Uint8Array.from(new TextEncoder().encode(input.secret));
    // The selected algorithm always wins over any `alg` written in the
    // header text, so the signed algorithm can never disagree with the UI.
    const token = await new SignJWT(payload.value)
      .setProtectedHeader({ ...header.value, alg: input.alg })
      .sign(key);
    return { isValid: true, token };
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    return invalidEncode(
      `Could not sign the token${message ? `: ${message}` : '.'}`
    );
  }
}
