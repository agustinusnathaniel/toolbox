import { describe, expect, test } from 'vite-plus/test';

import {
  PINNED_TOOLS_STORAGE_KEY,
  readPinnedTools,
  togglePinnedTool,
  writePinnedTools,
} from './pinned-tools';

interface MemoryStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  store: Map<string, string>;
}

function createMemoryStorage(initialValue?: string): MemoryStorage {
  const store = new Map<string, string>();
  if (initialValue !== undefined) {
    store.set(PINNED_TOOLS_STORAGE_KEY, initialValue);
  }
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value);
    },
    store,
  };
}

describe('readPinnedTools', () => {
  test('returns [] when storage is empty', () => {
    const storage = createMemoryStorage();
    expect(readPinnedTools(storage)).toEqual([]);
  });

  test('returns [] when stored JSON is invalid', () => {
    const storage = createMemoryStorage('not json{');
    expect(readPinnedTools(storage)).toEqual([]);
  });

  test('returns [] when stored value is not an array', () => {
    const storage = createMemoryStorage(JSON.stringify({ pinned: ['base64'] }));
    expect(readPinnedTools(storage)).toEqual([]);
  });

  test('filters out non-string entries', () => {
    const storage = createMemoryStorage(
      JSON.stringify(['base64', 42, null, 'json-formatter', ''])
    );
    expect(readPinnedTools(storage)).toEqual(['base64', 'json-formatter']);
  });

  test('returns stored slugs in order', () => {
    const storage = createMemoryStorage(
      JSON.stringify(['json-formatter', 'base64', 'ua-check'])
    );
    expect(readPinnedTools(storage)).toEqual([
      'json-formatter',
      'base64',
      'ua-check',
    ]);
  });
});

describe('togglePinnedTool', () => {
  test('appends a new slug', () => {
    expect(togglePinnedTool(['base64'], 'json-formatter')).toEqual([
      'base64',
      'json-formatter',
    ]);
  });

  test('removes an existing slug', () => {
    expect(togglePinnedTool(['base64', 'json-formatter'], 'base64')).toEqual([
      'json-formatter',
    ]);
  });

  test('returns a new array without mutating the input', () => {
    const slugs = ['base64', 'json-formatter'];
    const result = togglePinnedTool(slugs, 'ua-check');
    expect(result).toEqual(['base64', 'json-formatter', 'ua-check']);
    expect(result).not.toBe(slugs);
    expect(slugs).toEqual(['base64', 'json-formatter']);

    const removed = togglePinnedTool(slugs, 'base64');
    expect(removed).toEqual(['json-formatter']);
    expect(removed).not.toBe(slugs);
    expect(slugs).toEqual(['base64', 'json-formatter']);
  });
});

describe('writePinnedTools', () => {
  test('persists JSON to storage', () => {
    const storage = createMemoryStorage();
    writePinnedTools(storage, ['base64', 'json-formatter']);
    expect(storage.store.get(PINNED_TOOLS_STORAGE_KEY)).toBe(
      JSON.stringify(['base64', 'json-formatter'])
    );
    expect(readPinnedTools(storage)).toEqual(['base64', 'json-formatter']);
  });

  test('does not throw when setItem throws', () => {
    const throwingStorage = {
      setItem: () => {
        throw new Error('Quota exceeded');
      },
    };
    expect(() => writePinnedTools(throwingStorage, ['base64'])).not.toThrow();
  });
});
