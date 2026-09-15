'use client';

import { useCallback, useState } from 'react';

import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import { buildJsonToTsParams } from '@/lib/tools/json-to-ts/adapters/json-to-ts-params';

import { useJsonToTs } from './use-json-to-ts';

export function useJsonToTsPage(
  initialInput: string,
  trackAction: (a: string) => void
) {
  const [input, setInput] = useState(initialInput);
  const [generateTrigger, setGenerateTrigger] = useState(0);
  const { copiedKey, copy } = useCopyFeedback();
  const { computing, result, setResult } = useJsonToTs(input, generateTrigger);

  const handleGenerate = useCallback(() => {
    setResult(null);
    setGenerateTrigger((t) => t + 1);
    trackAction('generate');
  }, [setResult, trackAction]);

  const handleCopy = useCallback(async () => {
    if (!(result?.isValid && result.output)) {
      return;
    }
    if (await copy(result.output, 'copy', 'Copied TypeScript')) {
      trackAction('copy');
    }
  }, [result, copy, trackAction]);

  const handleCopyLink = useCopyShareableLink(
    () => buildJsonToTsParams(input),
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
    computing,
    copiedKey,
    handleCopy,
    handleCopyLink,
    handleGenerate,
    input,
    result,
    updateInput,
  };
}
