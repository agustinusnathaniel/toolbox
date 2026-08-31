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

  test('non-default paragraphs set', () => {
    const p = buildLoremIpsumParams({
      format: 'plain',
      paragraphs: 5,
      sentencesPerParagraph: 5,
      startWithLorem: true,
      wordsMax: 15,
      wordsMin: 8,
    });
    expect(p.get('paragraphs')).toBe('5');
  });

  test('non-default sentences set', () => {
    const p = buildLoremIpsumParams({
      format: 'plain',
      paragraphs: 3,
      sentencesPerParagraph: 2,
      startWithLorem: true,
      wordsMax: 15,
      wordsMin: 8,
    });
    expect(p.get('sentences')).toBe('2');
  });

  test('wordsMin and wordsMax set when non-default', () => {
    const p = buildLoremIpsumParams({
      format: 'plain',
      paragraphs: 3,
      sentencesPerParagraph: 5,
      startWithLorem: true,
      wordsMax: 20,
      wordsMin: 5,
    });
    expect(p.get('wordsMin')).toBe('5');
    expect(p.get('wordsMax')).toBe('20');
  });

  test('startWithLorem false set', () => {
    const p = buildLoremIpsumParams({
      format: 'plain',
      paragraphs: 3,
      sentencesPerParagraph: 5,
      startWithLorem: false,
      wordsMax: 15,
      wordsMin: 8,
    });
    expect(p.get('startWithLorem')).toBe('false');
  });

  test('html format set', () => {
    const p = buildLoremIpsumParams({
      format: 'html',
      paragraphs: 3,
      sentencesPerParagraph: 5,
      startWithLorem: true,
      wordsMax: 15,
      wordsMin: 8,
    });
    expect(p.get('format')).toBe('html');
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

  test('invalid numbers fallback to defaults', () => {
    const s = buildLoremIpsumStateFromSearch({
      paragraphs: 'bad',
      sentences: 'bad',
      wordsMax: 'bad',
      wordsMin: 'bad',
    });
    expect(s.paragraphs).toBe(3);
    expect(s.sentencesPerParagraph).toBe(5);
    expect(s.wordsMin).toBe(8);
    expect(s.wordsMax).toBe(15);
  });

  test('clamps paragraphs to max 50', () => {
    const s = buildLoremIpsumStateFromSearch({ paragraphs: '100' });
    expect(s.paragraphs).toBe(50);
  });

  test('clamps sentences to 10', () => {
    const s = buildLoremIpsumStateFromSearch({ sentences: '99' });
    expect(s.sentencesPerParagraph).toBe(10);
  });

  test('invalid format falls back to plain', () => {
    const s = buildLoremIpsumStateFromSearch({ format: 'bad' });
    expect(s.format).toBe('plain');
  });

  test('invalid startWithLorem falls back to true', () => {
    const s = buildLoremIpsumStateFromSearch({ startWithLorem: 'maybe' });
    expect(s.startWithLorem).toBe(true);
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

  test('round-trip defaults stays empty', () => {
    const defaults = {
      format: 'plain' as const,
      paragraphs: 3,
      sentencesPerParagraph: 5,
      startWithLorem: true,
      wordsMax: 15,
      wordsMin: 8,
    };
    const params = buildLoremIpsumParams(defaults);
    expect(params.toString()).toBe('');
    const restored = buildLoremIpsumStateFromSearch({});
    expect(restored).toEqual(defaults);
  });
});
