import { describe, expect, test } from 'vite-plus/test';

import { generateVCardString } from './qrcode';

describe('generateVCardString', () => {
  test('generates vCard with full contact info', () => {
    const result = generateVCardString({
      firstName: 'John',
      lastName: 'Doe',
      mobilePhoneNumber: '+1-555-1234',
      emailAddress: 'john@example.com',
      companyName: 'Acme Inc',
      jobTitle: 'Engineer',
    });

    expect(result).toContain('BEGIN:VCARD');
    expect(result).toContain('N:Doe;John');
    expect(result).toContain('TEL;TYPE=work,VOICE:+1-555-1234');
    expect(result).toContain('EMAIL:john@example.com');
    expect(result).toContain('ORG:Acme Inc');
    expect(result).toContain('TITLE:Engineer');
    expect(result).toContain('VERSION:3.0');
    expect(result).toContain('END:VCARD');
  });

  test('generates vCard with only phone number', () => {
    const result = generateVCardString({ mobilePhoneNumber: '+1-555-5678' });

    expect(result).toContain('BEGIN:VCARD');
    expect(result).toContain('TEL;TYPE=work,VOICE:+1-555-5678');
    expect(result).toContain('VERSION:3.0');
    expect(result).toContain('END:VCARD');
  });

  test('generates vCard with address fields', () => {
    const result = generateVCardString({
      firstName: 'Jane',
      lastName: 'Smith',
      streetAddress: '123 Main St',
      city: 'Portland',
      state: 'OR',
      postalCode: '97201',
      country: 'US',
    });

    expect(result).toContain(
      'ADR;TYPE=WORK,PREF:;;123 Main St;Portland;OR;97201;US'
    );
  });

  test('generates vCard with website URL', () => {
    const result = generateVCardString({ websiteURL: 'https://example.com' });

    expect(result).toContain('URL:https://example.com');
  });
});
