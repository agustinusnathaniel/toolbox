'use client';

import type { Dispatch, SetStateAction } from 'react';

import {
  useWorkerDeadline,
  useWorkerTrigger,
} from '@/lib/hooks/use-worker-deadline';
import type { SchemaValidationResult } from '@/lib/tools/json-schema-validator/adapters/json-schema-validator';

import type {
  JsonSchemaValidatorRequest,
  JsonSchemaValidatorResponse,
} from '../-worker/json-schema-validator.worker';
import JsonSchemaValidatorWorker from '../-worker/json-schema-validator.worker.ts?worker';

const JSON_SCHEMA_TIMEOUT_ERROR =
  'Validation took too long — the schema or document is too large. Try a smaller input.';

const TIMEOUT_RESULT: JsonSchemaValidatorState = {
  error: JSON_SCHEMA_TIMEOUT_ERROR,
  issues: [],
  isValid: false,
  timedOut: true,
  truncated: false,
};

type JsonSchemaValidatorState = SchemaValidationResult & {
  timedOut?: boolean;
};

export interface UseJsonSchemaValidatorReturn {
  computing: boolean;
  result: JsonSchemaValidatorState | null;
  setResult: Dispatch<SetStateAction<JsonSchemaValidatorState | null>>;
}

export function useJsonSchemaValidator(
  schema: string,
  document: string,
  trigger: number,
  workerFactory: () => Worker = () => new JsonSchemaValidatorWorker()
): UseJsonSchemaValidatorReturn {
  const { computing, result, setResult, postRequest } = useWorkerDeadline<
    JsonSchemaValidatorRequest,
    JsonSchemaValidatorResponse,
    JsonSchemaValidatorState
  >({
    buildRequest: (id) => ({
      document,
      id,
      schema,
    }),
    extractId: (response) => response.id,
    extractResult: (response) => response.result,
    timeoutResult: TIMEOUT_RESULT,
    workerFactory,
  });

  useWorkerTrigger(postRequest, trigger, false);

  return { computing, result, setResult };
}
