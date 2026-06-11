import { parseColor } from '@react-stately/color';
import { QRCodeSVG } from 'qrcode.react';

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
import { Label } from '@/lib/components/ui/field';
import { Input } from '@/lib/components/ui/input';
import {
  Popover,
  PopoverBody,
  PopoverContent,
} from '@/lib/components/ui/popover';

import type { UrlState } from './use-qrcode-form';

type UrlQRCardProps = {
  svgRef: React.RefObject<SVGSVGElement | null>;
  qrSize: number;
  urlState: UrlState;
  onSaveQR: (size: number) => void;
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
  onUpdateUrlField,
}: UrlQRCardProps) {
  const color = parseColor(urlState.fgColor);

  return (
    <Card>
      <CardHeader title="URL QR Code" />
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="flex flex-col items-center gap-4">
            <div
              className="rounded-lg p-4"
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
            <Button intent="primary" onPress={() => onSaveQR(qrSize)}>
              Save QR Code
            </Button>
          </div>

          <div className="flex-1">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <Label htmlFor="url-value">URL / Text</Label>
                <Input
                  id="url-value"
                  onChange={(e) =>
                    onUpdateUrlField('value', e.currentTarget.value)
                  }
                  placeholder="https://example.com"
                  value={urlState.value}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  intent="outline"
                  onPress={() => {
                    onUpdateUrlField('fgColor', '#000000');
                    onUpdateUrlField('bgColor', '#ffffff');
                  }}
                  size="sm"
                >
                  Standard
                </Button>
                <Button
                  intent="outline"
                  onPress={() => {
                    onUpdateUrlField('fgColor', '#ffffff');
                    onUpdateUrlField('bgColor', '#000000');
                  }}
                  size="sm"
                >
                  Dark Mode
                </Button>
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="url-fgColor">Foreground Color</Label>
                <ColorPicker
                  onChange={(c) =>
                    onUpdateUrlField(
                      'fgColor',
                      c.toFormat('hex').toString() ?? '#000000'
                    )
                  }
                  value={color}
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
                            colorSpace="rgb"
                            xChannel="red"
                            xName="red"
                            yChannel="green"
                            yName="green"
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
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
