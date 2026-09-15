'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import { convertTimestamp } from '@/lib/tools/timestamp-converter/adapters/timestamp-converter';
import { buildTimestampParams } from '@/lib/tools/timestamp-converter/adapters/timestamp-params';

export function useTimestampPage(
  initial: string,
  trackAction: (a: string) => void,
  trackComplete: (v: boolean) => void
) {
  const [input, setInput] = useState(initial);
  const { copiedKey, copy } = useCopyFeedback();
  const result = useMemo(() => convertTimestamp(input), [input]);

  useEffect(() => {
    trackAction('view');
    trackComplete(true);
  }, [trackAction, trackComplete]);

  const handleCopy = useCallback(
    async (key: string, value: string, label: string) => {
      if (await copy(value, key, label)) {
        trackAction('copy');
      }
    },
    [copy, trackAction]
  );

  const handleUseNow = useCallback(() => {
    setInput(String(Math.floor(Date.now() / 1000)));
    trackAction('use_now');
  }, [trackAction]);

  const handleCopyLink = useCopyShareableLink(
    () => buildTimestampParams(input),
    trackAction
  );

  return {
    copiedKey,
    handleCopy,
    handleCopyLink,
    handleUseNow,
    input,
    result,
    setInput,
  };
}
