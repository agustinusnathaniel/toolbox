'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import type { UrlInspectResult } from '@/lib/tools/url-inspector/adapters/url-inspector';
import { inspectUrl } from '@/lib/tools/url-inspector/adapters/url-inspector';
import {
  buildUrlInspectorParams,
  buildUrlInspectorStateFromSearch,
} from '@/lib/tools/url-inspector/adapters/url-inspector-params';

export function useUrlInspectorPage(
  search: Parameters<typeof buildUrlInspectorStateFromSearch>[0],
  trackAction: (a: string) => void,
  trackComplete: (v: boolean) => void
) {
  const [state, setState] = useState(() =>
    buildUrlInspectorStateFromSearch(search)
  );
  const { copiedKey, copy } = useCopyFeedback();

  const result = useMemo<UrlInspectResult | null>(() => {
    if (!state.input.trim()) {
      return null;
    }
    return inspectUrl(state.input);
  }, [state.input]);

  useEffect(() => {
    if (result?.isValid) {
      trackComplete(true);
    }
  }, [result, trackComplete]);

  const handleCopyPart = useCallback(
    async (value: string, key: string, label: string) => {
      if (await copy(value, key, label)) {
        trackAction('copy');
      }
    },
    [copy, trackAction]
  );

  const handleCopyLink = useCopyShareableLink(
    () => buildUrlInspectorParams(state),
    trackAction
  );

  return { copiedKey, handleCopyLink, handleCopyPart, result, setState, state };
}
