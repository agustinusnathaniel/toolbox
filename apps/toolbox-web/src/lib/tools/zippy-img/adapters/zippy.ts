import imageCompression from 'browser-image-compression';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { max, min } from 'radashi';

export interface CompressionOptions {
  onProgress?: (progress: number) => void;
}

const SINGLE_MB = 1024 * 1024;

function getImageDimensions(
  source: File | string
): Promise<{ width: number; height: number; size?: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: typeof source === 'string' ? undefined : source.size,
      });
    };

    img.onerror = reject;

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(source);
    }
  });
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const imageData = await getImageDimensions(file);
  const maxMeasure = max([imageData.height, imageData.width]);
  const maxSizeMB = min([
    Math.ceil(((imageData.size || 0) / SINGLE_MB) * 0.35),
    5,
  ]);
  const maxWidthOrHeight = max([Math.ceil(maxMeasure * 0.75), 2400]);

  const compressed = await imageCompression(file, {
    maxSizeMB,
    maxWidthOrHeight,
    preserveExif: true,
    onProgress: options.onProgress,
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
