import { createFileRoute, Outlet } from '@tanstack/react-router';

import { Heading } from '@/lib/components/ui/heading';

export const Route = createFileRoute('/tools')({
  component: ToolLayout,
});

function ToolLayout() {
  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex items-center justify-between">
        <Heading level={1}>Tools</Heading>
      </div>
      <Outlet />
    </div>
  );
}
