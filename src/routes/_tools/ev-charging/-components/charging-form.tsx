import { Form } from 'react-aria-components';

import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import type { ChargerType } from '@/lib/tools/ev-charging-estimator/adapters/ev-charging';

import { AdvancedFields, BasicFields } from './charging-fields';
import { FormulaExplanation } from './formula-explanation';
import { ResultCard } from './result-card';
import { useChargingForm } from './use-charging-form';

type ChargingFormProps = {
  onComplete: (success: boolean) => void;
  onTrack: (action: string) => void;
};

export function ChargingForm({ onComplete, onTrack }: ChargingFormProps) {
  const {
    effectiveChargingPower,
    form,
    handleCopyShareableLink,
    result,
    watchedValues,
  } = useChargingForm(onComplete);

  return (
    <Card>
      <CardContent>
        <Form
          {...form}
          className="grid gap-4 text-start"
          onSubmit={(e) => {
            e.preventDefault();
            handleCopyShareableLink(onTrack);
          }}
        >
          <BasicFields
            effectiveChargingPower={effectiveChargingPower}
            form={form}
            watchedChargerType={watchedValues.chargerType as ChargerType}
          />
          <AdvancedFields
            effectiveChargingPower={effectiveChargingPower}
            form={form}
            watchedChargerType={watchedValues.chargerType as ChargerType}
          />
          <Button intent="outline" size="sm" type="submit">
            Copy Shareable Link
          </Button>
        </Form>

        {result && (
          <ResultCard
            inputs={
              watchedValues as { totalCapacity: number; usablePercent: number }
            }
            result={result}
          />
        )}
        {result && (
          <FormulaExplanation
            inputs={
              watchedValues as {
                startSOC: number;
                endSOC: number;
                totalCapacity: number;
                usablePercent: number;
                calibrationFactor: number;
                chargerType: ChargerType;
                chargingPower?: number;
              }
            }
            result={result}
          />
        )}
      </CardContent>
    </Card>
  );
}
