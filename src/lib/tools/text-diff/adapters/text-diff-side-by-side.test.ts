import { describe, expect, test } from 'vite-plus/test';

import { buildSideBySideRows, diffTexts } from './text-diff';

describe('buildSideBySideRows', () => {
  test('returns no rows for an empty stream', () => {
    expect(buildSideBySideRows([])).toEqual([]);
  });

  test('spans unchanged lines across both sides', () => {
    const result = diffTexts('alpha\nbeta\n', 'alpha\nbeta\n');
    const rows = buildSideBySideRows(result.lines);
    expect(rows).toHaveLength(2);
    rows.forEach((row, index) => {
      expect(row.left?.content).toBe(result.lines[index].content);
      expect(row.left?.type).toBe('unchanged');
      expect(row.right?.content).toBe(result.lines[index].content);
      expect(row.right?.type).toBe('unchanged');
    });
  });

  test('pairs an equal-count replacement into one row', () => {
    const result = diffTexts('hello world\n', 'hello there\n');
    expect(result.lines.map((line) => line.type)).toEqual(['removed', 'added']);
    const rows = buildSideBySideRows(result.lines);
    expect(rows).toHaveLength(1);
    expect(rows[0].left?.type).toBe('removed');
    expect(rows[0].left?.content).toBe('hello world');
    expect(rows[0].right?.type).toBe('added');
    expect(rows[0].right?.content).toBe('hello there');
  });

  test('gives pure insertions an empty left side', () => {
    const result = diffTexts('alpha\n', 'alpha\nbeta\n');
    const rows = buildSideBySideRows(result.lines);
    expect(rows).toHaveLength(2);
    expect(rows[0].left?.type).toBe('unchanged');
    expect(rows[0].right?.type).toBe('unchanged');
    expect(rows[0].right?.content).toBe('alpha');
    expect(rows[1].left).toBeUndefined();
    expect(rows[1].right?.type).toBe('added');
    expect(rows[1].right?.content).toBe('beta');
  });

  test('gives pure deletions an empty right side', () => {
    const result = diffTexts('alpha\nbeta\n', 'alpha\n');
    const rows = buildSideBySideRows(result.lines);
    expect(rows).toHaveLength(2);
    expect(rows[0].left?.type).toBe('unchanged');
    expect(rows[0].right?.type).toBe('unchanged');
    expect(rows[1].left?.type).toBe('removed');
    expect(rows[1].left?.content).toBe('beta');
    expect(rows[1].right).toBeUndefined();
  });

  test('pads leftover removed lines when the added side is shorter', () => {
    const result = diffTexts('a\nb\nc\n', 'a\nX\n');
    const rows = buildSideBySideRows(result.lines);
    expect(rows).toHaveLength(3);
    expect(rows[0].left?.content).toBe('a');
    expect(rows[0].right?.content).toBe('a');
    expect(rows[1].left?.content).toBe('b');
    expect(rows[1].left?.type).toBe('removed');
    expect(rows[1].right?.content).toBe('X');
    expect(rows[1].right?.type).toBe('added');
    expect(rows[2].left?.content).toBe('c');
    expect(rows[2].left?.type).toBe('removed');
    expect(rows[2].right).toBeUndefined();
  });

  test('pads leftover added lines when the removed side is shorter', () => {
    const result = diffTexts('a\nX\n', 'a\nb\nc\n');
    const rows = buildSideBySideRows(result.lines);
    expect(rows).toHaveLength(3);
    expect(rows[0].left?.content).toBe('a');
    expect(rows[0].right?.content).toBe('a');
    expect(rows[1].left?.content).toBe('X');
    expect(rows[1].left?.type).toBe('removed');
    expect(rows[1].right?.content).toBe('b');
    expect(rows[1].right?.type).toBe('added');
    expect(rows[2].left).toBeUndefined();
    expect(rows[2].right?.content).toBe('c');
    expect(rows[2].right?.type).toBe('added');
  });

  test('preserves inline chunks on both sides', () => {
    const result = diffTexts('hello world', 'hello there');
    const rows = buildSideBySideRows(result.lines);
    expect(rows).toHaveLength(1);
    expect(rows[0].left?.chunks).toEqual([
      { text: 'hello ', type: 'unchanged' },
      { text: 'world', type: 'removed' },
    ]);
    expect(rows[0].right?.chunks).toEqual([
      { text: 'hello ', type: 'unchanged' },
      { text: 'there', type: 'added' },
    ]);
  });

  test('rows count follows max-side semantics on mixed streams', () => {
    const result = diffTexts('a\nb\nc\nd\n', 'a\nX\nY\n');
    const rows = buildSideBySideRows(result.lines);
    const rowsWithLeft = rows.filter((row) => row.left).length;
    const rowsWithRight = rows.filter((row) => row.right).length;
    expect(rowsWithLeft).toBe(result.removedCount + 1);
    expect(rowsWithRight).toBe(result.addedCount + 1);
    expect(rows).toHaveLength(Math.max(rowsWithLeft, rowsWithRight));
  });

  test('pairs a mixed stream in order', () => {
    const result = diffTexts(
      'one\ntwo\nthree\nfour\n',
      'one\nTWO\nthree\nfour five\n'
    );
    const rows = buildSideBySideRows(result.lines);
    expect(rows.map((row) => row.left?.content)).toEqual([
      'one',
      'two',
      'three',
      'four',
    ]);
    expect(rows.map((row) => row.right?.content)).toEqual([
      'one',
      'TWO',
      'three',
      'four five',
    ]);
    expect(rows.map((row) => row.left?.type)).toEqual([
      'unchanged',
      'removed',
      'unchanged',
      'removed',
    ]);
    expect(rows.map((row) => row.right?.type)).toEqual([
      'unchanged',
      'added',
      'unchanged',
      'added',
    ]);
  });
});
