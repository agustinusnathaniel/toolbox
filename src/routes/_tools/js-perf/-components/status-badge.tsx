import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  XCircle,
} from 'lucide-react';

import { Badge } from '@/lib/components/ui/badge';
import type { ExecutionResult } from '@/lib/js-perf-comp-core/models';

export function StatusBadge({ result }: { result: ExecutionResult | null }) {
  if (!result) {
    return null;
  }

  switch (result.status) {
    case 'success':
      return (
        <Badge
          className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          variant="outline"
        >
          <CheckCircle2 className="size-3" />
          Success
        </Badge>
      );
    case 'runtime_error':
      return (
        <Badge variant="destructive">
          <XCircle className="size-3" />
          Runtime Error
        </Badge>
      );
    case 'timeout':
      return (
        <Badge
          className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
          variant="outline"
        >
          <Clock className="size-3" />
          Timeout
        </Badge>
      );
    case 'terminated':
      return (
        <Badge
          className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
          variant="outline"
        >
          <ShieldAlert className="size-3" />
          Terminated
        </Badge>
      );
    case 'worker_error':
      return (
        <Badge variant="destructive">
          <AlertCircle className="size-3" />
          Worker Error
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary">
          <AlertCircle className="size-3" />
          Unknown
        </Badge>
      );
  }
}
