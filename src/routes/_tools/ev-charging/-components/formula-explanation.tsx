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
  SOC_PENALTY_90,
  SOC_PENALTY_95,
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
              </span>{' '}
              and drops progressively above it:&nbsp;
              <span className="font-medium text-fg">
                {((efficiency - SOC_PENALTY) * 100).toFixed(0)}% at{' '}
                {SOC_THRESHOLD}–90% SOC
              </span>
              ,{' '}
              <span className="font-medium text-fg">
                {((efficiency - SOC_PENALTY_90) * 100).toFixed(0)}% at 90–95%
                SOC
              </span>
              ,{' '}
              <span className="font-medium text-fg">
                {((efficiency - SOC_PENALTY_95) * 100).toFixed(0)}% above 95%
                SOC
              </span>
              . Charging slows at high SOC to protect battery health, which
              increases relative losses.
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
                  split by SOC threshold:
                </p>
                <div className="overflow-x-auto rounded-md border border-border bg-background p-3 font-mono text-fg text-xs">
                  <p>
                    below{SOC_THRESHOLD} = ({SOC_THRESHOLD} - {startSOC}) x{' '}
                    {usableCapacity} / {efficiency} ={' '}
                    {(
                      ((SOC_THRESHOLD - startSOC) * usableCapacity) /
                      100 /
                      efficiency
                    ).toFixed(2)}{' '}
                    kWh
                  </p>
                  {endSOC > 80 && (
                    <p>
                      {SOC_THRESHOLD}–90% = (
                      {Math.min(endSOC, 90) - SOC_THRESHOLD}) x {usableCapacity}{' '}
                      / {(efficiency - SOC_PENALTY).toFixed(3)} ={' '}
                      {(
                        ((Math.min(endSOC, 90) - SOC_THRESHOLD) *
                          usableCapacity) /
                        100 /
                        (efficiency - SOC_PENALTY)
                      ).toFixed(2)}{' '}
                      kWh
                    </p>
                  )}
                  {endSOC > 90 && (
                    <p>
                      90–95% = ({Math.min(endSOC, 95) - 90}) x {usableCapacity}{' '}
                      / {(efficiency - SOC_PENALTY_90).toFixed(3)} ={' '}
                      {(
                        ((Math.min(endSOC, 95) - 90) * usableCapacity) /
                        100 /
                        (efficiency - SOC_PENALTY_90)
                      ).toFixed(2)}{' '}
                      kWh
                    </p>
                  )}
                  {endSOC > 95 && (
                    <p>
                      95–100% = ({endSOC - 95}) x {usableCapacity} /{' '}
                      {(efficiency - SOC_PENALTY_95).toFixed(3)} ={' '}
                      {(
                        ((endSOC - 95) * usableCapacity) /
                        100 /
                        (efficiency - SOC_PENALTY_95)
                      ).toFixed(2)}{' '}
                      kWh
                    </p>
                  )}
                  <p className="mt-1 font-semibold">
                    total = {result.totalKwh} kWh
                  </p>
                </div>
              </>
            )}

            {showAboveFormula && (
              <>
                <p>
                  Since charging starts at or above {SOC_THRESHOLD}%, each SOC
                  band uses its own loss rate:
                </p>
                <div className="overflow-x-auto rounded-md border border-border bg-background p-3 font-mono text-fg text-xs">
                  {endSOC > 80 && startSOC < 90 && (
                    <p>
                      {SOC_THRESHOLD}–90% = (
                      {Math.min(endSOC, 90) - Math.max(startSOC, 80)}) x{' '}
                      {usableCapacity} / {(efficiency - SOC_PENALTY).toFixed(3)}{' '}
                      ={' '}
                      {(
                        ((Math.min(endSOC, 90) - Math.max(startSOC, 80)) *
                          usableCapacity) /
                        100 /
                        (efficiency - SOC_PENALTY)
                      ).toFixed(2)}{' '}
                      kWh
                    </p>
                  )}
                  {endSOC > 90 && startSOC < 95 && (
                    <p>
                      90–95% = ({Math.min(endSOC, 95) - Math.max(startSOC, 90)})
                      x {usableCapacity} /{' '}
                      {(efficiency - SOC_PENALTY_90).toFixed(3)} ={' '}
                      {(
                        ((Math.min(endSOC, 95) - Math.max(startSOC, 90)) *
                          usableCapacity) /
                        100 /
                        (efficiency - SOC_PENALTY_90)
                      ).toFixed(2)}{' '}
                      kWh
                    </p>
                  )}
                  {endSOC > 95 && (
                    <p>
                      95–100% = ({endSOC - Math.max(startSOC, 95)}) x{' '}
                      {usableCapacity} /{' '}
                      {(efficiency - SOC_PENALTY_95).toFixed(3)} ={' '}
                      {(
                        ((endSOC - Math.max(startSOC, 95)) * usableCapacity) /
                        100 /
                        (efficiency - SOC_PENALTY_95)
                      ).toFixed(2)}{' '}
                      kWh
                    </p>
                  )}
                  <p className="mt-1 font-semibold">
                    total = {result.totalKwh} kWh
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
