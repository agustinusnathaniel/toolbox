'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';

import { UrlQRCard } from './-components/url-qr-card';
import { useQRCodeForm } from './-components/use-qrcode-form';
import { VCardQRCard } from './-components/vcard-qr-card';

const searchSchema = z.object({
  mode: z.enum(['url', 'vcard']).optional(),
  // URL mode
  value: z.string().optional(),
  fg: z.string().optional(),
  bg: z.string().optional(),
  // VCard mode
  fn: z.string().optional(),
  ln: z.string().optional(),
  mp: z.string().optional(),
  op: z.string().optional(),
  em: z.string().optional(),
  co: z.string().optional(),
  jt: z.string().optional(),
  st: z.string().optional(),
  ct: z.string().optional(),
  sa: z.string().optional(),
  pc: z.string().optional(),
  cn: z.string().optional(),
  wb: z.string().optional(),
});

const meta = {
  pageTitle: 'QR Code Generator',
  description: 'Generate QR codes for URLs or vCard contact information.',
  slug: 'qrcode',
} as const;

export const Route = createFileRoute('/_tools/qrcode/')({
  component: QRCodeGeneratorPage,
  validateSearch: searchSchema,
  staticData: {
    meta,
  },
  head: () => ({
    meta: [
      { title: meta.pageTitle },
      { name: 'description', content: meta.description },
      { property: 'og:title', content: meta.pageTitle },
      { property: 'og:description', content: meta.description },
      { property: 'og:type', content: 'website' },
    ],
  }),
});

const qrSize = 220;

function QRCodeGeneratorPage() {
  const { trackAction } = useToolTracking('qrcode', 'QR Code Generator');
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
          onSaveQR={(size) => {
            trackAction('save_qr');
            handleSaveQR(size);
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
          onSaveQR={(size) => {
            trackAction('save_qr');
            handleSaveQR(size);
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
            question: 'Is my data safe?',
            answer:
              'Yes. All QR code generation happens in your browser. No data is sent to any server.',
          },
          {
            question: 'What is VCard?',
            answer:
              "VCard is a standard file format for electronic business cards. The QR code contains your contact information that can be saved directly to a phone's contacts.",
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
