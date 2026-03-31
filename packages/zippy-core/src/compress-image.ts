import imageCompression from "browser-image-compression";
import { max, min } from "radashi";

export interface CompressionOptions {
  onProgress?: (progress: number) => void;
}

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
}

const SINGLE_MB = 1024 * 1024;

async function getImageDimensions(
  source: File | string,
): Promise<{ width: number; height: number; size?: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: typeof source !== "string" ? source.size : undefined,
      });
    };

    img.onerror = reject;

    if (typeof source === "string") {
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

export async function compressImage(file: File, options: CompressionOptions = {}): Promise<File> {
  const imageData = await getImageDimensions(file);
  const maxMeasure = max([imageData.height, imageData.width]);
  const maxSizeMB = min([Math.ceil(((imageData.size || 0) / SINGLE_MB) * 0.35), 5]);
  const maxWidthOrHeight = max([Math.ceil(maxMeasure * 0.75), 2400]);

  const compressed = await imageCompression(file, {
    maxSizeMB,
    maxWidthOrHeight,
    preserveExif: true,
    onProgress: options.onProgress,
  });

  return new File([compressed], file.name, { type: file.type });
}
