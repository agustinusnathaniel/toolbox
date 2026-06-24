'use client';

import { createFileRoute } from '@tanstack/react-router';
import { Download } from 'lucide-react';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent, CardHeader } from '@/lib/components/ui/card';

import { CompressionResults } from './-components/compression-results';
import { FileQueue } from './-components/file-queue';
import { ImageDropZone } from './-components/image-drop-zone';
import {
  MAX_FILES,
  MAX_SIZE_MB,
  useZippyImg,
} from './-components/use-zippy-img';

const meta = {
  pageTitle: 'Zippy Image',
  description:
    'Compress images securely in your browser with no server upload.',
  slug: 'zippy-img',
} as const;

export const Route = createFileRoute('/_tools/zippy-img/')({
  component: ZippyImgPage,
  staticData: {
    meta,
  },
  head: () => ({
    meta: [
      { title: meta.pageTitle },
      { name: 'description', content: meta.description },
      { property: 'og:title', content: meta.pageTitle },
      { property: 'og:description', content: meta.description },
      { property: 'og:type', content: 'website' },
    ],
  }),
});

function ZippyImgPage() {
  const { trackAction, trackComplete } = useToolTracking(
    'zippy-img',
    'Zippy Image'
  );
  const {
    inputs,
    isCompressing,
    allDone,
    hasCompressed,
    compressedItems,
    totalOriginal,
    totalCompressed,
    totalSavings,
    handleFilesSelected,
    executeCompress,
    handleDownload,
    handleRemove,
  } = useZippyImg(trackAction, trackComplete);

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-2xl">
      <Card>
        <CardHeader />
        <CardContent className="flex flex-col gap-4">
          <p className="text-muted-fg text-sm">
            Compress images securely in your browser. No files are uploaded to
            any server.
          </p>

          <ImageDropZone
            maxFiles={MAX_FILES}
            maxSizeMB={MAX_SIZE_MB}
            onFilesSelected={handleFilesSelected}
          />

          {inputs.length > 0 && (
            <FileQueue
              inputs={inputs}
              isCompressing={isCompressing}
              onRemove={handleRemove}
            />
          )}

          <div className="flex items-center gap-3">
            <Button
              intent="primary"
              isDisabled={!inputs.length || isCompressing}
              onPress={executeCompress}
              size="lg"
            >
              {isCompressing ? 'Compressing...' : 'Compress Now'}
            </Button>

            {allDone && hasCompressed && (
              <Button intent="outline" onPress={handleDownload} size="lg">
                <Download />
                Download Outputs
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {allDone && hasCompressed && compressedItems.length > 0 && (
        <CompressionResults
          items={compressedItems}
          totalCompressed={totalCompressed}
          totalOriginal={totalOriginal}
          totalSavings={totalSavings}
        />
      )}

      <ToolHelp
        faq={[
          {
            question: 'Is my data safe?',
            answer:
              'Yes. All processing happens in your browser. No files or images are sent to any server.',
          },
          {
            question: 'What formats are supported?',
            answer: 'Most common image formats including PNG, JPEG, and WebP.',
          },
        ]}
        howItWorks={{
          description:
            'This tool compresses images directly in your browser. Your files are never uploaded to any server.',
          steps: [
            'Drag and drop or click Browse to select images',
            `Maximum ${MAX_FILES} files at a time, up to ${MAX_SIZE_MB}MB each`,
            'Click Compress Now to reduce file sizes',
            'Download individual files or all at once as a ZIP',
          ],
        }}
      />
    </div>
  );
}
