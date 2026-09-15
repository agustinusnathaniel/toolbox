'use client';

import { createFileRoute } from '@tanstack/react-router';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { Card, CardContent, CardHeader } from '@/lib/components/ui/card';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { CompressionResults } from './-components/compression-results';
import { FileQueue } from './-components/file-queue';
import { ImageDropZone } from './-components/image-drop-zone';
import {
  MAX_FILES,
  MAX_SIZE_MB,
  useZippyImg,
} from './-components/use-zippy-img';
import {
  buildCompressionMessage,
  ZippyActions,
  ZippyHelp,
} from './-components/zippy-sections';
import { meta } from './-meta';

export const Route = createFileRoute('/_tools/zippy-img/')({
  component: ZippyImgPage,
  ...createToolRouteMetadata(meta),
});

function ZippyImgPage() {
  const { trackAction, trackComplete } = useToolTracking(
    'zippy-img',
    'Zippy Image'
  );
  const zippy = useZippyImg(trackAction, trackComplete);
  const compressionMessage = buildCompressionMessage(zippy.compressionSummary);

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
            onFilesSelected={zippy.handleFilesSelected}
          />
          {zippy.inputs.length > 0 && (
            <FileQueue
              inputs={zippy.inputs}
              isCompressing={zippy.isCompressing}
              onRemove={zippy.handleRemove}
            />
          )}
          <ZippyActions
            allDone={zippy.allDone}
            canCompress={zippy.inputs.length > 0}
            compressing={zippy.isCompressing}
            hasCompressed={zippy.hasCompressed}
            onCompress={zippy.executeCompress}
            onDownload={zippy.handleDownload}
          />
          {zippy.compressionSummary && (
            <p aria-live="polite" className="text-muted-fg text-sm">
              {compressionMessage}
            </p>
          )}
        </CardContent>
      </Card>
      {zippy.allDone &&
        zippy.hasCompressed &&
        zippy.compressedItems.length > 0 && (
          <CompressionResults
            items={zippy.compressedItems}
            totalCompressed={zippy.totalCompressed}
            totalOriginal={zippy.totalOriginal}
            totalSavings={zippy.totalSavings}
          />
        )}
      <ZippyHelp />
    </div>
  );
}
