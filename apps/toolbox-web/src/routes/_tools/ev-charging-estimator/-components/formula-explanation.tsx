import {
  Disclosure,
  DisclosureGroup,
  DisclosurePanel,
  DisclosureTrigger,
} from '@/lib/components/ui/disclosure-group';
import {
  CHARGER_EFFICIENCIES,
  type ChargerType,
  type ChargingResult,
} from '@/lib/tools/ev-charging-estimator/adapters/ev-charging';

type FormulaExplanationProps = {
  inputs: {
    startSOC: number;
    endSOC: number;
    totalCapacity: number;
    usablePercent: number;
    chargerType: ChargerType;
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

  const { startSOC, endSOC, totalCapacity, usablePercent, chargerType } =
    inputs;
  const usableCapacity = result.usableCapacity;
  const efficiency = CHARGER_EFFICIENCIES[chargerType];
  const SOC_THRESHOLD = 80;
  const SOC_PENALTY = 0.07;

  const showSplitFormula = endSOC > SOC_THRESHOLD && startSOC < SOC_THRESHOLD;
  const showAboveFormula = startSOC >= SOC_THRESHOLD;

  return (
    <DisclosureGroup className="mt-4">
      <Disclosure>
        <DisclosureTrigger>How is this calculated?</DisclosureTrigger>
        <DisclosurePanel>
          <div className="space-y-3 text-muted-fg text-sm">
            <p>
              Total capacity: {totalCapacity} kWh, usable: {usablePercent}% ={' '}
              <span className="font-medium text-fg">{usableCapacity} kWh</span>{' '}
              used for calculations.
            </p>

            <p>
              Charger efficiency for{' '}
              <span className="font-medium text-fg">{chargerType}</span> is{' '}
              <span className="font-medium text-fg">
                {(efficiency * 100).toFixed(0)}%
              </span>
              . This accounts for AC/DC conversion losses and battery
              resistance.
            </p>

            {showSplitFormula && (
              <>
                <p>
                  Since charging spans above and below the 80% SOC threshold,
                  the calculation is split into two parts:
                </p>
                <div className="overflow-x-auto rounded-md border border-border bg-background p-3 font-mono text-fg text-xs">
                  <p>
                    basePart = ({SOC_THRESHOLD} - {startSOC}) x {usableCapacity}{' '}
                    / {efficiency} ={' '}
                    {result.baseKwh > result.conversionLossKwh
                      ? (
                          ((SOC_THRESHOLD - startSOC) * usableCapacity) /
                          100 /
                          efficiency
                        ).toFixed(2)
                      : '—'}{' '}
                    kWh
                  </p>
                  <p>
                    topPart = ({endSOC} - {SOC_THRESHOLD}) x {usableCapacity} /{' '}
                    {(efficiency - SOC_PENALTY).toFixed(2)} ={' '}
                    {(
                      ((endSOC - SOC_THRESHOLD) * usableCapacity) /
                      100 /
                      (efficiency - SOC_PENALTY)
                    ).toFixed(2)}{' '}
                    kWh
                  </p>
                  <p className="mt-1 font-semibold">
                    total = basePart + topPart = {result.totalKwh} kWh
                  </p>
                </div>
                <p>
                  The 80% SOC threshold adds a{' '}
                  <span className="font-medium text-fg">
                    {(SOC_PENALTY * 100).toFixed(0)} percentage point
                  </span>{' '}
                  efficiency penalty to slow down charging and protect battery
                  health.
                </p>
              </>
            )}

            {showAboveFormula && (
              <>
                <p>
                  Since charging starts at or above 80%, the penalty applies to
                  the entire charge:
                </p>
                <div className="overflow-x-auto rounded-md border border-border bg-background p-3 font-mono text-fg text-xs">
                  <p>
                    kWh = ({endSOC} - {startSOC}) x {usableCapacity} /{' '}
                    {(efficiency - SOC_PENALTY).toFixed(2)} = {result.totalKwh}{' '}
                    kWh
                  </p>
                </div>
              </>
            )}

            {!(showSplitFormula || showAboveFormula) && (
              <>
                <p>
                  Since charging stays below 80%, standard efficiency applies:
                </p>
                <div className="overflow-x-auto rounded-md border border-border bg-background p-3 font-mono text-fg text-xs">
                  <p>
                    kWh = ({endSOC} - {startSOC}) x {usableCapacity} /{' '}
                    {efficiency} = {result.totalKwh} kWh
                  </p>
                </div>
              </>
            )}

            <p>
              Total loss:{' '}
              <span className="font-medium text-fg">
                {result.conversionLossKwh} kWh
              </span>{' '}
              ({((result.conversionLossKwh / result.totalKwh) * 100).toFixed(1)}
              % of total). Real-world losses vary with temperature, battery age,
              and charger condition.
            </p>
          </div>
        </DisclosurePanel>
      </Disclosure>
    </DisclosureGroup>
  );
}
