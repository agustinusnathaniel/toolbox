import { coerceEnum, readString } from '@/lib/utils/search-params';

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
  const params = new URLSearchParams();
  if (input !== '') {
    params.set('input', input);
  }
  params.set('mode', mode);
  return params;
}

export function buildYamlStateFromSearch(search: Record<string, unknown>): {
  input: string;
  mode: YamlMode;
} {
  const input = readString(search.input);
  const mode = coerceEnum(search.mode, ALLOWED_MODES, DEFAULT_MODE);
  return { input, mode };
}
