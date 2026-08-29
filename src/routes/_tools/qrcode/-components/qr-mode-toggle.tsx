'use client';

import { Button } from '@/lib/components/ui/button';
import type { QRMode } from '@/lib/tools/qrcode-generator/adapters/qrcode-params';

export function QrModeToggle({
  mode,
  setMode,
  trackAction,
}: {
  mode: QRMode;
  setMode: (m: QRMode) => void;
  trackAction: (a: string) => void;
}) {
  return (
    <div className="flex gap-2">
      <Button
        intent={mode === 'url' ? 'primary' : 'outline'}
        onPress={() => {
          setMode('url');
          trackAction('mode_url');
        }}
      >
        URL QR
      </Button>
      <Button
        intent={mode === 'vcard' ? 'primary' : 'outline'}
        onPress={() => {
          setMode('vcard');
          trackAction('mode_vcard');
        }}
      >
        VCard QR
      </Button>
    </div>
  );
}
