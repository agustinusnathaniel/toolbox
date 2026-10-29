import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/lib/components/ui/collapsible';
import {
  type ChargerType,
  type ChargingResult,
  SOC_THRESHOLD,
} from '@/lib/tools/ev-charging/adapters/ev-charging';

import {
  AboveThresholdFormula,
  EfficiencyInfo,
  SimpleFormula,
  SplitFormula,
} from './formula-sections';

type FormulaExplanationProps = {
  inputs: {
    startSOC: number;
    endSOC: number;
    totalCapacity: number;
    usablePercent: number;
    calibrationFactor: number;
    chargerType: ChargerType;
    chargingPower?: number;
  };
  result: ChargingResult;
};

export function FormulaExplanation({
  inputs,
  result,
}: FormulaExplanationProps) {
  if (result.totalKwh === 0) {
    return null;
  }

  const showSplitFormula =
    inputs.endSOC > SOC_THRESHOLD && inputs.startSOC < SOC_THRESHOLD;
  const showAboveFormula = inputs.startSOC >= SOC_THRESHOLD;

  return (
    <Collapsible className="mt-4">
      <CollapsibleTrigger className="font-medium text-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        How is this calculated?
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-3 text-muted-foreground text-sm">
          <EfficiencyInfo inputs={inputs} result={result} />
          {showSplitFormula && <SplitFormula inputs={inputs} result={result} />}
          {showAboveFormula && (
            <AboveThresholdFormula inputs={inputs} result={result} />
          )}
          {!(showSplitFormula || showAboveFormula) && (
            <SimpleFormula inputs={inputs} result={result} />
          )}
          <p>
            Total loss:{' '}
            <span className="font-medium text-foreground">
              {result.conversionLossKwh} kWh
            </span>{' '}
            ({((result.conversionLossKwh / result.totalKwh) * 100).toFixed(1)}%
            of total). Real-world losses vary with temperature, battery age, and
            charger condition.
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
