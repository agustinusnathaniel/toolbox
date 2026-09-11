import { LoremIpsum } from 'lorem-ipsum';

export type LoremIpsumOutputFormat = 'plain' | 'html';

export interface LoremIpsumOptions {
  format: LoremIpsumOutputFormat;
  paragraphs: number;
  sentencesPerParagraph: number;
  startWithLorem: boolean;
  wordsPerSentence: { min: number; max: number };
}

const LOREM_START = 'Lorem ipsum dolor sit amet';
const LOREM_START_WORDS = 5;

function clampInt(
  value: number,
  min: number,
  max: number,
  fallback: number
): number {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  const floored = Math.floor(value);
  if (floored < min) {
    return min;
  }
  if (floored > max) {
    return max;
  }
  return floored;
}

function applyLoremStart(paragraph: string): string {
  const sentenceEnd = paragraph.indexOf('.');
  const firstSentence = paragraph.slice(0, sentenceEnd + 1);
  const tail = firstSentence.split(' ').slice(LOREM_START_WORDS).join(' ');
  const patched = tail ? `${LOREM_START} ${tail}` : `${LOREM_START}.`;
  return patched + paragraph.slice(sentenceEnd + 1);
}

export function generateLoremIpsum(options: LoremIpsumOptions): string {
  const { format, startWithLorem } = options;
  if (options.paragraphs <= 0) {
    return '';
  }
  const paragraphs = clampInt(options.paragraphs, 1, 50, 3);
  const sentencesPerParagraph = clampInt(
    options.sentencesPerParagraph,
    1,
    10,
    5
  );
  let wordMin = clampInt(options.wordsPerSentence.min, 1, 50, 8);
  let wordMax = clampInt(options.wordsPerSentence.max, 1, 50, 15);
  if (wordMin > wordMax) {
    [wordMin, wordMax] = [wordMax, wordMin];
  }
  const separator = format === 'html' ? '\n' : '\n\n';
  const lorem = new LoremIpsum(
    {
      random: Math.random,
      sentencesPerParagraph: {
        max: sentencesPerParagraph,
        min: sentencesPerParagraph,
      },
      wordsPerSentence: { max: wordMax, min: wordMin },
    },
    format,
    separator
  );
  if (!startWithLorem) {
    return lorem.generateParagraphs(paragraphs);
  }
  const first = lorem.formatString(
    applyLoremStart(lorem.generator.generateRandomParagraph())
  );
  if (paragraphs === 1) {
    return first;
  }
  return `${first}${separator}${lorem.generateParagraphs(paragraphs - 1)}`;
}
