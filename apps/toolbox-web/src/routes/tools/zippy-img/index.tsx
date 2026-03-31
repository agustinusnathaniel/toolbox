import { createFileRoute } from '@tanstack/react-router';

import { Badge } from '@/lib/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/lib/components/ui/card';

export const Route = createFileRoute('/tools/zippy-img/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Zippy Image</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Badge intent="info">Phase 4 Migration Target</Badge>
        <p className="text-muted-fg text-sm">
          This placeholder route is ready for zippy-img integration in the
          unified app shell.
        </p>
      </CardContent>
    </Card>
  );
}
