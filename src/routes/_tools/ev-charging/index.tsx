'use client';

import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { ToolHelp } from '@/lib/components/tool-help';
import { Note } from '@/lib/components/ui/note';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { ChargingForm } from './-components/charging-form';
import { meta } from './-meta';

const searchSchema = z.object({
  cal: z.coerce.number().min(0.5).max(1.5).optional(),
  cap: z.coerce.number().positive().optional(),
  end: z.coerce.number().min(0).max(100).optional(),
  power: z.coerce.number().positive().optional(),
  rate: z.coerce.number().positive().optional(),
  start: z.coerce.number().min(0).max(100).optional(),
  type: z.enum(['ac-l1', 'ac-l2', 'dc-fast', 'dc-ultra']).optional(),
  usable: z.coerce.number().min(1).max(100).optional(),
});

export const Route = createFileRoute('/_tools/ev-charging/')({
  component: EVChargingEstimatorPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

function EVChargingEstimatorPage() {
  const { trackAction, trackComplete } = useToolTracking(
    'ev-charging',
    'EV Charging Estimator'
  );

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <ChargingForm onComplete={trackComplete} onTrack={trackAction} />

      <Note intent="info">
        Want to track your vehicle's consumption over time?{' '}
        <a
          className="font-semibold underline underline-offset-2"
          href="https://cartrack.sznm.dev"
          rel="noopener noreferrer"
          target="_blank"
        >
          Try CarTrack
        </a>{' '}
        — a local-first app for tracking EV, PHEV, and gasoline car fuel
        consumption.
      </Note>

      <ToolHelp
        faq={[
          {
            answer:
              'Above 80% SOC, the battery management system slows charging to protect the cells. This means more time drawing power for auxiliary systems (cooling, BMS) relative to energy stored, reducing overall efficiency.',
            question: 'Why is charging above 80% less efficient?',
          },
          {
            answer:
              'Manufacturers often advertise the total (gross) battery capacity, but the BMS reserves a buffer at both ends to protect cell health. The usable capacity is typically 90-95% of total. For example, a car advertised as 82 kWh may only let you use 75 kWh. Use the usable capacity for accurate estimates.',
            question: 'What is "usable" battery capacity?',
          },
          {
            answer:
              'This provides a reasonable estimate based on typical charger efficiencies. Real-world results vary based on temperature, battery health, charger condition, and specific vehicle behavior.',
            question: 'How accurate is this estimate?',
          },
          {
            answer:
              'No. All calculations happen in your browser. No data is stored or transmitted.',
            question: 'Is my data sent anywhere?',
          },
        ]}
        howItWorks={{
          description:
            'Estimate how much energy your EV needs to charge between two battery levels, accounting for real-world charging losses.',
          steps: [
            'Enter your current (start) and target (end) battery percentage',
            "Enter your vehicle's total battery capacity in kWh (from the spec sheet)",
            "Adjust the usable % if needed (default 95% — check your vehicle's actual usable capacity)",
            'Select your charger type (AC or DC)',
            'Optionally add electricity rate and charging power for cost and time estimates',
          ],
        }}
      />
    </div>
  );
}
