import {
  type RegexTestResult,
  testRegex,
} from '@/lib/tools/regex-tester/adapters/regex';

export interface RegexTesterRequest {
  flags: string;
  id: string;
  input: string;
  pattern: string;
}

export interface RegexTesterResponse {
  id: string;
  result: RegexTestResult;
}

self.onmessage = (event: MessageEvent<RegexTesterRequest>) => {
  const { flags, id, input, pattern } = event.data;
  const result = testRegex(pattern, flags, input);
  const response: RegexTesterResponse = { id, result };
  self.postMessage(response);
};
