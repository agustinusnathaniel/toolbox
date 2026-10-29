'use client';

import { Button } from '@/lib/components/ui/button';
import { Progress } from '@/lib/components/ui/progress';

import type { ImageFile } from './use-zippy-img';

type FileQueueProps = {
  inputs: Array<ImageFile>;
  isCompressing: boolean;
  onRemove: (name: string) => void;
};

export function FileQueue({ inputs, isCompressing, onRemove }: FileQueueProps) {
  return (
    <div className="flex flex-col gap-2">
      {inputs.map((item) => (
        <div
          className="flex items-center gap-3 rounded-md border p-3 outline-1 outline-black/8 -outline-offset-1 dark:outline-white/8"
          key={item.file.name}
        >
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="truncate font-medium text-sm">
              {item.file.name}
            </span>
            <Progress
              aria-label={`Compression progress for ${item.file.name}`}
              className="w-full"
              value={item.progress}
            />
          </div>
          <Button
            disabled={isCompressing}
            onClick={() => onRemove(item.file.name)}
            size="sm"
            variant="ghost"
          >
            Remove
          </Button>
        </div>
      ))}
    </div>
  );
}
