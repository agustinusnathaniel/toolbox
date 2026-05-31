'use client';

import { createFileRoute } from '@tanstack/react-router';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';

import { UrlQRCard } from './-components/url-qr-card';
import { useQRCodeForm } from './-components/use-qrcode-form';
import { VCardQRCard } from './-components/vcard-qr-card';

const meta = {
  pageTitle: 'QR Code Generator',
  description: 'Generate QR codes for URLs or vCard contact information.',
  slug: 'qrcode-generator',
} as const;

export const Route = createFileRoute('/_tools/qrcode-generator/')({
  component: QRCodeGeneratorPage,
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
  const { trackAction } = useToolTracking(
    'qrcode-generator',
    'QR Code Generator'
  );
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
  } = useQRCodeForm();

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
