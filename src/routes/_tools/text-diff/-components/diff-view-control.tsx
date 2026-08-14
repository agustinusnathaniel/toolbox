'use client';

import { Button } from '@/lib/components/ui/button';
import type { DiffViewMode } from '@/lib/tools/text-diff/adapters/text-diff-view-mode';

/**
 * Id of the hint shown (and announced via aria-describedby on the Split
 * button) when split view is not available at the current container width.
 */
export const SPLIT_VIEW_UNAVAILABLE_HINT_ID = 'diff-view-split-unavailable';

interface DiffViewControlProps {
  /** The diff style that is actually being rendered. */
  effectiveMode: DiffViewMode;
  onModeChange: (mode: DiffViewMode) => void;
  /** True when the container is too narrow for a readable split view. */
  splitDisabled: boolean;
}

export function DiffViewControl({
  effectiveMode,
  onModeChange,
  splitDisabled,
}: DiffViewControlProps) {
  return (
    <fieldset
      aria-label="Diff view"
      className="flex shrink-0 rounded-lg border border-input p-0.5"
    >
      <Button
        aria-pressed={effectiveMode === 'unified'}
        className="touch-target whitespace-nowrap"
        intent={effectiveMode === 'unified' ? 'primary' : 'plain'}
        onPress={() => onModeChange('unified')}
        size="sm"
      >
        Unified
      </Button>
      <Button
        aria-describedby={
          splitDisabled ? SPLIT_VIEW_UNAVAILABLE_HINT_ID : undefined
        }
        aria-pressed={effectiveMode === 'split'}
        className="touch-target whitespace-nowrap"
        intent={effectiveMode === 'split' ? 'primary' : 'plain'}
        isDisabled={splitDisabled}
        onPress={() => onModeChange('split')}
        size="sm"
      >
        Split
      </Button>
    </fieldset>
  );
}
