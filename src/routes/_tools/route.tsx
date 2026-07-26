import { createFileRoute, Outlet, useMatches } from '@tanstack/react-router';

import { ErrorBoundary } from '@/lib/components/error-boundary';
import { Heading } from '@/lib/components/ui/heading';

export const Route = createFileRoute('/_tools')({
  component: ToolLayout,
});

function ToolLayout() {
  const match = useMatches();
  const leafMatch = match.at(-1);
  const meta = leafMatch?.staticData?.meta;

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex items-center justify-between">
        <Heading className="mx-auto text-center" level={1}>
          {meta?.pageTitle}
        </Heading>
      </div>
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </div>
  );
}
