import { toast } from 'sonner';

export async function copyToClipboard(
  text: string,
  label = 'Copied'
): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    toast(label, {
      description: text.length > 100 ? `${text.slice(0, 100)}...` : text,
    });
    return true;
  } catch {
    toast.error('Failed to copy', {
      description: 'Clipboard access denied. Try using HTTPS.',
    });
    return false;
  }
}
