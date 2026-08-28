import { dump, load } from 'js-yaml';

export interface YamlConverterResult {
  error?: string;
  isValid: boolean;
  output: string;
}

export function convertJsonToYaml(json: string): YamlConverterResult {
  const trimmed = json.trim();
  if (!trimmed) {
    return { error: 'Input is empty', isValid: false, output: '' };
  }
  try {
    const parsed = JSON.parse(trimmed);
    const yaml = dump(parsed, { indent: 2, lineWidth: -1 });
    return { isValid: true, output: yaml };
  } catch (e) {
    return { error: (e as Error).message, isValid: false, output: '' };
  }
}

export function convertYamlToJson(yaml: string): YamlConverterResult {
  const trimmed = yaml.trim();
  if (!trimmed) {
    return { error: 'Input is empty', isValid: false, output: '' };
  }
  try {
    const parsed = load(trimmed);
    // js-yaml returns undefined for empty/invalid that doesn't throw
    if (parsed === undefined) {
      return { error: 'Input is empty', isValid: false, output: '' };
    }
    const json = JSON.stringify(parsed, null, 2);
    return { isValid: true, output: json };
  } catch (e) {
    return { error: (e as Error).message, isValid: false, output: '' };
  }
}
