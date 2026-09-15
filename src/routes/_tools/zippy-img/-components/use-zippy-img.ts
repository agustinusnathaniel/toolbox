'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import {
  compressImage,
  downloadFiles,
} from '@/lib/tools/zippy-img/adapters/zippy';

import {
  announceCompressionSummary,
  filterValidFiles,
  getCompressionSummary,
  mergeFileInputs,
  summarizeZippyTotals,
} from './zippy-helpers';

export const MAX_FILES = 2;
export const MAX_SIZE_MB = 15;

export interface ImageFile {
  compressed?: File;
  file: File;
  progress: number;
}

export type CompressedItem = ImageFile & { compressed: File };

export function useZippyImg(
  trackAction: (action: string) => void,
  trackComplete: (success: boolean) => void
) {
  const [inputs, setInputs] = useState<Array<ImageFile>>([]);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFilesSelected = useCallback(
    (files: Array<File>) => {
      trackAction('files_selected');
      const accepted = filterValidFiles(files);
      setInputs((prev) => mergeFileInputs(prev, accepted));
    },
    [trackAction]
  );

  const executeCompress = useCallback(async () => {
    if (!inputs.length) {
      return;
    }
    trackAction('compress');
    setIsCompressing(true);
    setInputs((prev) =>
      prev.map((p) => ({ ...p, compressed: undefined, progress: 0 }))
    );
    const results = await Promise.all(
      inputs.map((item, index) => compressOne(item, index, setInputs))
    );
    setInputs(results);
    setIsCompressing(false);
    const summary = getCompressionSummary(results);
    if (summary) {
      trackComplete(summary.succeeded > 0);
      announceCompressionSummary(summary);
    }
  }, [trackAction, trackComplete, inputs]);

  const handleDownload = useCallback(() => {
    trackAction('download');
    const compressed = inputs
      .map((i) => i.compressed)
      .filter((f): f is File => f !== undefined);
    if (!compressed.length) {
      return;
    }
    downloadFiles(compressed);
  }, [trackAction, inputs]);

  const handleRemove = useCallback((name: string) => {
    setInputs((prev) => prev.filter((p) => p.file.name !== name));
  }, []);

  const allDone = inputs.length > 0 && inputs.every((i) => i.progress >= 100);
  const compressionSummary = getCompressionSummary(inputs);
  const totals = summarizeZippyTotals(inputs);

  return {
    allDone,
    compressedItems: totals.compressedItems,
    compressionSummary,
    executeCompress,
    handleDownload,
    handleFilesSelected,
    handleRemove,
    hasCompressed: totals.hasCompressed,
    inputs,
    isCompressing,
    totalCompressed: totals.totalCompressed,
    totalOriginal: totals.totalOriginal,
    totalSavings: totals.totalSavings,
  };
}

async function compressOne(
  item: ImageFile,
  index: number,
  setInputs: React.Dispatch<React.SetStateAction<Array<ImageFile>>>
): Promise<ImageFile> {
  try {
    const compressed = await compressImage(item.file, {
      onProgress: (progress) => {
        setInputs((prev) =>
          prev.map((p, i) => (i === index ? { ...p, progress } : p))
        );
      },
    });
    return { compressed, file: item.file, progress: 100 };
  } catch {
    toast.error(`Failed to compress "${item.file.name}"`);
    return { compressed: undefined, file: item.file, progress: 100 };
  }
}
