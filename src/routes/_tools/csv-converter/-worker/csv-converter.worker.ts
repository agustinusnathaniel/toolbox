import {
  type CsvConverterResult,
  type CsvMode,
  csvToJson,
  jsonToCsv,
} from '@/lib/tools/csv-converter/adapters/csv-converter';

export interface CsvConverterRequest {
  id: string;
  input: string;
  mode: CsvMode;
}

export interface CsvConverterResponse {
  id: string;
  result: CsvConverterResult;
}

self.onmessage = (event: MessageEvent<CsvConverterRequest>) => {
  const { id, input, mode } = event.data;
  const result = mode === 'json-to-csv' ? jsonToCsv(input) : csvToJson(input);
  const response: CsvConverterResponse = { id, result };
  self.postMessage(response);
};
