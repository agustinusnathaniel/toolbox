import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vite-plus/test';

import type { DiffViewMode } from '@/lib/tools/text-diff/adapters/text-diff-view-mode';

import {
  DiffViewControl,
  SPLIT_VIEW_UNAVAILABLE_HINT_ID,
} from './diff-view-control';

function getGroup() {
  return screen.getByRole('group', { name: 'Diff view' });
}

function getButtons() {
  return {
    split: screen.getByRole('button', { name: 'Split' }),
    unified: screen.getByRole('button', { name: 'Unified' }),
  };
}

afterEach(() => {
  cleanup();
});

describe('DiffViewControl', () => {
  test('renders a group labelled "Diff view" with both options', () => {
    render(
      <DiffViewControl
        effectiveMode="unified"
        onModeChange={vi.fn()}
        splitDisabled={false}
      />
    );

    expect(getGroup()).toBeInTheDocument();
    expect(getButtons().unified).toBeInTheDocument();
    expect(getButtons().split).toBeInTheDocument();
  });

  test('marks the effective mode as pressed via aria-pressed', () => {
    const { rerender } = render(
      <DiffViewControl
        effectiveMode="unified"
        onModeChange={vi.fn()}
        splitDisabled={false}
      />
    );

    expect(getButtons().unified).toHaveAttribute('aria-pressed', 'true');
    expect(getButtons().split).toHaveAttribute('aria-pressed', 'false');

    rerender(
      <DiffViewControl
        effectiveMode="split"
        onModeChange={vi.fn()}
        splitDisabled={false}
      />
    );

    expect(getButtons().unified).toHaveAttribute('aria-pressed', 'false');
    expect(getButtons().split).toHaveAttribute('aria-pressed', 'true');
  });

  test('disables split and keeps aria-pressed false when split is not usable', () => {
    render(
      <DiffViewControl
        effectiveMode="unified"
        onModeChange={vi.fn()}
        splitDisabled
      />
    );

    expect(getButtons().split).toBeDisabled();
    expect(getButtons().split).toHaveAttribute('aria-pressed', 'false');
    expect(getButtons().split).toHaveAttribute(
      'aria-describedby',
      SPLIT_VIEW_UNAVAILABLE_HINT_ID
    );
    expect(getButtons().unified).not.toBeDisabled();
  });

  test('requests the pressed option via onModeChange', () => {
    const onModeChange = vi.fn<(mode: DiffViewMode) => void>();
    render(
      <DiffViewControl
        effectiveMode="unified"
        onModeChange={onModeChange}
        splitDisabled={false}
      />
    );

    fireEvent.click(getButtons().split);
    expect(onModeChange).toHaveBeenCalledWith('split');

    fireEvent.click(getButtons().unified);
    expect(onModeChange).toHaveBeenCalledWith('unified');
  });

  test('does not fire onModeChange when split is disabled', () => {
    const onModeChange = vi.fn<(mode: DiffViewMode) => void>();
    render(
      <DiffViewControl
        effectiveMode="unified"
        onModeChange={onModeChange}
        splitDisabled
      />
    );

    fireEvent.click(getButtons().split);
    expect(onModeChange).not.toHaveBeenCalled();
  });
});
