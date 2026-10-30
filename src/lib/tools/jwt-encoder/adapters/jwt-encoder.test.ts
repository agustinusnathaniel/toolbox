import { compactVerify, decodeProtectedHeader } from 'jose';
import { describe, expect, test } from 'vite-plus/test';

import {
  encodeJwt,
  JWT_ENCODER_DEFAULT_HEADER,
  JWT_ENCODER_DEFAULT_PAYLOAD,
} from './jwt-encoder';

const SECRET = 'your-256-bit-secret';

const HMAC_HASHES = {
  HS256: 'SHA-256',
  HS384: 'SHA-384',
  HS512: 'SHA-512',
} as const;

async function verifyWith(
  token: string,
  secret: string,
  alg: keyof typeof HMAC_HASHES
): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { hash: HMAC_HASHES[alg], name: 'HMAC' },
    false,
    ['verify']
  );
  await compactVerify(token, key);
  return true;
}

describe('encodeJwt signing', () => {
  test('signs HS256 and verifies with the same secret', async () => {
    const result = await encodeJwt({
      alg: 'HS256',
      header: JWT_ENCODER_DEFAULT_HEADER,
      payload: JWT_ENCODER_DEFAULT_PAYLOAD,
      secret: SECRET,
    });
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.token?.split('.')).toHaveLength(3);
    expect(decodeProtectedHeader(result.token ?? '').alg).toBe('HS256');
    await expect(verifyWith(result.token ?? '', SECRET, 'HS256')).resolves.toBe(
      true
    );
  });

  test('signs HS384 and HS512 with their own hash', async () => {
    for (const alg of ['HS384', 'HS512'] as const) {
      const result = await encodeJwt({
        alg,
        header: JWT_ENCODER_DEFAULT_HEADER,
        payload: JWT_ENCODER_DEFAULT_PAYLOAD,
        secret: SECRET,
      });
      expect(result.isValid).toBe(true);
      expect(decodeProtectedHeader(result.token ?? '').alg).toBe(alg);
      await expect(verifyWith(result.token ?? '', SECRET, alg)).resolves.toBe(
        true
      );
    }
  });

  test('selected algorithm wins over header text', async () => {
    const result = await encodeJwt({
      alg: 'HS256',
      header: '{"alg":"HS512","typ":"JWT"}',
      payload: JWT_ENCODER_DEFAULT_PAYLOAD,
      secret: SECRET,
    });
    expect(result.isValid).toBe(true);
    expect(decodeProtectedHeader(result.token ?? '').alg).toBe('HS256');
    await expect(verifyWith(result.token ?? '', SECRET, 'HS256')).resolves.toBe(
      true
    );
  });
});

describe('encodeJwt header problems', () => {
  test('rejects malformed header JSON', async () => {
    const result = await encodeJwt({
      alg: 'HS256',
      header: '{"alg":',
      payload: JWT_ENCODER_DEFAULT_PAYLOAD,
      secret: SECRET,
    });
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Header is not valid JSON.');
  });

  test('rejects a non-object header', async () => {
    const result = await encodeJwt({
      alg: 'HS256',
      header: '["alg","HS256"]',
      payload: JWT_ENCODER_DEFAULT_PAYLOAD,
      secret: SECRET,
    });
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Header must be a JSON object.');
  });
});

describe('encodeJwt payload problems', () => {
  test('rejects malformed payload JSON', async () => {
    const result = await encodeJwt({
      alg: 'HS256',
      header: JWT_ENCODER_DEFAULT_HEADER,
      payload: '{"sub":',
      secret: SECRET,
    });
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Payload is not valid JSON.');
  });

  test('rejects a non-object payload', async () => {
    const result = await encodeJwt({
      alg: 'HS256',
      header: JWT_ENCODER_DEFAULT_HEADER,
      payload: '"just-a-string"',
      secret: SECRET,
    });
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Payload must be a JSON object.');
  });
});

describe('encodeJwt secret problems', () => {
  test('rejects an empty secret', async () => {
    const result = await encodeJwt({
      alg: 'HS256',
      header: JWT_ENCODER_DEFAULT_HEADER,
      payload: JWT_ENCODER_DEFAULT_PAYLOAD,
      secret: '',
    });
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Enter a secret to sign the token.');
  });
});
