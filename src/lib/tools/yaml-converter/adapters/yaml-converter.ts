import { dump, load } from 'js-yaml';

import { runTransform, type TransformResult } from '@/lib/utils/transform';

export function convertJsonToYaml(json: string): TransformResult {
  return runTransform(json, (trimmed) =>
    dump(JSON.parse(trimmed), { indent: 2, lineWidth: -1 })
  );
}

export function convertYamlToJson(yaml: string): TransformResult {
  return runTransform(yaml, (trimmed) => {
    const parsed = load(trimmed);
    // js-yaml returns undefined for empty/invalid that doesn't throw
    if (parsed === undefined) {
      throw new Error('Input is empty');
    }
    return JSON.stringify(parsed, null, 2);
  });
}
