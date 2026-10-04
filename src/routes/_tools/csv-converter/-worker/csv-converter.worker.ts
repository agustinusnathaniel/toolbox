import type {
  WorkerRequest,
  WorkerResponse,
} from '@/lib/hooks/worker-protocol';
import {
  type CsvMode,
  csvToJson,
  jsonToCsv,
} from '@/lib/tools/csv-converter/adapters/csv-converter';
import type { TransformResult } from '@/lib/utils/transform';

export type CsvConverterRequest = WorkerRequest<{
  input: string;
  mode: CsvMode;
}>;

export type CsvConverterResponse = WorkerResponse<TransformResult>;

self.onmessage = (event: MessageEvent<CsvConverterRequest>) => {
  const { id, input, mode } = event.data;
  const result = mode === 'json-to-csv' ? jsonToCsv(input) : csvToJson(input);
  const response: CsvConverterResponse = { id, result };
  self.postMessage(response);
};
