'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import {
  compressImage,
  downloadFiles,
} from '@/lib/tools/zippy-img/adapters/zippy';

export const MAX_FILES = 2;
export const MAX_SIZE_MB = 15;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

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

      setInputs((prev) => {
        const existing = prev.map((p) => p.file.name);
        const newFiles = accepted.filter((f) => !existing.includes(f.name));
        return [
          ...prev.map((p) => ({ ...p, progress: 0 })),
          ...newFiles.map((file) => ({ file, progress: 0 })),
        ].slice(0, MAX_FILES);
      });
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
      prev.map((p) => ({ ...p, progress: 0, compressed: undefined }))
    );

    const results = await Promise.all(
      inputs.map(async (item, index) => {
        try {
          const compressed = await compressImage(item.file, {
            onProgress: (progress) => {
              setInputs((prev) =>
                prev.map((p, i) => (i === index ? { ...p, progress } : p))
              );
            },
          });
          return { file: item.file, progress: 100, compressed };
        } catch {
          toast.error(`Failed to compress "${item.file.name}"`);
          return { file: item.file, progress: 0, compressed: undefined };
        }
      })
    );

    setInputs(results);
    setIsCompressing(false);
    const successCount = results.filter(
      (r) => r.compressed !== undefined
    ).length;
    trackComplete(successCount > 0);
    toast.success('Compression complete');
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
  const hasCompressed = inputs.some((i) => i.compressed !== undefined);
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
  const totalSavings =
    totalOriginal > 0
      ? Math.round(((totalOriginal - totalCompressed) / totalOriginal) * 100)
      : 0;

  return {
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
  };
}
