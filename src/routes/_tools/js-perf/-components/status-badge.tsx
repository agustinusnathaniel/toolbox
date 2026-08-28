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
        <Badge intent="success" isCircle={false}>
          <CheckCircle2 className="size-3" />
          Success
        </Badge>
      );
    case 'runtime_error':
      return (
        <Badge intent="danger" isCircle={false}>
          <XCircle className="size-3" />
          Runtime Error
        </Badge>
      );
    case 'timeout':
      return (
        <Badge intent="warning" isCircle={false}>
          <Clock className="size-3" />
          Timeout
        </Badge>
      );
    case 'terminated':
      return (
        <Badge intent="warning" isCircle={false}>
          <ShieldAlert className="size-3" />
          Terminated
        </Badge>
      );
    case 'worker_error':
      return (
        <Badge intent="danger" isCircle={false}>
          <AlertCircle className="size-3" />
          Worker Error
        </Badge>
      );
    default:
      return (
        <Badge intent="secondary" isCircle={false}>
          <AlertCircle className="size-3" />
          Unknown
        </Badge>
      );
  }
}
