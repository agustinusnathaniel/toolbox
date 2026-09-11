import { describe, expect, test } from 'vite-plus/test';

import { convertCase } from './case-converter';

const EMPTY_FORMATS = {
  camel: '',
  kebab: '',
  lower: '',
  pascal: '',
  screamingSnake: '',
  snake: '',
  title: '',
  upper: '',
};

describe('convertCase', () => {
  test.each([
    {
      expected: { formats: EMPTY_FORMATS, isValid: false, wordCount: 0 },
      input: '',
    },
    {
      expected: { formats: EMPTY_FORMATS, isValid: false, wordCount: 0 },
      input: '   \t  ',
    },
    {
      expected: {
        formats: {
          camel: 'helloWorld',
          kebab: 'hello-world',
          lower: 'hello world',
          pascal: 'HelloWorld',
          screamingSnake: 'HELLO_WORLD',
          snake: 'hello_world',
          title: 'Hello World',
          upper: 'HELLO WORLD',
        },
        isValid: true,
        wordCount: 2,
      },
      input: 'hello world',
    },
  ])('converts %j', ({ input, expected }) => {
    const result = convertCase(input);
    expect(result.isValid).toBe(expected.isValid);
    expect(result.wordCount).toBe(expected.wordCount);
    expect(result.formats).toEqual(expected.formats);
  });

  test('passes Unicode letters through', () => {
    const result = convertCase('café au lait');
    expect(result.formats.camel).toBe('caféAuLait');
    expect(result.formats.upper).toBe('CAFÉ AU LAIT');
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
