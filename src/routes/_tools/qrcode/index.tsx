'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { useEffect } from 'react';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { ToolHelp } from '@/lib/components/tool-help';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { QrCards } from './-components/qr-cards';
import { QrModeToggle } from './-components/qr-mode-toggle';
import { useQRCodeForm } from './-components/use-qrcode-form';
import { meta } from './-meta';

const searchSchema = z.object({
  bg: z.string().optional(),
  cn: z.string().optional(),
  co: z.string().optional(),
  ct: z.string().optional(),
  em: z.string().optional(),
  fg: z.string().optional(),
  // VCard mode
  fn: z.string().optional(),
  jt: z.string().optional(),
  ln: z.string().optional(),
  mode: z.enum(['url', 'vcard']).optional(),
  mp: z.string().optional(),
  op: z.string().optional(),
  pc: z.string().optional(),
  sa: z.string().optional(),
  st: z.string().optional(),
  // URL mode
  value: z.string().optional(),
  wb: z.string().optional(),
});

export const Route = createFileRoute('/_tools/qrcode/')({
  component: QRCodeGeneratorPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

const qrSize = 220;

function useQrCompleteTracker(
  mode: string,
  urlValue: string,
  vcardString: string,
  trackComplete: (ok: boolean) => void
) {
  useEffect(() => {
    const hasQRData =
      (mode === 'url' && urlValue.length > 0) ||
      (mode === 'vcard' && vcardString.length > 0);
    if (hasQRData) {
      trackComplete(true);
    }
  }, [mode, urlValue, vcardString, trackComplete]);
}

function QRCodeGeneratorPage() {
  const { trackAction, trackComplete } = useToolTracking(
    'qrcode',
    'QR Code Generator'
  );
  const search = useSearch({ from: '/_tools/qrcode/' });
  const {
    mode,
    setMode,
    svgRef,
    urlState,
    vcardState,
    vcardString,
    updateUrlField,
    updateVCardField,
    handleSaveQR,
    handleCopyShareableLink,
  } = useQRCodeForm(search);
  useQrCompleteTracker(mode, urlState.value, vcardString, trackComplete);
  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <QrModeToggle mode={mode} setMode={setMode} trackAction={trackAction} />
      <QrCards
        handleCopyShareableLink={handleCopyShareableLink}
        handleSaveQR={handleSaveQR}
        mode={mode}
        qrSize={qrSize}
        svgRef={svgRef}
        trackAction={trackAction}
        updateUrlField={updateUrlField}
        updateVCardField={updateVCardField}
        urlState={urlState}
        vcardState={vcardState}
        vcardString={vcardString}
      />

      <ToolHelp
        faq={[
          {
            answer:
              'Yes. All QR code generation happens in your browser. No data is sent to any server.',
            question: 'Is my data safe?',
          },
          {
            answer:
              "VCard is a standard file format for electronic business cards. The QR code contains your contact information that can be saved directly to a phone's contacts.",
            question: 'What is VCard?',
          },
        ]}
        howItWorks={{
          description:
            'Generate QR codes for URLs or vCard contact information. Scan with any QR code reader app.',
          steps: [
            'URL mode: Enter any URL or text',
            'VCard mode: Create contact cards with name, phone, email, etc.',
            'Customize the QR code foreground color',
            'Download as high-resolution PNG',
          ],
        }}
      />
    </div>
  );
}
