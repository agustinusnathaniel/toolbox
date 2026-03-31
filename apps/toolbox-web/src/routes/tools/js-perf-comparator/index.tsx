import { createFileRoute } from '@tanstack/react-router';

import { Badge } from '@/lib/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/lib/components/ui/card';

export const Route = createFileRoute('/tools/js-perf-comparator/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>JS Perf Comparator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Badge intent="warning">Phase 5 New Tool</Badge>
        <p className="text-muted-fg text-sm">
          This placeholder route reserves the controlled-runtime JavaScript
          performance comparator experience.
        </p>
      </CardContent>
    </Card>
  );
}
