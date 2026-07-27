import { TriangleAlertIcon } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

import { trackToolError } from '@/lib/analytics';

export type ErrorBoundaryProps = {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
  fallbackIcon?: ReactNode;
  onReset?: () => void;
  /**
   * Tool identifier passed to analytics when an error is caught.
   * When provided, the error is tracked via the analytics module.
   */
  toolId?: string;
  /** Human-readable tool name for analytics error tracking. */
  toolName?: string;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
  remountKey: number;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null, hasError: false, remountKey: 0 };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error, hasError: true, remountKey: 0 };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Tool error boundary caught an error:', error, errorInfo);

    const { toolId, toolName } = this.props;
    if (toolId && toolName) {
      trackToolError(toolId, toolName, error.message);
    }
  }

  private readonly handleReset = (): void => {
    this.props.onReset?.();
    this.setState({
      error: null,
      hasError: false,
      remountKey: this.state.remountKey + 1,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          fallbackDescription={this.props.fallbackDescription}
          fallbackIcon={this.props.fallbackIcon}
          fallbackTitle={this.props.fallbackTitle}
          onReset={this.handleReset}
        />
      );
    }
    return <div key={this.state.remountKey}>{this.props.children}</div>;
  }
}

export type ErrorFallbackProps = {
  fallbackTitle?: string;
  fallbackDescription?: string;
  fallbackIcon?: ReactNode;
  onReset?: () => void;
};

export function ErrorFallback({
  fallbackTitle = 'Something went wrong',
  fallbackDescription = 'This tool encountered an error.',
  fallbackIcon,
  onReset,
}: ErrorFallbackProps) {
  return (
    <div
      className={twMerge(
        'flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-16 text-center'
      )}
      role="alert"
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
        {fallbackIcon ?? <TriangleAlertIcon className="size-6 text-muted-fg" />}
      </div>
      <h3 className="text-balance font-semibold text-base/6 text-fg">
        {fallbackTitle}
      </h3>
      <p className="mt-2 text-pretty text-muted-fg text-sm/6">
        {fallbackDescription}
      </p>
      {onReset && (
        <button
          className="mt-4 cursor-pointer rounded-md bg-fg px-4 py-2 font-medium text-bg text-sm transition-opacity hover:opacity-80"
          onClick={onReset}
          type="button"
        >
          Try again
        </button>
      )}
    </div>
  );
}
