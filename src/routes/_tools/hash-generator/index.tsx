'use client';

import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { ToolHelp } from '@/lib/components/tool-help';
import { Card, CardContent } from '@/lib/components/ui/card';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { HashActions } from './-components/hash-actions';
import { HashAlgorithmSelect } from './-components/hash-algorithm-select';
import { HashDropZone } from './-components/hash-dropzone';
import { HashExpectedInput, HashTextInput } from './-components/hash-inputs';
import { HashError, HashResultPanel } from './-components/hash-result-panel';
import { useHashPage } from './-components/use-hash-page';
import { meta } from './-meta';

const searchSchema = z.object({
  algorithm: z.string().optional(),
  expected: z.string().optional(),
  text: z.string().optional(),
});

export const Route = createFileRoute('/_tools/hash-generator/')({
  component: HashGeneratorPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

function HashGeneratorPage() {
  const s = useHashPage();
  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <HashAlgorithmSelect
            algorithm={s.algorithm}
            onChange={s.setAlgorithm}
          />
          <HashTextInput
            setFileName={s.setFileName as never}
            setResult={s.setResult as never}
            setText={s.setText}
            text={s.text}
          />
          <HashExpectedInput
            expected={s.expected}
            setExpected={s.setExpected}
          />
          <HashActions
            onCopyLink={s.handleCopyLink}
            onHashText={s.handleHashText}
          />
          <HashDropZone
            onFile={s.handleFile}
            onFileSelect={s.handleFileSelect}
          />
          <HashError result={s.result} />
          <HashResultPanel
            copiedKey={s.copiedKey}
            expected={s.expected}
            fileName={s.fileName}
            onCopy={s.handleCopy}
            result={s.result}
          />
        </CardContent>
      </Card>
      <ToolHelp
        faq={[
          {
            answer:
              'No. Hashing happens entirely in your browser with the native Web Crypto API. Your text or file never leaves your device.',
            question: 'Is my data sent anywhere?',
          },
          {
            answer:
              'Hash your file or text, paste the published digest into the Expected hash field, and the tool tells you if they match. Comparison ignores case and whitespace.',
            question: 'How do I verify a checksum?',
          },
        ]}
        howItWorks={{
          description:
            'Pick an algorithm, type text or drop a file, then copy the resulting hash.',
          steps: [
            'Choose SHA-1, SHA-256, SHA-384, or SHA-512',
            'Type text and click Hash text, or drag & drop a file',
            'Copy the hash with the copy button',
            'Optionally paste an expected hash to verify a match',
          ],
        }}
      />
    </div>
  );
}
