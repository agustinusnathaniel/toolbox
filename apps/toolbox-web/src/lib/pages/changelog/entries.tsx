import type { ComponentType } from 'react';

export type ChangelogTag = 'new' | 'improved' | 'fixed';

const mdxModules = import.meta.glob<{
  default: ComponentType;
  date: string;
  tag: 'new' | 'improved' | 'fixed';
  title: string;
  version: string;
}>('/content/changelog/*.mdx', { eager: true });

export type ChangelogEntry = {
  content: ComponentType;
  date: string;
  slug: string;
  tag: 'new' | 'improved' | 'fixed';
  title: string;
  version: string;
};

export function getChangelogEntries(): Array<ChangelogEntry> {
  return Object.entries(mdxModules)
    .map(([path, mod]) => {
      const slug = path.split('/').pop()?.replace('.mdx', '');
      if (!slug) {
        return null;
      }
      return {
        content: mod.default,
        date: mod.date,
        slug,
        tag: mod.tag,
        title: mod.title,
        version: mod.version,
      };
    })
    .filter((entry): entry is ChangelogEntry => entry !== null)
    .sort((a, b) => {
      const vA = a.version.split('.').map(Number);
      const vB = b.version.split('.').map(Number);
      for (let i = 0; i < 3; i++) {
        if (vA[i] !== vB[i]) {
          return vB[i] - vA[i];
        }
      }
      return 0;
    });
}
