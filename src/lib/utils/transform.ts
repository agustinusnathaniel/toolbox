/**
 * Shared adapter scaffold for tools that turn a text input into a text
 * output. Rejects empty input, runs the transform, and surfaces thrown
 * errors as a result field instead of an exception.
 */
export interface TransformResult {
  error?: string;
  isValid: boolean;
  output: string;
}

export function runTransform(
  input: string,
  transform: (trimmed: string) => string
): TransformResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { error: 'Input is empty', isValid: false, output: '' };
  }
  try {
    return { isValid: true, output: transform(trimmed) };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Invalid input',
      isValid: false,
      output: '',
    };
  }
}
