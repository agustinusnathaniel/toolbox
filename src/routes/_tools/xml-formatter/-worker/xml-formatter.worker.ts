import type {
  WorkerRequest,
  WorkerResponse,
} from '@/lib/hooks/worker-protocol';
import {
  formatXml,
  minifyXml,
  validateXml,
  type XmlIndent,
} from '@/lib/tools/xml-formatter/adapters/xml-formatter';
import type { XmlAction } from '@/lib/tools/xml-formatter/adapters/xml-params';
import type { TransformResult } from '@/lib/utils/transform';

export type XmlFormatterRequest = WorkerRequest<{
  action: XmlAction;
  indent: XmlIndent;
  input: string;
}>;

export type XmlFormatterResponse = WorkerResponse<
  TransformResult & { timedOut?: boolean }
>;

self.onmessage = (event: MessageEvent<XmlFormatterRequest>) => {
  const { id, input, indent, action } = event.data;
  let result: TransformResult;
  if (action === 'minify') {
    result = minifyXml(input);
  } else if (action === 'validate') {
    const validation = validateXml(input);
    result = validation.valid
      ? { isValid: true, output: '' }
      : { error: validation.error, isValid: false, output: '' };
  } else {
    result = formatXml(input, indent);
  }
  const response: XmlFormatterResponse = { id, result };
  self.postMessage(response);
};
