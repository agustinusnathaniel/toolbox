'use client';

import { UploadIcon } from 'lucide-react';

import { Button } from '@/lib/components/ui/button';
import { DropZone } from '@/lib/components/ui/drop-zone';
import { FileTrigger } from '@/lib/components/ui/file-trigger';

type ImageDropZoneProps = {
  maxFiles: number;
  maxSizeMB: number;
  onFilesSelected: (files: Array<File>) => void;
};

export function ImageDropZone({
  maxFiles,
  maxSizeMB,
  onFilesSelected,
}: ImageDropZoneProps) {
  return (
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
        onFilesSelected(files);
      }}
    >
      <div className="flex flex-col items-center gap-1 text-center">
        <div className="flex size-10 items-center justify-center rounded-full border">
          <UploadIcon className="size-5 text-muted-fg" />
        </div>
        <p className="font-medium text-sm">Drag & drop images here</p>
        <p className="text-muted-fg text-xs">
          Or click Browse to select (max {maxFiles} files, up to {maxSizeMB}MB
          each)
        </p>
      </div>
      <FileTrigger
        acceptedFileTypes={['image/*']}
        allowsMultiple
        onSelect={(e) => {
          if (e) {
            onFilesSelected(Array.from(e));
          }
        }}
      >
        <Button intent="outline" size="sm">
          Browse files
        </Button>
      </FileTrigger>
    </DropZone>
  );
}
