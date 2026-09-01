import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { describe, expect, test, vi } from 'vite-plus/test';

import { downloadFiles, formatFileSize, summarizeCompression } from './zippy';

vi.mock('file-saver', () => ({ saveAs: vi.fn() }));

describe('downloadFiles', () => {
  test('handles empty files array gracefully', async () => {
    await expect(downloadFiles([])).resolves.toBeUndefined();
    expect(saveAs).not.toHaveBeenCalled();
  });

  test('downloads a single file', async () => {
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    await expect(downloadFiles([file])).resolves.toBeUndefined();
    expect(saveAs).toHaveBeenCalledTimes(1);
    expect(saveAs).toHaveBeenCalledWith(file, 'test.txt');
  });

  test('bundles multiple files into a single zip download', async () => {
    vi.mocked(saveAs).mockClear();
    const files = [
      new File(['one'], 'one.txt', { type: 'text/plain' }),
      new File(['two'], 'two.txt', { type: 'text/plain' }),
    ];

    await expect(downloadFiles(files)).resolves.toBeUndefined();
    expect(saveAs).toHaveBeenCalledTimes(1);

    const [blob, filename] = vi.mocked(saveAs).mock.calls[0];
    expect(filename).toBe('files.zip');
    expect(blob).toBeInstanceOf(Blob);

    const zip = await JSZip.loadAsync(blob as Blob);
    expect(await zip.file('one.txt')?.async('string')).toBe('one');
    expect(await zip.file('two.txt')?.async('string')).toBe('two');
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

  test('handles 1MB boundary transition', () => {
    expect(formatFileSize(1024 * 1024 - 1)).toBe('1024.0 KB');
    expect(formatFileSize(1024 * 1024)).toBe('1.00 MB');
  });

  test('formats large values', () => {
    expect(formatFileSize(100 * 1024 * 1024)).toBe('100.00 MB');
    expect(formatFileSize(500 * 1024 * 1024)).toBe('500.00 MB');
  });
});

describe('summarizeCompression', () => {
  const file = new File(['compressed'], 'compressed.jpg', {
    type: 'image/jpeg',
  });

  test('distinguishes all-success, partial, and all-failure outcomes', () => {
    expect(
      summarizeCompression([{ compressed: file }, { compressed: file }])
    ).toEqual({
      failed: 0,
      outcome: 'all-success',
      succeeded: 2,
      total: 2,
    });
    expect(summarizeCompression([{ compressed: file }, {}])).toEqual({
      failed: 1,
      outcome: 'partial',
      succeeded: 1,
      total: 2,
    });
    expect(summarizeCompression([{}])).toEqual({
      failed: 1,
      outcome: 'all-failure',
      succeeded: 0,
      total: 1,
    });
  });
});
