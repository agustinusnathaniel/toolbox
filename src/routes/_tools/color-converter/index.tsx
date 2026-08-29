'use client';

import { parseColor as parseColorStately } from '@react-stately/color';
import { createFileRoute, useSearch } from '@tanstack/react-router';
import { Check, Copy, Link } from 'lucide-react';
import { useCallback, useState } from 'react';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent, CardHeader } from '@/lib/components/ui/card';
import { ColorArea } from '@/lib/components/ui/color-area';
import { ColorField } from '@/lib/components/ui/color-field';
import { ColorPicker } from '@/lib/components/ui/color-picker';
import {
  ColorSlider,
  ColorSliderTrack,
} from '@/lib/components/ui/color-slider';
import { ColorSwatch } from '@/lib/components/ui/color-swatch';
import { ColorThumb } from '@/lib/components/ui/color-thumb';
import { Input } from '@/lib/components/ui/input';
import {
  Popover,
  PopoverBody,
  PopoverContent,
} from '@/lib/components/ui/popover';
import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import type {
  ColorFormat,
  ParsedColor,
} from '@/lib/tools/color-converter/adapters/color-converter';
import {
  formatColorString,
  PRESET_COLORS,
  parseColor,
} from '@/lib/tools/color-converter/adapters/color-converter';
import { buildColorParams } from '@/lib/tools/color-converter/adapters/color-params';
import { copyToClipboard } from '@/lib/utils/clipboard';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { meta } from './-meta';

const searchSchema = z.object({
  c: z.string().optional(),
});

const FORMATS: Array<{ key: ColorFormat; label: string }> = [
  { key: 'hex', label: 'HEX' },
  { key: 'rgb', label: 'RGB' },
  { key: 'hsl', label: 'HSL' },
  { key: 'oklch', label: 'OKLCH' },
];

export function copyColorValue(
  parsed: ParsedColor,
  format: ColorFormat,
  copy: typeof copyToClipboard = copyToClipboard
): Promise<boolean> {
  return copy(formatColorString(parsed, format), 'Copied');
}

