'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { ArrowLeftRight, RotateCcw, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { CopyLinkButton } from '@/lib/components/copy-link-button';
import { CopyRow } from '@/lib/components/copy-row';
import { ToolError } from '@/lib/components/tool-error';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import { Label } from '@/lib/components/ui/field';
import { Input } from '@/lib/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/lib/components/ui/select';
import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import { usePersistedState } from '@/lib/hooks/use-persisted-state';
import type {
  ConversionResult,
  ParsedRates,
} from '@/lib/tools/currency-converter/adapters/currency-converter';
import {
  CURRENCIES,
  convertCurrency,
  formatRate,
  isCacheFresh,
  normalizeCurrency,
  parseRatesResponse,
  rateAgeDays,
  ratesUrl,
} from '@/lib/tools/currency-converter/adapters/currency-converter';
import {
  buildCurrencyConverterParams,
  buildCurrencyConverterStateFromSearch,
} from '@/lib/tools/currency-converter/adapters/currency-converter-params';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { meta } from './-meta';

const searchSchema = z.object({
  amount: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export const Route = createFileRoute('/_tools/currency-converter/')({
  component: CurrencyConverterPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

const CURRENCY_OPTIONS = CURRENCIES.map((c) => ({
  id: c.code,
  label: `${c.code} — ${c.name}`,
}));

const HOW_IT_WORKS = {
  description:
    'Enter an amount, pick currencies, and see the conversion at the latest ECB reference rate.',
  steps: [
    'Choose from and to currencies and enter an amount',
    'Rates load automatically from Frankfurter (daily ECB reference rates)',
    'See the converted result update instantly',
    'Swap currencies, copy the result, or share a link',
  ],
};

const FAQ = [
  {
    answer:
      'Daily reference rates from the European Central Bank, served by the free Frankfurter API. They update once per working day around 16:00 CET — not on weekends or holidays.',
    question: 'Where do the rates come from?',
  },
  {
    answer:
      'No. These are daily midpoint reference rates, good for travel, invoicing, and price display. They are not live bid/ask market rates — do not use them for trading.',
    question: 'Are these live market rates?',
  },
  {
    answer:
      'Yes. The last fetched rates are cached in your browser for 12 hours and reused when offline. Cached or stale rates are always labeled with their date.',
    question: 'Does it work offline?',
  },
] as const;

interface Pair {
  from: string;
  to: string;
}

function useCurrencyConverterState(persisted: Pair) {
  const search = useSearch({ from: '/_tools/currency-converter/' });
  const [state, setState] = useState(() => {
    const fromSearch = buildCurrencyConverterStateFromSearch(search);
    return {
      amount: fromSearch.amount,
      from:
        search.from === undefined
          ? normalizeCurrency(persisted.from, fromSearch.from)
          : fromSearch.from,
      to:
        search.to === undefined
          ? normalizeCurrency(persisted.to, fromSearch.to)
          : fromSearch.to,
    };
  });
  return [state, setState] as const;
}

interface RatesFetch {
  date: string | null;
  error: string | null;
  fromCache: boolean;
  rates: Record<string, number> | null;
  status: 'loading' | 'ready' | 'error';
}

interface CachedRates {
  at: number;
  date: string;
  rates: Record<string, number>;
}

function readCachedRates(base: string): CachedRates | null {
  try {
    const raw = localStorage.getItem(`currency-converter:rates:${base}`);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as {
      at: number;
      date: string;
      rates: Record<string, number>;
    };
    if (
      typeof parsed.at !== 'number' ||
      typeof parsed.date !== 'string' ||
      typeof parsed.rates !== 'object' ||
      parsed.rates === null
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

async function fetchRates(base: string): Promise<ParsedRates> {
  const response = await fetch(ratesUrl(base));
  if (!response.ok) {
    throw new Error(`Rates request failed (${response.status})`);
  }
  const parsed = parseRatesResponse(await response.json(), base);
  if (!parsed.data) {
    throw new Error(parsed.error ?? 'Invalid rates response');
  }
  try {
    localStorage.setItem(
      `currency-converter:rates:${base}`,
      JSON.stringify({
        at: Date.now(),
        date: parsed.data.date,
        rates: parsed.data.rates,
      })
    );
  } catch {
    // Cache is best-effort (private mode, quota) — live rates still work.
  }
  return parsed.data;
}

function useRates(base: string, needed: boolean) {
  const [state, setState] = useState<RatesFetch>({
    date: null,
    error: null,
    fromCache: false,
    rates: null,
    status: 'loading',
  });

  const load = useCallback(() => {
    if (!needed) {
      setState({
        date: null,
        error: null,
        fromCache: false,
        rates: null,
        status: 'ready',
      });
      return;
    }
    const cached = readCachedRates(base);
    if (cached && isCacheFresh(cached.at, Date.now())) {
      setState({
        date: cached.date,
        error: null,
        fromCache: true,
        rates: cached.rates,
        status: 'ready',
      });
      return;
    }
    setState({
      date: cached?.date ?? null,
      error: null,
      fromCache: cached !== null,
      rates: cached?.rates ?? null,
      status: cached ? 'ready' : 'loading',
    });
    fetchRates(base).then(
      (data) => {
        setState({
          date: data.date,
          error: null,
          fromCache: false,
          rates: data.rates,
          status: 'ready',
        });
      },
      (error) => {
        // Stale cache keeps serving — the rate line labels it. Only a
        // cache miss surfaces as an error with a retry button.
        if (cached) {
          return;
        }
        setState({
          date: null,
          error:
            error instanceof Error ? error.message : 'Failed to load rates',
          fromCache: false,
          rates: null,
          status: 'error',
        });
      }
    );
  }, [base, needed]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, retry: load };
}

function RateStatusLine({
  date,
  from,
  fromCache,
  rate,
  to,
}: {
  date: string | null;
  from: string;
  fromCache: boolean;
  rate: number | undefined;
  to: string;
}) {
  if (from === to || rate === undefined || date === null) {
    return null;
  }
  const age = rateAgeDays(date, Date.now());
  return (
    <p className="text-muted-fg text-xs">
      1 {from} = {formatRate(rate)} {to} · ECB {date}
      {age > 1 ? ` · ${age} days old` : ''}
      {fromCache ? ' · cached' : ''}
    </p>
  );
}

function ConversionOutput({
  copiedKey,
  hasInput,
  onCopy,
  onRetry,
  result,
}: {
  copiedKey: string | null;
  hasInput: boolean;
  onCopy: () => void;
  onRetry: () => void;
  result: ConversionResult & { loadError: string | null };
}) {
  if (!hasInput) {
    return (
      <p className="text-muted-fg text-xs">
        Enter an amount to see the conversion.
      </p>
    );
  }
  if (!result.isValid) {
    return (
      <div className="flex flex-col gap-2">
        <ToolError title={result.error ?? 'Invalid input'} />
        {result.loadError !== null && (
          <Button intent="outline" onPress={onRetry} size="sm">
            <RotateCcw className="size-4" />
            Retry
          </Button>
        )}
      </div>
    );
  }
  return (
    <CopyRow
      copied={copiedKey === 'result'}
      copyLabel="Copy result"
      label="Result"
      mono
      onCopy={onCopy}
      value={result.formatted ?? ''}
    />
  );
}

function CurrencySelectors({
  from,
  onFromChange,
  onSwap,
  onToChange,
  to,
}: {
  from: string;
  onFromChange: (v: string) => void;
  onSwap: () => void;
  onToChange: (v: string) => void;
  to: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_1fr]">
      <div className="flex flex-col gap-1">
        <Label htmlFor="currency-converter-from">From</Label>
        <Select
          aria-label="From currency"
          onSelectionChange={(key) => onFromChange(key as string)}
          selectedKey={from}
        >
          <SelectTrigger id="currency-converter-from" />
          <SelectContent items={CURRENCY_OPTIONS}>
            {(option) => <SelectItem id={option.id}>{option.label}</SelectItem>}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-end justify-center pb-1">
        <Button
          aria-label="Swap currencies"
          intent="outline"
          onPress={onSwap}
          size="sq-sm"
        >
          <ArrowLeftRight className="size-4" />
        </Button>
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="currency-converter-to">To</Label>
        <Select
          aria-label="To currency"
          onSelectionChange={(key) => onToChange(key as string)}
          selectedKey={to}
        >
          <SelectTrigger id="currency-converter-to" />
          <SelectContent items={CURRENCY_OPTIONS}>
            {(option) => <SelectItem id={option.id}>{option.label}</SelectItem>}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: cohesive single-screen island, keep together
function CurrencyConverterPage() {
  const { trackAction } = useToolTracking(
    'currency-converter',
    'Currency Converter'
  );
  const [persistedPair, setPersistedPair] = usePersistedState<Pair>(
    'currency-converter:pair',
    { from: 'USD', to: 'EUR' }
  );
  const [state, setState] = useCurrencyConverterState(persistedPair);
  const { copiedKey, copy } = useCopyFeedback();

  const needsRates = state.from !== state.to;
  const { date, fromCache, rates, retry, status } = useRates(
    state.from,
    needsRates
  );

  const result = useMemo(
    () =>
      convertCurrency(
        state.amount,
        state.from,
        state.to,
        status === 'ready' ? rates : null
      ),
    [state.amount, state.from, state.to, rates, status]
  );

  const handleFromChange = useCallback(
    (v: string) => {
      setState((prev) => ({ ...prev, from: v }));
      setPersistedPair((prev) => ({ ...prev, from: v }));
    },
    [setState, setPersistedPair]
  );

  const handleToChange = useCallback(
    (v: string) => {
      setState((prev) => ({ ...prev, to: v }));
      setPersistedPair((prev) => ({ ...prev, to: v }));
    },
    [setState, setPersistedPair]
  );

  const handleAmountChange = useCallback(
    (v: string) => {
      setState((prev) => ({ ...prev, amount: v }));
    },
    [setState]
  );

  const handleSwap = useCallback(() => {
    setState((prev) => ({ ...prev, from: prev.to, to: prev.from }));
    setPersistedPair((prev) => ({ from: prev.to, to: prev.from }));
    trackAction('swap');
  }, [trackAction, setState, setPersistedPair]);

  const handleCopyResult = useCallback(async () => {
    if (
      result.isValid &&
      result.formatted &&
      (await copy(result.formatted, 'result', 'Copied result'))
    ) {
      trackAction('copy');
    }
  }, [copy, result, trackAction]);

  const handleRetry = useCallback(() => {
    trackAction('retry');
    retry();
  }, [retry, trackAction]);

  const handleCopyLink = useCopyShareableLink(
    () => buildCurrencyConverterParams(state.amount, state.from, state.to),
    trackAction
  );

  const handleClear = useCallback(() => {
    setState((prev) => ({ ...prev, amount: '' }));
    trackAction('clear');
  }, [trackAction, setState]);

  const hasInput = state.amount.trim().length > 0;

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <CurrencySelectors
            from={state.from}
            onFromChange={handleFromChange}
            onSwap={handleSwap}
            onToChange={handleToChange}
            to={state.to}
          />
          <div className="flex flex-col gap-1">
            <label
              className="text-muted-fg text-sm"
              htmlFor="currency-converter-amount"
            >
              Amount
            </label>
            <Input
              aria-label="Amount"
              id="currency-converter-amount"
              inputMode="decimal"
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="Enter amount..."
              value={state.amount}
            />
          </div>
          <div className="flex flex-col gap-2">
            <ConversionOutput
              copiedKey={copiedKey as string | null}
              hasInput={hasInput}
              onCopy={handleCopyResult}
              onRetry={handleRetry}
              result={{
                ...result,
                loadError: status === 'error' ? 'load' : null,
              }}
            />
            {status === 'loading' && hasInput && result.isValid && (
              <p className="text-muted-fg text-xs">Loading latest rates…</p>
            )}
            <RateStatusLine
              date={date}
              from={state.from}
              fromCache={fromCache}
              rate={result.rate}
              to={state.to}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyLinkButton onPress={handleCopyLink} />
            <Button intent="outline" onPress={handleClear} size="sm">
              <Trash2 className="size-4" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
      <ToolHelp faq={[...FAQ]} howItWorks={HOW_IT_WORKS} />
    </div>
  );
}
