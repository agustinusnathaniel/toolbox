'use client';

import { Download } from 'lucide-react';

import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import type { CompressionSummary } from '@/lib/tools/zippy-img/adapters/zippy';

import { MAX_FILES, MAX_SIZE_MB } from './use-zippy-img';

export function buildCompressionMessage(
  summary: CompressionSummary | null
): string {
  if (summary?.outcome === 'all-success') {
    return `Compression complete: ${summary.succeeded} files ready to download.`;
  }
  if (summary?.outcome === 'partial') {
    return `Compression partially complete: ${summary.succeeded} succeeded, ${summary.failed} failed.`;
  }
  if (summary) {
    return 'Compression failed for all selected files.';
  }
  return '';
}

export function ZippyActions({
  allDone,
  canCompress,
  compressing,
  hasCompressed,
  onCompress,
  onDownload,
}: {
  allDone: boolean;
  canCompress: boolean;
  compressing: boolean;
  hasCompressed: boolean;
  onCompress: () => void;
  onDownload: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <Button
        intent="primary"
        isDisabled={!canCompress || compressing}
        onPress={onCompress}
        size="lg"
      >
        {compressing ? 'Compressing...' : 'Compress Now'}
      </Button>
      {allDone && hasCompressed && (
        <Button intent="outline" onPress={onDownload} size="lg">
          <Download />
          Download Outputs
        </Button>
      )}
    </div>
  );
}

export function ZippyHelp() {
  return (
    <ToolHelp
      faq={[
        {
          answer:
            'Yes. All processing happens in your browser. No files or images are sent to any server.',
          question: 'Is my data safe?',
        },
        {
          answer: 'Most common image formats including PNG, JPEG, and WebP.',
          question: 'What formats are supported?',
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
  );
}
