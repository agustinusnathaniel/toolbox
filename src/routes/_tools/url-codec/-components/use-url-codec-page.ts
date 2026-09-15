'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import type {
  UrlCodecDecodeResult,
  UrlCodecDirection,
} from '@/lib/tools/url-codec/adapters/url-codec';
import { decodeUrl, encodeUrl } from '@/lib/tools/url-codec/adapters/url-codec';
import {
  buildUrlCodecParams,
  buildUrlCodecStateFromSearch,
} from '@/lib/tools/url-codec/adapters/url-codec-params';

export function getUrlCodecResultLabel(
  direction: UrlCodecDirection,
  isValid: boolean
): string {
  if (!isValid) {
    return 'Invalid encoding';
  }
  return direction === 'encode' ? 'Encoded' : 'Decoded';
}

export function useUrlCodecPage(
  search: Parameters<typeof buildUrlCodecStateFromSearch>[0],
  trackAction: (a: string) => void,
  trackComplete: (v: boolean) => void
) {
  const [state, setState] = useState(() =>
    buildUrlCodecStateFromSearch(search)
  );
  const { copiedKey, copy } = useCopyFeedback();

  const result = useMemo<UrlCodecDecodeResult | null>(() => {
    if (!state.input.trim()) {
      return null;
    }
    if (state.direction === 'encode') {
      return { isValid: true, output: encodeUrl(state.input, state.mode) };
    }
    return decodeUrl(state.input, state.mode);
  }, [state.direction, state.input, state.mode]);

  useEffect(() => {
    if (result?.isValid && result.output.length > 0) {
      trackComplete(true);
    }
  }, [result, trackComplete]);

  const handleCopy = useCallback(async () => {
    if (!(result?.isValid && result.output)) {
      return;
    }
    const label =
      state.direction === 'encode'
        ? 'Copied encoded URL'
        : 'Copied decoded URL';
    if (await copy(result.output, 'copy', label)) {
      trackAction('copy');
    }
  }, [copy, result, state.direction, trackAction]);

  const handleCopyLink = useCopyShareableLink(
    () => buildUrlCodecParams(state),
    trackAction
  );

  return { copiedKey, handleCopy, handleCopyLink, result, setState, state };
}
