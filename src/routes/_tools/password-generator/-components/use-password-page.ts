'use client';

import { useCallback, useMemo, useState } from 'react';

import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import type { PasswordResult } from '@/lib/tools/password-generator/adapters/password-generator';
import {
  estimateEntropy,
  generatePassword,
} from '@/lib/tools/password-generator/adapters/password-generator';
import {
  buildPasswordParams,
  buildPasswordStateFromSearch,
} from '@/lib/tools/password-generator/adapters/password-params';

export function usePasswordPage(
  search: Parameters<typeof buildPasswordStateFromSearch>[0],
  trackAction: (a: string) => void
) {
  const [options, setOptions] = useState(() =>
    buildPasswordStateFromSearch(search)
  );
  const [result, setResult] = useState<PasswordResult | null>(null);
  const { copiedKey, copy } = useCopyFeedback();

  const handleGenerate = useCallback(() => {
    setResult(generatePassword(options));
    trackAction('generate');
  }, [options, trackAction]);

  const handleCopy = useCallback(async () => {
    if (!(result?.isValid && result.output)) {
      return;
    }
    if (await copy(result.output, 'copy', 'Copied password')) {
      trackAction('copy');
    }
  }, [result, copy, trackAction]);

  const handleCopyLink = useCopyShareableLink(
    () => buildPasswordParams(options),
    trackAction
  );

  const entropy = useMemo(() => estimateEntropy(options), [options]);

  return {
    copiedKey,
    entropy,
    handleCopy,
    handleCopyLink,
    handleGenerate,
    options,
    result,
    setOptions,
  };
}
