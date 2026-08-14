import type { FileDiffMetadata } from '@pierre/diffs';
import { describe, expect, test } from 'vite-plus/test';

import {
  buildCopyDiffText,
  diffTexts,
  TEXT_DIFF_FILENAME,
  TEXT_DIFF_MAX_CHARS,
  toFileContents,
} from './text-diff';

function diffFileDiff(original: string, modified: string): FileDiffMetadata {
  const result = diffTexts(original, modified);
  expect(result.isValid).toBe(true);
  expect(result.fileDiff).not.toBeNull();
  return result.fileDiff as FileDiffMetadata;
}

describe('diffTexts', () => {
  test('returns an empty diff for identical text', () => {
    const result = diffTexts('alpha\nbeta', 'alpha\nbeta');
    expect(result.isValid).toBe(true);
    expect(result.addedCount).toBe(0);
    expect(result.removedCount).toBe(0);
    expect(result.fileDiff).not.toBeNull();
  });

  test('flags added lines', () => {
    const result = diffTexts('alpha\n', 'alpha\nbeta\n');
    expect(result.isValid).toBe(true);
    expect(result.addedCount).toBe(1);
    expect(result.removedCount).toBe(0);
    expect(buildCopyDiffText(result.fileDiff as FileDiffMetadata)).toBe(
      '+beta'
    );
  });

  test('flags removed lines', () => {
    const result = diffTexts('alpha\nbeta\n', 'alpha\n');
    expect(result.isValid).toBe(true);
    expect(result.removedCount).toBe(1);
    expect(result.addedCount).toBe(0);
    expect(buildCopyDiffText(result.fileDiff as FileDiffMetadata)).toBe(
      '-beta'
    );
  });

  test('counts replaced lines on both sides', () => {
    const result = diffTexts('hello world', 'hello there');
    expect(result.isValid).toBe(true);
    expect(result.removedCount).toBe(1);
    expect(result.addedCount).toBe(1);
  });

  test('handles multi-line blocks', () => {
    const result = diffTexts('a\nb\nc', 'a\nB\nc');
    expect(result.isValid).toBe(true);
    expect(result.removedCount).toBe(1);
    expect(result.addedCount).toBe(1);
    expect(result.fileDiff?.hunks).toHaveLength(1);
  });

  test('treats trailing newline difference as a change', () => {
    const result = diffTexts('a', 'a\n');
    expect(result.isValid).toBe(true);
    expect(result.removedCount).toBe(1);
    expect(result.addedCount).toBe(1);
  });

  test('returns valid empty result for empty inputs', () => {
    const result = diffTexts('', '');
    expect(result.isValid).toBe(true);
    expect(result.addedCount).toBe(0);
    expect(result.removedCount).toBe(0);
    expect(result.fileDiff).not.toBeNull();
  });

  test('rejects oversized input', () => {
    const oversized = 'x'.repeat(TEXT_DIFF_MAX_CHARS + 1);
    const result = diffTexts(oversized, 'small');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeTruthy();
    expect(result.fileDiff).toBeNull();
  });

  test('accepts input at the size limit', () => {
    const atLimit = 'x'.repeat(TEXT_DIFF_MAX_CHARS);
    const belowLimit = 'x'.repeat(TEXT_DIFF_MAX_CHARS - 1);
    const result = diffTexts(atLimit, belowLimit);
    expect(result.isValid).toBe(true);
  });
});

describe('toFileContents', () => {
  test('uses the plain-text filename', () => {
    expect(toFileContents('abc')).toEqual({
      contents: 'abc',
      name: TEXT_DIFF_FILENAME,
    });
  });
});

describe('buildCopyDiffText', () => {
  test('returns empty string for identical text', () => {
    expect(buildCopyDiffText(diffFileDiff('alpha\nbeta', 'alpha\nbeta'))).toBe(
      ''
    );
  });

  test('emits +/- lines for a single-line replacement', () => {
    expect(buildCopyDiffText(diffFileDiff('hello world', 'hello there'))).toBe(
      '-hello world\n+hello there'
    );
  });

  test('emits changed lines only, skipping context', () => {
    expect(buildCopyDiffText(diffFileDiff('a\nb\nc\nd', 'a\nB\nc\nd'))).toBe(
      '-b\n+B'
    );
  });

  test('emits deletions before additions per change block', () => {
    expect(buildCopyDiffText(diffFileDiff('x\n1\ny\n2', 'x\n1\ny\n3'))).toBe(
      '-2\n+3'
    );
  });

  test('handles multiple change blocks in order', () => {
    expect(
      buildCopyDiffText(diffFileDiff('a\n1\nb\n2\nc\n3', 'a\nX\nb\n2\nc\nY'))
    ).toBe('-1\n+X\n-3\n+Y');
  });

  test('strips trailing newlines from emitted lines', () => {
    expect(buildCopyDiffText(diffFileDiff('line1\n', 'line2\n'))).toBe(
      '-line1\n+line2'
    );
  });
});
