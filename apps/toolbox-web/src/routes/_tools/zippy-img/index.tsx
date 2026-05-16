'use client';

import { createFileRoute } from '@tanstack/react-router';
import { Download, HelpCircleIcon, InfoIcon, UploadIcon } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/lib/components/ui/button';
import { Card, CardContent, CardHeader } from '@/lib/components/ui/card';
import {
  Disclosure,
  DisclosureGroup,
  DisclosurePanel,
  DisclosureTrigger,
} from '@/lib/components/ui/disclosure-group';
import { DropZone } from '@/lib/components/ui/drop-zone';
import { FileTrigger } from '@/lib/components/ui/file-trigger';
import {
  ProgressBar,
  ProgressBarTrack,
  ProgressBarValue,
} from '@/lib/components/ui/progress-bar';
import {
  compressImage,
  downloadFiles,
} from '@/lib/tools/zippy-img/adapters/zippy';
import { TOOL_META } from '@/lib/utils/metadata';

const meta = TOOL_META['zippy-img'];

export const Route = createFileRoute('/_tools/zippy-img/')({
  component: ZippyImgPage,
  staticData: {
    pageTitle: meta.title,
  },
  head: () => ({
    meta: [
      { title: meta.title },
      { name: 'description', content: meta.description },
      { property: 'og:title', content: meta.title },
      { property: 'og:description', content: meta.description },
      { property: 'og:type', content: 'website' },
    ],
  }),
});

const MAX_FILES = 2;
const MAX_SIZE_MB = 15;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

interface ImageFile {
  compressed?: File;
  file: File;
  progress: number;
}

function ZippyImgPage() {
  const [inputs, setInputs] = useState<Array<ImageFile>>([]);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFilesSelected = useCallback((files: Array<File>) => {
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
  }, []);

  const executeCompress = useCallback(async () => {
    if (!inputs.length) {
      return;
    }

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
    toast.success('Compression complete');
  }, [inputs]);

  const handleDownload = useCallback(() => {
    const compressed = inputs
      .map((i) => i.compressed)
      .filter((f): f is File => f !== undefined);
    if (!compressed.length) {
      return;
    }
    downloadFiles(compressed);
  }, [inputs]);

  const handleRemove = useCallback((name: string) => {
    setInputs((prev) => prev.filter((p) => p.file.name !== name));
  }, []);

  const allDone = inputs.length > 0 && inputs.every((i) => i.progress >= 100);
  const hasCompressed = inputs.some((i) => i.compressed !== undefined);

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-2xl">
      <Card>
        <CardHeader />
        <CardContent className="flex flex-col gap-4">
          <p className="text-muted-fg text-sm">
            Compress images securely in your browser. No files are uploaded to
            any server.
          </p>

          <DropZone
            className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-6"
            onDrop={async (e) => {
              const files: Array<File> = [];
              for (const item of e.items) {
                if (item.kind === 'file') {
                  const file = await item.getFile();
                  if (file) {
                    files.push(file);
                  }
                }
              }
              handleFilesSelected(files);
            }}
          >
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="flex size-10 items-center justify-center rounded-full border">
                <UploadIcon className="size-5 text-muted-fg" />
              </div>
              <p className="font-medium text-sm">Drag & drop images here</p>
              <p className="text-muted-fg text-xs">
                Or click Browse to select (max {MAX_FILES} files, up to{' '}
                {MAX_SIZE_MB}MB each)
              </p>
            </div>
            <FileTrigger
              acceptedFileTypes={['image/*']}
              allowsMultiple
              onSelect={(e) => {
                if (e) {
                  handleFilesSelected(Array.from(e));
                }
              }}
            >
              <Button intent="outline" size="sm">
                Browse files
              </Button>
            </FileTrigger>
          </DropZone>

          {inputs.length > 0 && (
            <div className="flex flex-col gap-2">
              {inputs.map((item) => (
                <div
                  className="flex items-center gap-3 rounded-md border p-3"
                  key={item.file.name}
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="truncate font-medium text-sm">
                      {item.file.name}
                    </span>
                    <ProgressBar className="w-full" value={item.progress}>
                      <ProgressBarTrack />
                      <ProgressBarValue />
                    </ProgressBar>
                  </div>
                  <Button
                    intent="plain"
                    isDisabled={isCompressing}
                    onPress={() => handleRemove(item.file.name)}
                    size="sm"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
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

      <DisclosureGroup>
        <Disclosure>
          <DisclosureTrigger>
            <span className="flex items-center gap-2">
              <InfoIcon className="size-4" />
              How it works
            </span>
          </DisclosureTrigger>
          <DisclosurePanel>
            <div className="flex flex-col gap-3 text-muted-fg text-sm">
              <p>
                This tool compresses images directly in your browser. Your files
                are never uploaded to any server.
              </p>
              <ul className="list-inside list-disc">
                <li>Drag and drop or click Browse to select images</li>
                <li>
                  Maximum {MAX_FILES} files at a time, up to {MAX_SIZE_MB}MB
                  each
                </li>
                <li>Click Compress Now to reduce file sizes</li>
                <li>Download individual files or all at once as a ZIP</li>
              </ul>
            </div>
          </DisclosurePanel>
        </Disclosure>
        <Disclosure>
          <DisclosureTrigger>
            <span className="flex items-center gap-2">
              <HelpCircleIcon className="size-4" />
              FAQ
            </span>
          </DisclosureTrigger>
          <DisclosurePanel>
            <div className="flex flex-col gap-3 text-muted-fg text-sm">
              <div className="flex flex-col gap-1">
                <p className="font-medium text-fg">Is my data safe?</p>
                <p>
                  Yes. All processing happens in your browser. No files or
                  images are sent to any server.
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-medium text-fg">
                  What formats are supported?
                </p>
                <p>Most common image formats including PNG, JPEG, and WebP.</p>
              </div>
            </div>
          </DisclosurePanel>
        </Disclosure>
      </DisclosureGroup>
    </div>
  );
}
