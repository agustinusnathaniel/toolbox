'use client';

import { useCallback, useEffect, useState } from 'react';

import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import { buildMarkdownParams } from '@/lib/tools/markdown-preview/adapters/markdown-params';

import { useMarkdownPreview } from './use-markdown-preview';

export function useMarkdownPage(
  initialInput: string,
  trackAction: (a: string) => void
) {
  const [input, setInput] = useState(initialInput);
  const { copiedKey, copy } = useCopyFeedback();
  const [trigger, setTrigger] = useState(0);
  const {
    computing,
    result: workerResult,
    setResult,
  } = useMarkdownPreview(input, trigger);

  useEffect(() => {
    if (input.trim()) {
      setTrigger((t) => t + 1);
    } else {
      setResult({ html: '', isEmpty: true });
    }
  }, [input, setResult]);

  const result = workerResult ?? { html: '', isEmpty: true };

  const handleCopyHtml = useCallback(async () => {
    if (result.isEmpty || !result.html) {
      return;
    }
    if (await copy(result.html, 'html', 'Copied HTML')) {
      trackAction('copy_html');
    }
  }, [copy, result.html, result.isEmpty, trackAction]);

  const handleCopyLink = useCopyShareableLink(
    () => buildMarkdownParams(input),
    trackAction
  );

  const handleClear = useCallback(() => {
    setInput('');
    trackAction('clear');
  }, [trackAction]);

  return {
    computed: result,
    computing,
    copiedKey,
    handleClear,
    handleCopyHtml,
    handleCopyLink,
    input,
    setInput,
  };
}
