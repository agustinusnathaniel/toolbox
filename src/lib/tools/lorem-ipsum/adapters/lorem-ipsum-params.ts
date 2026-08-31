import type { LoremIpsumOutputFormat } from './lorem-ipsum';

export interface LoremIpsumSearchParams {
  format?: string;
  paragraphs?: string;
  sentences?: string;
  startWithLorem?: string;
  wordsMax?: string;
  wordsMin?: string;
}

export interface LoremIpsumParamsState {
  format: LoremIpsumOutputFormat;
  paragraphs: number;
  sentencesPerParagraph: number;
  startWithLorem: boolean;
  wordsMax: number;
  wordsMin: number;
}

const DEFAULTS: LoremIpsumParamsState = {
  format: 'plain',
  paragraphs: 3,
  sentencesPerParagraph: 5,
  startWithLorem: true,
  wordsMax: 15,
  wordsMin: 8,
};

function parseIntClamped(
  value: string | undefined,
  min: number,
  max: number,
  fallback: number
): number {
  if (value === undefined) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  if (parsed < min) {
    return min;
  }
  if (parsed > max) {
    return max;
  }
  return Math.floor(parsed);
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  return fallback;
}

function parseFormat(value: string | undefined): LoremIpsumOutputFormat {
  if (value === 'html' || value === 'plain') {
    return value;
  }
  return DEFAULTS.format;
}

export function buildLoremIpsumParams(
  state: LoremIpsumParamsState
): URLSearchParams {
  const params = new URLSearchParams();
  if (state.paragraphs !== DEFAULTS.paragraphs) {
    params.set('paragraphs', String(state.paragraphs));
  }
  if (state.sentencesPerParagraph !== DEFAULTS.sentencesPerParagraph) {
    params.set('sentences', String(state.sentencesPerParagraph));
  }
  if (state.wordsMin !== DEFAULTS.wordsMin) {
    params.set('wordsMin', String(state.wordsMin));
  }
  if (state.wordsMax !== DEFAULTS.wordsMax) {
    params.set('wordsMax', String(state.wordsMax));
  }
  if (state.startWithLorem !== DEFAULTS.startWithLorem) {
    params.set('startWithLorem', String(state.startWithLorem));
  }
  if (state.format !== DEFAULTS.format) {
    params.set('format', state.format);
  }
  return params;
}

export function buildLoremIpsumStateFromSearch(
  search: LoremIpsumSearchParams
): LoremIpsumParamsState {
  let wordsMin = parseIntClamped(search.wordsMin, 1, 50, DEFAULTS.wordsMin);
  let wordsMax = parseIntClamped(search.wordsMax, 1, 50, DEFAULTS.wordsMax);
  if (wordsMin > wordsMax) {
    [wordsMin, wordsMax] = [wordsMax, wordsMin];
  }
  return {
    format: parseFormat(search.format),
    paragraphs: parseIntClamped(search.paragraphs, 1, 50, DEFAULTS.paragraphs),
    sentencesPerParagraph: parseIntClamped(
      search.sentences,
      1,
      10,
      DEFAULTS.sentencesPerParagraph
    ),
    startWithLorem: parseBoolean(
      search.startWithLorem,
      DEFAULTS.startWithLorem
    ),
    wordsMax,
    wordsMin,
  };
}
