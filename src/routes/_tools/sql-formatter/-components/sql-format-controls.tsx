import { FileText, Trash2 } from 'lucide-react';

import { Button } from '@/lib/components/ui/button';
import { FieldLabel } from '@/lib/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
        <FieldLabel htmlFor="sql-dialect">Dialect</FieldLabel>
        <Select
          onValueChange={(key) => onDialectChange(key as SqlDialect)}
          value={dialect}
        >
          <SelectTrigger aria-label="Select option">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DIALECT_OPTIONS.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <FieldLabel htmlFor="sql-action">Action</FieldLabel>
        <Select
          onValueChange={(key) => onActionChange(key as SqlSearchAction)}
          value={action}
        >
          <SelectTrigger aria-label="Select option">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACTION_OPTIONS.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={onFormat} size="sm" variant="default">
          <FileText className="size-4" />
          {action === 'minify' ? 'Minify' : 'Format'}
        </Button>
        <Button onClick={onClear} size="sm" variant="outline">
          <Trash2 className="size-4" />
          Clear
        </Button>
        {computing && (
          <span aria-live="polite" className="text-muted-foreground text-xs">
            Formatting…
          </span>
        )}
      </div>
    </div>
  );
}
