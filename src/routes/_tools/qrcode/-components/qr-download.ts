import { toast } from 'sonner';

import { downloadBlob } from '@/lib/utils/download';

const EXPORT_SIZE = 2000;
const EXPORT_FILENAME = 'qrcode.png';

export function svgToPngDownload(svgElement: SVGSVGElement): void {
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgData], {
    type: 'image/svg+xml;charset=utf-8',
  });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = () => {
    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = EXPORT_SIZE;
    resizedCanvas.height = EXPORT_SIZE;
    const ctx = resizedCanvas.getContext('2d');
    if (!ctx) {
      toast.error('Failed to create canvas');
      URL.revokeObjectURL(url);
      return;
    }
    ctx.drawImage(img, 0, 0, resizedCanvas.width, resizedCanvas.height);

    resizedCanvas.toBlob((blob) => {
      if (blob) {
        downloadBlob(blob, EXPORT_FILENAME);
      }
    });

    URL.revokeObjectURL(url);
  };
  img.onerror = () => {
    toast.error('Failed to render QR code');
    URL.revokeObjectURL(url);
  };
  img.src = url;
}
