'use client';

import { UploadIcon } from 'lucide-react';

import { Button } from '@/lib/components/ui/button';
import { DropZone } from '@/lib/components/ui/drop-zone';
import { FileTrigger } from '@/lib/components/ui/file-trigger';

export function HashDropZone({
  onFile,
  onFileSelect,
}: {
  onFile: (f: File) => void;
  onFileSelect: (files: FileList | null) => void;
}) {
  return (
    <DropZone
      className="flex flex-col items-center justify-center gap-3"
      onDrop={async (e) => {
        for (const item of e.items) {
          if (item.kind === 'file') {
            const file = await item.getFile();
            if (file) {
              await onFile(file);
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
      <FileTrigger allowsMultiple={false} onSelect={onFileSelect}>
        <Button intent="outline" size="sm">
          Browse file
        </Button>
      </FileTrigger>
    </DropZone>
  );
}
