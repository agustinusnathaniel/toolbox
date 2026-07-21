import { describe, expect, test } from 'vite-plus/test';

import {
  buildUrlParams,
  buildUrlStateFromSearch,
  buildVCardParams,
  buildVcardStateFromSearch,
  DEFAULT_URL_STATE,
  DEFAULT_VCARD_STATE,
  formatHex,
} from './qrcode-params';

describe('formatHex', () => {
  test('returns undefined for undefined input', () => {
    expect(formatHex(undefined)).toBeUndefined();
  });

  test('returns color as-is when it starts with #', () => {
    expect(formatHex('#ff0000')).toBe('#ff0000');
  });

  test('prepends # when color starts with %23', () => {
    expect(formatHex('%23ff0000')).toBe('#ff0000');
  });

  test('prepends # when color has no prefix', () => {
    expect(formatHex('ff0000')).toBe('#ff0000');
  });
});

describe('buildUrlParams', () => {
  test('includes value', () => {
    const params = buildUrlParams({
      ...DEFAULT_URL_STATE,
      value: 'https://example.com',
    });
    expect(params.get('value')).toBe('https://example.com');
  });

  test('omits default fgColor', () => {
    const params = buildUrlParams(DEFAULT_URL_STATE);
    expect(params.has('fg')).toBe(false);
  });

  test('includes non-default fgColor', () => {
    const params = buildUrlParams({
      ...DEFAULT_URL_STATE,
      fgColor: '#ff0000',
    });
    expect(params.get('fg')).toBe('#ff0000');
  });

  test('omits default bgColor', () => {
    const params = buildUrlParams(DEFAULT_URL_STATE);
    expect(params.has('bg')).toBe(false);
  });

  test('includes non-default bgColor', () => {
    const params = buildUrlParams({
      ...DEFAULT_URL_STATE,
      bgColor: '#cccccc',
    });
    expect(params.get('bg')).toBe('#cccccc');
  });

  test('omits empty value', () => {
    const params = buildUrlParams({ ...DEFAULT_URL_STATE, value: '' });
    expect(params.has('value')).toBe(false);
  });
});

describe('buildVCardParams', () => {
  test('includes all provided fields', () => {
    const params = buildVCardParams({
      ...DEFAULT_VCARD_STATE,
      emailAddress: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
    });
    expect(params.get('fn')).toBe('John');
    expect(params.get('ln')).toBe('Doe');
    expect(params.get('em')).toBe('john@example.com');
  });

  test('omits empty fields', () => {
    const params = buildVCardParams(DEFAULT_VCARD_STATE);
    expect(params.has('fn')).toBe(false);
    expect(params.has('ln')).toBe(false);
    expect(params.has('mp')).toBe(false);
  });

  test('omits default colors', () => {
    const params = buildVCardParams({
      ...DEFAULT_VCARD_STATE,
      firstName: 'John',
    });
    expect(params.has('fg')).toBe(false);
    expect(params.has('bg')).toBe(false);
  });

  test('includes non-default colors', () => {
    const params = buildVCardParams({
      ...DEFAULT_VCARD_STATE,
      bgColor: '#cccccc',
      fgColor: '#ff0000',
      firstName: 'John',
    });
    expect(params.get('fg')).toBe('#ff0000');
    expect(params.get('bg')).toBe('#cccccc');
  });

  test('maps all VCard fields to correct param keys', () => {
    const params = buildVCardParams({
      ...DEFAULT_VCARD_STATE,
      city: 'Springfield',
      companyName: 'Acme',
      country: 'US',
      jobTitle: 'Engineer',
      mobilePhoneNumber: '123',
      otherPhoneNumber: '456',
      postalCode: '62701',
      state: 'IL',
      streetAddress: '123 Main',
      websiteURL: 'https://example.com',
    });
    expect(params.get('mp')).toBe('123');
    expect(params.get('op')).toBe('456');
    expect(params.get('co')).toBe('Acme');
    expect(params.get('jt')).toBe('Engineer');
    expect(params.get('st')).toBe('123 Main');
    expect(params.get('ct')).toBe('Springfield');
    expect(params.get('sa')).toBe('IL');
    expect(params.get('pc')).toBe('62701');
    expect(params.get('cn')).toBe('US');
    expect(params.get('wb')).toBe('https://example.com');
  });
});

describe('buildUrlStateFromSearch', () => {
  test('returns defaults for empty search', () => {
    const state = buildUrlStateFromSearch({});
    expect(state).toEqual(DEFAULT_URL_STATE);
  });

  test('overrides value from search', () => {
    const state = buildUrlStateFromSearch({ value: 'https://test.com' });
    expect(state.value).toBe('https://test.com');
  });

  test('formats hex colors from search', () => {
    const state = buildUrlStateFromSearch({ bg: 'cccccc', fg: 'ff0000' });
    expect(state.fgColor).toBe('#ff0000');
    expect(state.bgColor).toBe('#cccccc');
  });

  test('handles %23 prefixed colors', () => {
    const state = buildUrlStateFromSearch({ fg: '%23ff0000' });
    expect(state.fgColor).toBe('#ff0000');
  });
});

describe('buildVcardStateFromSearch', () => {
  test('returns defaults for empty search', () => {
    const state = buildVcardStateFromSearch({});
    expect(state).toEqual(DEFAULT_VCARD_STATE);
  });

  test('overrides fields from search', () => {
    const state = buildVcardStateFromSearch({
      em: 'john@example.com',
      fn: 'John',
      ln: 'Doe',
    });
    expect(state.firstName).toBe('John');
    expect(state.lastName).toBe('Doe');
    expect(state.emailAddress).toBe('john@example.com');
  });

  test('formats hex colors from search', () => {
    const state = buildVcardStateFromSearch({ bg: 'cccccc', fg: 'ff0000' });
    expect(state.fgColor).toBe('#ff0000');
    expect(state.bgColor).toBe('#cccccc');
  });

  test('maps all VCard param keys to correct fields', () => {
    const state = buildVcardStateFromSearch({
      cn: 'US',
      co: 'Acme',
      ct: 'Springfield',
      jt: 'Engineer',
      mp: '123',
      op: '456',
      pc: '62701',
      sa: 'IL',
      st: '123 Main',
      wb: 'https://example.com',
    });
    expect(state.mobilePhoneNumber).toBe('123');
    expect(state.otherPhoneNumber).toBe('456');
    expect(state.companyName).toBe('Acme');
    expect(state.jobTitle).toBe('Engineer');
    expect(state.streetAddress).toBe('123 Main');
    expect(state.city).toBe('Springfield');
    expect(state.state).toBe('IL');
    expect(state.postalCode).toBe('62701');
    expect(state.country).toBe('US');
    expect(state.websiteURL).toBe('https://example.com');
  });
});
