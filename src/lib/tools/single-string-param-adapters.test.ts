import { describe, expect, test } from 'vite-plus/test';

import { buildBase64Params } from './base64/adapters/base64-params';
import { buildCaseParams } from './case-converter/adapters/case-params';
import { buildColorParams } from './color-converter/adapters/color-params';
import { buildCronParams } from './cron-parser/adapters/cron-params';
import { buildJsonParams } from './json-formatter/adapters/json-params';
import { buildJsonToTsParams } from './json-to-ts/adapters/json-to-ts-params';
import { buildJwtParams } from './jwt-decoder/adapters/jwt-params';
import { buildMarkdownParams } from './markdown-preview/adapters/markdown-params';
import { buildTextStatsParams } from './text-stats/adapters/text-stats-params';
import { buildTimestampParams } from './timestamp-converter/adapters/timestamp-params';
import { buildUaParams } from './ua-check/adapters/ua-params';

const ADAPTERS: ReadonlyArray<{
  build: (value: string) => URLSearchParams;
  key: string;
  name: string;
}> = [
  { build: buildBase64Params, key: 'input', name: 'buildBase64Params' },
  { build: buildCaseParams, key: 'input', name: 'buildCaseParams' },
  { build: buildColorParams, key: 'c', name: 'buildColorParams' },
  { build: buildCronParams, key: 'expression', name: 'buildCronParams' },
  { build: buildJsonParams, key: 'input', name: 'buildJsonParams' },
  { build: buildJsonToTsParams, key: 'input', name: 'buildJsonToTsParams' },
  { build: buildJwtParams, key: 'token', name: 'buildJwtParams' },
  { build: buildMarkdownParams, key: 'input', name: 'buildMarkdownParams' },
  { build: buildTextStatsParams, key: 'input', name: 'buildTextStatsParams' },
  { build: buildTimestampParams, key: 'ts', name: 'buildTimestampParams' },
  { build: buildUaParams, key: 'ua', name: 'buildUaParams' },
];

describe('singleStringParam adapters', () => {
  test.each(ADAPTERS)(
    '$name carries the value under $key',
    ({ build, key }) => {
      expect(build('hello world').get(key)).toBe('hello world');
    }
  );

  test.each(ADAPTERS)(
    '$name preserves whitespace in a non-blank value',
    ({ build, key }) => {
      expect(build('  hello world  ').get(key)).toBe('  hello world  ');
    }
  );

  test.each(ADAPTERS)(
    '$name yields empty params for blank and whitespace-only input',
    ({ build }) => {
      expect(build('').toString()).toBe('');
      expect(build('   ').toString()).toBe('');
    }
  );
});
