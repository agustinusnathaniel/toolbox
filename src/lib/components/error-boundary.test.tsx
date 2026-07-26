import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ErrorBoundary } from './error-boundary';

/** A component that throws on render. */
function Bomb({ shouldThrow }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('💣 intentional crash');
  }
  return <div>all good</div>;
}

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );
    expect(screen.getByText('all good')).toBeDefined();
  });

  it('catches render errors and shows fallback', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockReturnValue(undefined);

    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeDefined();
    expect(
      screen.getByText(
        'This tool encountered an error. Try refreshing the page.'
      )
    ).toBeDefined();

    consoleSpy.mockRestore();
  });

  it('accepts custom fallback title and description', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockReturnValue(undefined);

    render(
      <ErrorBoundary
        fallbackDescription="Please reload this tool."
        fallbackTitle="Tool crashed"
      >
        <Bomb shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByText('Tool crashed')).toBeDefined();
    expect(screen.getByText('Please reload this tool.')).toBeDefined();

    consoleSpy.mockRestore();
  });

  it('logs caught error to console via componentDidCatch', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockReturnValue(undefined);
    const error = new Error('custom error');

    function CustomBomb(): ReactNode {
      throw error;
    }

    render(
      <ErrorBoundary>
        <CustomBomb />
      </ErrorBoundary>
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'Tool error boundary caught an error:',
      error,
      expect.any(Object)
    );

    consoleSpy.mockRestore();
  });
});
