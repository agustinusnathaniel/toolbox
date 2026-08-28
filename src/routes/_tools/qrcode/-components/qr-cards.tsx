'use client';

import type {
  UrlState,
  VCardState,
} from '@/lib/tools/qrcode-generator/adapters/qrcode-params';

import { UrlQRCard } from './url-qr-card';
import { VCardQRCard } from './vcard-qr-card';

type Props = {
  mode: string;
  svgRef: React.RefObject<SVGSVGElement | null>;
  qrSize: number;
  urlState: UrlState;
  vcardState: VCardState;
  vcardString: string;
  updateUrlField: <K extends keyof UrlState>(
    field: K,
    value: UrlState[K]
  ) => void;
  updateVCardField: <K extends keyof VCardState>(
    field: K,
    value: VCardState[K]
  ) => void;
  handleSaveQR: () => void;
  handleCopyShareableLink: () => Promise<boolean>;
  trackAction: (a: string) => void;
};

export function QrCards(props: Props) {
  if (props.mode === 'url') {
    return (
      <UrlQRCard
        onCopyShareableLink={async () => {
          if (await props.handleCopyShareableLink()) {
            props.trackAction('copy_shareable');
          }
        }}
        onSaveQR={() => {
          props.trackAction('save_qr');
          props.handleSaveQR();
        }}
        onUpdateUrlField={props.updateUrlField}
        qrSize={props.qrSize}
        svgRef={props.svgRef}
        urlState={props.urlState}
      />
    );
  }
  return (
    <VCardQRCard
      onCopyShareableLink={async () => {
        if (await props.handleCopyShareableLink()) {
          props.trackAction('copy_shareable');
        }
      }}
      onSaveQR={() => {
        props.trackAction('save_qr');
        props.handleSaveQR();
      }}
      onUpdateVCardField={props.updateVCardField}
      qrSize={props.qrSize}
      svgRef={props.svgRef}
      vcardState={props.vcardState}
      vcardString={props.vcardString}
    />
  );
}
