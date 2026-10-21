'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import type { SubnetCalcResult } from '@/lib/tools/subnet-calculator/adapters/subnet-calculator';
import { calculateSubnet } from '@/lib/tools/subnet-calculator/adapters/subnet-calculator';
import {
  buildSubnetCalculatorParams,
  buildSubnetCalculatorStateFromSearch,
} from '@/lib/tools/subnet-calculator/adapters/subnet-calculator-params';

export function useSubnetCalculatorPage(
  search: Parameters<typeof buildSubnetCalculatorStateFromSearch>[0],
  trackAction: (a: string) => void,
  trackComplete: (v: boolean) => void
) {
  const [state, setState] = useState(() =>
    buildSubnetCalculatorStateFromSearch(search)
  );
  const { copiedKey, copy } = useCopyFeedback();

  const result = useMemo<SubnetCalcResult | null>(() => {
    if (!state.input.trim()) {
      return null;
    }
    return calculateSubnet(state.input);
  }, [state.input]);

  useEffect(() => {
    if (result?.isValid) {
      trackComplete(true);
    }
  }, [result, trackComplete]);

  const handleCopyPart = useCallback(
    async (value: string, key: string, label: string) => {
      if (await copy(value, key, label)) {
        trackAction('copy');
      }
    },
    [copy, trackAction]
  );

  const handleCopyLink = useCopyShareableLink(
    () => buildSubnetCalculatorParams(state),
    trackAction
  );

  return { copiedKey, handleCopyLink, handleCopyPart, result, setState, state };
}
