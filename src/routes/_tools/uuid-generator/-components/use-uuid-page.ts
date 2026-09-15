'use client';

import { useCallback, useState } from 'react';

import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import type {
  UuidOptions,
  UuidResult,
} from '@/lib/tools/uuid-generator/adapters/uuid-generator';
import { generateUuids } from '@/lib/tools/uuid-generator/adapters/uuid-generator';
import { buildUuidParams } from '@/lib/tools/uuid-generator/adapters/uuid-params';
import { copyToClipboard } from '@/lib/utils/clipboard';

export function useUuidPage(
  initialOptions: UuidOptions,
  trackAction: (action: string) => void
) {
  const [options, setOptions] = useState<UuidOptions>(initialOptions);
  const [result, setResult] = useState<UuidResult | null>(null);
  const { copiedKey, copy } = useCopyFeedback<number>();

  const handleGenerate = useCallback(() => {
    setResult(generateUuids(options));
    trackAction('generate');
  }, [options, trackAction]);

  const handleCopy = useCallback(
    async (uuid: string, index: number) => {
      if (await copy(uuid, index, 'Copied UUID')) {
        trackAction('copy');
      }
    },
    [copy, trackAction]
  );

  const handleCopyAll = useCallback(async () => {
    if (
      result?.isValid &&
      result.uuids.length > 1 &&
      (await copyToClipboard(result.uuids.join('\n'), 'Copied all UUIDs'))
    ) {
      trackAction('copy_all');
    }
  }, [result, trackAction]);

  const handleCopyLink = useCopyShareableLink(
    () => buildUuidParams(options),
    trackAction
  );

  const clearResult = useCallback(() => setResult(null), []);

  return {
    clearResult,
    copiedKey,
    handleCopy,
    handleCopyAll,
    handleCopyLink,
    handleGenerate,
    options,
    result,
    setOptions,
  };
}
