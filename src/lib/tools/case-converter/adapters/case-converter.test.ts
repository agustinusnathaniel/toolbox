import { describe, expect, test } from 'vite-plus/test';

import { convertCase } from './case-converter';

describe('convertCase', () => {
  test('returns an invalid empty result for empty input', () => {
    const result = convertCase('');
    expect(result.isValid).toBe(false);
    expect(result.wordCount).toBe(0);
    expect(result.formats).toEqual({
      camel: '',
      kebab: '',
      lower: '',
      pascal: '',
      screamingSnake: '',
      snake: '',
      title: '',
      upper: '',
    });
  });

  test('returns an invalid empty result for whitespace-only input', () => {
    const result = convertCase('   \t  ');
    expect(result.isValid).toBe(false);
    expect(result.wordCount).toBe(0);
    expect(result.formats.camel).toBe('');
    expect(result.formats.title).toBe('');
  });

  test('converts a simple phrase', () => {
    const result = convertCase('hello world');
    expect(result.isValid).toBe(true);
    expect(result.wordCount).toBe(2);
    expect(result.formats).toEqual({
      camel: 'helloWorld',
      kebab: 'hello-world',
      lower: 'hello world',
      pascal: 'HelloWorld',
      screamingSnake: 'HELLO_WORLD',
      snake: 'hello_world',
      title: 'Hello World',
      upper: 'HELLO WORLD',
    });
  });

  test('handles mixed separators', () => {
    const result = convertCase('one two-THREE');
    expect(result.formats.camel).toBe('oneTwoThree');
    expect(result.formats.snake).toBe('one_two_three');
    expect(result.formats.title).toBe('One Two Three');
  });

  test('converts camelCase input', () => {
    const result = convertCase('helloWorld');
    expect(result.formats.snake).toBe('hello_world');
    expect(result.formats.kebab).toBe('hello-world');
    expect(result.formats.pascal).toBe('HelloWorld');
  });

  test('handles acronym runs', () => {
    const result = convertCase('XMLHttpRequest');
    expect(result.formats.camel).toBe('xmlHttpRequest');
    expect(result.formats.snake).toBe('xml_http_request');
    expect(result.formats.title).toBe('XML Http Request');
  });

  test('handles SCREAMING_SNAKE acronyms', () => {
    const result = convertCase('API_KEY');
    expect(result.formats.camel).toBe('apiKey');
    expect(result.formats.pascal).toBe('ApiKey');
    expect(result.formats.title).toBe('API KEY');
  });

  test('converts already-kebab-case input', () => {
    const result = convertCase('already-kebab-case');
    expect(result.formats.camel).toBe('alreadyKebabCase');
    expect(result.formats.title).toBe('Already Kebab Case');
  });

  test('normalizes multi-space and tab whitespace', () => {
    const result = convertCase('  leading  and\t  trailing  ');
    expect(result.isValid).toBe(true);
    expect(result.wordCount).toBe(3);
    expect(result.formats.camel).toBe('leadingAndTrailing');
  });

  test('passes Unicode letters through', () => {
    const result = convertCase('café au lait');
    expect(result.formats.camel).toBe('caféAuLait');
    expect(result.formats.upper).toBe('CAFÉ AU LAIT');
  });

  test('drops empty tokens from consecutive separators', () => {
    const result = convertCase('a--b  c');
    expect(result.formats.snake).toBe('a_b_c');
  });

  test('pins intentional change-case digit handling', () => {
    // camelCase joins digit chunks with an underscore; word-delimited formats
    // keep digits as separate words. Both are deliberate package outputs.
    expect(convertCase('version 2 update').formats.camel).toBe(
      'version_2Update'
    );
    expect(convertCase('version 2 update').formats.snake).toBe(
      'version_2_update'
    );
    expect(convertCase('v1.2.3').formats.camel).toBe('v1_2_3');
  });

  test('treats uncased scripts as a single valid word', () => {
    const result = convertCase('日本語テキスト');
    expect(result.isValid).toBe(true);
    expect(result.wordCount).toBe(1);
    expect(result.formats).toEqual({
      camel: '日本語テキスト',
      kebab: '日本語テキスト',
      lower: '日本語テキスト',
      pascal: '日本語テキスト',
      screamingSnake: '日本語テキスト',
      snake: '日本語テキスト',
      title: '日本語テキスト',
      upper: '日本語テキスト',
    });
  });

  test('splits words across separators, casing, and acronym boundaries', () => {
    expect(convertCase('one two-THREE').wordCount).toBe(3);
    expect(convertCase('one two-THREE').formats.lower).toBe('one two three');
    expect(convertCase('one two-THREE').formats.upper).toBe('ONE TWO THREE');
    expect(convertCase('helloWorld').wordCount).toBe(2);
    expect(convertCase('XMLHttpRequest').wordCount).toBe(3);
    expect(convertCase('API_KEY').wordCount).toBe(2);
  });

  test('drops empty tokens when splitting', () => {
    const result = convertCase('a--b  c');
    expect(result.wordCount).toBe(3);
    expect(result.formats.lower).toBe('a b c');
    expect(result.formats.upper).toBe('A B C');
  });
});
