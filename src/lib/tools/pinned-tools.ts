export const PINNED_TOOLS_STORAGE_KEY = 'toolbox:pinned-tools';

export function readPinnedTools(
  storage: Pick<Storage, 'getItem'> = localStorage
): Array<string> {
  try {
    const raw = storage.getItem(PINNED_TOOLS_STORAGE_KEY);
    if (raw === null) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (slug): slug is string => typeof slug === 'string' && slug.length > 0
    );
  } catch {
    return [];
  }
}

export function writePinnedTools(
  storage: Pick<Storage, 'setItem'>,
  slugs: Array<string>
): void {
  try {
    storage.setItem(PINNED_TOOLS_STORAGE_KEY, JSON.stringify(slugs));
  } catch {
    // Ignore storage errors (quota exceeded, private mode, etc.)
  }
}

export function togglePinnedTool(
  slugs: Array<string>,
  slug: string
): Array<string> {
  return slugs.includes(slug)
    ? slugs.filter((item) => item !== slug)
    : [...slugs, slug];
}
