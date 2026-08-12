import { describe, expect, test } from 'vite-plus/test';

import { generateVCardString } from './qrcode';

describe('generateVCardString', () => {
  test('generates vCard with full contact info', () => {
    const result = generateVCardString({
      companyName: 'Acme Inc',
      emailAddress: 'john@example.com',
      firstName: 'John',
      jobTitle: 'Engineer',
      lastName: 'Doe',
      mobilePhoneNumber: '+1-555-1234',
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
      city: 'Portland',
      country: 'US',
      firstName: 'Jane',
      lastName: 'Smith',
      postalCode: '97201',
      state: 'OR',
      streetAddress: '123 Main St',
    });

    expect(result).toContain(
      'ADR;TYPE=WORK,PREF:;;123 Main St;Portland;OR;97201;US'
    );
  });

  test('generates vCard with address missing city (middle gap)', () => {
    const result = generateVCardString({
      country: 'US',
      firstName: 'Jane',
      lastName: 'Smith',
      postalCode: '97201',
      state: 'OR',
      streetAddress: '123 Main St',
    });

    expect(result).toContain('ADR;TYPE=WORK,PREF:;;123 Main St;;OR;97201;US');
  });

  test('generates vCard with address missing multiple gaps (street + country only)', () => {
    const result = generateVCardString({
      country: 'US',
      firstName: 'Jane',
      lastName: 'Smith',
      streetAddress: '123 Main St',
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
      city: 'Seattle',
      companyName: 'Tech Corp',
      country: 'US',
      emailAddress: 'alice@example.com',
      firstName: 'Alice',
      jobTitle: 'Developer',
      lastName: 'Johnson',
      mobilePhoneNumber: '+1-555-1111',
      otherPhoneNumber: '+1-555-2222',
      postalCode: '98101',
      state: 'WA',
      streetAddress: '456 Oak St',
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

  test('escapes special characters in name and organization', () => {
    const result = generateVCardString({
      companyName: 'Foo & Bar, LLC',
      firstName: 'José',
      lastName: 'Peña',
    });

    expect(result).toContain('N:Peña;José');
    expect(result).toContain('ORG:Foo & Bar\\, LLC');
  });

  test('generates N line with only first name (empty family)', () => {
    const result = generateVCardString({ firstName: 'John' });

    expect(result).toContain('N:;John');
  });

  test('generates N line with only last name (empty given, trailing semicolon)', () => {
    const result = generateVCardString({ lastName: 'Doe' });

    expect(result).toContain('N:Doe;');
  });

  test('escapes semicolons and commas in values', () => {
    const result = generateVCardString({
      firstName: 'John',
      lastName: 'Smith;Jr',
      streetAddress: 'Apt 5, Bldg 2',
    });

    expect(result).toContain('N:Smith\\;Jr;John');
    expect(result).toContain('Apt 5\\, Bldg 2');
  });

  test('neutralizes newline injection in values', () => {
    const result = generateVCardString({
      firstName: 'John',
      jobTitle: 'CEO\nTEL;TYPE=CELL:+15551234567',
      lastName: 'Doe',
    });

    expect(result).toContain('TITLE:CEO\\nTEL\\;TYPE=CELL:+15551234567');
    expect(
      result.split('\n').find((line) => line.startsWith('TEL;TYPE=CELL'))
    ).toBeUndefined();
  });
});
