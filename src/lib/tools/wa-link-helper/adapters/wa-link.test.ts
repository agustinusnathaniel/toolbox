import { describe, expect, test } from 'vite-plus/test';

import {
  buildWALinkSearchParams,
  buildWhatsAppLink,
  getPhoneCountryCode,
} from './wa-link';

describe('country helpers', () => {
  test('getPhoneCountryCode returns correct code for valid country', () => {
    expect(getPhoneCountryCode('US')).toBe('1');
    expect(getPhoneCountryCode('ID')).toBe('62');
    expect(getPhoneCountryCode('GB')).toBe('44');
  });

  test('getPhoneCountryCode returns undefined for invalid country', () => {
    expect(getPhoneCountryCode('XX')).toBeUndefined();
    expect(getPhoneCountryCode('')).toBeUndefined();
  });
});

describe('buildWhatsAppLink', () => {
  test('generates correct link with phone number only', () => {
    const result = buildWhatsAppLink({
      countryCode: 'US',
      phoneNumber: '2125551234',
    });
    expect(result.isValid).toBe(true);
    expect(result.link).toContain('https://wa.me/');
    expect(result.link).toContain('2125551234');
  });

  test('generates correct link with phone number and URL-encoded text', () => {
    const result = buildWhatsAppLink({
      countryCode: 'ID',
      phoneNumber: '81234567890',
      text: 'Hello from WA Link!',
    });
    expect(result.isValid).toBe(true);
    expect(result.link).toContain('https://wa.me/');
    expect(result.link).toContain('text=Hello%20from%20WA%20Link!');
  });

  test('returns invalid for empty phone number', () => {
    const result = buildWhatsAppLink({
      countryCode: 'US',
      phoneNumber: '',
    });
    expect(result.isValid).toBe(false);
    expect(result.link).toBe('');
  });

  test('normalizes the phone number to E.164 without the region prefix', () => {
    const result = buildWhatsAppLink({
      countryCode: 'IT',
      phoneNumber: '3123456789',
    });
    expect(result.isValid).toBe(true);
    expect(result.link).toContain('393123456789');
  });
});

describe('buildWALinkSearchParams', () => {
  test('returns object with all fields', () => {
    const result = buildWALinkSearchParams({
      countryCode: 'US',
      phoneNumber: '2125551234',
      text: 'Hello',
    });
    expect(result).toEqual({ cc: 'US', phone: '2125551234', text: 'Hello' });
  });

  test('omits empty fields', () => {
    const result = buildWALinkSearchParams({
      countryCode: '',
      phoneNumber: '',
      text: '',
    });
    expect(result).toEqual({
      cc: undefined,
      phone: undefined,
      text: undefined,
    });
  });

  test('handles partial inputs', () => {
    const result = buildWALinkSearchParams({
      countryCode: 'ID',
      phoneNumber: '81234567890',
    });
    expect(result).toEqual({
      cc: 'ID',
      phone: '81234567890',
      text: undefined,
    });
  });
});
