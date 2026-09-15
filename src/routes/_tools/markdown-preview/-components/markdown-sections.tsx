'use client';

import { CopyButton } from '@/lib/components/copy-button';
import { CopyLinkButton } from '@/lib/components/copy-link-button';
import { ToolError } from '@/lib/components/tool-error';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import { Textarea } from '@/lib/components/ui/textarea';

export function MarkdownEditor({
  onInput,
  value,
}: {
  onInput: (v: string) => void;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-muted-fg text-sm" htmlFor="markdown-input">
            Markdown
          </label>
          <Textarea
            aria-label="Markdown input"
            className="min-h-60 font-mono"
            id="markdown-input"
            onChange={(e) => onInput(e.target.value)}
            placeholder="Type Markdown here... e.g. # Hello **world**"
            value={value}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function MarkdownToolbar({
  canCopy,
  copied,
  computing,
  isEmpty,
  onClear,
  onCopyHtml,
  onCopyLink,
}: {
  canCopy: boolean;
  copied: boolean;
  computing: boolean;
  isEmpty: boolean;
  onClear: () => void;
  onCopyHtml: () => void;
  onCopyLink: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <CopyButton
        copied={copied}
        disabled={computing || isEmpty || !canCopy}
        label="Copy HTML"
        onPress={onCopyHtml}
        text="Copy HTML"
      />
      <CopyLinkButton label="Copy shareable link" onPress={onCopyLink} />
      <Button
        aria-label="Clear markdown"
        intent="outline"
        onPress={onClear}
        size="sm"
      >
        Clear
      </Button>
    </div>
  );
}

export function MarkdownPreview({
  computing,
  error,
  html,
  isEmpty,
  timedOut,
}: {
  computing: boolean;
  error?: string;
  html: string;
  isEmpty: boolean;
  timedOut?: boolean;
}) {
  if (computing) {
    return (
      <p aria-live="polite" className="text-muted-fg text-sm">
        Rendering…
      </p>
    );
  }
  if (timedOut) {
    return <ToolError message={error} title="Rendering timed out" />;
  }
  if (isEmpty) {
    return (
      <p className="text-muted-fg text-sm">
        Preview will appear here once you type Markdown.
      </p>
    );
  }
  return (
    <div
      className="markdown-preview prose prose-sm max-w-none rounded-lg border bg-(--card-bg)/50 p-4 [&_a]:text-primary [&_a]:underline [&_blockquote]:border-muted [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_blockquote]:text-muted-fg [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:font-bold [&_h1]:text-2xl [&_h1]:leading-tight [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:font-bold [&_h2]:text-xl [&_h2]:leading-tight [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:font-bold [&_h3]:text-lg [&_h3]:leading-snug [&_h4]:mt-4 [&_h4]:mb-2 [&_h4]:font-semibold [&_h4]:text-base [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-3 [&_pre]:overflow-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-3 [&_table]:my-6 [&_table]:w-full [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:rounded-lg [&_table]:border [&_td]:border [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:bg-muted [&_th]:px-3 [&_th]:py-2 [&_th]:font-semibold [&_ul]:list-disc [&_ul]:pl-6"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized via DOMPurify before rendering
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function MarkdownHelp() {
  return (
    <ToolHelp
      faq={[
        {
          answer:
            'Yes. Rendering happens entirely in your browser using the marked library. Your Markdown never leaves your device.',
          question: 'Is my data safe?',
        },
        {
          answer:
            'GitHub Flavored Markdown (GFM) is supported including tables, strikethrough, autolinks, and task lists.',
          question: 'What Markdown flavor is supported?',
        },
        {
          answer:
            'Click Copy link to copy a shareable URL that restores your Markdown input when opened.',
          question: 'How do I share my Markdown?',
        },
      ]}
      howItWorks={{
        description:
          'Type Markdown on the left and see the HTML preview update live. Copy the rendered HTML or share a link.',
        steps: [
          'Type or paste Markdown into the editor',
          'See the HTML preview update live',
          'Copy the rendered HTML or a shareable link',
          'Use Clear to reset the editor',
        ],
      }}
    />
  );
}
