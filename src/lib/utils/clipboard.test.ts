import { describe, expect, test, vi } from 'vite-plus/test';

import { copyToClipboard } from './clipboard';

const writeText = vi.fn();

vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), { error: vi.fn() }),
}));

describe('copyToClipboard', () => {
  test('returns true when the clipboard write succeeds', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    writeText.mockResolvedValue(undefined);

    await expect(copyToClipboard('copy me')).resolves.toBe(true);
  });

  test('returns false when clipboard access fails', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    writeText.mockRejectedValue(new Error('denied'));

    await expect(copyToClipboard('copy me')).resolves.toBe(false);
  });
});
