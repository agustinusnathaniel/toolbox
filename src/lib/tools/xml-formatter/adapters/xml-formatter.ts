import { runTransform, type TransformResult } from '@/lib/utils/transform';

export type XmlIndent = '2' | '4' | 'tab';

export interface XmlValidation {
  error?: string;
  line?: number;
  valid: boolean;
}

const MAX_XML_BYTES = 1024 * 1024;

const XML_DECLARATION_PATTERN = /^\s*<\?xml\s[^?]*\?>\s*/;
const TEXT_ESCAPE_PATTERN = /[&<>]/g;
const ATTR_ESCAPE_PATTERN = /[&<>"]/g;
const WHITESPACE_RUN_PATTERN = /\s+/g;
const LEADING_POSITION_PATTERN = /^\d+:\d+:\s*/;
const LINE_NUMBER_PATTERNS: ReadonlyArray<RegExp> = [
  /^(\d+):\d+:/,
  /line\s+(\d+)/i,
];

const TEXT_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
};

const ATTR_ESCAPES: Record<string, string> = {
  '"': '&quot;',
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
};

const INPUT_TOO_LARGE_ERROR =
  'Input is too large (max 1 MB). Paste a smaller file.';

class XmlParseError extends Error {
  line?: number;

  constructor(message: string, line?: number) {
    super(message);
    this.name = 'XmlParseError';
    this.line = line;
  }
}

function checkSizeBytes(value: string): string | null {
  if (new TextEncoder().encode(value).length > MAX_XML_BYTES) {
    return INPUT_TOO_LARGE_ERROR;
  }
  return null;
}

function describeParseError(raw: string): { detail: string; line?: number } {
  const collapsed =
    raw.replace(WHITESPACE_RUN_PATTERN, ' ').trim() || 'Invalid XML.';
  for (const pattern of LINE_NUMBER_PATTERNS) {
    const match = pattern.exec(collapsed);
    if (match?.[1]) {
      const line = Number.parseInt(match[1], 10);
      const detail = collapsed.replace(LEADING_POSITION_PATTERN, '');
      return {
        detail,
        line: Number.isFinite(line) ? line : undefined,
      };
    }
  }
  return { detail: collapsed };
}

function parseXml(trimmed: string): {
  declaration: string | null;
  doc: Document;
} {
  const declarationMatch = XML_DECLARATION_PATTERN.exec(trimmed);
  const declaration = declarationMatch ? declarationMatch[0].trim() : null;
  // parseFromString reports XML problems as a parsererror document rather
  // than throwing; unexpected throws are caught by the callers and surfaced
  // as structured errors.
  const doc = new DOMParser().parseFromString(trimmed, 'application/xml');
  const errorNode = doc.getElementsByTagName('parsererror')[0];
  if (errorNode) {
    const { detail, line } = describeParseError(errorNode.textContent ?? '');
    throw new XmlParseError(
      line === undefined ? `Invalid XML: ${detail}` : `Line ${line}: ${detail}`,
      line
    );
  }
  return { declaration, doc };
}

function indentUnit(indent: XmlIndent): string {
  if (indent === 'tab') {
    return '\t';
  }
  return indent === '4' ? '    ' : '  ';
}

function escapeText(value: string): string {
  return value.replace(
    TEXT_ESCAPE_PATTERN,
    (char) => TEXT_ESCAPES[char] ?? char
  );
}

function serializeAttributes(element: Element): string {
  const parts: Array<string> = [];
  for (let i = 0; i < element.attributes.length; i += 1) {
    const attr = element.attributes.item(i);
    if (attr) {
      parts.push(
        `${attr.name}="${attr.value.replace(ATTR_ESCAPE_PATTERN, (char) => ATTR_ESCAPES[char] ?? char)}"`
      );
    }
  }
  return parts.join(' ');
}

function significantChildren(element: Element): Array<ChildNode> {
  return Array.from(element.childNodes).filter((node) => {
    if (node.nodeType !== Node.TEXT_NODE) {
      return true;
    }
    return (node.textContent ?? '').trim() !== '';
  });
}

function serializeInline(node: ChildNode): string {
  if (node.nodeType === Node.CDATA_SECTION_NODE) {
    return `<![CDATA[${(node as CharacterData).data}]]>`;
  }
  return escapeText(node.textContent ?? '');
}

