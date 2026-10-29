'use client';

import { UploadIcon } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '@/lib/components/ui/button';

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
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const files = event.dataTransfer.files;
    // Ignore empty drops (e.g. dropped text) and non-file drags.
    if (!files || files.length === 0) {
      return;
    }
    onFilesSelected(Array.from(files));
  };

  return (
    // A drop target is not a natively interactive element, and the Browse
    // button next to it is the keyboard path, so the handlers stay here.
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: file drop target with a keyboard-accessible Browse button
    <section
      aria-label="Image drop zone"
      className={`flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-6 transition-colors ${
        isDragging ? 'border-primary bg-primary/5' : ''
      }`}
      onDragEnter={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center gap-1 text-center">
        <div className="flex size-10 items-center justify-center rounded-full border outline-1 outline-black/8 -outline-offset-1 dark:outline-white/8">
          <UploadIcon
            aria-hidden="true"
            className="size-5 text-muted-foreground"
          />
        </div>
        <p className="font-medium text-sm">Drag & drop images here</p>
        <p className="text-muted-foreground text-xs">
          Or click Browse to select (max {maxFiles} files, up to {maxSizeMB}MB
          each)
        </p>
      </div>
      <input
        accept="image/*"
        className="sr-only"
        multiple
        onChange={(event) => {
          if (event.target.files) {
            onFilesSelected(Array.from(event.target.files));
          }
          // Reset so selecting the same files again still fires a change.
          event.target.value = '';
        }}
        ref={inputRef}
        type="file"
      />
      <Button
        onClick={() => inputRef.current?.click()}
        size="sm"
        variant="outline"
      >
        Browse files
      </Button>
    </section>
  );
}
