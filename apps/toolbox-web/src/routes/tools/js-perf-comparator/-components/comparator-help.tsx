import { HelpCircleIcon, InfoIcon } from 'lucide-react';

import {
  Disclosure,
  DisclosureGroup,
  DisclosurePanel,
  DisclosureTrigger,
} from '@/lib/components/ui/disclosure-group';

export function ComparatorHelp() {
  return (
    <DisclosureGroup>
      <Disclosure>
        <DisclosureTrigger>
          <span className="flex items-center gap-2">
            <InfoIcon className="size-4" />
            How it works
          </span>
        </DisclosureTrigger>
        <DisclosurePanel>
          <div className="flex flex-col gap-3 text-muted-fg text-sm">
            <p>
              Compare JavaScript snippet execution in parallel sandboxed QuickJS
              runtimes. Both snippets run the same number of iterations and the
              results are compared.
            </p>
            <ul className="list-inside list-disc">
              <li>Write code in both editors</li>
              <li>Select a preset or write custom code</li>
              <li>
                Optional: enable Stability mode to aggregate multiple rounds
              </li>
              <li>Click Run Both to execute</li>
              <li>Review execution stats, confidence hints, and output</li>
            </ul>
          </div>
        </DisclosurePanel>
      </Disclosure>

      <Disclosure>
        <DisclosureTrigger>
          <span className="flex items-center gap-2">
            <HelpCircleIcon className="size-4" />
            FAQ
          </span>
        </DisclosureTrigger>
        <DisclosurePanel>
          <div className="flex flex-col gap-3 text-muted-fg text-sm">
            <div className="flex flex-col gap-1">
              <p className="font-medium text-fg">Is the comparison accurate?</p>
              <p>
                This tool compares controlled runtime execution, not native
                browser engine performance. Use it to understand code behavior
                differences, not benchmark browser engines. If results are close
                or flip between runs, enable Stability mode to aggregate
                multiple rounds.
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <p className="font-medium text-fg">What is QuickJS?</p>
              <p>
                QuickJS is a small JavaScript engine that runs in a Web Worker.
                Code is sandboxed and cannot access host APIs.
              </p>
            </div>
          </div>
        </DisclosurePanel>
      </Disclosure>
    </DisclosureGroup>
  );
}
