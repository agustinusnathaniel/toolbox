'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import {
  decodeHtmlEntities,
  encodeHtmlEntities,
} from '@/lib/tools/html-entities/adapters/html-entities';
import {
  buildHtmlEntitiesParams,
  buildHtmlEntitiesStateFromSearch,
} from '@/lib/tools/html-entities/adapters/html-entities-params';

export function useHtmlEntitiesPage(
  search: Parameters<typeof buildHtmlEntitiesStateFromSearch>[0],
  trackAction: (a: string) => void,
  trackComplete: (v: boolean) => void
) {
  const [state, setState] = useState(() =>
    buildHtmlEntitiesStateFromSearch(search)
  );
  const { copiedKey, copy } = useCopyFeedback();

  const result = useMemo(() => {
    if (!state.input) {
      return '';
    }
    return state.mode === 'encode'
      ? encodeHtmlEntities(state.input)
      : decodeHtmlEntities(state.input);
  }, [state.input, state.mode]);

  useEffect(() => {
    if (result.length > 0 && state.input.trim().length > 0) {
      trackComplete(true);
    }
  }, [result, state.input, trackComplete]);

  const handleCopy = useCallback(async () => {
    if (!result) {
      return;
    }
    if (await copy(result, 'copy', 'Copied result')) {
      trackAction('copy');
    }
  }, [copy, result, trackAction]);

  const handleCopyLink = useCopyShareableLink(
    () => buildHtmlEntitiesParams(state.input, state.mode),
    trackAction
  );

  const handleClear = useCallback(() => {
    setState((prev) => ({ ...prev, input: '' }));
    trackAction('clear');
  }, [trackAction]);

  return {
    copiedKey,
    handleClear,
    handleCopy,
    handleCopyLink,
    result,
    setState,
    state,
  };
}
