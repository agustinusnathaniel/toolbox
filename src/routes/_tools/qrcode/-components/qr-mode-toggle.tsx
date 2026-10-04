'use client';

import { ToggleBar } from '@/lib/components/toggle-bar';
import type { QRMode } from '@/lib/tools/qrcode/adapters/qrcode-params';

const MODE_OPTIONS = [
  { action: 'mode_url', id: 'url', label: 'URL QR' },
  { action: 'mode_vcard', id: 'vcard', label: 'VCard QR' },
] as const;

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
    <ToggleBar
      onSelectionChange={setMode}
      options={MODE_OPTIONS}
      track={trackAction}
      value={mode}
    />
  );
}
