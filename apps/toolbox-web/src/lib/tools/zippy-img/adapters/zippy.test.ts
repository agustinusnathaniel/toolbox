import { describe, expect, test } from 'vitest';

import { downloadFiles } from './zippy';

describe('downloadFiles', () => {
  test('handles empty files array gracefully', async () => {
    await expect(downloadFiles([])).resolves.toBeUndefined();
  });
});
