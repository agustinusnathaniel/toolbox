'use client';

import { Button } from '@/lib/components/ui/button';
import {
  ProgressBar,
  ProgressBarTrack,
  ProgressBarValue,
} from '@/lib/components/ui/progress-bar';

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
            onPress={() => onRemove(item.file.name)}
            size="sm"
          >
            Remove
          </Button>
        </div>
      ))}
    </div>
  );
}
