import { useLocation } from '@tanstack/react-router';

import type { ToolNavItem } from '@/lib/navigation/tool-registry';
import { getToolNavItems } from '@/lib/navigation/tool-registry';

import { HomepagePage } from './homepage-page';
import { HomepageSkeleton } from './homepage-skeleton';

export type StressMode =
  | 'demo'
  | 'worst'
  | 'empty'
  | 'one'
  | 'large'
  | 'loading';

const DOC_CHUNK =
  'Formats, validates, and repairs structured payloads with source maps, path filtering, key sorting, duplicate detection, and streaming for large files. ';

function docText(length: number): string {
  let out = '';
  while (out.length < length) {
    out += DOC_CHUNK;
  }
  return out.slice(0, length);
}

function worstTools(): Array<ToolNavItem> {
  return getToolNavItems().map((tool) => {
    switch (tool.slug) {
      case 'json-formatter':
        return {
          ...tool,
          description: docText(2000),
          title: 'JSON Schema and OpenAPI Specification Formatter',
        };
      case 'zippy-img':
        return {
          ...tool,
          description:
            'Paste any payload, then press Format.\nHMACSHA256SignatureVerification tokens stay on one line no matter how narrow the panel gets.\nA third line keeps multiline input visible.',
          title: 'Zippy 画像圧縮',
        };
      case 'color-converter':
        return {
          ...tool,
          description:
            'Renders <b>bold</b>, <script>alert("escaped")</script>, `inline code`, and # markdown headings as plain text.',
          title: 'Chuyển đổi màu sắc',
        };
      case 'wa-link-helper':
        return { ...tool, title: 'WA Link Helper 🚀' };
      case 'ua-check':
        return {
          ...tool,
          description:
            'Full thread at https://example.com/workspaces/acme/projects/q3-launch/docs/9f8e7d6c5b4a?tab=comments&filter=unresolved including repro steps.',
          title: 'HMACSHA256SignatureVerification',
        };
      case 'meeting-time-finder':
        return { ...tool, description: '' };
      case 'password-generator':
        return { ...tool, title: 'QR' };
      default:
        return { ...tool };
    }
  });
}

function largeTools(): Array<ToolNavItem> {
  const base = getToolNavItems();
  const rows: Array<ToolNavItem> = [];
  for (let index = 0; index < 1000; index++) {
    const source = base[index % base.length];
    rows.push({
      ...source,
      slug: `${source.slug}-preview-${index}`,
      title: `${source.title} Preview ${index + 1}`,
    });
  }
  return rows;
}

export function getStressTools(mode: StressMode): Array<ToolNavItem> {
  switch (mode) {
    case 'empty':
      return [];
    case 'one':
      return getToolNavItems().slice(0, 1);
    case 'large':
      return largeTools();
    case 'demo':
      return getToolNavItems();
    case 'worst':
      return worstTools();
    default:
      return getToolNavItems();
  }
}

const MODE_LINKS: Array<{ label: string; mode: StressMode }> = [
  { label: 'Demo data', mode: 'demo' },
  { label: 'Worst case', mode: 'worst' },
  { label: 'Empty', mode: 'empty' },
  { label: 'One', mode: 'one' },
  { label: '1,000 rows', mode: 'large' },
  { label: 'Loading', mode: 'loading' },
];

export function HomepageStressBar({ current }: { current: StressMode }) {
  const pathname = useLocation({ select: (s) => s.pathname });
  return (
    <nav
      aria-label="Stress data preview"
      className="fixed bottom-[calc(0.5rem+env(safe-area-inset-bottom))] left-1/2 z-40 w-max max-w-[calc(100vw-1rem)] -translate-x-1/2"
    >
      <div className="flex flex-wrap items-center justify-center gap-1 rounded-full border border-border bg-bg px-2 py-1 text-xs shadow">
        <a
          className="rounded-full px-2 py-1 text-muted-fg no-underline hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href={pathname}
        >
          Off
        </a>
        {MODE_LINKS.map(({ label, mode }) => (
          <a
            aria-current={mode === current ? 'page' : undefined}
            className="rounded-full px-2 py-1 text-muted-fg no-underline hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:bg-secondary aria-[current=page]:font-medium aria-[current=page]:text-fg"
            href={`${pathname}?data=${mode}`}
            key={mode}
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}

export function StressHomepage({ mode }: { mode: StressMode }) {
  return (
    <>
      <style>
        {
          'body:has([aria-label="Stress data preview"]) { padding-block-end: 10rem; }'
        }
      </style>
      {mode === 'loading' ? (
        <HomepageSkeleton />
      ) : (
        <HomepagePage tools={getStressTools(mode)} />
      )}
      <HomepageStressBar current={mode} />
    </>
  );
}
