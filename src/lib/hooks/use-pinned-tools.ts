import { useCallback, useMemo } from 'react';

import { usePersistedState } from '@/lib/hooks/use-persisted-state';
import {
  PINNED_TOOLS_STORAGE_KEY,
  parsePinnedTools,
  togglePinnedTool,
} from '@/lib/tools/pinned-tools';

interface UsePinnedToolsResult {
  isPinned: (slug: string) => boolean;
  pinnedSlugs: Array<string>;
  togglePin: (slug: string) => void;
}

export function usePinnedTools(): UsePinnedToolsResult {
  const [storedValue, setStoredValue] = usePersistedState<unknown>(
    PINNED_TOOLS_STORAGE_KEY,
    []
  );

  const pinnedSlugs = useMemo(
    () => parsePinnedTools(storedValue),
    [storedValue]
  );

  const togglePin = useCallback(
    (slug: string) => {
      setStoredValue((prev: unknown) =>
        togglePinnedTool(parsePinnedTools(prev), slug)
      );
    },
    [setStoredValue]
  );

  return {
    isPinned: (slug) => pinnedSlugs.includes(slug),
    pinnedSlugs,
    togglePin,
  };
}
