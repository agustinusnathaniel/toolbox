import type {
  WorkerRequest,
  WorkerResponse,
} from '@/lib/hooks/worker-protocol';
import {
  convertJsonToYaml,
  convertYamlToJson,
  type YamlConverterResult,
} from '@/lib/tools/yaml-converter/adapters/yaml-converter';
import type { YamlMode } from '@/lib/tools/yaml-converter/adapters/yaml-params';

export type YamlConverterRequest = WorkerRequest<{
  input: string;
  mode: YamlMode;
}>;

export type YamlConverterResponse = WorkerResponse<
  YamlConverterResult & { timedOut?: boolean }
>;

self.onmessage = (event: MessageEvent<YamlConverterRequest>) => {
  const { id, input, mode } = event.data;
  let result: YamlConverterResult;
  if (mode === 'yaml-to-json') {
    result = convertYamlToJson(input);
  } else {
    result = convertJsonToYaml(input);
  }
  const response: YamlConverterResponse = { id, result };
  self.postMessage(response);
};
