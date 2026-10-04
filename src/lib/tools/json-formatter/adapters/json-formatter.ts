import { runTransform, type TransformResult } from '@/lib/utils/transform';

export function formatJson(input: string, indent = 2): TransformResult {
  return runTransform(input, (trimmed) =>
    JSON.stringify(JSON.parse(trimmed), null, indent)
  );
}

export function minifyJson(input: string): TransformResult {
  return runTransform(input, (trimmed) => JSON.stringify(JSON.parse(trimmed)));
}

export function validateJson(input: string): TransformResult {
  return minifyJson(input);
}
