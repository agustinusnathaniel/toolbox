import { describe, expect, it } from 'vite-plus/test';

import { decodeHtmlEntities, encodeHtmlEntities } from './html-entities';

describe('encodeHtmlEntities', () => {
  it('encodes all special chars together', () => {
    expect(encodeHtmlEntities('<a href="x"> & \'')).toBe(
      '&lt;a href=&quot;x&quot;&gt; &amp; &#39;'
    );
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
  it('decodes &#39; and &apos;', () => {
    expect(decodeHtmlEntities('&#39;')).toBe("'");
    expect(decodeHtmlEntities('&apos;')).toBe("'");
    expect(decodeHtmlEntities('&#x27;')).toBe("'");
    expect(decodeHtmlEntities('&#X27;')).toBe("'");
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
});
