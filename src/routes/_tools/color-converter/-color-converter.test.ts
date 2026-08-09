import { describe, expect, test, vi } from 'vite-plus/test';

import { parseColor } from '@/lib/tools/color-converter/adapters/color-converter';

import { copyColorValue } from './index';

describe('copyColorValue', () => {
  const parsed = parseColor('#ff0000');
  if (!parsed) {
    throw new Error('Expected test color to parse');
  }

  test('passes the formatted value to the clipboard abstraction', async () => {
    const copy = vi.fn().mockResolvedValue(true);

    await expect(copyColorValue(parsed, 'rgb', copy)).resolves.toBe(true);
    expect(copy).toHaveBeenCalledWith('rgb(255, 0, 0)', 'Copied');
  });

  test('returns false when the clipboard abstraction rejects the copy', async () => {
    const copy = vi.fn().mockResolvedValue(false);

    await expect(copyColorValue(parsed, 'hex', copy)).resolves.toBe(false);
  });
});
