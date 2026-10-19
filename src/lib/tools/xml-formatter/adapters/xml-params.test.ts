import { describe, expect, test } from 'vite-plus/test';

import { buildXmlParams, buildXmlStateFromSearch } from './xml-params';

describe('buildXmlParams', () => {
  test('builds params with input and indent', () => {
    const params = buildXmlParams('<root/>', '2');
    expect(params.get('input')).toBe('<root/>');
    expect(params.get('indent')).toBe('2');
  });

  test('builds params with tab indent', () => {
    const params = buildXmlParams('<root/>', 'tab');
    expect(params.get('indent')).toBe('tab');
  });

  test('omits input when empty', () => {
    const params = buildXmlParams('', '2');
    expect(params.has('input')).toBe(false);
    expect(params.get('indent')).toBe('2');
  });

  test('preserves all indent values', () => {
    for (const indent of ['2', '4', 'tab'] as const) {
      const params = buildXmlParams('x', indent);
      expect(params.get('indent')).toBe(indent);
    }
  });
});

describe('buildXmlStateFromSearch', () => {
  test('parses valid search', () => {
    const state = buildXmlStateFromSearch({
      indent: '4',
      input: '<root/>',
    });
    expect(state.input).toBe('<root/>');
    expect(state.indent).toBe('4');
  });

  test('defaults indent when invalid', () => {
    const state = buildXmlStateFromSearch({
      indent: '8',
      input: 'test',
    });
    expect(state.indent).toBe('2');
  });

  test('handles empty search', () => {
    const state = buildXmlStateFromSearch({});
    expect(state.input).toBe('');
    expect(state.indent).toBe('2');
  });

  test('handles non-string input', () => {
    const state = buildXmlStateFromSearch({ indent: '2', input: 123 });
    expect(state.input).toBe('');
    expect(state.indent).toBe('2');
  });

  test('preserves numeric-looking string input', () => {
    const state = buildXmlStateFromSearch({ indent: '2', input: '123' });
    expect(state.input).toBe('123');
    expect(typeof state.input).toBe('string');
  });

  test('round-trip build -> parse', () => {
    const params = buildXmlParams('<root><a>1</a></root>', 'tab');
    const search: Record<string, unknown> = {};
    for (const [k, v] of params.entries()) {
      search[k] = v;
    }
    const state = buildXmlStateFromSearch(search);
    expect(state.input).toBe('<root><a>1</a></root>');
    expect(state.indent).toBe('tab');
  });

  test('round-trip with numeric-looking input', () => {
    const params = buildXmlParams('123', '4');
    const search: Record<string, unknown> = {};
    for (const [k, v] of params.entries()) {
      search[k] = v;
    }
    const state = buildXmlStateFromSearch(search);
    expect(state.input).toBe('123');
    expect(typeof state.input).toBe('string');
  });
});
