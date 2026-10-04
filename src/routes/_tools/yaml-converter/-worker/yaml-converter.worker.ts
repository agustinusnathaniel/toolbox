import type {
  WorkerRequest,
  WorkerResponse,
} from '@/lib/hooks/worker-protocol';
import {
  convertJsonToYaml,
  convertYamlToJson,
} from '@/lib/tools/yaml-converter/adapters/yaml-converter';
import type { YamlMode } from '@/lib/tools/yaml-converter/adapters/yaml-params';
import type { TransformResult } from '@/lib/utils/transform';

export type YamlConverterRequest = WorkerRequest<{
  input: string;
  mode: YamlMode;
}>;

export type YamlConverterResponse = WorkerResponse<
  TransformResult & { timedOut?: boolean }
>;

self.onmessage = (event: MessageEvent<YamlConverterRequest>) => {
  const { id, input, mode } = event.data;
  let result: TransformResult;
  if (mode === 'yaml-to-json') {
    result = convertYamlToJson(input);
  } else {
    result = convertJsonToYaml(input);
  }
  const response: YamlConverterResponse = { id, result };
  self.postMessage(response);
};
