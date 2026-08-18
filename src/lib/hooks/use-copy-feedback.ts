'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { copyToClipboard } from '@/lib/utils/clipboard';

const FEEDBACK_DURATION_MS = 1500;

/**
 * Encapsulates the copy-to-clipboard + temporary feedback pattern used
 * across every tool. Returns a `copy` function that writes to the
 * clipboard, shows a toast, and flips a `copiedKey` state for
 * FEEDBACK_DURATION_MS so the UI can show a checkmark.
 *
 * `copiedKey` is `null` when no copy is active, or an opaque key
 * identifying which copy action succeeded (string | number).
 */
export function useCopyFeedback<TKey extends string | number = string>() {
  const [copiedKey, setCopiedKey] = useState<TKey | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    },
    []
  );

  const copy = useCallback(
    async (text: string, key: TKey, label = 'Copied'): Promise<boolean> => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
      const ok = await copyToClipboard(text, label);
      if (ok) {
        setCopiedKey(key);
        timerRef.current = setTimeout(() => {
          setCopiedKey(null);
          timerRef.current = null;
        }, FEEDBACK_DURATION_MS);
      }
      return ok;
    },
    []
  );

  return { copiedKey, copy };
}
