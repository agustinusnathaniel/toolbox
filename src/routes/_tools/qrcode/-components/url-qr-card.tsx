import { QRCodeSVG } from 'qrcode.react';

import {
  ColorPicker,
  ColorPickerContent,
  ColorPickerTrigger,
} from '@/lib/components/reui/color-picker';
import { Button } from '@/lib/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/lib/components/ui/card';
import { Field, FieldLabel } from '@/lib/components/ui/field';
import { Input } from '@/lib/components/ui/input';
import type { UrlState } from '@/lib/tools/qrcode/adapters/qrcode-params';

type UrlQRCardProps = {
  svgRef: React.RefObject<SVGSVGElement | null>;
  qrSize: number;
  urlState: UrlState;
  onSaveQR: () => void;
  onCopyShareableLink: () => void;
  onUpdateUrlField: <K extends keyof UrlState>(
    field: K,
    value: UrlState[K]
  ) => void;
};

export function UrlQRCard({
  svgRef,
  qrSize,
  urlState,
  onSaveQR,
  onCopyShareableLink,
  onUpdateUrlField,
}: UrlQRCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>URL QR Code</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="flex flex-col items-center gap-4">
            <div
              className="rounded-md p-4 outline-1 outline-black/8 -outline-offset-1 dark:outline-white/8"
              style={{ backgroundColor: urlState.bgColor }}
            >
              <QRCodeSVG
                bgColor={urlState.bgColor}
                fgColor={urlState.fgColor}
                ref={svgRef}
                size={qrSize}
                value={urlState.value || ' '}
              />
            </div>
            <Button onClick={onSaveQR} variant="default">
              Save QR Code
            </Button>
            <Button onClick={onCopyShareableLink} variant="outline">
              Copy Shareable Link
            </Button>
          </div>

          <div className="flex-1">
            <div className="flex flex-col gap-4">
              <Field>
                <FieldLabel htmlFor="url-value">URL / Text</FieldLabel>
                <Input
                  autoComplete="url"
                  id="url-value"
                  inputMode="url"
                  onChange={(e) =>
                    onUpdateUrlField('value', e.currentTarget.value)
                  }
                  placeholder="https://example.com"
                  type="url"
                  value={urlState.value}
                />
              </Field>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    onUpdateUrlField('fgColor', '#000000');
                    onUpdateUrlField('bgColor', '#ffffff');
                  }}
                  size="sm"
                  variant="outline"
                >
                  Standard
                </Button>
                <Button
                  onClick={() => {
                    onUpdateUrlField('fgColor', '#ffffff');
                    onUpdateUrlField('bgColor', '#000000');
                  }}
                  size="sm"
                  variant="outline"
                >
                  Dark Mode
                </Button>
              </div>

              <Field>
                <FieldLabel htmlFor="url-fgColor">Foreground Color</FieldLabel>
                <ColorPicker
                  aria-label="Foreground color"
                  format="hex"
                  id="url-fgColor"
                  onValueChange={(value) =>
                    onUpdateUrlField('fgColor', value ?? '#000000')
                  }
                  value={urlState.fgColor}
                >
                  <ColorPickerTrigger />
                  <ColorPickerContent />
                </ColorPicker>
              </Field>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
