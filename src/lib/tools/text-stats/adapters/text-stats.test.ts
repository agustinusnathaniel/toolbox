import { describe, expect, test } from 'vite-plus/test';

import { buildStatsSummary, computeTextStats } from './text-stats';

describe('computeTextStats', () => {
  test('empty string', () => {
    const s = computeTextStats('');
    expect(s.characters).toBe(0);
    expect(s.charactersNoSpaces).toBe(0);
    expect(s.words).toBe(0);
    expect(s.lines).toBe(0);
    expect(s.paragraphs).toBe(0);
    expect(s.sentences).toBe(0);
    expect(s.bytesUtf8).toBe(0);
    expect(s.readingTimeMinutes).toBe(0);
    expect(s.readingTimeText).toBe('0 sec');
    expect(s.averageWordLength).toBe(0);
    expect(s.longestWordLength).toBe(0);
  });

  test('whitespace only', () => {
    const s = computeTextStats('   \n\t  ');
    expect(s.characters).toBe(7);
    expect(s.charactersNoSpaces).toBe(0);
    expect(s.words).toBe(0);
    expect(s.lines).toBe(2);
    expect(s.paragraphs).toBe(0);
    expect(s.sentences).toBe(0);
  });

  test('single word', () => {
    const s = computeTextStats('hello');
    expect(s.characters).toBe(5);
    expect(s.charactersNoSpaces).toBe(5);
    expect(s.words).toBe(1);
    expect(s.lines).toBe(1);
    expect(s.paragraphs).toBe(1);
    expect(s.sentences).toBe(1);
    expect(s.bytesUtf8).toBe(5);
    expect(s.longestWordLength).toBe(5);
    expect(s.averageWordLength).toBe(5);
  });

  test('hello world basic', () => {
    const s = computeTextStats('hello world');
    expect(s.characters).toBe(11);
    expect(s.charactersNoSpaces).toBe(10);
    expect(s.words).toBe(2);
    expect(s.lines).toBe(1);
    expect(s.paragraphs).toBe(1);
    expect(s.sentences).toBe(1);
    expect(s.averageWordLength).toBe(5);
    expect(s.longestWordLength).toBe(5);
  });

  test('multiline', () => {
    const s = computeTextStats('a\nb\nc');
    expect(s.lines).toBe(3);
    expect(s.words).toBe(3);
    expect(s.characters).toBe(5);
  });

  test('paragraphs split by blank line', () => {
    const s = computeTextStats('para one\n\npara two\n\npara three');
    expect(s.paragraphs).toBe(3);
    expect(s.lines).toBe(5);
  });

  test('paragraphs with extra blank lines', () => {
    const s = computeTextStats('a\n\n\nb');
    expect(s.paragraphs).toBe(2);
  });

  test('sentences with punctuation', () => {
    const s = computeTextStats('Hello world. How are you? Fine!');
    expect(s.sentences).toBe(3);
    expect(s.words).toBe(6);
  });

  test('sentence without terminator counts as one', () => {
    const s = computeTextStats('hello world');
    expect(s.sentences).toBe(1);
  });

  test('empty sentences stays zero', () => {
    const s = computeTextStats('');
    expect(s.sentences).toBe(0);
  });

  test('bytesUtf8 handles unicode', () => {
    const s = computeTextStats('café');
    expect(s.characters).toBe(4);
    expect(s.bytesUtf8).toBe(5);
    expect(s.words).toBe(1);
  });

  test('bytesUtf8 emoji', () => {
    const s = computeTextStats('hi 👋');
    expect(s.characters).toBe(5);
    expect(s.bytesUtf8).toBe(7);
  });

  test('reading time short text shows seconds', () => {
    const s = computeTextStats('hello world');
    expect(s.readingTimeMinutes).toBe(1);
    expect(s.readingTimeText).toContain('sec');
  });

  test('reading time long text', () => {
    const words = Array.from({ length: 400 }, () => 'word').join(' ');
    const s = computeTextStats(words);
    expect(s.words).toBe(400);
    expect(s.readingTimeMinutes).toBe(2);
    expect(s.readingTimeText).toBe('2 min');
  });

  test('reading time exactly 200 words', () => {
    const words = Array.from({ length: 200 }, () => 'word').join(' ');
    const s = computeTextStats(words);
    expect(s.readingTimeMinutes).toBe(1);
    expect(s.readingTimeText).toBe('1 min');
  });

  test('average and longest word', () => {
    const s = computeTextStats('a bb ccc');
    expect(s.words).toBe(3);
    expect(s.longestWordLength).toBe(3);
    expect(s.averageWordLength).toBe(2);
  });

  test('charactersNoSpaces excludes tabs and newlines', () => {
    const s = computeTextStats('a b\tc\nd');
    expect(s.charactersNoSpaces).toBe(4);
    expect(s.characters).toBe(7);
  });

  test('handles leading and trailing whitespace', () => {
    const s = computeTextStats('  hello   world  ');
    expect(s.words).toBe(2);
    expect(s.characters).toBe(17);
    expect(s.charactersNoSpaces).toBe(10);
  });
});

describe('buildStatsSummary', () => {
  test('formats summary', () => {
    const s = computeTextStats('hello world');
    const summary = buildStatsSummary(s);
    expect(summary).toContain('2 words');
    expect(summary).toContain('11 characters');
  });

  test('empty summary', () => {
    const s = computeTextStats('');
    const summary = buildStatsSummary(s);
    expect(summary).toContain('0 words');
  });
});
