'use client';

import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Label } from '@/lib/components/ui/field';

export function WaLinkResult({
  isValid,
  link,
  onCopyShareable,
}: {
  isValid: boolean;
  link: string;
  onCopyShareable: () => void;
}) {
  if (!(link && isValid)) {
    return null;
  }
  return (
    <div className="mt-6 flex flex-col gap-2">
      <Label>Generated Link</Label>
      <Button
        className="w-full flex-wrap break-words break-all text-start"
        intent="plain"
      >
        <a href={link} rel="noopener noreferrer" target="_blank">
          {link}
        </a>
      </Button>
      <Button intent="outline" onPress={onCopyShareable}>
        Copy Shareable Link
      </Button>
    </div>
  );
}

export function WaLinkHelp() {
  return (
    <ToolHelp
      faq={[
        {
          answer:
            'The country code already includes the + prefix. Adding + will cause the link to fail.',
          question: 'Why no + sign?',
        },
        {
          answer:
            'No. All processing happens in your browser. No phone numbers or messages are stored or transmitted.',
          question: 'Is my data sent anywhere?',
        },
      ]}
      howItWorks={{
        description:
          'Enter a phone number and optionally a message. The tool generates a WhatsApp link that you can copy and share.',
        steps: [
          'Select the country code first',
          'Enter the phone number without the country code',
          'Add an optional pre-filled message',
          'Click Copy Link to copy the generated URL',
        ],
        title: 'How to use',
      }}
    />
  );
}
