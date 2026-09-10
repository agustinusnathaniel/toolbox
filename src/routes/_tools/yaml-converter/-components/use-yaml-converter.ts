'use client';

import { type Dispatch, type SetStateAction, useEffect } from 'react';

import { useWorkerDeadline } from '@/lib/hooks/use-worker-deadline';
import type { YamlConverterResult } from '@/lib/tools/yaml-converter/adapters/yaml-converter';
import type { YamlMode } from '@/lib/tools/yaml-converter/adapters/yaml-params';

import type {
  YamlConverterRequest,
  YamlConverterResponse,
} from '../-worker/yaml-converter.worker';
import YamlConverterWorker from '../-worker/yaml-converter.worker.ts?worker';

const YAML_CONVERTER_TIMEOUT_ERROR =
  'Conversion took too long — the input is too large. Try a smaller file.';

const TIMEOUT_RESULT: YamlConverterResult & { timedOut: true } = {
  error: YAML_CONVERTER_TIMEOUT_ERROR,
  isValid: false,
  output: '',
  timedOut: true,
};

type YamlConverterState = YamlConverterResult & { timedOut?: boolean };

export interface UseYamlConverterReturn {
  computing: boolean;
  result: YamlConverterState | null;
  setResult: Dispatch<SetStateAction<YamlConverterState | null>>;
}

export function useYamlConverter(
  input: string,
  mode: YamlMode,
  trigger: number,
  workerFactory: () => Worker = () => new YamlConverterWorker()
): UseYamlConverterReturn {
  const { computing, result, setResult, postRequest } = useWorkerDeadline<
    YamlConverterRequest,
    YamlConverterResponse,
    YamlConverterState
  >({
    buildRequest: (id) => ({
      id,
      input,
      mode,
    }),
    extractId: (response) => response.id,
    extractResult: (response) => response.result,
    timeoutResult: TIMEOUT_RESULT,
    workerFactory,
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: input/mode captured via buildRequest closure, trigger drives execution
  useEffect(() => {
    if (trigger <= 0) {
      return;
    }
    if (!input.trim()) {
      setResult(null);
      return;
    }
    postRequest();
  }, [input, mode, postRequest, setResult, trigger]);

  return { computing, result, setResult };
}
