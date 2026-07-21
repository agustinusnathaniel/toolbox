import imageCompression from 'browser-image-compression';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { max, min } from 'radashi';

export interface CompressionOptions {
  onProgress?: (progress: number) => void;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const SINGLE_MB = 1024 * 1024;

function getImageDimensions(
  source: File | string
): Promise<{ width: number; height: number; size?: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({
        height: img.naturalHeight,
        size: typeof source === 'string' ? undefined : source.size,
        width: img.naturalWidth,
      });
    };

    img.onerror = reject;

    if (typeof source === 'string') {
      img.src = source;
    } else {
      img.src = URL.createObjectURL(source);
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        resolve({
          height: img.naturalHeight,
          size: source.size,
          width: img.naturalWidth,
        });
      };
    }
  });
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const imageData = await getImageDimensions(file);
  const maxMeasure = max([imageData.height, imageData.width]) ?? 1;
  const maxSizeMB = max([
    min([Math.ceil(((imageData.size || 0) / SINGLE_MB) * 0.35), 5]) ?? 0.01,
    0.01,
  ]);
  const maxWidthOrHeight = max([Math.ceil(maxMeasure * 0.75), 2400]) ?? 2400;

  const compressed = await imageCompression(file, {
    maxSizeMB,
    maxWidthOrHeight,
    onProgress: options.onProgress,
    preserveExif: true,
  });

  return new File([compressed], file.name, { type: file.type });
}

export async function downloadFiles(files: Array<File>): Promise<void> {
  if (!files.length) {
    return;
  }

  if (files.length === 1) {
    const file = files[0];
    saveAs(file, file.name);
  } else {
    const zip = new JSZip();

    for (const file of files) {
      const buffer = await file.arrayBuffer();
      zip.file(file.name, buffer);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, 'files.zip');
  }
}
