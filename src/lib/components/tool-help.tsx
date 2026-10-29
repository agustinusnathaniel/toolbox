import { RiArrowDownSLine } from '@remixicon/react';
import { HelpCircleIcon, InfoIcon } from 'lucide-react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/lib/components/ui/collapsible';

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

function HelpSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Collapsible>
      <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left font-medium text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <span className="flex flex-1 items-center gap-2">
          {icon}
          {title}
        </span>
        <RiArrowDownSLine
          aria-hidden="true"
          className="size-4 shrink-0 in-data-[panel-open]:rotate-180 transition-transform"
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-2 py-2">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function ToolHelp({ howItWorks, faq }: ToolHelpProps) {
  return (
    <div className="flex flex-col gap-1">
      {howItWorks && (
        <HelpSection
          icon={<InfoIcon aria-hidden="true" className="size-4" />}
          title={howItWorks.title ?? 'How it works'}
        >
          <div className="flex flex-col gap-3 text-muted-foreground text-sm">
            <p>{howItWorks.description}</p>
            <ul className="list-inside list-disc">
              {howItWorks.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </div>
        </HelpSection>
      )}

      {faq && faq.length > 0 && (
        <HelpSection
          icon={<HelpCircleIcon aria-hidden="true" className="size-4" />}
          title="FAQ"
        >
          <div className="flex flex-col gap-3 text-muted-foreground text-sm">
            {faq.map((item) => (
              <div className="flex flex-col gap-1" key={item.question}>
                <p className="font-medium text-foreground">{item.question}</p>
                <p>{item.answer}</p>
              </div>
            ))}
          </div>
        </HelpSection>
      )}
    </div>
  );
}
