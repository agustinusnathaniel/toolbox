'use client';

import { useCallback, useState } from 'react';

import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import type { XmlIndent } from '@/lib/tools/xml-formatter/adapters/xml-formatter';
import {
  buildXmlParams,
  buildXmlStateFromSearch,
  type XmlAction,
} from '@/lib/tools/xml-formatter/adapters/xml-params';

import { useXmlFormatter } from './use-xml-formatter';

export function useXmlPage(
  search: Parameters<typeof buildXmlStateFromSearch>[0],
  trackAction: (action: string) => void
) {
  const [state, setState] = useState(() => buildXmlStateFromSearch(search));
  const [activeAction, setActiveAction] = useState<XmlAction | null>(null);
  const [formatTrigger, setFormatTrigger] = useState(0);
  const { copiedKey, copy } = useCopyFeedback();
  const { computing, result, setResult } = useXmlFormatter(
    state.input,
    state.indent,
    activeAction ?? 'format',
    formatTrigger
  );

  const runAction = useCallback(
    (action: XmlAction) => {
      setActiveAction(action);
      setResult(null);
      setFormatTrigger((t) => t + 1);
      trackAction(action);
    },
    [setResult, trackAction]
  );

  const handleInputChange = useCallback(
    (input: string) => {
      setState((prev) => ({ ...prev, input }));
      setResult(null);
    },
    [setResult]
  );

  const handleIndentChange = useCallback(
    (indent: XmlIndent) => {
      setState((prev) => ({ ...prev, indent }));
      setResult(null);
    },
    [setResult]
  );

  const handleCopy = useCallback(async () => {
    if (!(result?.isValid && result.output)) {
      return;
    }
    if (await copy(result.output, 'copy', 'Copied XML')) {
      trackAction('copy');
    }
  }, [result, copy, trackAction]);

  const handleCopyLink = useCopyShareableLink(
    () => buildXmlParams(state.input, state.indent),
    trackAction
  );

  return {
    activeAction,
    computing,
    copiedKey,
    handleCopy,
    handleCopyLink,
    handleIndentChange,
    handleInputChange,
    result,
    runAction,
    state,
  };
}
