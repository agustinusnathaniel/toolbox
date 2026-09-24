import { describe, expect, test } from 'vite-plus/test';

import { generateLoremIpsum } from './lorem-ipsum';

const WS_RE = /\s+/;

const CLAMP_CASES = [
  {
    expected: { paragraphs: 50, sentences: 1, wordsMax: 3, wordsMin: 3 },
    name: 'clamps paragraphs to max 50',
    options: {
      paragraphs: 100,
      sentencesPerParagraph: 1,
      wordsPerSentence: { max: 3, min: 3 },
    },
  },
  {
    expected: { paragraphs: 1, sentences: 10, wordsMax: 3, wordsMin: 3 },
    name: 'clamps sentencesPerParagraph to 1-10',
    options: {
      paragraphs: 1,
      sentencesPerParagraph: 20,
      wordsPerSentence: { max: 3, min: 3 },
    },
  },
  {
    expected: { paragraphs: 3, sentences: 5, wordsMax: 15, wordsMin: 8 },
    name: 'falls back to defaults for non-finite options',
    options: {
      paragraphs: Number.NaN,
      sentencesPerParagraph: Number.NaN,
      wordsPerSentence: { max: Number.NaN, min: Number.NaN },
    },
  },
];

describe('generateLoremIpsum output', () => {
  test('generates correct paragraph count plain', () => {
    const text = generateLoremIpsum({
      format: 'plain',
      paragraphs: 3,
      sentencesPerParagraph: 2,
      startWithLorem: false,
      wordsPerSentence: { max: 5, min: 5 },
    });
    const paragraphs = text.split('\n\n');
    expect(paragraphs).toHaveLength(3);
  });

  test('returns empty for zero or negative paragraphs', () => {
    for (const paragraphs of [0, -2]) {
      const text = generateLoremIpsum({
        format: 'plain',
        paragraphs,
        sentencesPerParagraph: 5,
        startWithLorem: true,
        wordsPerSentence: { max: 15, min: 8 },
      });
      expect(text).toBe('');
    }
  });

  test('html format wraps paragraphs in <p>', () => {
    const text = generateLoremIpsum({
      format: 'html',
      paragraphs: 2,
      sentencesPerParagraph: 2,
      startWithLorem: false,
      wordsPerSentence: { max: 5, min: 5 },
    });
    const lines = text.split('\n');
    expect(lines).toHaveLength(2);
    for (const line of lines) {
      expect(line.startsWith('<p>')).toBe(true);
      expect(line.endsWith('</p>')).toBe(true);
    }
  });
});

describe('generateLoremIpsum option clamping', () => {
  test.each(CLAMP_CASES)('$name', ({ options, expected }) => {
    const text = generateLoremIpsum({
      format: 'plain',
      startWithLorem: false,
      ...options,
    });
    const paragraphs = text.split('\n\n');
    expect(paragraphs).toHaveLength(expected.paragraphs);
    for (const paragraph of paragraphs) {
      const sentences = paragraph.split('.').filter((s) => s.trim());
      expect(sentences).toHaveLength(expected.sentences);
      for (const sentence of sentences) {
        const words = sentence.trim().split(WS_RE);
        expect(words.length).toBeGreaterThanOrEqual(expected.wordsMin);
        expect(words.length).toBeLessThanOrEqual(expected.wordsMax);
      }
    }
  });

  test('swaps word min/max if inverted', () => {
    const text = generateLoremIpsum({
      format: 'plain',
      paragraphs: 1,
      sentencesPerParagraph: 3,
      startWithLorem: false,
      wordsPerSentence: { max: 8, min: 15 },
    });
    const sentences = text.split('.').filter((s) => s.trim().length > 0);
    for (const sentence of sentences) {
      const words = sentence.trim().split(WS_RE);
      expect(words.length).toBeGreaterThanOrEqual(8);
      expect(words.length).toBeLessThanOrEqual(15);
    }
  });
});

describe('generateLoremIpsum edge cases', () => {
  test('startWithLorem replaces a short first sentence entirely', () => {
    const text = generateLoremIpsum({
      format: 'plain',
      paragraphs: 2,
      sentencesPerParagraph: 2,
      startWithLorem: true,
      wordsPerSentence: { max: 3, min: 1 },
    });
    const paragraphs = text.split('\n\n');
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0].split('.')[0].trim()).toBe(
      'Lorem ipsum dolor sit amet'
    );
    for (const paragraph of paragraphs) {
      const sentences = paragraph.split('.').filter((s) => s.trim());
      expect(sentences).toHaveLength(2);
    }
  });

  test('startWithLorem keeps the sentence count when sentences are 5 words', () => {
    const text = generateLoremIpsum({
      format: 'plain',
      paragraphs: 1,
      sentencesPerParagraph: 3,
      startWithLorem: true,
      wordsPerSentence: { max: 5, min: 5 },
    });
    expect(text.split('.')[0].trim()).toBe('Lorem ipsum dolor sit amet');
    expect(text.split('.').filter((s) => s.trim())).toHaveLength(3);
  });
});
