'use client';

import { toast } from 'sonner';

import {
  type CompressionSummary,
  summarizeCompression,
} from '@/lib/tools/zippy-img/adapters/zippy';

import type { CompressedItem, ImageFile } from './use-zippy-img';
import { MAX_FILES, MAX_SIZE_MB } from './use-zippy-img';

const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export function filterValidFiles(files: Array<File>): Array<File> {
  const validFiles = files.filter((f) => {
    if (f.size > MAX_SIZE_BYTES) {
      toast.error(`"${f.name}" exceeds ${MAX_SIZE_MB}MB limit`);
      return false;
    }
    return f.type.startsWith('image/');
  });
  const accepted = validFiles.slice(0, MAX_FILES);
  if (validFiles.length > MAX_FILES) {
    toast.info(`Only first ${MAX_FILES} files accepted`);
  }
  return accepted;
}

export function mergeFileInputs(
  prev: Array<ImageFile>,
  accepted: Array<File>
): Array<ImageFile> {
  const existing = prev.map((p) => p.file.name);
  const newFiles = accepted.filter((f) => !existing.includes(f.name));
  return [
    ...prev.map((p) => ({ ...p, progress: 0 })),
    ...newFiles.map((file) => ({ file, progress: 0 })),
  ].slice(0, MAX_FILES);
}

export function announceCompressionSummary(summary: CompressionSummary): void {
  if (summary.outcome === 'all-success') {
    toast.success('Compression complete');
  } else if (summary.outcome === 'partial') {
    toast.info(
      `Compression finished: ${summary.succeeded} of ${summary.total} files succeeded`
    );
  } else {
    toast.error('Compression failed for all files');
  }
}

export interface ZippyTotals {
  compressedItems: Array<CompressedItem>;
  hasCompressed: boolean;
  totalCompressed: number;
  totalOriginal: number;
  totalSavings: number;
}

export function summarizeZippyTotals(inputs: Array<ImageFile>): ZippyTotals {
  const compressedItems = inputs.filter(
    (i): i is CompressedItem => i.compressed !== undefined
  );
  const totalOriginal = compressedItems.reduce(
    (sum, i) => sum + i.file.size,
    0
  );
  const totalCompressed = compressedItems.reduce(
    (sum, i) => sum + i.compressed.size,
    0
  );
  return {
    compressedItems,
    hasCompressed: inputs.some((i) => i.compressed !== undefined),
    totalCompressed,
    totalOriginal,
    totalSavings:
      totalOriginal > 0
        ? Math.round(((totalOriginal - totalCompressed) / totalOriginal) * 100)
        : 0,
  };
}

export function getCompressionSummary(
  inputs: Array<ImageFile>
): CompressionSummary | null {
  const allDone = inputs.length > 0 && inputs.every((i) => i.progress >= 100);
  return allDone ? summarizeCompression(inputs) : null;
}
