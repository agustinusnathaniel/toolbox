export const PINNED_TOOLS_STORAGE_KEY = 'toolbox:pinned-tools';

export function parsePinnedTools(value: unknown): Array<string> {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(
    (slug): slug is string => typeof slug === 'string' && slug.length > 0
  );
}

export function togglePinnedTool(
  slugs: Array<string>,
  slug: string
): Array<string> {
  return slugs.includes(slug)
    ? slugs.filter((item) => item !== slug)
    : [...slugs, slug];
}
