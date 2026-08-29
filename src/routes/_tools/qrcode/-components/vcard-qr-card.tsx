import { QRCodeSVG } from 'qrcode.react';

import { Button } from '@/lib/components/ui/button';
import { Card, CardContent, CardHeader } from '@/lib/components/ui/card';
import { Label } from '@/lib/components/ui/field';
import { Textarea } from '@/lib/components/ui/textarea';
import type { VCardState } from '@/lib/tools/qrcode-generator/adapters/qrcode-params';

import { VCardColorPresets, VCardFgColorPicker } from './vcard-color-controls';
import {
  VCardCityStateFields,
  VCardContactFields,
  VCardNameFields,
  VCardPhoneFields,
  VCardPostalCountryFields,
  VCardStreetField,
  VCardWebsiteField,
} from './vcard-fields';

type VCardQRCardProps = {
  svgRef: React.RefObject<SVGSVGElement | null>;
  qrSize: number;
  vcardState: VCardState;
  vcardString: string;
  onSaveQR: () => void;
  onCopyShareableLink: () => void;
  onUpdateVCardField: <K extends keyof VCardState>(
    field: K,
    value: VCardState[K]
  ) => void;
};

function VCardQRPreview({
  svgRef,
  qrSize,
  vcardState,
  vcardString,
  onSaveQR,
  onCopyShareableLink,
}: VCardQRCardProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="rounded-lg p-4"
        style={{ backgroundColor: vcardState.bgColor }}
      >
        <QRCodeSVG
          bgColor={vcardState.bgColor}
          fgColor={vcardState.fgColor}
          ref={svgRef}
          size={qrSize}
          value={vcardString || ' '}
        />
      </div>
      <Button intent="primary" onPress={onSaveQR}>
        Save QR Code
      </Button>
      <Button intent="outline" onPress={onCopyShareableLink}>
        Copy Shareable Link
      </Button>
    </div>
  );
}

function VCardFormFields(props: VCardQRCardProps) {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <VCardNameFields {...props} />
      <VCardPhoneFields {...props} />
      <VCardContactFields {...props} />
      <VCardStreetField {...props} />
      <VCardCityStateFields {...props} />
      <VCardPostalCountryFields {...props} />
      <VCardWebsiteField {...props} />
      <VCardColorPresets onUpdateVCardField={props.onUpdateVCardField} />
      <VCardFgColorPicker
        onUpdateVCardField={props.onUpdateVCardField}
        vcardState={props.vcardState}
      />
    </div>
  );
}

export function VCardQRCard(props: VCardQRCardProps) {
  return (
    <Card>
      <CardHeader title="VCard QR Code" />
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-6 md:flex-row">
          <VCardQRPreview {...props} />
          <VCardFormFields {...props} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>VCard Preview</Label>
          <Textarea
            className="min-h-[120px] font-mono text-xs"
            disabled
            rows={6}
            value={props.vcardString}
          />
        </div>
      </CardContent>
    </Card>
  );
}
