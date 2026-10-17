import { describe, expect, test } from 'vite-plus/test';

import { formatXml, minifyXml, validateXml } from './xml-formatter';

describe('formatXml empty input', () => {
  test('returns error for empty string', () => {
    const result = formatXml('', '2');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Input is empty');
    expect(result.output).toBe('');
  });

  test('returns error for whitespace only', () => {
    const result = formatXml('   ', '2');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Input is empty');
  });
});

describe('formatXml indentation', () => {
  test('formats nested elements with 2-space indent', () => {
    const result = formatXml('<root><a>1</a><b>2</b></root>', '2');
    expect(result.isValid).toBe(true);
    expect(result.output).toBe('<root>\n  <a>1</a>\n  <b>2</b>\n</root>');
  });

  test('formats with 4-space indent', () => {
    const result = formatXml('<root><a>1</a></root>', '4');
    expect(result.isValid).toBe(true);
    expect(result.output).toBe('<root>\n    <a>1</a>\n</root>');
  });

  test('formats with tab indent', () => {
    const result = formatXml('<root><a>1</a></root>', 'tab');
    expect(result.isValid).toBe(true);
    expect(result.output).toBe('<root>\n\t<a>1</a>\n</root>');
  });

  test('defaults to 2-space indent', () => {
    const result = formatXml('<root><a>1</a></root>');
    expect(result.isValid).toBe(true);
    expect(result.output).toBe('<root>\n  <a>1</a>\n</root>');
  });
});

describe('formatXml content', () => {
  test('is idempotent for already formatted XML', () => {
    const first = formatXml('<root><a>1</a></root>', '2');
    expect(first.isValid).toBe(true);
    const second = formatXml(first.output, '2');
    expect(second.output).toBe(first.output);
  });

  test('preserves comments, CDATA, and processing instructions', () => {
    const input =
      '<root><!--note--><a><![CDATA[<raw>]]></a><?target data?></root>';
    const result = formatXml(input, '2');
    expect(result.isValid).toBe(true);
    expect(result.output).toContain('<!--note-->');
    expect(result.output).toContain('<![CDATA[<raw>]]>');
    expect(result.output).toContain('<?target data?>');
  });

  test('preserves the XML declaration', () => {
    const result = formatXml(
      '<?xml version="1.0" encoding="UTF-8"?><root><a>1</a></root>',
      '2'
    );
    expect(result.isValid).toBe(true);
    expect(
      result.output.startsWith('<?xml version="1.0" encoding="UTF-8"?>')
    ).toBe(true);
  });
});

describe('formatXml errors', () => {
  test('returns invalid with an error instead of throwing for malformed XML', () => {
    const result = formatXml('<root><a></root>', '2');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  test('rejects input over 1 MB with a friendly error', () => {
    const big = `<root>${'x'.repeat(1024 * 1024)}</root>`;
    const result = formatXml(big, '2');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('1 MB');
  });
});

describe('validateXml', () => {
  test('accepts valid XML', () => {
    expect(validateXml('<root><a>1</a></root>').valid).toBe(true);
  });

  test('rejects empty input', () => {
    const result = validateXml('   ');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Input is empty');
  });

  test('reports the line number for malformed XML', () => {
    const result = validateXml('<root>\n  <a>1</b>\n</root>');
    expect(result.valid).toBe(false);
    expect(result.line).toBe(2);
    expect(result.error).toContain('Line 2');
  });

  test('reports an error without a line when no position is available', () => {
    const result = validateXml('<root><a></root>');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe('minifyXml', () => {
  test('returns error for empty input', () => {
    const result = minifyXml('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Input is empty');
  });

  test('minifies XML to a single line', () => {
    const result = minifyXml('<root>\n  <a>1</a>\n  <b>2</b>\n</root>');
    expect(result.isValid).toBe(true);
    expect(result.output).toBe('<root><a>1</a><b>2</b></root>');
  });

  test('minify then format matches formatting the original', () => {
    const input = '<root>\n  <a>1</a>\n  <!--note-->\n  <b>2</b>\n</root>';
    const minified = minifyXml(input);
    expect(minified.isValid).toBe(true);
    const fromMinified = formatXml(minified.output, '2');
    const direct = formatXml(input, '2');
    expect(fromMinified.output).toBe(direct.output);
  });

  test('keeps comments and CDATA through minify', () => {
    const result = minifyXml(
      '<root><!--note--><a><![CDATA[<raw>]]></a></root>'
    );
    expect(result.isValid).toBe(true);
    expect(result.output).toContain('<!--note-->');
    expect(result.output).toContain('<![CDATA[<raw>]]>');
  });
});
