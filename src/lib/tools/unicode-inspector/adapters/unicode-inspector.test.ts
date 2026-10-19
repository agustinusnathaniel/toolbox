import { describe, expect, test } from 'vite-plus/test';

import {
  categorizeChar,
  changedForms,
  flagLabel,
  formatCodePoint,
  inspectCharacters,
  normalizeAllForms,
  summarizeInspection,
  utf8ByteLength,
} from './unicode-inspector';

describe('formatCodePoint', () => {
  test('pads BMP code points to four digits', () => {
    expect(formatCodePoint(0x41)).toBe('U+0041');
  });

  test('uses five digits above the BMP', () => {
    expect(formatCodePoint(0x1_f6_00)).toBe('U+1F600');
  });
});

describe('categorizeChar', () => {
  test('classifies letters, numbers, and punctuation', () => {
    expect(categorizeChar('A')).toBe('letter');
    expect(categorizeChar('7')).toBe('number');
    expect(categorizeChar('!')).toBe('punctuation');
  });

  test('classifies whitespace as separator and newline as control', () => {
    expect(categorizeChar(' ')).toBe('separator');
    expect(categorizeChar('\n')).toBe('control');
  });

  test('classifies zero-width joiner as format', () => {
    expect(categorizeChar('‍')).toBe('format');
  });

  test('classifies emoji as symbol', () => {
    expect(categorizeChar('😀')).toBe('symbol');
  });

  test('classifies combining marks as mark', () => {
    expect(categorizeChar('́')).toBe('mark');
  });
});

describe('inspectCharacters', () => {
  test('returns no rows for empty input', () => {
    expect(inspectCharacters('')).toEqual([]);
  });

  test('inspects ASCII with single-byte UTF-8 and UTF-16', () => {
    const [row] = inspectCharacters('A');
    expect(row.codePoint).toBe('U+0041');
    expect(row.utf8).toBe('41');
    expect(row.utf16).toBe('0041');
    expect(row.category).toBe('letter');
    expect(row.invisible).toBe(false);
    expect(row.suspicious).toBe(false);
    expect(row.name).toBeNull();
  });

  test('keeps astral characters as one row with surrogate-pair UTF-16', () => {
    const [row] = inspectCharacters('😀');
    expect(row.codePoint).toBe('U+1F600');
    expect(row.utf8).toBe('F0 9F 98 80');
    expect(row.utf16).toBe('D83D DE00');
  });

  test('assigns zero-based positions in order', () => {
    const rows = inspectCharacters('AB');
    expect(rows.map((row) => row.index)).toEqual([0, 1]);
    expect(rows.map((row) => row.char)).toEqual(['A', 'B']);
  });

  test('names zero width space without flagging it suspicious', () => {
    const [row] = inspectCharacters('​');
    expect(row.codePoint).toBe('U+200B');
    expect(row.invisible).toBe(true);
    expect(row.suspicious).toBe(false);
    expect(row.name).toBe('Zero Width Space');
  });

  test('flags right-to-left override as suspicious', () => {
    const [row] = inspectCharacters('‮');
    expect(row.codePoint).toBe('U+202E');
    expect(row.invisible).toBe(true);
    expect(row.suspicious).toBe(true);
    expect(row.name).toBe('Right-to-Left Override');
  });

  test('names non-breaking space', () => {
    const [row] = inspectCharacters(' ');
    expect(row.name).toBe('No-Break Space');
    expect(row.invisible).toBe(true);
  });

  test('marks newline invisible without a table name', () => {
    const [row] = inspectCharacters('\n');
    expect(row.category).toBe('control');
    expect(row.invisible).toBe(true);
    expect(row.name).toBeNull();
  });

  test('measures euro sign as three UTF-8 bytes', () => {
    const [row] = inspectCharacters('€');
    expect(row.utf8).toBe('E2 82 AC');
  });
});

describe('normalizeAllForms', () => {
  test('leaves plain ASCII unchanged in every form', () => {
    const forms = normalizeAllForms('hello');
    expect(forms.NFC).toBe('hello');
    expect(forms.NFD).toBe('hello');
    expect(forms.NFKC).toBe('hello');
    expect(forms.NFKD).toBe('hello');
  });

  test('decomposes precomposed e-acute in NFD', () => {
    const forms = normalizeAllForms('é');
    expect(forms.NFC).toBe('é');
    expect(forms.NFD).toBe('é');
    expect(forms.NFD.length).toBe(2);
  });

  test('folds the fi ligature in compatibility forms', () => {
    const forms = normalizeAllForms('ﬁ');
    expect(forms.NFC).toBe('ﬁ');
    expect(forms.NFKC).toBe('fi');
    expect(forms.NFKD).toBe('fi');
  });
});

describe('changedForms', () => {
  test('reports no changes for ASCII', () => {
    expect(changedForms('abc', normalizeAllForms('abc'))).toEqual([]);
  });

  test('reports only the forms that differ', () => {
    expect(changedForms('ﬁ', normalizeAllForms('ﬁ'))).toEqual(['NFKC', 'NFKD']);
  });
});

describe('utf8ByteLength', () => {
  test('counts ASCII as one byte per character', () => {
    expect(utf8ByteLength('abc')).toBe(3);
  });

  test('counts astral characters as four bytes', () => {
    expect(utf8ByteLength('😀')).toBe(4);
  });
});

describe('flagLabel', () => {
  test('prefers suspicious over invisible', () => {
    const [row] = inspectCharacters('‮');
    expect(flagLabel(row)).toBe('suspicious');
  });

  test('uses the table name for named invisibles', () => {
    const [row] = inspectCharacters('​');
    expect(flagLabel(row)).toBe('Zero Width Space');
  });

  test('falls back to invisible without a table name', () => {
    const [row] = inspectCharacters('\n');
    expect(flagLabel(row)).toBe('invisible');
  });

  test('marks visible characters with an em dash', () => {
    const [row] = inspectCharacters('A');
    expect(flagLabel(row)).toBe('—');
  });
});

describe('summarizeInspection', () => {
  test('summarizes a clean string with zero flags', () => {
    const input = 'Hi!';
    const summary = summarizeInspection(input, inspectCharacters(input));
    expect(summary.totalCodePoints).toBe(3);
    expect(summary.utf8ByteLength).toBe(3);
    expect(summary.invisibleCount).toBe(0);
    expect(summary.suspiciousCount).toBe(0);
  });

  test('counts invisible and suspicious characters separately', () => {
    const input = 'a​‮';
    const summary = summarizeInspection(input, inspectCharacters(input));
    expect(summary.totalCodePoints).toBe(3);
    expect(summary.invisibleCount).toBe(2);
    expect(summary.suspiciousCount).toBe(1);
  });
});
