export interface JsonFormatterResult {
  error?: string;
  formatted: string;
  isValid: boolean;
}

export function formatJson(input: string, indent = 2): JsonFormatterResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { error: 'Input is empty', formatted: '', isValid: false };
  }
  try {
    const parsed = JSON.parse(trimmed);
    return { formatted: JSON.stringify(parsed, null, indent), isValid: true };
  } catch (e) {
    return { error: (e as Error).message, formatted: '', isValid: false };
  }
}

export function validateJson(input: string): JsonFormatterResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { error: 'Input is empty', formatted: '', isValid: false };
  }
  try {
    const parsed = JSON.parse(trimmed);
    return { formatted: JSON.stringify(parsed), isValid: true };
  } catch (e) {
    return { error: (e as Error).message, formatted: '', isValid: false };
  }
}

export function minifyJson(input: string): JsonFormatterResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { error: 'Input is empty', formatted: '', isValid: false };
  }
  try {
    const parsed = JSON.parse(trimmed);
    return { formatted: JSON.stringify(parsed), isValid: true };
  } catch (e) {
    return { error: (e as Error).message, formatted: '', isValid: false };
  }
}
