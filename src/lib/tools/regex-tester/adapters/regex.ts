interface RegexMatch {
  full: string;
  groups: Array<string | undefined>;
  index: number;
}

export interface RegexTestResult {
  error?: string;
  isValid: boolean;
  matchCount: number;
  matches: Array<RegexMatch>;
  timedOut?: boolean;
}

export function testRegex(
  pattern: string,
  flags: string,
  input: string
): RegexTestResult {
  if (pattern.trim() === '') {
    return { isValid: true, matchCount: 0, matches: [] };
  }

  let regex: RegExp;
  try {
    regex = new RegExp(pattern, flags.includes('g') ? flags : `${flags}g`);
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : String(err),
      isValid: false,
      matchCount: 0,
      matches: [],
    };
  }

  const matches: Array<RegexMatch> = [];
  let match: RegExpExecArray | null = regex.exec(input);
  while (match !== null) {
    matches.push({
      full: match[0],
      groups: match.slice(1),
      index: match.index,
    });

    if (match[0] === '' && regex.lastIndex === match.index) {
      regex.lastIndex += 1;
    }
    match = regex.exec(input);
  }

  return { isValid: true, matchCount: matches.length, matches };
}
