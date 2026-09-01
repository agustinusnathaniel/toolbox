import { describe, expect, it } from 'vite-plus/test';

import { decodeHtmlEntities, encodeHtmlEntities } from './html-entities';

describe('encodeHtmlEntities', () => {
  it('encodes &', () => {
    expect(encodeHtmlEntities('a & b')).toBe('a &amp; b');
  });

  it('encodes < and >', () => {
    expect(encodeHtmlEntities('<div>')).toBe('&lt;div&gt;');
  });

  it('encodes double quotes', () => {
    expect(encodeHtmlEntities('"hello"')).toBe('&quot;hello&quot;');
  });

  it('encodes single quotes as &#39;', () => {
    expect(encodeHtmlEntities("it's")).toBe('it&#39;s');
  });

  it('encodes all special chars together', () => {
    expect(encodeHtmlEntities('<a href="x"> & \'')).toBe(
      '&lt;a href=&quot;x&quot;&gt; &amp; &#39;'
    );
  });

  it('leaves plain text unchanged', () => {
    expect(encodeHtmlEntities('hello world')).toBe('hello world');
  });

  it('handles empty string', () => {
    expect(encodeHtmlEntities('')).toBe('');
  });

  it('encodes & first to avoid double-encoding', () => {
    // Ensure we don't double-encode already existing entity-like text incorrectly beyond single pass
    expect(encodeHtmlEntities('&lt;')).toBe('&amp;lt;');
  });

  it('handles unicode unchanged', () => {
    expect(encodeHtmlEntities('café 🎉')).toBe('café 🎉');
  });
});

describe('decodeHtmlEntities', () => {
  it('decodes &amp;', () => {
    expect(decodeHtmlEntities('a &amp; b')).toBe('a & b');
  });

  it('decodes &lt; and &gt;', () => {
    expect(decodeHtmlEntities('&lt;div&gt;')).toBe('<div>');
  });

  it('decodes &quot;', () => {
    expect(decodeHtmlEntities('&quot;hello&quot;')).toBe('"hello"');
  });

  it('decodes &#39; and &apos;', () => {
    expect(decodeHtmlEntities('&#39;')).toBe("'");
    expect(decodeHtmlEntities('&apos;')).toBe("'");
    expect(decodeHtmlEntities('&#x27;')).toBe("'");
    expect(decodeHtmlEntities('&#X27;')).toBe("'");
  });

  it('decodes numeric decimal entities', () => {
    expect(decodeHtmlEntities('&#60;')).toBe('<');
    expect(decodeHtmlEntities('&#62;')).toBe('>');
    expect(decodeHtmlEntities('&#34;')).toBe('"');
  });

  it('decodes numeric hex entities case-insensitive', () => {
    expect(decodeHtmlEntities('&#x3C;')).toBe('<');
    expect(decodeHtmlEntities('&#x3c;')).toBe('<');
    expect(decodeHtmlEntities('&#X3C;')).toBe('<');
    expect(decodeHtmlEntities('&#x22;')).toBe('"');
  });

  it('decodes hex for emoji', () => {
    expect(decodeHtmlEntities('&#x1F600;')).toBe('😀');
  });

  it('leaves unknown entity passthrough', () => {
    expect(decodeHtmlEntities('&unknown;')).toBe('&unknown;');
    expect(decodeHtmlEntities('&foobar;')).toBe('&foobar;');
  });

  it('handles mixed content', () => {
    expect(
      decodeHtmlEntities('&lt;p&gt;Hello &amp; welcome&#33;&lt;/p&gt;')
    ).toBe('<p>Hello & welcome!</p>');
  });

  it('handles empty string', () => {
    expect(decodeHtmlEntities('')).toBe('');
  });

  it('decodes case-insensitive named entities', () => {
    expect(decodeHtmlEntities('&AMP;')).toBe('&');
    expect(decodeHtmlEntities('&LT;')).toBe('<');
    expect(decodeHtmlEntities('&GT;')).toBe('>');
  });
});

describe('roundtrip', () => {
  it('encode then decode returns original', () => {
    const original = '<div class="test">Tom & Jerry\'s "show"</div>';
    expect(decodeHtmlEntities(encodeHtmlEntities(original))).toBe(original);
  });

  it('decode then encode roundtrip for simple entities', () => {
    const encoded = '&lt;div&gt; &amp; &quot;hello&quot; &#39;world&#39;';
    const decoded = decodeHtmlEntities(encoded);
    expect(decoded).toBe('<div> & "hello" \'world\'');
    expect(encodeHtmlEntities(decoded)).toBe(
      '&lt;div&gt; &amp; &quot;hello&quot; &#39;world&#39;'
    );
  });

  it('handles numeric entities roundtrip', () => {
    const original = '<>"\'&';
    const encoded = encodeHtmlEntities(original);
    const decodedNumeric = decodeHtmlEntities('&#60;&#62;&#34;&#39;&#38;');
    expect(decodedNumeric).toBe('<>"\'&');
    expect(encoded).toBe('&lt;&gt;&quot;&#39;&amp;');
  });
});
