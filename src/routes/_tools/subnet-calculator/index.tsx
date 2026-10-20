'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { Card, CardContent } from '@/lib/components/ui/card';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import {
  SubnetCalculatorActions,
  SubnetCalculatorHelp,
  SubnetCalculatorInputs,
  SubnetCalculatorResult,
} from './-components/subnet-calculator-sections';
import { useSubnetCalculatorPage } from './-components/use-subnet-calculator-page';
import { meta } from './-meta';

const searchSchema = z.object({
  input: z.string().optional(),
});

export const Route = createFileRoute('/_tools/subnet-calculator/')({
  component: SubnetCalculatorPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

function SubnetCalculatorPage() {
  const { trackAction, trackComplete } = useToolTracking(
    'subnet-calculator',
    'Subnet Calculator'
  );
  const search = useSearch({ from: '/_tools/subnet-calculator/' });
  const { copiedKey, handleCopyLink, handleCopyPart, result, setState, state } =
    useSubnetCalculatorPage(search, trackAction, trackComplete);

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <SubnetCalculatorInputs
            input={state.input}
            onInput={(input) => setState((prev) => ({ ...prev, input }))}
          />
          <SubnetCalculatorActions onCopyLink={handleCopyLink} />
          <SubnetCalculatorResult
            copiedKey={copiedKey}
            onCopyPart={handleCopyPart}
            result={result}
          />
        </CardContent>
      </Card>
      <SubnetCalculatorHelp />
    </div>
  );
}
