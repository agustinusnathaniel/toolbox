import { toast } from 'sonner';

export function svgToPngDownload(
  svgElement: SVGSVGElement,
  size: number
): void {
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgData], {
    type: 'image/svg+xml;charset=utf-8',
  });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = () => {
    const scale = 2000 / size;
    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = size * scale;
    resizedCanvas.height = size * scale;
    const ctx = resizedCanvas.getContext('2d');
    if (!ctx) {
      toast.error('Failed to create canvas');
      URL.revokeObjectURL(url);
      return;
    }
    ctx.drawImage(img, 0, 0, resizedCanvas.width, resizedCanvas.height);

    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = resizedCanvas.toDataURL();
    link.click();

    URL.revokeObjectURL(url);
  };
  img.onerror = () => {
    toast.error('Failed to render QR code');
    URL.revokeObjectURL(url);
  };
  img.src = url;
}
