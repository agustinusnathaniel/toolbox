import { saveAs } from "file-saver";
import JSZip from "jszip";

export async function downloadFiles(files: File[]): Promise<void> {
  if (!files.length) return;

  if (files.length === 1) {
    const file = files[0];
    saveAs(file, file.name);
  } else {
    const zip = new JSZip();

    for (const file of files) {
      const buffer = await file.arrayBuffer();
      zip.file(file.name, buffer);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, "files.zip");
  }
}
