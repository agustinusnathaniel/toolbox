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

  test('generates vCard with address missing city (middle gap)', () => {
    const result = generateVCardString({
      firstName: 'Jane',
      lastName: 'Smith',
      streetAddress: '123 Main St',
      state: 'OR',
      postalCode: '97201',
      country: 'US',
    });

    expect(result).toContain('ADR;TYPE=WORK,PREF:;;123 Main St;;OR;97201;US');
  });

  test('generates vCard with address missing multiple gaps (street + country only)', () => {
    const result = generateVCardString({
      firstName: 'Jane',
      lastName: 'Smith',
      streetAddress: '123 Main St',
      country: 'US',
    });

    expect(result).toContain('ADR;TYPE=WORK,PREF:;;123 Main St;;;;US');
  });

  test('generates vCard with all address fields empty', () => {
    const result = generateVCardString({
      firstName: 'Jane',
      lastName: 'Smith',
    });

    expect(result).not.toContain('ADR;');
  });

  test('generates vCard with website URL', () => {
    const result = generateVCardString({ websiteURL: 'https://example.com' });

    expect(result).toContain('URL:https://example.com');
  });

  test('generates vCard with all fields filled', () => {
    const result = generateVCardString({
      firstName: 'Alice',
      lastName: 'Johnson',
      mobilePhoneNumber: '+1-555-1111',
      otherPhoneNumber: '+1-555-2222',
      emailAddress: 'alice@example.com',
      companyName: 'Tech Corp',
      jobTitle: 'Developer',
      streetAddress: '456 Oak St',
      city: 'Seattle',
      state: 'WA',
      postalCode: '98101',
      country: 'US',
      websiteURL: 'https://alice.dev',
    });

    expect(result).toBe(
      [
        'BEGIN:VCARD',
        'N:Johnson;Alice',
        'TEL;TYPE=work,VOICE:+1-555-1111',
        'TEL;TYPE=home,VOICE:+1-555-2222',
        'EMAIL:alice@example.com',
        'ORG:Tech Corp',
        'TITLE:Developer',
        'ADR;TYPE=WORK,PREF:;;456 Oak St;Seattle;WA;98101;US',
        'URL:https://alice.dev',
        'VERSION:3.0',
        'END:VCARD',
      ].join('\n')
    );
  });

  test('generates vCard with minimal fields (empty object)', () => {
    const result = generateVCardString({});

    expect(result).toBe(['BEGIN:VCARD', 'VERSION:3.0', 'END:VCARD'].join('\n'));
  });

  test('handles special characters in name and organization', () => {
    const result = generateVCardString({
      firstName: 'José',
      lastName: 'Peña',
      companyName: 'Foo & Bar, LLC',
    });

    expect(result).toContain('N:Peña;José');
    expect(result).toContain('ORG:Foo & Bar, LLC');
  });
});
