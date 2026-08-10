export interface RegexSearchParams {
  flags?: string;
  input?: string;
  pattern?: string;
}

export function buildRegexParams(
  pattern: string,
  flags: string,
  input: string
): URLSearchParams {
  const params = new URLSearchParams();
  if (pattern.trim()) {
    params.set('pattern', pattern);
  }
  if (flags.trim()) {
    params.set('flags', flags);
  }
  if (input) {
    params.set('input', input);
  }
  return params;
}

export function buildRegexStateFromSearch(search: RegexSearchParams): {
  pattern: string;
  flags: string;
  input: string;
} {
  return {
    flags: search.flags ?? '',
    input: search.input ?? '',
    pattern: search.pattern ?? '',
  };
}
