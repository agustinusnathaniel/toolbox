import type {
  WorkerRequest,
  WorkerResponse,
} from '@/lib/hooks/worker-protocol';
import {
  type SchemaValidationResult,
  validateJsonAgainstSchema,
} from '@/lib/tools/json-schema-validator/adapters/json-schema-validator';

export interface JsonSchemaValidatorRequest
  extends WorkerRequest<{
    document: string;
    schema: string;
  }> {}

export type JsonSchemaValidatorResponse =
  WorkerResponse<SchemaValidationResult>;

self.onmessage = (event: MessageEvent<JsonSchemaValidatorRequest>) => {
  const { document, id, schema } = event.data;
  const result = validateJsonAgainstSchema(schema, document);
  const response: JsonSchemaValidatorResponse = { id, result };
  self.postMessage(response);
};
