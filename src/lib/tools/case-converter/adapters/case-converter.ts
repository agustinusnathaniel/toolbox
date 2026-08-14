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

const WORD_CHUNK_RE = /\p{Lu}+(?=\p{Lu}\p{Ll})|\p{Lu}?\p{Ll}+|\p{Lu}+|\p{N}+/gu;

export function splitWords(input: string): Array<string> {
  const trimmed = input.trim();
  if (!trimmed) {
    return [];
  }
  return trimmed.match(WORD_CHUNK_RE) ?? [];
}

function lowercase(word: string): string {
  return word.toLowerCase();
}

function uppercase(word: string): string {
  return word.toUpperCase();
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function toTitleWord(word: string): string {
  if (word.length >= 2 && word.length <= 3 && word === uppercase(word)) {
    return word;
  }
  return capitalize(word);
}

function buildFormats(words: Array<string>): Record<CaseFormat, string> {
  const [first, ...rest] = words;
  return {
    camel: lowercase(first) + rest.map(capitalize).join(''),
    kebab: words.map(lowercase).join('-'),
    lower: words.map(lowercase).join(' '),
    pascal: words.map(capitalize).join(''),
    screamingSnake: words.map(uppercase).join('_'),
    snake: words.map(lowercase).join('_'),
    title: words.map(toTitleWord).join(' '),
    upper: words.map(uppercase).join(' '),
  };
}

export function convertCase(input: string): CaseConverterResult {
  const words = splitWords(input);
  if (words.length === 0) {
    return { formats: EMPTY_FORMATS, isValid: false, wordCount: 0 };
  }
  return {
    formats: buildFormats(words),
    isValid: true,
    wordCount: words.length,
  };
}
