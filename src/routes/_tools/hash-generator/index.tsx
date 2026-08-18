'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { Check, Copy, Fingerprint, Link, UploadIcon } from 'lucide-react';
import { useCallback, useState } from 'react';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import { DropZone } from '@/lib/components/ui/drop-zone';
import { FileTrigger } from '@/lib/components/ui/file-trigger';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/lib/components/ui/select';
import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import type {
  HashAlgorithm,
  HashResult,
} from '@/lib/tools/hash-generator/adapters/hash-generator';
import {
  HASH_ALGORITHMS,
  hashBytes,
  hashText,
} from '@/lib/tools/hash-generator/adapters/hash-generator';
import {
  buildHashParams,
  buildHashStateFromSearch,
} from '@/lib/tools/hash-generator/adapters/hash-params';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { meta } from './-meta';

const ALGORITHM_OPTIONS = HASH_ALGORITHMS.map((algorithm) => ({
  id: algorithm,
  label: algorithm,
}));

const searchSchema = z.object({
  algorithm: z.string().optional(),
  text: z.string().optional(),
});

export const Route = createFileRoute('/_tools/hash-generator/')({
  component: HashGeneratorPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

function HashGeneratorPage() {
  const { trackAction } = useToolTracking('hash-generator', 'Hash Generator');
  const search = useSearch({ from: '/_tools/hash-generator/' });
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>(
    () => buildHashStateFromSearch(search).algorithm
  );
  const [text, setText] = useState(() => buildHashStateFromSearch(search).text);
  const [result, setResult] = useState<HashResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const { copiedKey, copy } = useCopyFeedback();

  const handleHashText = useCallback(async () => {
    const res = await hashText({ algorithm, text });
    setResult(res);
    setFileName(null);
    trackAction('hash-text');
  }, [algorithm, text, trackAction]);

  const handleFile = useCallback(
    async (file: File) => {
      const buffer = await file.arrayBuffer();
      const res = await hashBytes(new Uint8Array(buffer), algorithm);
      setResult(res);
      setFileName(`${file.name} (${file.size} bytes)`);
      trackAction('hash-file');
    },
    [algorithm, trackAction]
  );

  const handleCopy = useCallback(async () => {
    if (!(result?.isValid && result.output)) {
      return;
    }
    if (await copy(result.output, 'copy', 'Copied hash')) {
      trackAction('copy');
    }
  }, [result, copy, trackAction]);

  const handleCopyLink = useCopyShareableLink(
    () => buildHashParams(text, algorithm),
    trackAction
  );

  const showError = result && !result.isValid;
  const showResult = result?.isValid;

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      const file = files?.[0];
      if (file) {
        await handleFile(file);
      }
    },
    [handleFile]
  );

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <Select
            aria-label="Hash algorithm"
            onSelectionChange={(key) => setAlgorithm(key as HashAlgorithm)}
            selectedKey={algorithm}
          >
            <SelectTrigger />
            <SelectContent items={ALGORITHM_OPTIONS}>
              {(option) => (
                <SelectItem id={option.id}>{option.label}</SelectItem>
              )}
            </SelectContent>
          </Select>

          <div className="flex flex-col gap-1">
            <label className="text-muted-fg text-sm" htmlFor="hash-text">
              Text
            </label>
            <textarea
              className="field-sizing-content min-h-40 w-full rounded-lg border border-input bg-transparent p-3 font-mono text-fg text-sm outline-hidden placeholder:text-muted-fg focus:border-ring/70 focus:ring-3 focus:ring-ring/20"
              id="hash-text"
              onChange={(e) => {
                setText(e.target.value);
                setResult(null);
                setFileName(null);
              }}
              placeholder="Type or paste text to hash..."
              value={text}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onPress={handleHashText} size="sm">
              <Fingerprint className="size-4" />
              Hash text
            </Button>
            <Button
              aria-label="Copy shareable link"
              intent="outline"
              onPress={handleCopyLink}
              size="sm"
            >
              <Link className="size-4" />
              Copy link
            </Button>
          </div>

          <DropZone
            className="flex flex-col items-center justify-center gap-3"
            onDrop={async (e) => {
              for (const item of e.items) {
                if (item.kind === 'file') {
                  const file = await item.getFile();
                  if (file) {
                    await handleFile(file);
                  }
                }
              }
            }}
          >
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="flex size-10 items-center justify-center rounded-full border">
                <UploadIcon className="size-5 text-muted-fg" />
              </div>
              <p className="font-medium text-sm">Drag & drop a file here</p>
              <p className="text-muted-fg text-xs">
                Or click Browse to pick a file to hash
              </p>
            </div>
            <FileTrigger allowsMultiple={false} onSelect={handleFileSelect}>
              <Button intent="outline" size="sm">
                Browse file
              </Button>
            </FileTrigger>
          </DropZone>

          {showError && (
            <div
              className="rounded-lg border border-danger/30 bg-danger/5 p-3"
              role="alert"
            >
              <p className="font-medium text-danger text-sm">Nothing to hash</p>
              <pre className="mt-1 whitespace-pre-wrap font-mono text-danger/80 text-xs">
                {result.error}
              </pre>
            </div>
          )}

          {showResult && result.isValid && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-fg text-sm">
                  {fileName ?? 'Hash'}
                </span>
                <Button
                  aria-label="Copy hash"
                  intent="outline"
                  onPress={handleCopy}
                  size="sq-sm"
                >
                  {copiedKey === 'copy' ? (
                    <Check className="size-4 text-success" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
              <pre className="max-h-80 overflow-auto rounded-lg border bg-(--card-bg)/50 p-3 font-mono text-sm">
                {result.output}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      <ToolHelp
        faq={[
          {
            answer:
              'No. Hashing happens entirely in your browser with the native Web Crypto API. Your text or file never leaves your device.',
            question: 'Is my data sent anywhere?',
          },
        ]}
        howItWorks={{
          description:
            'Pick an algorithm, type text or drop a file, then copy the resulting hash.',
          steps: [
            'Choose SHA-1, SHA-256, SHA-384, or SHA-512',
            'Type text and click Hash text, or drag & drop a file',
            'Copy the hash with the copy button',
          ],
        }}
      />
    </div>
  );
}
