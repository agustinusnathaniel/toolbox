'use client';

import { useCallback, useMemo, useState } from 'react';

import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import {
  changedForms,
  type InspectedChar,
  type InspectionSummary,
  inspectCharacters,
  type NormalizationForm,
  normalizeAllForms,
  summarizeInspection,
} from '@/lib/tools/unicode-inspector/adapters/unicode-inspector';
import {
  buildUnicodeParams,
  buildUnicodeStateFromSearch,
} from '@/lib/tools/unicode-inspector/adapters/unicode-params';

/** Rows rendered in the character table; the rest is counted, not mounted. */
export const MAX_RENDERED_CHARS = 500;

export interface UnicodeInspection {
  changed: Array<NormalizationForm>;
  chars: Array<InspectedChar>;
  forms: Record<NormalizationForm, string>;
  summary: InspectionSummary;
  truncated: boolean;
  visible: Array<InspectedChar>;
}

export function useUnicodePage(
  search: Parameters<typeof buildUnicodeStateFromSearch>[0],
  trackAction: (action: string) => void
) {
  const [state, setState] = useState(() => buildUnicodeStateFromSearch(search));
  const { copiedKey, copy } = useCopyFeedback();

  const inspection = useMemo<UnicodeInspection | null>(() => {
    if (!state.input) {
      return null;
    }
    const chars = inspectCharacters(state.input);
    const forms = normalizeAllForms(state.input);
    return {
      changed: changedForms(state.input, forms),
      chars,
      forms,
      summary: summarizeInspection(state.input, chars),
      truncated: chars.length > MAX_RENDERED_CHARS,
      visible: chars.slice(0, MAX_RENDERED_CHARS),
    };
  }, [state.input]);

  const handleInputChange = useCallback((input: string) => {
    setState((prev) => ({ ...prev, input }));
  }, []);

  const handleClear = useCallback(() => {
    setState((prev) => ({ ...prev, input: '' }));
  }, []);

  const handleCopyForm = useCallback(
    async (form: NormalizationForm) => {
      const value = inspection?.forms[form];
      if (!value) {
        return;
      }
      if (await copy(value, `form-${form}`, `Copied ${form}`)) {
        trackAction('copy-form');
      }
    },
    [inspection, copy, trackAction]
  );

  const handleCopyLink = useCopyShareableLink(
    () => buildUnicodeParams(state.input),
    trackAction
  );

  return {
    copiedKey,
    handleClear,
    handleCopyForm,
    handleCopyLink,
    handleInputChange,
    inspection,
    state,
  };
}
