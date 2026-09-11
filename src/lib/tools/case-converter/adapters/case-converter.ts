import {
  camelCase,
  constantCase,
  kebabCase,
  pascalCase,
  snakeCase,
  splitSeparateNumbers,
} from 'change-case';

export type CaseFormat =
  | 'camel'
  | 'pascal'
  | 'snake'
  | 'kebab'
  | 'screamingSnake'
  | 'title'
  | 'lower'
  | 'upper';

export interface CaseConverterResult {
  formats: Record<CaseFormat, string>;
  isValid: boolean;
  wordCount: number;
}

const EMPTY_FORMATS: Record<CaseFormat, string> = {
  camel: '',
  kebab: '',
  lower: '',
  pascal: '',
  screamingSnake: '',
  snake: '',
  title: '',
  upper: '',
};

// Word-delimited formats keep digit chunks separate; camel/pascal stay on the
// package default so a digit run does not gain an underscore.
const SEPARATE_DIGITS_OPTIONS = { split: splitSeparateNumbers } as const;

function toTitleWord(word: string): string {
  if (word.length >= 2 && word.length <= 3 && word === word.toUpperCase()) {
    return word;
  }
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function splitWords(input: string): Array<string> {
  return splitSeparateNumbers(input.trim());
}

export function convertCase(input: string): CaseConverterResult {
  const words = splitWords(input);
  if (words.length === 0) {
    return { formats: EMPTY_FORMATS, isValid: false, wordCount: 0 };
  }
  return {
    formats: {
      camel: camelCase(input),
      kebab: kebabCase(input, SEPARATE_DIGITS_OPTIONS),
      lower: words.map((word) => word.toLowerCase()).join(' '),
      pascal: pascalCase(input),
      screamingSnake: constantCase(input, SEPARATE_DIGITS_OPTIONS),
      snake: snakeCase(input, SEPARATE_DIGITS_OPTIONS),
      title: words.map(toTitleWord).join(' '),
      upper: words.map((word) => word.toUpperCase()).join(' '),
    },
    isValid: true,
    wordCount: words.length,
  };
}
