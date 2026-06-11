import { HelpCircleIcon, InfoIcon } from 'lucide-react';

import {
  Disclosure,
  DisclosureGroup,
  DisclosurePanel,
  DisclosureTrigger,
} from '@/lib/components/ui/disclosure-group';

type FaqItem = {
  question: string;
  answer: string;
};

type HowItWorks = {
  title?: string;
  description: string;
  steps: Array<string>;
};

type ToolHelpProps = {
  howItWorks?: HowItWorks;
  faq?: Array<FaqItem>;
};

export function ToolHelp({ howItWorks, faq }: ToolHelpProps) {
  return (
    <DisclosureGroup>
      {howItWorks && (
        <Disclosure>
          <DisclosureTrigger>
            <span className="flex items-center gap-2">
              <InfoIcon className="size-4" />
              {howItWorks.title ?? 'How it works'}
            </span>
          </DisclosureTrigger>
          <DisclosurePanel>
            <div className="flex flex-col gap-3 text-muted-fg text-sm">
              <p>{howItWorks.description}</p>
              <ul className="list-inside list-disc">
                {howItWorks.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </div>
          </DisclosurePanel>
        </Disclosure>
      )}

      {faq && faq.length > 0 && (
        <Disclosure>
          <DisclosureTrigger>
            <span className="flex items-center gap-2">
              <HelpCircleIcon className="size-4" />
              FAQ
            </span>
          </DisclosureTrigger>
          <DisclosurePanel>
            <div className="flex flex-col gap-3 text-muted-fg text-sm">
              {faq.map((item) => (
                <div className="flex flex-col gap-1" key={item.question}>
                  <p className="font-medium text-fg">{item.question}</p>
                  <p>{item.answer}</p>
                </div>
              ))}
            </div>
          </DisclosurePanel>
        </Disclosure>
      )}
    </DisclosureGroup>
  );
}
