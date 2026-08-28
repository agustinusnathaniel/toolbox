export type YamlMode = 'json-to-yaml' | 'yaml-to-json';

const ALLOWED_MODES: ReadonlySet<string> = new Set([
  'json-to-yaml',
  'yaml-to-json',
]);
const DEFAULT_MODE: YamlMode = 'json-to-yaml';

function coerceMode(value: unknown): YamlMode {
  if (typeof value === 'string' && ALLOWED_MODES.has(value)) {
    return value as YamlMode;
  }
  return DEFAULT_MODE;
}

export interface YamlSearchParams {
  input?: string;
  mode?: string;
}

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
  const input = typeof search.input === 'string' ? search.input : '';
  const mode = coerceMode(search.mode);
  return { input, mode };
}
