export interface TextStats {
  averageWordLength: number;
  bytesUtf8: number;
  characters: number;
  charactersNoSpaces: number;
  lines: number;
  longestWordLength: number;
  paragraphs: number;
  readingTimeMinutes: number;
  readingTimeText: string;
  sentences: number;
  words: number;
}

const WHITESPACE_SPLIT_RE = /\s+/;
const WHITESPACE_RE = /\s/g;
const PARAGRAPH_SPLIT_RE = /\n\s*\n+/;
const SENTENCE_RE = /[^.!?]+[.!?]+/g;

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) {
    return 0;
  }
  return trimmed.split(WHITESPACE_SPLIT_RE).filter(Boolean).length;
}

function countLines(text: string): number {
  if (!text) {
    return 0;
  }
  return text.split('\n').length;
}

function countParagraphs(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) {
    return 0;
  }
  return trimmed.split(PARAGRAPH_SPLIT_RE).filter((p) => p.trim()).length;
}

function countSentences(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) {
    return 0;
  }
  const matches = trimmed.match(SENTENCE_RE);
  if (matches) {
    return matches.length;
  }
  return countWords(text) > 0 ? 1 : 0;
}

function getWords(text: string): Array<string> {
  const trimmed = text.trim();
  if (!trimmed) {
    return [];
  }
  return trimmed.split(WHITESPACE_SPLIT_RE).filter(Boolean);
}

function getLongestWordLength(words: Array<string>): number {
  let max = 0;
  for (const w of words) {
    if (w.length > max) {
      max = w.length;
    }
  }
  return max;
}

function formatReadingTime(minutes: number): string {
  if (minutes === 0) {
    return '0 sec';
  }
  if (minutes < 1) {
    const seconds = Math.ceil(minutes * 60);
    return `${seconds} sec`;
  }
  if (minutes === 1) {
    return '1 min';
  }
  return `${minutes} min`;
}

export function computeTextStats(input: string): TextStats {
  const characters = input.length;
  const charactersNoSpaces = input.replace(WHITESPACE_RE, '').length;
  const words = countWords(input);
  const lines = countLines(input);
  const paragraphs = countParagraphs(input);
  const sentences = countSentences(input);
  const bytesUtf8 = new TextEncoder().encode(input).length;
  const wordList = getWords(input);
  const longestWordLength = getLongestWordLength(wordList);
  const averageWordLength =
    words === 0 ? 0 : Math.round((charactersNoSpaces / words) * 10) / 10;
  const rawMinutes = words / 200;
  const readingTimeMinutes = words === 0 ? 0 : Math.ceil(rawMinutes);
  let readingTimeValue = readingTimeMinutes;
  if (words === 0) {
    readingTimeValue = 0;
  } else if (rawMinutes < 1) {
    readingTimeValue = rawMinutes;
  }
  const readingTimeText = formatReadingTime(readingTimeValue);
  return {
    averageWordLength,
    bytesUtf8,
    characters,
    charactersNoSpaces,
    lines,
    longestWordLength,
    paragraphs,
    readingTimeMinutes,
    readingTimeText,
    sentences,
    words,
  };
}

export function buildStatsSummary(stats: TextStats): string {
  return [
    `${stats.words} words`,
    `${stats.characters} characters`,
    `${stats.lines} lines`,
    `${stats.readingTimeText} read`,
  ].join(' | ');
}