export const Route = createFileRoute('/_tools/color-converter/')({
  component: ColorConverterPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

function useColorState() {
  const search = useSearch({ from: '/_tools/color-converter/' });
  const [input, setInput] = useState(search.c ?? '#ff0000');
  return { input, setInput };
}

function useColorActions(
  parsed: ParsedColor | null,
  setInput: (v: string) => void,
  trackAction: (a: string) => void,
  copy: (text: string, key: string) => Promise<boolean>
) {
  const handleCopy = useCallback(
    async (format: ColorFormat) => {
      if (!parsed) {
        return;
      }
      if (await copy(formatColorString(parsed, format), format)) {
        trackAction(`copy_${format}`);
      }
    },
    [parsed, copy, trackAction]
  );
  const handlePreset = useCallback(
    (hex: string) => {
      setInput(hex);
      trackAction('preset');
    },
    [trackAction, setInput]
  );
  return { handleCopy, handlePreset };
}

function ColorInputRow({
  input,
  setInput,
  trackAction,
  handleCopyLink,
  swatchColor,
}: {
  input: string;
  setInput: (v: string) => void;
  trackAction: (a: string) => void;
  handleCopyLink: () => void;
  swatchColor: string;
}) {
  return (
    <div className="flex gap-4">
      <ColorPicker
        onChange={(c) => {
          setInput(c.toString('hex'));
          trackAction('color_picker');
        }}
        value={parseColorStately(swatchColor)}
      >
        <Popover>
          <Button data-slot="control" intent="plain">
            <ColorSwatch />
            Select color
          </Button>
          <PopoverContent className="[--gutter:--spacing(1)]">
            <PopoverBody>
              <div className="space-y-(--gutter)">
                <ColorArea
                  colorSpace="hsb"
                  xChannel="saturation"
                  yChannel="brightness"
                />
                <ColorSlider channel="hue" colorSpace="hsb">
                  <ColorSliderTrack>
                    <ColorThumb />
                  </ColorSliderTrack>
                </ColorSlider>
                <ColorField aria-label="Color">
                  <Input />
                </ColorField>
              </div>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </ColorPicker>
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
      <Button
        aria-label="Copy shareable link"
        intent="outline"
        onPress={handleCopyLink}
        size="sq-sm"
      >
        <Link className="size-4" />
      </Button>
    </div>
  );
}

function ColorResults({
  parsed,
  copiedKey,
  onCopy,
}: {
  parsed: ParsedColor | null;
  copiedKey: string | null;
  onCopy: (f: ColorFormat) => void;
}) {
  if (!parsed) {
    return null;
  }
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {FORMATS.map(({ key, label }) => {
        const value = formatColorString(parsed, key);
        return (
          <div
            className="flex items-center justify-between rounded-lg border p-3"
            key={key}
          >
            <div className="flex flex-col gap-0.5">
              <span className="font-medium text-muted-fg text-xs">{label}</span>
              <code className="font-mono text-sm">{value}</code>
            </div>
            <Button
              aria-label={`Copy ${label} value`}
              intent="outline"
              onPress={() => onCopy(key)}
              size="sq-sm"
            >
              {copiedKey === key ? (
                <Check className="size-4 text-success" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>
        );
      })}
    </div>
  );
}

function ColorPresets({ onPreset }: { onPreset: (hex: string) => void }) {
  return (
    <Card>
      <CardHeader title="Presets" />
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map(({ hex, label }) => (
            <button
              aria-label={`Select ${label} (${hex})`}
              className="flex size-10 items-center justify-center rounded-lg border shadow-xs transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
              key={hex}
              onClick={() => onPreset(hex)}
              style={{ backgroundColor: hex }}
              title={label}
              type="button"
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ColorMainCard({
  input,
  setInput,
  trackAction,
  handleCopyLink,
  parsed,
  copiedKey,
  onCopy,
}: {
  input: string;
  setInput: (v: string) => void;
  trackAction: (a: string) => void;
  handleCopyLink: () => void;
  parsed: ParsedColor | null;
  copiedKey: string | null;
  onCopy: (f: ColorFormat) => void;
}) {
  const swatchColor = parsed ? parsed.hex : '#000000';
  return (
    <Card>
      <CardHeader />
      <CardContent className="flex flex-col gap-6">
        <ColorInputRow
          handleCopyLink={handleCopyLink}
          input={input}
          setInput={setInput}
          swatchColor={swatchColor}
          trackAction={trackAction}
        />
        {!parsed && input.trim() && (
          <p className="text-danger text-sm" role="alert">
            Could not parse this color. Try a format like #ff0000, rgb(255, 0,
            0), hsl(0, 100%, 50%), or oklch(0.6278 0.2577 29.23).
          </p>
        )}
        <ColorResults copiedKey={copiedKey} onCopy={onCopy} parsed={parsed} />
      </CardContent>
    </Card>
  );
}

function ColorConverterPage() {
  const { trackAction } = useToolTracking('color-converter', 'Color Converter');
  const { input, setInput } = useColorState();
  const { copiedKey, copy } = useCopyFeedback<ColorFormat>();
  const parsed = parseColor(input);
  const { handleCopy, handlePreset } = useColorActions(
    parsed,
    setInput,
    trackAction,
    copy as never
  );
  const handleCopyLink = useCopyShareableLink(
    () => buildColorParams(input),
    trackAction
  );
  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-2xl">
      <ColorMainCard
        copiedKey={copiedKey}
        handleCopyLink={handleCopyLink}
        input={input}
        onCopy={handleCopy}
        parsed={parsed}
        setInput={setInput}
        trackAction={trackAction}
      />
      <ColorPresets onPreset={handlePreset} />

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
            'Click the color swatch to open the visual color picker',
          ],
        }}
      />
    </div>
  );
}
