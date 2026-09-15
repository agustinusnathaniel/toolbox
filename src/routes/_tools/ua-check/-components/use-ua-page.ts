'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import { parseUserAgent } from '@/lib/tools/ua-check/adapters/ua-check';
import { buildUaParams } from '@/lib/tools/ua-check/adapters/ua-params';

export function useUaPage(
  initialUa: string | undefined,
  trackAction: (a: string) => void,
  trackComplete: (v: boolean) => void
) {
  const [uaInput, setUaInput] = useState(
    initialUa ?? (typeof navigator === 'undefined' ? '' : navigator.userAgent)
  );
  const result = useMemo(() => parseUserAgent(uaInput), [uaInput]);

  useEffect(() => {
    trackAction('view');
    trackComplete(true);
  }, [trackAction, trackComplete]);

  const handleUseMyUA = useCallback(() => {
    setUaInput(navigator.userAgent);
    trackAction('use_my_ua');
  }, [trackAction]);

  const handleCopyLink = useCopyShareableLink(
    () => buildUaParams(uaInput),
    trackAction
  );

  return { handleCopyLink, handleUseMyUA, result, setUaInput, uaInput };
}
