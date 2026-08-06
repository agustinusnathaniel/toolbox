import { useCallback } from 'react';

import { usePersistedState } from '@/lib/hooks/use-persisted-state';
import {
  PINNED_TOOLS_STORAGE_KEY,
  togglePinnedTool,
} from '@/lib/tools/pinned-tools';

interface UsePinnedToolsResult {
  isPinned: (slug: string) => boolean;
  pinnedSlugs: Array<string>;
  togglePin: (slug: string) => void;
}

export function usePinnedTools(): UsePinnedToolsResult {
  const [pinnedSlugs, setPinnedSlugs] = usePersistedState<Array<string>>(
    PINNED_TOOLS_STORAGE_KEY,
    []
  );

  const togglePin = useCallback(
    (slug: string) => {
      setPinnedSlugs((prev) => togglePinnedTool(prev, slug));
    },
    [setPinnedSlugs]
  );

  return {
    isPinned: (slug) => pinnedSlugs.includes(slug),
    pinnedSlugs,
    togglePin,
  };
}
