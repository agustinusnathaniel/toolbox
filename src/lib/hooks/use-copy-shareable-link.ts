'use client';

import { useCallback, useRef } from 'react';

import { copyToClipboard } from '@/lib/utils/clipboard';

export function useCopyShareableLink(
  buildParams: () => URLSearchParams,
  trackAction: (action: string) => void,
  action = 'copy_link'
): () => Promise<void> {
  const buildParamsRef = useRef(buildParams);
  buildParamsRef.current = buildParams;
  const trackActionRef = useRef(trackAction);
  trackActionRef.current = trackAction;
  const actionRef = useRef(action);
  actionRef.current = action;

  return useCallback(async () => {
    const params = buildParamsRef.current();
    const url = `${window.location.origin}${window.location.pathname}${
      params.toString() ? `?${params.toString()}` : ''
    }`;
    if (await copyToClipboard(url, 'Copied Shareable Link')) {
      trackActionRef.current(actionRef.current);
    }
  }, []);
}
