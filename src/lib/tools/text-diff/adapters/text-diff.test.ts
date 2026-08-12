import { describe, expect, test } from 'vite-plus/test';

import { diffTexts, TEXT_DIFF_MAX_CHARS } from './text-diff';

describe('diffTexts', () => {
  test('returns all unchanged lines for identical text', () => {
    const result = diffTexts('alpha\nbeta', 'alpha\nbeta');
    expect(result.isValid).toBe(true);
    expect(result.lines.map((line) => line.type)).toEqual([
      'unchanged',
      'unchanged',
    ]);
    expect(result.lines.map((line) => line.content)).toEqual(['alpha', 'beta']);
    expect(result.lines.every((line) => line.type === 'unchanged')).toBe(true);
    expect(result.addedCount).toBe(0);
    expect(result.removedCount).toBe(0);
  });

  test('flags added lines', () => {
    const result = diffTexts('alpha\n', 'alpha\nbeta\n');
    expect(result.isValid).toBe(true);
    expect(result.lines.map((line) => line.type)).toEqual([
      'unchanged',
      'added',
    ]);
    expect(result.lines.map((line) => line.content)).toEqual(['alpha', 'beta']);
    expect(result.addedCount).toBe(1);
    expect(result.removedCount).toBe(0);
  });

  test('flags removed lines', () => {
    const result = diffTexts('alpha\nbeta\n', 'alpha\n');
    expect(result.isValid).toBe(true);
    expect(result.lines.map((line) => line.type)).toEqual([
      'unchanged',
      'removed',
    ]);
    expect(result.lines.map((line) => line.content)).toEqual(['alpha', 'beta']);
    expect(result.removedCount).toBe(1);
    expect(result.addedCount).toBe(0);
  });

  test('falls back to line-level diff when appended line has no trailing newline', () => {
    const result = diffTexts('alpha', 'alpha\nbeta');
    expect(result.isValid).toBe(true);
    expect(result.lines.map((line) => line.type)).toEqual([
      'removed',
      'added',
      'added',
    ]);
    expect(result.lines.map((line) => line.content)).toEqual([
      'alpha',
      'alpha',
      'beta',
    ]);
    expect(result.addedCount).toBe(2);
    expect(result.removedCount).toBe(1);
  });

  test('marks replaced word with inline chunks on both sides', () => {
    const result = diffTexts('hello world', 'hello there');
    expect(result.isValid).toBe(true);
    expect(result.lines[0].type).toBe('removed');
    expect(result.lines[0].chunks).toEqual([
      { text: 'hello ', type: 'unchanged' },
      { text: 'world', type: 'removed' },
    ]);
    expect(result.lines[0].content).toBe('hello world');
    expect(result.lines[1].type).toBe('added');
    expect(result.lines[1].chunks).toEqual([
      { text: 'hello ', type: 'unchanged' },
      { text: 'there', type: 'added' },
    ]);
    expect(result.lines[1].content).toBe('hello there');
  });

  test('marks inserted word with inline chunk on added side', () => {
    const result = diffTexts('hello world', 'hello brave world');
    expect(result.isValid).toBe(true);
    expect(result.lines[0].type).toBe('removed');
    expect(result.lines[0].chunks).toEqual([
      { text: 'hello ', type: 'unchanged' },
      { text: 'world', type: 'unchanged' },
    ]);
    expect(result.lines[0].content).toBe('hello world');
    expect(result.lines[1].type).toBe('added');
    expect(result.lines[1].chunks).toEqual([
      { text: 'hello ', type: 'unchanged' },
      { text: 'brave ', type: 'added' },
      { text: 'world', type: 'unchanged' },
    ]);
    expect(result.lines[1].content).toBe('hello brave world');
  });

  test('handles multi-line blocks', () => {
    const result = diffTexts('a\nb\nc', 'a\nB\nc');
    expect(result.isValid).toBe(true);
    expect(result.lines.map((line) => line.type)).toEqual([
      'unchanged',
      'removed',
      'added',
      'unchanged',
    ]);
    expect(result.lines.map((line) => line.content)).toEqual([
      'a',
      'b',
      'B',
      'c',
    ]);
    expect(result.removedCount).toBe(1);
    expect(result.addedCount).toBe(1);
  });

  test('treats trailing newline difference as a change', () => {
    const result = diffTexts('a', 'a\n');
    expect(result.isValid).toBe(true);
    expect(result.lines.map((line) => line.type)).toEqual(['removed', 'added']);
    expect(result.lines.map((line) => line.content)).toEqual(['a', 'a']);
    expect(result.removedCount).toBe(1);
    expect(result.addedCount).toBe(1);
  });

  test('returns valid empty result for empty inputs', () => {
    const result = diffTexts('', '');
    expect(result.isValid).toBe(true);
    expect(result.lines).toHaveLength(0);
    expect(result.addedCount).toBe(0);
    expect(result.removedCount).toBe(0);
  });

  test('rejects oversized input', () => {
    const oversized = 'x'.repeat(TEXT_DIFF_MAX_CHARS + 1);
    const result = diffTexts(oversized, 'small');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeTruthy();
    expect(result.lines).toHaveLength(0);
  });

  test('accepts input at the size limit', () => {
    const atLimit = 'x'.repeat(TEXT_DIFF_MAX_CHARS);
    const belowLimit = 'x'.repeat(TEXT_DIFF_MAX_CHARS - 1);
    const result = diffTexts(atLimit, belowLimit);
    expect(result.isValid).toBe(true);
  });
});
