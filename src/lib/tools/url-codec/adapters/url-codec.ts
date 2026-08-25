export type UrlCodecDirection = 'decode' | 'encode';
export type UrlCodecMode = 'component' | 'full';

export interface UrlCodecDecodeResult {
  error?: string;
  isValid: boolean;
  output: string;
}

export function encodeUrl(input: string, mode: UrlCodecMode): string {
  return mode === 'component' ? encodeURIComponent(input) : encodeURI(input);
}

export function decodeUrl(
  input: string,
  mode: UrlCodecMode
): UrlCodecDecodeResult {
  try {
    return {
      isValid: true,
      output:
        mode === 'component' ? decodeURIComponent(input) : decodeURI(input),
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Malformed percent-encoding sequence',
      isValid: false,
      output: '',
    };
  }
}
