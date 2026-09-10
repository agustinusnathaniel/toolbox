import type {
  WorkerRequest,
  WorkerResponse,
} from '@/lib/hooks/worker-protocol';
import {
  type RegexTestResult,
  testRegex,
} from '@/lib/tools/regex-tester/adapters/regex';

export type RegexTesterRequest = WorkerRequest<{
  flags: string;
  input: string;
  pattern: string;
}>;

export type RegexTesterResponse = WorkerResponse<RegexTestResult>;

self.onmessage = (event: MessageEvent<RegexTesterRequest>) => {
  const { flags, id, input, pattern } = event.data;
  const result = testRegex(pattern, flags, input);
  const response: RegexTesterResponse = { id, result };
  self.postMessage(response);
};
