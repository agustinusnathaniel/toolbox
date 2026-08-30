export type LoremIpsumOutputFormat = 'plain' | 'html';

export interface LoremIpsumOptions {
  format: LoremIpsumOutputFormat;
  paragraphs: number;
  sentencesPerParagraph: number;
  startWithLorem: boolean;
  wordsPerSentence: { min: number; max: number };
}

const WORDS: ReadonlyArray<string> = [
  'lorem',
  'ipsum',
  'dolor',
  'sit',
  'amet',
  'consectetur',
  'adipiscing',
  'elit',
  'sed',
  'do',
  'eiusmod',
  'tempor',
  'incididunt',
  'ut',
  'labore',
  'et',
  'dolore',
  'magna',
  'aliqua',
  'enim',
  'ad',
  'minim',
  'veniam',
  'quis',
  'nostrud',
  'exercitation',
  'ullamco',
  'laboris',
  'nisi',
  'aliquip',
  'ex',
  'ea',
  'commodo',
  'consequat',
  'duis',
  'aute',
  'irure',
  'in',
  'reprehenderit',
  'voluptate',
  'velit',
  'esse',
  'cillum',
  'fugiat',
  'nulla',
  'pariatur',
  'excepteur',
  'sint',
  'occaecat',
  'cupidatat',
  'non',
  'proident',
  'sunt',
  'culpa',
  'qui',
  'officia',
  'deserunt',
  'mollit',
  'anim',
  'id',
  'est',
  'laborum',
  'perspiciatis',
  'unde',
  'omnis',
  'iste',
  'natus',
  'error',
  'voluptatem',
  'accusantium',
  'doloremque',
  'laudantium',
  'totam',
  'rem',
  'aperiam',
  'eaque',
  'ipsa',
  'quae',
  'ab',
  'illo',
  'inventore',
  'veritatis',
  'et',
  'quasi',
  'architecto',
  'beatae',
  'vitae',
  'dicta',
  'sunt',
  'explicabo',
  'nemo',
  'enim',
  'ipsam',
  'quia',
  'voluptas',
  'aspernatur',
  'aut',
  'odit',
  'fugit',
  'sed',
  'quia',
  'consequuntur',
  'magni',
  'dolores',
  'eos',
  'ratione',
  'sequi',
  'nesciunt',
  'neque',
  'porro',
  'quisquam',
  'dolorem',
  'adipisci',
  'numquam',
  'eius',
  'modi',
  'tempora',
  'incidunt',
  'magnam',
  'aliquam',
  'quaerat',
  'enim',
  'minima',
  'veniam',
  'nostrum',
  'exercitationem',
  'ullam',
  'corporis',
  'suscipit',
  'laboriosam',
  'nisi',
  'aliquid',
  'commodi',
  'consequatur',
  'autem',
  'eum',
  'iure',
  'reprehenderit',
  'voluptate',
  'esse',
  'quam',
  'nihil',
  'molestiae',
  'illum',
  'qui',
  'dolorem',
  'eum',
  'fugiat',
  'quo',
  'voluptas',
  'nulla',
  'pariatur',
  'at',
  'vero',
  'eos',
  'accusamus',
  'iusto',
  'odio',
  'dignissimos',
  'ducimus',
  'blanditiis',
  'praesentium',
  'voluptatum',
  'deleniti',
  'atque',
  'corrupti',
  'quos',
  'dolores',
  'quas',
  'molestias',
  'excepturi',
  'sint',
  'occaecati',
  'cupiditate',
  'provident',
  'similique',
  'sunt',
  'culpa',
  'officia',
  'deserunt',
  'mollitia',
  'animi',
  'laborum',
  'et',
  'dolorum',
  'fuga',
  'harum',
  'quidem',
  'rerum',
  'facilis',
  'expedita',
  'distinctio',
  'nam',
  'libero',
  'tempore',
  'cum',
  'soluta',
  'nobis',
  'eligendi',
  'optio',
  'cumque',
  'nihil',
  'impedit',
  'quo',
  'minus',
] as const;

const LOREM_START = ['Lorem', 'ipsum', 'dolor', 'sit', 'amet'];

const WORDS_SPLIT_RE = /\s+/;

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

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function capitalize(word: string): string {
  if (!word) {
    return word;
  }
  return word[0].toUpperCase() + word.slice(1);
}

function pickWord(): string {
  const idx = randomInt(0, WORDS.length - 1);
  return WORDS[idx];
}

function generateSentence(wordMin: number, wordMax: number): string {
  const count = randomInt(wordMin, wordMax);
  const words: Array<string> = [];
  for (let i = 0; i < count; i += 1) {
    words.push(pickWord());
  }
  words[0] = capitalize(words[0]);
  return `${words.join(' ')}.`;
}

function generateParagraph(
  sentencesPerParagraph: number,
  wordMin: number,
  wordMax: number,
  isFirstParagraph: boolean,
  startWithLorem: boolean
): string {
  const sentences: Array<string> = [];
  for (let i = 0; i < sentencesPerParagraph; i += 1) {
    let sentence = generateSentence(wordMin, wordMax);
    if (isFirstParagraph && i === 0 && startWithLorem) {
      const extraWords = sentence.split(' ');
      const loremCount = LOREM_START.length;
      if (extraWords.length >= loremCount) {
        const tail = extraWords.slice(loremCount).join(' ');
        sentence = tail
          ? `${LOREM_START.join(' ')} ${tail}`
          : `${LOREM_START.join(' ')}.`;
        if (!sentence.endsWith('.')) {
          sentence = `${sentence}.`;
        }
      } else {
        sentence = `${LOREM_START.join(' ')}.`;
      }
    }
    sentences.push(sentence);
  }
  return sentences.join(' ');
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) {
    return 0;
  }
  return trimmed.split(WORDS_SPLIT_RE).filter(Boolean).length;
}

export function generateLoremIpsum(options: LoremIpsumOptions): string {
  const { startWithLorem, format } = options;
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
  const parts: Array<string> = [];
  for (let p = 0; p < paragraphs; p += 1) {
    const para = generateParagraph(
      sentencesPerParagraph,
      wordMin,
      wordMax,
      p === 0,
      startWithLorem
    );
    parts.push(para);
  }
  if (format === 'html') {
    return parts.map((p) => `<p>${p}</p>`).join('\n');
  }
  return parts.join('\n\n');
}
