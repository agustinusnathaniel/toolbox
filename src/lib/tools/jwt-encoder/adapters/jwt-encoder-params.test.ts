import { describe, expect, test } from 'vite-plus/test';

import type { JwtEncoderSearchParams } from './jwt-encoder-params';
import {
  buildJwtEncoderParams,
  buildJwtEncoderStateFromSearch,
} from './jwt-encoder-params';

describe('buildJwtEncoderParams', () => {
  test('carries header, payload, and non-default alg under their keys', () => {
    const params = buildJwtEncoderParams({
      alg: 'HS384',
      header: '{"typ":"JWT"}',
      payload: '{"sub":"1"}',
    });
    expect(params.get('alg')).toBe('HS384');
    expect(params.get('header')).toBe('{"typ":"JWT"}');
    expect(params.get('payload')).toBe('{"sub":"1"}');
  });

  test('drops the default alg and blank panes so the link stays short', () => {
    expect(
      buildJwtEncoderParams({
        alg: 'HS256',
        header: '  ',
        payload: ' ',
      }).toString()
    ).toBe('');
    expect(
      buildJwtEncoderParams({
        alg: 'HS256',
        header: '{"typ":"JWT"}',
        payload: '  ',
      }).toString()
    ).toBe('header=%7B%22typ%22%3A%22JWT%22%7D');
  });

  test('never carries a secret', () => {
    expect(
      buildJwtEncoderParams({
        alg: 'HS256',
        header: '{"typ":"JWT"}',
        payload: '{"sub":"1"}',
      }).has('secret')
    ).toBe(false);
  });
});

describe('buildJwtEncoderStateFromSearch', () => {
  test('restores all fields verbatim', () => {
    expect(
      buildJwtEncoderStateFromSearch({
        alg: 'HS512',
        header: '{"typ":"JWT"}',
        payload: '{"sub":"1"}',
      })
    ).toEqual({
      alg: 'HS512',
      header: '{"typ":"JWT"}',
      payload: '{"sub":"1"}',
    });
  });

  test('defaults missing fields', () => {
    expect(buildJwtEncoderStateFromSearch({})).toEqual({
      alg: 'HS256',
      header: '',
      payload: '',
    });
  });

  test('falls back for coerced or unknown values', () => {
    expect(
      buildJwtEncoderStateFromSearch({
        alg: 'RS256',
        header: 123,
        payload: 456,
      } as unknown as JwtEncoderSearchParams)
    ).toEqual({ alg: 'HS256', header: '', payload: '' });
  });

  test('keeps numeric-looking strings intact', () => {
    expect(
      buildJwtEncoderStateFromSearch({ header: '123', payload: '456' })
    ).toEqual({ alg: 'HS256', header: '123', payload: '456' });
  });
});
