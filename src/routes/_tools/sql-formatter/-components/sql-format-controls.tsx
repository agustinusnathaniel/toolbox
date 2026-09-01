import { FileText, Trash2 } from 'lucide-react';

import { Button } from '@/lib/components/ui/button';
import { Label } from '@/lib/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/lib/components/ui/select';
import type { SqlDialect } from '@/lib/tools/sql-formatter/adapters/sql-formatter';
import type { SqlSearchAction } from '@/lib/tools/sql-formatter/adapters/sql-params';

const DIALECT_OPTIONS: ReadonlyArray<{ id: SqlDialect; label: string }> = [
  { id: 'sql', label: 'SQL (Generic)' },
  { id: 'mysql', label: 'MySQL' },
  { id: 'postgresql', label: 'PostgreSQL' },
  { id: 'sqlite', label: 'SQLite' },
  { id: 'bigquery', label: 'BigQuery' },
  { id: 'transactsql', label: 'Transact-SQL' },
];

const ACTION_OPTIONS: ReadonlyArray<{ id: SqlSearchAction; label: string }> = [
  { id: 'format', label: 'Format' },
  { id: 'minify', label: 'Minify' },
];

interface SqlFormatControlsProps {
  action: SqlSearchAction;
  computing: boolean;
  dialect: SqlDialect;
  onActionChange: (action: SqlSearchAction) => void;
  onClear: () => void;
  onDialectChange: (dialect: SqlDialect) => void;
  onFormat: () => void;
}

export function SqlFormatControls({
  action,
  computing,
  dialect,
  onActionChange,
  onClear,
  onDialectChange,
  onFormat,
}: SqlFormatControlsProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1">
        <Label htmlFor="sql-dialect">Dialect</Label>
        <Select
          aria-label="SQL dialect"
          onSelectionChange={(key) => onDialectChange(key as SqlDialect)}
          selectedKey={dialect}
        >
          <SelectTrigger id="sql-dialect" />
          <SelectContent items={DIALECT_OPTIONS}>
            {(option) => <SelectItem id={option.id}>{option.label}</SelectItem>}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="sql-action">Action</Label>
        <Select
          aria-label="Format action"
          onSelectionChange={(key) => onActionChange(key as SqlSearchAction)}
          selectedKey={action}
        >
          <SelectTrigger id="sql-action" />
          <SelectContent items={ACTION_OPTIONS}>
            {(option) => <SelectItem id={option.id}>{option.label}</SelectItem>}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Button intent="primary" onPress={onFormat} size="sm">
          <FileText className="size-4" />
          {action === 'minify' ? 'Minify' : 'Format'}
        </Button>
        <Button intent="outline" onPress={onClear} size="sm">
          <Trash2 className="size-4" />
          Clear
        </Button>
        {computing && (
          <span aria-live="polite" className="text-muted-fg text-xs">
            Formatting…
          </span>
        )}
      </div>
    </div>
  );
}
