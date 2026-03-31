import { createFileRoute, Outlet, useMatches } from '@tanstack/react-router';

import { Heading } from '@/lib/components/ui/heading';

export const Route = createFileRoute('/tools')({
  component: ToolLayout,
});

function ToolLayout() {
  const match = useMatches();
  const leafMatch = match.at(-1);
  const { pageTitle } = leafMatch?.staticData ?? {};

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex items-center justify-between">
        <Heading className="mx-auto text-center" level={1}>
          {pageTitle}
        </Heading>
      </div>
      <Outlet />
    </div>
  );
}
