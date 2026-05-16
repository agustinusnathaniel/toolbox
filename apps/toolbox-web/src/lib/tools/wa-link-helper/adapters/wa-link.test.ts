import { describe, expect, test } from 'vitest';

import {
  buildWhatsAppLink,
  countryCodeOptions,
  getCountryOptions,
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

  test('countryCodeOptions returns array of country options', () => {
    const options = countryCodeOptions;
    expect(Array.isArray(options)).toBe(true);
    expect(options.length).toBeGreaterThan(0);
  });

  test('countryCodeOptions contains expected structure', () => {
    const options = countryCodeOptions;
    const usOption = options.find((o) => o.id === 'US');
    expect(usOption).toBeDefined();
    expect(usOption?.name).toContain('1');
    expect(usOption?.id).toBe('US');
  });

  test('getCountryOptions returns same as countryCodeOptions', () => {
    expect(getCountryOptions()).toEqual(countryCodeOptions);
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

  test('generates correct link with phone number and text', () => {
    const result = buildWhatsAppLink({
      countryCode: 'ID',
      phoneNumber: '81234567890',
      text: 'Hello from WA Link!',
    });
    expect(result.isValid).toBe(true);
    expect(result.link).toContain('https://wa.me/');
    expect(result.link).toContain('text=');
  });

  test('returns invalid for empty phone number', () => {
    const result = buildWhatsAppLink({
      countryCode: 'US',
      phoneNumber: '',
    });
    expect(result.isValid).toBe(false);
    expect(result.link).toBe('');
  });

  test('handles phone number with leading zeros', () => {
    const result = buildWhatsAppLink({
      countryCode: 'IT',
      phoneNumber: '3123456789',
    });
    expect(result.isValid).toBe(true);
    expect(result.link).toContain('https://wa.me/');
  });
});
