import {
  coerceEnum,
  readString,
  recordToSearchParams,
  trimmed,
} from '@/lib/utils/search-params';

import type { XmlIndent } from './xml-formatter';

const ALLOWED_INDENTS: ReadonlySet<XmlIndent> = new Set<XmlIndent>([
  '2',
  '4',
  'tab',
]);

const DEFAULT_INDENT: XmlIndent = '2';

export function buildXmlParams(
  input: string,
  indent: XmlIndent
): URLSearchParams {
  return recordToSearchParams({
    indent,
    input: trimmed(input),
  });
}

export function buildXmlStateFromSearch(search: Record<string, unknown>): {
  indent: XmlIndent;
  input: string;
} {
  return {
    indent: coerceEnum(search.indent, ALLOWED_INDENTS, DEFAULT_INDENT),
    input: readString(search.input),
  };
}
