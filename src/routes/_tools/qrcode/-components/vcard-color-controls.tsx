import { parseColor } from '@react-stately/color';

import { Button } from '@/lib/components/ui/button';
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
import type { VCardState } from '@/lib/tools/qrcode-generator/adapters/qrcode-params';

export function VCardColorPresets({
  onUpdateVCardField,
}: {
  onUpdateVCardField: <K extends keyof VCardState>(
    field: K,
    value: VCardState[K]
  ) => void;
}) {
  return (
    <div className="flex gap-2">
      <Button
        intent="outline"
        onPress={() => {
          onUpdateVCardField('fgColor', '#000000');
          onUpdateVCardField('bgColor', '#ffffff');
        }}
        size="sm"
      >
        Standard
      </Button>
      <Button
        intent="outline"
        onPress={() => {
          onUpdateVCardField('fgColor', '#ffffff');
          onUpdateVCardField('bgColor', '#000000');
        }}
        size="sm"
      >
        Dark Mode
      </Button>
    </div>
  );
}

export function VCardFgColorPicker({
  vcardState,
  onUpdateVCardField,
}: {
  vcardState: VCardState;
  onUpdateVCardField: <K extends keyof VCardState>(
    field: K,
    value: VCardState[K]
  ) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor="vcard-fgColor">Foreground Color</Label>
      <ColorPicker
        onChange={(c) =>
          onUpdateVCardField(
            'fgColor',
            c.toFormat('hex').toString() ?? '#000000'
          )
        }
        value={parseColor(vcardState.fgColor)}
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
  );
}
