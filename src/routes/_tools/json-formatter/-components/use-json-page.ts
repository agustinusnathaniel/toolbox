'use client';

import { useCallback, useState } from 'react';

import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import { buildJsonParams } from '@/lib/tools/json-formatter/adapters/json-params';

import { useJsonFormatter } from './use-json-formatter';

type JsonAction = 'format' | 'validate' | 'minify';

export function useJsonPage(
  initialInput: string,
  trackAction: (a: string) => void
) {
  const [input, setInput] = useState(initialInput);
  const { copiedKey, copy } = useCopyFeedback();
  const [activeAction, setActiveAction] = useState<JsonAction | null>(null);
  const [trigger, setTrigger] = useState(0);
  const { computing, result, setResult } = useJsonFormatter(
    input,
    activeAction,
    trigger
  );

  const runAction = useCallback(
    (action: JsonAction) => {
      setResult(null);
      setActiveAction(action);
      setTrigger((t) => t + 1);
      trackAction(action);
    },
    [setResult, trackAction]
  );

  const handleCopy = useCallback(async () => {
    if (!(result?.isValid && result.formatted)) {
      return;
    }
    if (await copy(result.formatted, 'copy', 'Copied JSON')) {
      trackAction('copy');
    }
  }, [result, copy, trackAction]);

  const handleCopyLink = useCopyShareableLink(
    () => buildJsonParams(input),
    trackAction
  );

  const updateInput = useCallback(
    (v: string) => {
      setInput(v);
      setResult(null);
    },
    [setResult]
  );

  return {
    activeAction,
    computing,
    copiedKey,
    handleCopy,
    handleCopyLink,
    input,
    result,
    runAction,
    updateInput,
  };
}
