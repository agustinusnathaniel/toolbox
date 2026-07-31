'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { useEffect } from 'react';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';

import { UrlQRCard } from './-components/url-qr-card';
import { useQRCodeForm } from './-components/use-qrcode-form';
import { VCardQRCard } from './-components/vcard-qr-card';

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

const meta = {
  description: 'Generate QR codes for URLs or vCard contact information.',
  pageTitle: 'QR Code Generator',
  slug: 'qrcode',
} as const;

export const Route = createFileRoute('/_tools/qrcode/')({
  component: QRCodeGeneratorPage,
  head: () => ({
    meta: [
      { title: meta.pageTitle },
      { content: meta.description, name: 'description' },
      { content: meta.pageTitle, property: 'og:title' },
      { content: meta.description, property: 'og:description' },
      { content: 'website', property: 'og:type' },
    ],
  }),
  staticData: {
    meta,
  },
  validateSearch: searchSchema,
});

const qrSize = 220;

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

  useEffect(() => {
    const hasQRData =
      (mode === 'url' && urlState.value.length > 0) ||
      (mode === 'vcard' && vcardString.length > 0);
    if (hasQRData) {
      trackComplete(true);
    }
  }, [mode, urlState.value, vcardString, trackComplete]);

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
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

      {mode === 'url' && (
        <UrlQRCard
          onCopyShareableLink={() => {
            trackAction('copy_shareable');
            handleCopyShareableLink();
          }}
          onSaveQR={() => {
            trackAction('save_qr');
            handleSaveQR();
          }}
          onUpdateUrlField={updateUrlField}
          qrSize={qrSize}
          svgRef={svgRef}
          urlState={urlState}
        />
      )}

      {mode === 'vcard' && (
        <VCardQRCard
          onCopyShareableLink={() => {
            trackAction('copy_shareable');
            handleCopyShareableLink();
          }}
          onSaveQR={() => {
            trackAction('save_qr');
            handleSaveQR();
          }}
          onUpdateVCardField={updateVCardField}
          qrSize={qrSize}
          svgRef={svgRef}
          vcardState={vcardState}
          vcardString={vcardString}
        />
      )}

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
