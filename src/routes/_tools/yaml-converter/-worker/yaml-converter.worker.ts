import {
  convertJsonToYaml,
  convertYamlToJson,
  type YamlConverterResult,
} from '@/lib/tools/yaml-converter/adapters/yaml-converter';

export type YamlMode = 'json-to-yaml' | 'yaml-to-json';

export interface YamlConverterRequest {
  id: string;
  input: string;
  mode: YamlMode;
}

export interface YamlConverterResponse {
  id: string;
  result: YamlConverterResult & { timedOut?: boolean };
}

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
