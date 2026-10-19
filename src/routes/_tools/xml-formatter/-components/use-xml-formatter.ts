'use client';

import { type Dispatch, type SetStateAction, useEffect } from 'react';

import { useWorkerDeadline } from '@/lib/hooks/use-worker-deadline';
import type { XmlIndent } from '@/lib/tools/xml-formatter/adapters/xml-formatter';
import type { XmlAction } from '@/lib/tools/xml-formatter/adapters/xml-params';
import type { TransformResult } from '@/lib/utils/transform';

import type {
  XmlFormatterRequest,
  XmlFormatterResponse,
} from '../-worker/xml-formatter.worker';
import XmlFormatterWorker from '../-worker/xml-formatter.worker.ts?worker';

export const XML_FORMATTER_TIMEOUT_ERROR =
  'Processing took too long — the input is too large. Try a smaller file.';

const TIMEOUT_RESULT: TransformResult & { timedOut: true } = {
  error: XML_FORMATTER_TIMEOUT_ERROR,
  isValid: false,
  output: '',
  timedOut: true,
};

type XmlFormatterState = TransformResult & { timedOut?: boolean };

export interface UseXmlFormatterReturn {
  computing: boolean;
  result: XmlFormatterState | null;
  setResult: Dispatch<SetStateAction<XmlFormatterState | null>>;
}

export function useXmlFormatter(
  input: string,
  indent: XmlIndent,
  action: XmlAction,
  trigger: number,
  workerFactory: () => Worker = () => new XmlFormatterWorker()
): UseXmlFormatterReturn {
  const { computing, result, setResult, postRequest } = useWorkerDeadline<
    XmlFormatterRequest,
    XmlFormatterResponse,
    XmlFormatterState
  >({
    buildRequest: (id) => ({
      action,
      id,
      indent,
      input,
    }),
    extractId: (response) => response.id,
    extractResult: (response) => response.result,
    timeoutResult: TIMEOUT_RESULT,
    workerFactory,
  });

  // Explicit-run semantics (matches the pre-worker page): formatting only runs
  // when the trigger bumps via a Run button. Edits clear the result instead of
  // recomputing. trigger alone drives execution; input/indent/action are read
  // from the latest buildRequest closure at post time.
  useEffect(() => {
    if (trigger <= 0) {
      return;
    }
    postRequest();
  }, [postRequest, trigger]);

  return { computing, result, setResult };
}
