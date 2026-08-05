import { describe, expect, test } from 'vite-plus/test';

import { bytesToBase64Url, decodeJwt, verifyJwtSignature } from './jwt-decoder';

const HEADER = { alg: 'HS256', typ: 'JWT' };
const PAYLOAD = {
  exp: 2_000_000_000,
  iss: 'toolbox',
  name: 'Nathan',
  sub: '1234567890',
};

function makeToken(secret = 'secret'): Promise<string> {
  return (async () => {
    const enc = new TextEncoder();
    const headerB64 = bytesToBase64Url(
      new Uint8Array(enc.encode(JSON.stringify(HEADER)))
    );
    const payloadB64 = bytesToBase64Url(
      new Uint8Array(enc.encode(JSON.stringify(PAYLOAD)))
    );
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { hash: 'SHA-256', name: 'HMAC' },
      false,
      ['sign']
    );
    const sig = await crypto.subtle.sign(
      'HMAC',
      key,
      enc.encode(`${headerB64}.${payloadB64}`)
    );
    return `${headerB64}.${payloadB64}.${bytesToBase64Url(new Uint8Array(sig))}`;
  })();
}

describe('decodeJwt', () => {
  test('decodes a valid JWT into header, payload, and claims', async () => {
    const token = await makeToken();
    const result = decodeJwt(token);
    expect(result.isValid).toBe(true);
    expect(result.header).toEqual(HEADER);
    expect(result.payload).toEqual(PAYLOAD);
    expect(result.alg).toBe('HS256');
    expect(result.claims).toEqual(
      expect.arrayContaining([
        { key: 'iss', value: 'toolbox' },
        { key: 'sub', value: '1234567890' },
        { key: 'exp', value: '2000000000' },
      ])
    );
  });

  test('rejects a token without 3 parts', () => {
    const result = decodeJwt('not-a-jwt');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('3 dot-separated parts');
  });

  test('rejects malformed base64url payload', () => {
    const result = decodeJwt('eyJhbGciOiJIUzI1NiJ9.not-valid-base64!.sig');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  test('rejects non-JSON payload', () => {
    const result = decodeJwt('eyJhbGciOiJIUzI1NiJ9.aGVsbG8.sig');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  test('rejects null JSON payload with a clean error', () => {
    const result = decodeJwt('eyJhbGciOiJIUzI1NiJ9.bnVsbA.sig');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('JSON objects');
  });
});

describe('verifyJwtSignature', () => {
  test('accepts a token signed with the correct secret', async () => {
    const token = await makeToken('hunter2');
    const result = await verifyJwtSignature(token, 'hunter2');
    expect(result.isValid).toBe(true);
    expect(result.message).toContain('valid');
  });

  test('rejects a token signed with a different secret', async () => {
    const token = await makeToken('hunter2');
    const result = await verifyJwtSignature(token, 'wrong-secret');
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('verification failed');
  });

  test('rejects non-HMAC algorithms', async () => {
    const token = await makeToken();
    const tampered = token.replace(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9'
    );
    const result = await verifyJwtSignature(tampered, 'secret');
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('Unsupported algorithm');
  });

  test('requires a secret', async () => {
    const token = await makeToken();
    const result = await verifyJwtSignature(token, '');
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('Enter a secret');
  });

  test('rejects a malformed token', async () => {
    const result = await verifyJwtSignature('abc.def', 'secret');
    expect(result.isValid).toBe(false);
  });
});
