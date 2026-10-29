'use client';

import { CopyLinkButton } from '@/lib/components/copy-link-button';
import { CopyRow } from '@/lib/components/copy-row';
import { LabeledTextarea } from '@/lib/components/labeled-textarea';
import { ToolError } from '@/lib/components/tool-error';
import { ToolHelp } from '@/lib/components/tool-help';
import type {
  InspectedUrl,
  UrlInspectResult,
} from '@/lib/tools/url-inspector/adapters/url-inspector';

export function UrlInspectorInputs({
  input,
  onInput,
}: {
  input: string;
  onInput: (v: string) => void;
}) {
  return (
    <LabeledTextarea
      aria-label="URL to inspect"
      id="url-inspector-input"
      label="URL"
      onChange={(e) => onInput(e.target.value)}
      placeholder="Paste a URL, e.g. https://example.com:8443/docs?q=toolbox#results"
      value={input}
    />
  );
}

export function UrlInspectorActions({
  onCopyLink,
}: {
  onCopyLink: () => void;
}) {
  return (
    <div>
      <CopyLinkButton label="Copy shareable link" onClick={onCopyLink} />
    </div>
  );
}

function OriginRows({
  copiedKey,
  inspected,
  onCopyPart,
}: {
  copiedKey: string | number | null;
  inspected: InspectedUrl;
  onCopyPart: (value: string, key: string, label: string) => void;
}) {
  return (
    <>
      <CopyRow
        copied={copiedKey === 'href'}
        copyLabel="Copy normalized URL"
        label="Normalized"
        mono
        onCopy={() =>
          onCopyPart(inspected.href, 'href', 'Copied normalized URL')
        }
        value={inspected.href}
      />
      <CopyRow
        copied={copiedKey === 'protocol'}
        copyLabel="Copy protocol"
        label="Protocol"
        mono
        onCopy={() =>
          onCopyPart(inspected.protocol, 'protocol', 'Copied protocol')
        }
        value={inspected.protocol}
      />
      <CopyRow
        copied={copiedKey === 'username'}
        copyLabel="Copy username"
        label="Username"
        mono
        onCopy={() =>
          onCopyPart(inspected.username, 'username', 'Copied username')
        }
        value={inspected.username}
      />
      <CopyRow
        copied={copiedKey === 'host'}
        copyLabel="Copy host"
        label="Host"
        mono
        onCopy={() => onCopyPart(inspected.host, 'host', 'Copied host')}
        value={inspected.host}
      />
      <CopyRow
        copied={copiedKey === 'port'}
        copyLabel="Copy port"
        label="Port"
        mono
        onCopy={() => onCopyPart(inspected.port, 'port', 'Copied port')}
        value={inspected.port}
      />
    </>
  );
}

function LocationRows({
  copiedKey,
  inspected,
  onCopyPart,
}: {
  copiedKey: string | number | null;
  inspected: InspectedUrl;
  onCopyPart: (value: string, key: string, label: string) => void;
}) {
  return (
    <>
      <CopyRow
        copied={copiedKey === 'pathname'}
        copyLabel="Copy path"
        label="Path"
        mono
        onCopy={() => onCopyPart(inspected.pathname, 'pathname', 'Copied path')}
        value={inspected.pathname}
      />
      <CopyRow
        copied={copiedKey === 'search'}
        copyLabel="Copy query string"
        label="Query string"
        mono
        onCopy={() =>
          onCopyPart(inspected.search, 'search', 'Copied query string')
        }
        value={inspected.search}
      />
      <CopyRow
        copied={copiedKey === 'hash'}
        copyLabel="Copy fragment"
        label="Fragment"
        mono
        onCopy={() => onCopyPart(inspected.hash, 'hash', 'Copied fragment')}
        value={inspected.hash}
      />
      <CopyRow
        copied={copiedKey === 'origin'}
        copyLabel="Copy origin"
        label="Origin"
        mono
        onCopy={() => onCopyPart(inspected.origin, 'origin', 'Copied origin')}
        value={inspected.origin}
      />
    </>
  );
}

function QueryParamRows({
  copiedKey,
  onCopyPart,
  queryParams,
}: {
  copiedKey: string | number | null;
  onCopyPart: (value: string, key: string, label: string) => void;
  queryParams: InspectedUrl['queryParams'];
}) {
  if (queryParams.length === 0) {
    return null;
  }
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-sm">Query parameters</span>
      {queryParams.map((param, index) => {
        const key = `query-${index}`;
        return (
          <CopyRow
            copied={copiedKey === key}
            copyLabel={`Copy value of ${param.name}`}
            key={key}
            label={`?${param.name}`}
            mono
            onCopy={() =>
              onCopyPart(param.value, key, `Copied value of ${param.name}`)
            }
            value={param.value || '(empty)'}
          />
        );
      })}
    </div>
  );
}

export function UrlInspectorResult({
  copiedKey,
  onCopyPart,
  result,
}: {
  copiedKey: string | number | null;
  onCopyPart: (value: string, key: string, label: string) => void;
  result: UrlInspectResult | null;
}) {
  if (!result) {
    return null;
  }
  const { inspected } = result;
  if (!inspected) {
    return <ToolError message={result.error} />;
  }
  return (
    <div className="flex flex-col gap-2">
      {result.usedSchemeFallback && (
        <p className="text-muted-foreground text-xs">
          No scheme detected — parsed as an https:// address.
        </p>
      )}
      <OriginRows
        copiedKey={copiedKey}
        inspected={inspected}
        onCopyPart={onCopyPart}
      />
      <LocationRows
        copiedKey={copiedKey}
        inspected={inspected}
        onCopyPart={onCopyPart}
      />
      <QueryParamRows
        copiedKey={copiedKey}
        onCopyPart={onCopyPart}
        queryParams={inspected.queryParams}
      />
    </div>
  );
}

export function UrlInspectorHelp() {
  return (
    <ToolHelp
      faq={[
        {
          answer:
            'Everything runs on the WHATWG URL parser built into your browser. Parts like protocol, host, port, path segments, query parameters (including repeats like ?a=1&a=2), and the fragment are each shown with their own copy button.',
          question: 'What does the inspector show?',
        },
        {
          answer:
            'Pasting example.com/docs?a=1 without https:// still works — it is parsed as https://example.com/docs?a=1 and the page says so. Add the scheme yourself when you need a different one, e.g. ftp:// or a deep link.',
          question: 'What if my URL has no scheme?',
        },
        {
          answer:
            'Yes. Inspection uses only the browser-native URL parser. Everything runs locally and no data ever leaves your device.',
          question: 'Is my data safe?',
        },
      ]}
    />
  );
}
