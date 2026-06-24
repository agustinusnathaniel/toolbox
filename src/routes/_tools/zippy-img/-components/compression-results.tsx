'use client';

import { Card, CardContent, CardHeader } from '@/lib/components/ui/card';
import { formatFileSize } from '@/lib/tools/zippy-img/adapters/zippy';

import type { CompressedItem } from './use-zippy-img';

type CompressionResultsProps = {
  items: Array<CompressedItem>;
  totalOriginal: number;
  totalCompressed: number;
  totalSavings: number;
};

export function CompressionResults({
  items,
  totalOriginal,
  totalCompressed,
  totalSavings,
}: CompressionResultsProps) {
  return (
    <Card>
      <CardHeader title="Compression Results" />
      <CardContent className="flex flex-col gap-4">
        {items.map((item) => {
          const savings = Math.round(
            ((item.file.size - item.compressed.size) / item.file.size) * 100
          );
          return (
            <div className="flex flex-col gap-2" key={item.file.name}>
              <div className="flex items-center justify-between text-sm">
                <span className="truncate font-medium">{item.file.name}</span>
                <span
                  className={savings > 0 ? 'text-success' : 'text-muted-fg'}
                >
                  {savings > 0 ? `-${savings}%` : 'No reduction'}
                </span>
              </div>
              <div className="flex h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="rounded-full bg-success transition-all"
                  style={{ width: `${Math.max(100 - savings, 5)}%` }}
                />
              </div>
              <div className="flex justify-between text-muted-fg text-xs">
                <span>{formatFileSize(item.file.size)}</span>
                <span>{formatFileSize(item.compressed.size)}</span>
              </div>
            </div>
          );
        })}
        {items.length > 1 && (
          <div className="flex items-center justify-between border-t pt-3 font-medium text-sm">
            <span>Total savings</span>
            <span className={totalSavings > 0 ? 'text-success' : ''}>
              {totalSavings > 0
                ? `-${totalSavings}% (${formatFileSize(totalOriginal)} → ${formatFileSize(totalCompressed)})`
                : 'No reduction'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
