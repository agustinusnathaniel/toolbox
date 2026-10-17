'use client';

import { useCallback, useState } from 'react';

import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import {
  formatXml,
  minifyXml,
  validateXml,
  type XmlIndent,
} from '@/lib/tools/xml-formatter/adapters/xml-formatter';
import {
  buildXmlParams,
  buildXmlStateFromSearch,
} from '@/lib/tools/xml-formatter/adapters/xml-params';
import type { TransformResult } from '@/lib/utils/transform';

export type XmlAction = 'format' | 'minify' | 'validate';

export function useXmlPage(
  search: Parameters<typeof buildXmlStateFromSearch>[0],
  trackAction: (action: string) => void
) {
  const [state, setState] = useState(() => buildXmlStateFromSearch(search));
  const [activeAction, setActiveAction] = useState<XmlAction | null>(null);
  const [result, setResult] = useState<TransformResult | null>(null);
  const { copiedKey, copy } = useCopyFeedback();

  const runAction = useCallback(
    (action: XmlAction) => {
      setActiveAction(action);
      if (action === 'validate') {
        const validation = validateXml(state.input);
        setResult(
          validation.valid
            ? { isValid: true, output: '' }
            : {
                error: validation.error,
                isValid: false,
                output: '',
              }
        );
      } else if (action === 'minify') {
        setResult(minifyXml(state.input));
      } else {
        setResult(formatXml(state.input, state.indent));
      }
      trackAction(action);
    },
    [state.indent, state.input, trackAction]
  );

  const handleInputChange = useCallback((input: string) => {
    setState((prev) => ({ ...prev, input }));
    setResult(null);
  }, []);

  const handleIndentChange = useCallback((indent: XmlIndent) => {
    setState((prev) => ({ ...prev, indent }));
    setResult(null);
  }, []);

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
