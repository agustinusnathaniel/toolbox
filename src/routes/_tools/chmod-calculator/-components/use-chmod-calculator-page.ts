'use client';

import { useCallback, useState } from 'react';

import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import {
  bitsToSymbolic,
  type ChmodBits,
  type ChmodExample,
  DEFAULT_CHMOD_OCTAL,
  modeToOctal,
  octalToBits,
  symbolicToBits,
} from '@/lib/tools/chmod-calculator/adapters/chmod-calculator';
import type { ChmodCalculatorState } from '@/lib/tools/chmod-calculator/adapters/chmod-calculator-params';
import {
  buildChmodCalculatorParams,
  buildChmodCalculatorStateFromSearch,
  type ChmodCalculatorSearchParams,
} from '@/lib/tools/chmod-calculator/adapters/chmod-calculator-params';

export type ChmodPermissionClass = 'group' | 'other' | 'owner';
export type ChmodPermission = 'execute' | 'read' | 'write';
export type ChmodSpecial = 'setgid' | 'setuid' | 'sticky';

type CopyKey = 'command' | 'octal' | 'symbolic';

function fallbackBits(): ChmodBits {
  return (
    octalToBits(DEFAULT_CHMOD_OCTAL) ?? {
      group: { execute: true, read: true, write: false },
      other: { execute: true, read: true, write: false },
      owner: { execute: true, read: true, write: true },
      setgid: false,
      setuid: false,
      sticky: false,
    }
  );
}

function useChmodTextFields(
  initialBits: ChmodBits,
  onValidBits: (next: ChmodBits) => void
) {
  const [octalText, setOctalText] = useState(() => modeToOctal(initialBits));
  const [symbolicText, setSymbolicText] = useState(() =>
    bitsToSymbolic(initialBits)
  );
  const [octalError, setOctalError] = useState<string | null>(null);
  const [symbolicError, setSymbolicError] = useState<string | null>(null);

  const syncTexts = useCallback((next: ChmodBits) => {
    setOctalText(modeToOctal(next));
    setSymbolicText(bitsToSymbolic(next));
    setOctalError(null);
    setSymbolicError(null);
  }, []);

  const updateOctalText = useCallback(
    (value: string) => {
      setOctalText(value);
      const parsed = octalToBits(value);
      if (parsed === null) {
        setOctalError('Use 3 or 4 octal digits (0-7), e.g. 755 or 4755.');
        return;
      }
      onValidBits(parsed);
      syncTexts(parsed);
    },
    [onValidBits, syncTexts]
  );

  const updateSymbolicText = useCallback(
    (value: string) => {
      setSymbolicText(value);
      const parsed = symbolicToBits(value);
      if (parsed === null) {
        setSymbolicError(
          'Use 9 characters from r w x s S t T -, e.g. rwxr-xr-x.'
        );
        return;
      }
      onValidBits(parsed);
      syncTexts(parsed);
    },
    [onValidBits, syncTexts]
  );

  return {
    octalError,
    octalText,
    symbolicError,
    symbolicText,
    syncTexts,
    updateOctalText,
    updateSymbolicText,
  };
}

function useChmodCopyActions(octal: string, trackAction: (a: string) => void) {
  const { copiedKey, copy } = useCopyFeedback<CopyKey>();

  const handleCopy = useCallback(
    async (text: string, key: CopyKey) => {
      if (await copy(text, key, 'Copied')) {
        trackAction('copy');
      }
    },
    [copy, trackAction]
  );

  const handleCopyLink = useCopyShareableLink(
    () => buildChmodCalculatorParams({ mode: octal }),
    trackAction
  );

  return { copiedKey, handleCopy, handleCopyLink };
}

function useChmodToggles(
  applyBits: (next: ChmodBits) => void,
  bits: ChmodBits,
  trackAction: (a: string) => void
) {
  const togglePermission = useCallback(
    (klass: ChmodPermissionClass, permission: ChmodPermission) => {
      applyBits({
        ...bits,
        [klass]: { ...bits[klass], [permission]: !bits[klass][permission] },
      });
      trackAction('toggle');
    },
    [applyBits, bits, trackAction]
  );

  const toggleSpecial = useCallback(
    (bit: ChmodSpecial) => {
      applyBits({ ...bits, [bit]: !bits[bit] });
      trackAction('toggle');
    },
    [applyBits, bits, trackAction]
  );

  return { togglePermission, toggleSpecial };
}

function useChmodExampleLoader(
  applyBits: (next: ChmodBits) => void,
  trackAction: (a: string) => void
) {
  return useCallback(
    (example: ChmodExample) => {
      const parsed = octalToBits(example.octal);
      if (parsed !== null) {
        applyBits(parsed);
      }
      trackAction('example');
    },
    [applyBits, trackAction]
  );
}

export function useChmodCalculatorPage(
  search: ChmodCalculatorSearchParams,
  trackAction: (a: string) => void
) {
  const [initial] = useState<ChmodCalculatorState>(() =>
    buildChmodCalculatorStateFromSearch(search)
  );
  const initialBits = octalToBits(initial.mode) ?? fallbackBits();
  const [bits, setBits] = useState(initialBits);
  const text = useChmodTextFields(initialBits, setBits);

  const octal = modeToOctal(bits);
  const symbolic = bitsToSymbolic(bits);
  const command = `chmod ${octal} filename`;
  const copyActions = useChmodCopyActions(octal, trackAction);

  const applyBits = useCallback(
    (next: ChmodBits) => {
      setBits(next);
      text.syncTexts(next);
    },
    [text]
  );

  const toggles = useChmodToggles(applyBits, bits, trackAction);
  const loadExample = useChmodExampleLoader(applyBits, trackAction);

  return {
    bits,
    command,
    copiedKey: copyActions.copiedKey,
    handleCopy: copyActions.handleCopy,
    handleCopyLink: copyActions.handleCopyLink,
    loadExample,
    octal,
    octalError: text.octalError,
    octalText: text.octalText,
    symbolic,
    symbolicError: text.symbolicError,
    symbolicText: text.symbolicText,
    togglePermission: toggles.togglePermission,
    toggleSpecial: toggles.toggleSpecial,
    updateOctalText: text.updateOctalText,
    updateSymbolicText: text.updateSymbolicText,
  };
}
