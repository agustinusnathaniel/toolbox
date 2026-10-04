import {
  coerceEnum,
  readString,
  recordToSearchParams,
  trimmed,
} from '@/lib/utils/search-params';

export type YamlMode = 'json-to-yaml' | 'yaml-to-json';

const ALLOWED_MODES: ReadonlySet<YamlMode> = new Set<YamlMode>([
  'json-to-yaml',
  'yaml-to-json',
]);
const DEFAULT_MODE: YamlMode = 'json-to-yaml';

export function buildYamlParams(
  input: string,
  mode: YamlMode
): URLSearchParams {
  return recordToSearchParams({
    input: trimmed(input),
    mode,
  });
}

export function buildYamlStateFromSearch(search: Record<string, unknown>): {
  input: string;
  mode: YamlMode;
} {
  return {
    input: readString(search.input),
    mode: coerceEnum(search.mode, ALLOWED_MODES, DEFAULT_MODE),
  };
}
