'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { Check, Copy, Dices, Link } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import { Checkbox } from '@/lib/components/ui/checkbox';
import { Label } from '@/lib/components/ui/field';
import { NumberField, NumberInput } from '@/lib/components/ui/number-field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/lib/components/ui/select';
import type {
  UuidOptions,
  UuidResult,
} from '@/lib/tools/uuid-generator/adapters/uuid-generator';
import {
  generateUuids,
  UUID_VERSION_OPTIONS,
} from '@/lib/tools/uuid-generator/adapters/uuid-generator';
import {
  buildUuidParams,
  buildUuidStateFromSearch,
} from '@/lib/tools/uuid-generator/adapters/uuid-params';
import { copyToClipboard } from '@/lib/utils/clipboard';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { meta } from './-meta';

const searchSchema = z.object({
  count: z.string().optional(),
  hyphens: z.string().optional(),
  uppercase: z.string().optional(),
  version: z.string().optional(),
});

export const Route = createFileRoute('/_tools/uuid-generator/')({
  component: UuidGeneratorPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

function UuidGeneratorPage() {
  const { trackAction } = useToolTracking('uuid-generator', 'UUID Generator');
  const search = useSearch({ from: '/_tools/uuid-generator/' });
  const [options, setOptions] = useState<UuidOptions>(() =>
    buildUuidStateFromSearch(search)
  );
  const [result, setResult] = useState<UuidResult | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const count = useMemo(() => options.count, [options.count]);
  const version = useMemo(() => options.version, [options.version]);
  const hyphens = useMemo(() => options.hyphens, [options.hyphens]);
  const uppercase = useMemo(() => options.uppercase, [options.uppercase]);

  const handleGenerate = useCallback(() => {
    setResult(generateUuids(options));
    setCopiedIndex(null);
    trackAction('generate');
  }, [options, trackAction]);

  const handleCopy = useCallback(
    async (uuid: string, index: number) => {
      if (await copyToClipboard(uuid, 'Copied UUID')) {
        setCopiedIndex(index);
        trackAction('copy');
        setTimeout(() => setCopiedIndex(null), 1500);
      }
    },
    [trackAction]
  );

  const handleCopyAll = useCallback(async () => {
    if (
      result?.isValid &&
      result.uuids.length > 1 &&
      (await copyToClipboard(result.uuids.join('\n'), 'Copied all UUIDs'))
    ) {
      trackAction('copy_all');
    }
  }, [result, trackAction]);

  const handleCopyLink = useCallback(async () => {
    const params = buildUuidParams(options);
    const url = `${window.location.origin}${window.location.pathname}${
      params.toString() ? `?${params.toString()}` : ''
    }`;
    if (await copyToClipboard(url, 'Copied Shareable Link')) {
      trackAction('copy_link');
    }
  }, [options, trackAction]);

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-1">
              <Label htmlFor="uuid-version">Version</Label>
              <Select
                aria-label="UUID version"
                onSelectionChange={(key) => {
                  setOptions((prev) => ({
                    ...prev,
                    version: key as UuidOptions['version'],
                  }));
                  setResult(null);
                }}
                selectedKey={version}
              >
                <SelectTrigger />
                <SelectContent items={UUID_VERSION_OPTIONS}>
                  {(option) => (
                    <SelectItem id={option.id}>{option.label}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="uuid-count">Count</Label>
              <NumberField
                maxValue={1000}
                minValue={1}
                onChange={(v) => {
                  setOptions((prev) => ({ ...prev, count: v ?? prev.count }));
                  setResult(null);
                }}
                value={count}
              >
                <NumberInput id="uuid-count" />
              </NumberField>
            </div>
            <Button onPress={handleGenerate} size="sm">
              <Dices className="size-4" />
              Generate
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Checkbox
              isSelected={uppercase}
              onChange={(selected) => {
                setOptions((prev) => ({ ...prev, uppercase: selected }));
                setResult(null);
              }}
            >
              Uppercase (A-Z)
            </Checkbox>
            <Checkbox
              isSelected={hyphens}
              onChange={(selected) => {
                setOptions((prev) => ({ ...prev, hyphens: selected }));
                setResult(null);
              }}
            >
              Include hyphens
            </Checkbox>
          </div>

          <div className="flex flex-wrap gap-2">
            {result?.isValid && result.uuids.length > 1 && (
              <Button intent="outline" onPress={handleCopyAll} size="sm">
                Copy all
              </Button>
            )}
            <Button
              aria-label="Copy shareable link"
              intent="outline"
              onPress={handleCopyLink}
              size="sm"
            >
              <Link className="size-4" />
              Copy link
            </Button>
          </div>

          {result && !result.isValid && (
            <p className="text-danger text-sm" role="alert">
              {result.error}
            </p>
          )}

          {result?.isValid && result.uuids.length > 0 && (
            <ol className="flex max-h-96 flex-col gap-2 overflow-auto">
              {result.uuids.map((uuid, index) => (
                <li
                  className="flex items-center justify-between gap-2 rounded-lg border bg-(--card-bg)/50 p-3"
                  key={uuid}
                >
                  <code className="min-w-0 truncate font-mono text-sm">
                    {uuid}
                  </code>
                  <Button
                    aria-label={`Copy UUID ${index + 1}`}
                    intent="outline"
                    onPress={() => handleCopy(uuid, index)}
                    size="sq-sm"
                  >
                    {copiedIndex === index ? (
                      <Check className="size-4 text-success" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      <ToolHelp
        faq={[
          {
            answer:
              'No. UUIDs are generated entirely in your browser using the native Web Crypto API. Nothing leaves your device.',
            question: 'Is my data sent anywhere?',
          },
          {
            answer:
              'UUID v4 is fully random. UUID v7 encodes the current timestamp in the first bytes, so values are roughly time-ordered, which can improve database index locality.',
            question: 'What is the difference between v4 and v7?',
          },
        ]}
        howItWorks={{
          description:
            'Pick a version, choose how many UUIDs you need, and copy them individually or all at once.',
          steps: [
            'Select UUID v4 or v7',
            'Set the count (1-1000) and formatting options',
            'Click Generate',
            'Copy a single UUID or copy all',
          ],
        }}
      />
    </div>
  );
}
