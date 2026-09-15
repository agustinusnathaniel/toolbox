import { describe, expect, test } from 'vite-plus/test';

import {
  buildLoremIpsumParams,
  buildLoremIpsumStateFromSearch,
} from './lorem-ipsum-params';

describe('buildLoremIpsumParams', () => {
  test('defaults produce empty params', () => {
    const p = buildLoremIpsumParams({
      format: 'plain',
      paragraphs: 3,
      sentencesPerParagraph: 5,
      startWithLorem: true,
      wordsMax: 15,
      wordsMin: 8,
    });
    expect(p.toString()).toBe('');
  });

  test('all non-defaults together', () => {
    const p = buildLoremIpsumParams({
      format: 'html',
      paragraphs: 2,
      sentencesPerParagraph: 3,
      startWithLorem: false,
      wordsMax: 10,
      wordsMin: 5,
    });
    expect(p.get('paragraphs')).toBe('2');
    expect(p.get('sentences')).toBe('3');
    expect(p.get('wordsMin')).toBe('5');
    expect(p.get('wordsMax')).toBe('10');
    expect(p.get('startWithLorem')).toBe('false');
    expect(p.get('format')).toBe('html');
  });
});

const FALLBACK_CASES = [
  {
    expected: {
      paragraphs: 3,
      sentencesPerParagraph: 5,
      wordsMax: 15,
      wordsMin: 8,
    },
    name: 'invalid numbers fall back to defaults',
    search: {
      paragraphs: 'bad',
      sentences: 'bad',
      wordsMax: 'bad',
      wordsMin: 'bad',
    },
  },
  {
    expected: { paragraphs: 50 },
    name: 'clamps paragraphs to max 50',
    search: { paragraphs: '100' },
  },
  {
    expected: { sentencesPerParagraph: 10 },
    name: 'clamps sentences to 10',
    search: { sentences: '99' },
  },
];

const FORMAT_FALLBACK_CASES = [
  {
    expected: { format: 'plain' },
    name: 'invalid format falls back to plain',
    search: { format: 'bad' },
  },
  {
    expected: { startWithLorem: true },
    name: 'invalid startWithLorem falls back to true',
    search: { startWithLorem: 'maybe' },
  },
];

describe('buildLoremIpsumStateFromSearch', () => {
  test('empty search gives defaults', () => {
    const s = buildLoremIpsumStateFromSearch({});
    expect(s).toEqual({
      format: 'plain',
      paragraphs: 3,
      sentencesPerParagraph: 5,
      startWithLorem: true,
      wordsMax: 15,
      wordsMin: 8,
    });
  });

  test('parses valid params', () => {
    const s = buildLoremIpsumStateFromSearch({
      format: 'html',
      paragraphs: '5',
      sentences: '2',
      startWithLorem: 'false',
      wordsMax: '20',
      wordsMin: '10',
    });
    expect(s.paragraphs).toBe(5);
    expect(s.sentencesPerParagraph).toBe(2);
    expect(s.wordsMin).toBe(10);
    expect(s.wordsMax).toBe(20);
    expect(s.startWithLorem).toBe(false);
    expect(s.format).toBe('html');
  });

  test.each(FALLBACK_CASES)('$name', ({ search, expected }) => {
    expect(buildLoremIpsumStateFromSearch(search)).toMatchObject(expected);
  });

  test.each(FORMAT_FALLBACK_CASES)('$name', ({ search, expected }) => {
    expect(buildLoremIpsumStateFromSearch(search)).toMatchObject(expected);
  });

  test('swaps wordsMin wordsMax if inverted', () => {
    const s = buildLoremIpsumStateFromSearch({ wordsMax: '5', wordsMin: '20' });
    expect(s.wordsMin).toBe(5);
    expect(s.wordsMax).toBe(20);
  });

  test('round-trip preserves state', () => {
    const original = {
      format: 'html' as const,
      paragraphs: 4,
      sentencesPerParagraph: 3,
      startWithLorem: false,
      wordsMax: 12,
      wordsMin: 6,
    };
    const params = buildLoremIpsumParams(original);
    const search: Record<string, string> = {};
    for (const [k, v] of params.entries()) {
      search[k] = v;
    }
    const restored = buildLoremIpsumStateFromSearch(search);
    expect(restored).toEqual(original);
  });
});
