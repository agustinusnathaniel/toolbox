import {
  Disclosure,
  DisclosureGroup,
  DisclosurePanel,
  DisclosureTrigger,
} from '@/lib/components/ui/disclosure-group';
import {
  type ChargerType,
  type ChargingResult,
  SOC_PENALTY,
  SOC_THRESHOLD,
} from '@/lib/tools/ev-charging-estimator/adapters/ev-charging';

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

  const {
    startSOC,
    endSOC,
    totalCapacity,
    usablePercent,
    calibrationFactor,
    chargerType,
  } = inputs;
  const usableCapacity = result.usableCapacity;
  const efficiency = result.efficiency;

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
              <span className="font-medium text-fg">{chargerType}</span>:{' '}
              <span className="font-medium text-fg">
                {(efficiency * 100).toFixed(0)}% below {SOC_THRESHOLD}%
              </span>
              ,{' '}
              <span className="font-medium text-fg">
                {((efficiency - SOC_PENALTY) * 100).toFixed(0)}% above{' '}
                {SOC_THRESHOLD}%
              </span>
              . Charging slows above {SOC_THRESHOLD}% to protect battery health,
              which increases relative losses.
            </p>

            {calibrationFactor !== 1 && (
              <p>
                Calibration factor:{' '}
                <span className="font-medium text-fg">
                  {calibrationFactor.toFixed(2)}x
                </span>{' '}
                — adjusted to match a specific vehicle's real-world efficiency.
              </p>
            )}

            {showSplitFormula && (
              <>
                <p>
                  Since charging spans both efficiency zones, the calculation is
                  split into two parts:
                </p>
                <div className="overflow-x-auto rounded-md border border-border bg-background p-3 font-mono text-fg text-xs">
                  <p>
                    below80 = ({SOC_THRESHOLD} - {startSOC}) x {usableCapacity}{' '}
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
                    above80 = ({endSOC} - {SOC_THRESHOLD}) x {usableCapacity} /{' '}
                    {(efficiency - SOC_PENALTY).toFixed(2)} ={' '}
                    {(
                      ((endSOC - SOC_THRESHOLD) * usableCapacity) /
                      100 /
                      (efficiency - SOC_PENALTY)
                    ).toFixed(2)}{' '}
                    kWh
                  </p>
                  <p className="mt-1 font-semibold">
                    total = below80 + above80 = {result.totalKwh} kWh
                  </p>
                </div>
              </>
            )}

            {showAboveFormula && (
              <>
                <p>
                  Since charging starts at or above {SOC_THRESHOLD}%, the higher
                  loss rate applies to the entire charge:
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
                  Since charging stays below {SOC_THRESHOLD}%, the standard
                  efficiency applies:
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
