import { describe, expect, test } from 'vite-plus/test';

import { downloadFiles, formatFileSize } from './zippy';

describe('downloadFiles', () => {
  test('handles empty files array gracefully', async () => {
    await expect(downloadFiles([])).resolves.toBeUndefined();
  });
});

describe('formatFileSize', () => {
  test('formats bytes', () => {
    expect(formatFileSize(500)).toBe('500 B');
    expect(formatFileSize(0)).toBe('0 B');
  });

  test('formats kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });

  test('formats megabytes', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1.00 MB');
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.50 MB');
  });
});
