import { describe, expect, test } from 'vite-plus/test';

import { countWords, generateLoremIpsum } from './lorem-ipsum';

const WS_RE = /\s+/;

describe('generateLoremIpsum', () => {
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

  test('0 paragraphs returns empty', () => {
    const text = generateLoremIpsum({
      format: 'plain',
      paragraphs: 0,
      sentencesPerParagraph: 5,
      startWithLorem: true,
      wordsPerSentence: { max: 15, min: 8 },
    });
    expect(text).toBe('');
  });

  test('negative paragraphs returns empty', () => {
    const text = generateLoremIpsum({
      format: 'plain',
      paragraphs: -2,
      sentencesPerParagraph: 5,
      startWithLorem: true,
      wordsPerSentence: { max: 15, min: 8 },
    });
    expect(text).toBe('');
  });

  test('sentence count per paragraph', () => {
    const text = generateLoremIpsum({
      format: 'plain',
      paragraphs: 2,
      sentencesPerParagraph: 4,
      startWithLorem: false,
      wordsPerSentence: { max: 5, min: 5 },
    });
    const paragraphs = text.split('\n\n');
    for (const p of paragraphs) {
      const sentences = p.split('.').filter((s) => s.trim().length > 0);
      expect(sentences).toHaveLength(4);
    }
  });

  test('word bounds per sentence', () => {
    const text = generateLoremIpsum({
      format: 'plain',
      paragraphs: 1,
      sentencesPerParagraph: 5,
      startWithLorem: false,
      wordsPerSentence: { max: 12, min: 8 },
    });
    const sentences = text.split('.').filter((s) => s.trim().length > 0);
    for (const s of sentences) {
      const words = s.trim().split(WS_RE);
      expect(words.length).toBeGreaterThanOrEqual(8);
      expect(words.length).toBeLessThanOrEqual(12);
    }
  });

  test('startWithLorem true starts with Lorem ipsum dolor sit amet', () => {
    const text = generateLoremIpsum({
      format: 'plain',
      paragraphs: 1,
      sentencesPerParagraph: 2,
      startWithLorem: true,
      wordsPerSentence: { max: 15, min: 8 },
    });
    expect(text.startsWith('Lorem ipsum dolor sit amet')).toBe(true);
  });

  test('startWithLorem false does not always start with Lorem', () => {
    // generate multiple times and ensure at least one does not start with Lorem
    let foundNonLorem = false;
    for (let i = 0; i < 10; i += 1) {
      const t = generateLoremIpsum({
        format: 'plain',
        paragraphs: 1,
        sentencesPerParagraph: 1,
        startWithLorem: false,
        wordsPerSentence: { max: 8, min: 8 },
      });
      if (!t.startsWith('Lorem ipsum dolor sit amet')) {
        foundNonLorem = true;
        break;
      }
    }
    expect(foundNonLorem).toBe(true);
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

  test('clamps paragraphs to max 50', () => {
    const text = generateLoremIpsum({
      format: 'plain',
      paragraphs: 100,
      sentencesPerParagraph: 1,
      startWithLorem: false,
      wordsPerSentence: { max: 3, min: 3 },
    });
    expect(text.split('\n\n')).toHaveLength(50);
  });

  test('clamps sentencesPerParagraph to 1-10', () => {
    const text = generateLoremIpsum({
      format: 'plain',
      paragraphs: 1,
      sentencesPerParagraph: 20,
      startWithLorem: false,
      wordsPerSentence: { max: 3, min: 3 },
    });
    const sentences = text.split('.').filter((s) => s.trim().length > 0);
    expect(sentences).toHaveLength(10);
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
    for (const s of sentences) {
      const words = s.trim().split(WS_RE);
      expect(words.length).toBeGreaterThanOrEqual(8);
      expect(words.length).toBeLessThanOrEqual(15);
    }
  });

  test('each sentence ends with period and capitalizes', () => {
    const text = generateLoremIpsum({
      format: 'plain',
      paragraphs: 1,
      sentencesPerParagraph: 2,
      startWithLorem: false,
      wordsPerSentence: { max: 5, min: 5 },
    });
    // last sentence still ends with .
    expect(text.trim().endsWith('.')).toBe(true);
    for (const p of text.split('\n\n')) {
      const sents = p.split('.').filter((s) => s.trim());
      for (const s of sents) {
        const trimmed = s.trim();
        expect(trimmed[0]).toBe(trimmed[0].toUpperCase());
      }
    }
  });
});

describe('countWords', () => {
  test('empty returns 0', () => {
    expect(countWords('')).toBe(0);
  });

  test('counts words with spaces', () => {
    expect(countWords('hello world')).toBe(2);
  });

  test('trims and handles multiple spaces', () => {
    expect(countWords('  hello   world  ')).toBe(2);
  });

  test('handles newlines', () => {
    expect(countWords('a\nb\nc')).toBe(3);
  });
});
