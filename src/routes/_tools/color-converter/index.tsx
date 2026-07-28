'use client';

import { createFileRoute } from '@tanstack/react-router';
import { Check, Copy } from 'lucide-react';
import { useCallback, useState } from 'react';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent, CardHeader } from '@/lib/components/ui/card';
import type { ColorFormat } from '@/lib/tools/color-converter/adapters/color-converter';
import {
  formatColorString,
  PRESET_COLORS,
  parseColor,
} from '@/lib/tools/color-converter/adapters/color-converter';

const FORMATS: Array<{ key: ColorFormat; label: string }> = [
  { key: 'hex', label: 'HEX' },
  { key: 'rgb', label: 'RGB' },
  { key: 'hsl', label: 'HSL' },
  { key: 'oklch', label: 'OKLCH' },
];

const meta = {
  description: 'Convert colors between HEX, RGB, HSL, and OKLCH formats.',
  pageTitle: 'Color Converter',
  slug: 'color-converter',
} as const;

export const Route = createFileRoute('/_tools/color-converter/')({
  component: ColorConverterPage,
  head: () => ({
    meta: [
      { title: meta.pageTitle },
      { content: meta.description, name: 'description' },
      { content: meta.pageTitle, property: 'og:title' },
      { content: meta.description, property: 'og:description' },
      { content: 'website', property: 'og:type' },
    ],
  }),
  staticData: {
    meta,
  },
});

function ColorConverterPage() {
  const { trackAction } = useToolTracking('color-converter', 'Color Converter');
  const [input, setInput] = useState('#ff0000');
  const [copied, setCopied] = useState<ColorFormat | null>(null);

  const parsed = parseColor(input);

  const handleCopy = useCallback(
    async (format: ColorFormat) => {
      if (!parsed) {
        return;
      }
      const str = formatColorString(parsed, format);
      await navigator.clipboard.writeText(str);
      setCopied(format);
      trackAction(`copy_${format}`);
      setTimeout(() => setCopied(null), 1500);
    },
    [parsed, trackAction]
  );

  const handlePreset = useCallback(
    (hex: string) => {
      setInput(hex);
      trackAction('preset');
    },
    [trackAction]
  );

  const swatchColor = parsed ? parsed.hex : '#000000';

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-2xl">
      <Card>
        <CardHeader />
        <CardContent className="flex flex-col gap-6">
          <div className="flex gap-4">
            <div
              className="size-16 shrink-0 rounded-lg border shadow-xs"
              style={{ backgroundColor: swatchColor }}
            />
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-muted-fg text-sm" htmlFor="color-input">
                Enter a color value
              </label>
              <input
                className="w-full rounded-lg border bg-bg px-3 py-2 text-sm outline-hidden focus:ring-2 focus:ring-primary/30"
                id="color-input"
                onChange={(e) => setInput(e.target.value)}
                placeholder="#ff0000, rgb(255, 0, 0), hsl(0, 100%, 50%), oklch(0.6278 0.2577 29.23)"
                type="text"
                value={input}
              />
            </div>
          </div>

          {!parsed && input.trim() && (
            <p className="text-danger text-sm" role="alert">
              Could not parse this color. Try a format like #ff0000, rgb(255, 0,
              0), hsl(0, 100%, 50%), or oklch(0.6278 0.2577 29.23).
            </p>
          )}

          {parsed && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {FORMATS.map(({ key, label }) => {
                const value = formatColorString(parsed, key);
                return (
                  <div
                    className="flex items-center justify-between rounded-lg border p-3"
                    key={key}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-muted-fg text-xs">
                        {label}
                      </span>
                      <code className="font-mono text-sm">{value}</code>
                    </div>
                    <Button
                      aria-label={`Copy ${label} value`}
                      intent="outline"
                      onPress={() => handleCopy(key)}
                      size="sq-sm"
                    >
                      {copied === key ? (
                        <Check className="size-4 text-success" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Presets" />
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map(({ hex, label }) => (
              <button
                aria-label={`Select ${label} (${hex})`}
                className="flex size-10 items-center justify-center rounded-lg border shadow-xs transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
                key={hex}
                onClick={() => handlePreset(hex)}
                style={{ backgroundColor: hex }}
                title={label}
                type="button"
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <ToolHelp
        faq={[
          {
            answer:
              'Yes. All color conversions happen locally in your browser. No data is sent to any server.',
            question: 'Is my data safe?',
          },
          {
            answer:
              'OKLCH is a perceptually uniform color space that better matches human vision. Unlike HSL, it provides consistent perceived lightness and saturation across different hues.',
            question: 'What is OKLCH?',
          },
          {
            answer:
              'Type or paste any color value in HEX, RGB, HSL, or OKLCH format. The tool will automatically detect the format and show conversions to all other formats.',
            question: 'How do I use this tool?',
          },
        ]}
        howItWorks={{
          description:
            'This tool converts colors between different color representations. Enter a color in any supported format and see the equivalent values in all other formats.',
          steps: [
            'Type or paste a color value in any format',
            'The tool auto-detects the format and converts it',
            'Copy any conversion result with the copy button',
            'Click preset swatches to try common colors',
          ],
        }}
      />
    </div>
  );
}
