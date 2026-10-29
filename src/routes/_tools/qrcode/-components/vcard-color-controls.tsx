import {
  ColorPicker,
  ColorPickerContent,
  ColorPickerTrigger,
} from '@/lib/components/reui/color-picker';
import { Button } from '@/lib/components/ui/button';
import { Field, FieldLabel } from '@/lib/components/ui/field';
import type { VCardState } from '@/lib/tools/qrcode/adapters/qrcode-params';

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
        onClick={() => {
          onUpdateVCardField('fgColor', '#000000');
          onUpdateVCardField('bgColor', '#ffffff');
        }}
        size="sm"
        variant="outline"
      >
        Standard
      </Button>
      <Button
        onClick={() => {
          onUpdateVCardField('fgColor', '#ffffff');
          onUpdateVCardField('bgColor', '#000000');
        }}
        size="sm"
        variant="outline"
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
    <Field>
      <FieldLabel htmlFor="vcard-fgColor">Foreground Color</FieldLabel>
      <ColorPicker
        aria-label="Foreground color"
        format="hex"
        id="vcard-fgColor"
        onValueChange={(value) =>
          onUpdateVCardField('fgColor', value ?? '#000000')
        }
        value={vcardState.fgColor}
      >
        <ColorPickerTrigger />
        <ColorPickerContent />
      </ColorPicker>
    </Field>
  );
}
