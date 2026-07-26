import { TriangleAlertIcon } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

type ErrorBoundaryProps = {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
  fallbackIcon?: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null, hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error, hasError: true };
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo): void {
    console.error('Tool error boundary caught an error:', _error, _errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback {...this.props} />;
    }
    return this.props.children;
  }
}

type ErrorFallbackProps = Pick<
  ErrorBoundaryProps,
  'fallbackTitle' | 'fallbackDescription' | 'fallbackIcon'
>;

export function ErrorFallback({
  fallbackTitle = 'Something went wrong',
  fallbackDescription = 'This tool encountered an error. Try refreshing the page.',
  fallbackIcon,
}: ErrorFallbackProps) {
  return (
    <div
      className={twMerge(
        'flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-16 text-center'
      )}
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
    </div>
  );
}
