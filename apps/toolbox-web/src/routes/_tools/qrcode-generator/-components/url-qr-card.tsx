import { QRCodeCanvas } from 'qrcode.react';

import { Button } from '@/lib/components/ui/button';
import { Card, CardContent, CardHeader } from '@/lib/components/ui/card';
import { Label } from '@/lib/components/ui/field';
import { Input } from '@/lib/components/ui/input';

import type { UrlState } from './use-qrcode-form';

type UrlQRCardProps = {
  qrRef: React.RefObject<HTMLCanvasElement | null>;
  qrSize: number;
  urlState: UrlState;
  onSaveQR: () => void;
  onUpdateUrlField: <K extends keyof UrlState>(
    field: K,
    value: UrlState[K]
  ) => void;
};

export function UrlQRCard({
  qrRef,
  qrSize,
  urlState,
  onSaveQR,
  onUpdateUrlField,
}: UrlQRCardProps) {
  return (
    <Card>
      <CardHeader title="URL QR Code" />
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-lg bg-white p-4">
              <QRCodeCanvas
                fgColor={urlState.fgColor}
                size={qrSize}
                value={urlState.value || ' '}
              />
            </div>
            <canvas ref={qrRef} style={{ display: 'none' }} />
            <Button intent="primary" onPress={onSaveQR}>
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

              <div className="flex flex-col gap-1">
                <Label htmlFor="url-fgColor">Foreground Color</Label>
                <Input
                  id="url-fgColor"
                  onChange={(e) =>
                    onUpdateUrlField('fgColor', e.currentTarget.value)
                  }
                  type="color"
                  value={urlState.fgColor}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
