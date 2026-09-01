import { ToolHelp } from '@/lib/components/tool-help';

export function YamlHelp() {
  return (
    <ToolHelp
      faq={[
        {
          answer:
            'Yes. All conversion happens in your browser using js-yaml. No data is ever sent to a server.',
          question: 'Is my data safe?',
        },
        {
          answer:
            'JSON to YAML parses JSON and dumps it as YAML. YAML to JSON parses YAML and stringifies it as JSON with 2-space indentation.',
          question: 'How does the conversion work?',
        },
        {
          answer:
            'Conversions run in a Web Worker so the page stays responsive; conversions that take too long show a timeout message.',
          question: 'What is the largest input supported?',
        },
      ]}
      howItWorks={{
        description:
          'Pick a direction, paste your input, and convert. Copy the output or share a link that restores your input and mode.',
        steps: [
          'Choose JSON to YAML or YAML to JSON',
          'Paste your input into the textarea',
          'Click Convert',
          'Copy the output or copy a shareable link',
        ],
      }}
    />
  );
}