function serializeBlock(node: ChildNode, unit: string, depth: number): string {
  const pad = unit.repeat(depth);
  if (node.nodeType === Node.ELEMENT_NODE) {
    return serializeElement(node as Element, unit, depth);
  }
  if (node.nodeType === Node.COMMENT_NODE) {
    return `${pad}<!--${(node as CharacterData).data}-->`;
  }
  if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
    const target = (node as ProcessingInstruction).target;
    const data = (node as ProcessingInstruction).data;
    return `${pad}<?${target}${data ? ` ${data}` : ''}?>`;
  }
  if (node.nodeType === Node.CDATA_SECTION_NODE) {
    return `${pad}<![CDATA[${(node as CharacterData).data}]]>`;
  }
  if (node.nodeType === Node.DOCUMENT_TYPE_NODE) {
    return `${pad}${new XMLSerializer().serializeToString(node)}`;
  }
  const text = escapeText(node.textContent ?? '').trim();
  return text ? `${pad}${text}` : '';
}

function serializeElement(
  element: Element,
  unit: string,
  depth: number
): string {
  const pad = unit.repeat(depth);
  const attrs = serializeAttributes(element);
  const open = `<${element.tagName}${attrs ? ` ${attrs}` : ''}`;
  const children = significantChildren(element);
  if (children.length === 0) {
    return `${pad}${open}/>`;
  }
  const textOnly = children.every(
    (child) =>
      child.nodeType === Node.TEXT_NODE ||
      child.nodeType === Node.CDATA_SECTION_NODE
  );
  if (textOnly) {
    return `${pad}${open}>${children.map(serializeInline).join('')}</${element.tagName}>`;
  }
  const inner = children
    .map((child) => serializeBlock(child, unit, depth + 1))
    .filter((line) => line !== '')
    .join('\n');
  if (!inner) {
    return `${pad}${open}/>`;
  }
  return `${pad}${open}>\n${inner}\n${pad}</${element.tagName}>`;
}

function serializeDocument(doc: Document, unit: string): string {
  return Array.from(doc.childNodes)
    .filter((node) => {
      if (node.nodeType !== Node.TEXT_NODE) {
        return true;
      }
      return (node.textContent ?? '').trim() !== '';
    })
    .map((node) => serializeBlock(node, unit, 0))
    .filter((line) => line !== '')
    .join('\n');
}

function serializeCompact(node: Node): string {
  if (
    node.nodeType === Node.DOCUMENT_NODE ||
    node.nodeType === Node.DOCUMENT_FRAGMENT_NODE
  ) {
    return Array.from(node.childNodes).map(serializeCompact).join('');
  }
  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element;
    const attrs = serializeAttributes(element);
    const open = `<${element.tagName}${attrs ? ` ${attrs}` : ''}`;
    const children = significantChildren(element);
    if (children.length === 0) {
      return `${open}/>`;
    }
    return `${open}>${children.map(serializeCompact).join('')}</${element.tagName}>`;
  }
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? '';
    return text.trim() === '' ? '' : escapeText(text);
  }
  if (node.nodeType === Node.CDATA_SECTION_NODE) {
    return `<![CDATA[${(node as CharacterData).data}]]>`;
  }
  if (node.nodeType === Node.COMMENT_NODE) {
    return `<!--${(node as CharacterData).data}-->`;
  }
  if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
    const target = (node as ProcessingInstruction).target;
    const data = (node as ProcessingInstruction).data;
    return `<?${target}${data ? ` ${data}` : ''}?>`;
  }
  if (node.nodeType === Node.DOCUMENT_TYPE_NODE) {
    return new XMLSerializer().serializeToString(node);
  }
  return '';
}

export function formatXml(
  input: string,
  indent: XmlIndent = '2'
): TransformResult {
  return runTransform(input, (trimmed) => {
    const sizeError = checkSizeBytes(trimmed);
    if (sizeError) {
      throw new Error(sizeError);
    }
    const { declaration, doc } = parseXml(trimmed);
    const body = serializeDocument(doc, indentUnit(indent));
    return declaration ? `${declaration}\n${body}` : body;
  });
}

export function minifyXml(input: string): TransformResult {
  return runTransform(input, (trimmed) => {
    const sizeError = checkSizeBytes(trimmed);
    if (sizeError) {
      throw new Error(sizeError);
    }
    const { declaration, doc } = parseXml(trimmed);
    const body = serializeCompact(doc);
    return declaration ? `${declaration}${body}` : body;
  });
}

export function validateXml(input: string): XmlValidation {
  if (!input.trim()) {
    return { error: 'Input is empty', valid: false };
  }
  const trimmed = input.trim();
  const sizeError = checkSizeBytes(trimmed);
  if (sizeError) {
    return { error: sizeError, valid: false };
  }
  try {
    parseXml(trimmed);
    return { valid: true };
  } catch (error) {
    if (error instanceof XmlParseError) {
      return error.line === undefined
        ? { error: error.message, valid: false }
        : { error: error.message, line: error.line, valid: false };
    }
    return { error: 'Invalid XML: could not parse input.', valid: false };
  }
}
