import type { ChargingResult } from '@/lib/tools/ev-charging-estimator/adapters/ev-charging';
import { formatTime } from '@/lib/tools/ev-charging-estimator/adapters/ev-charging';

type ResultCardProps = {
  result: ChargingResult;
  inputs: {
    totalCapacity: number;
    usablePercent: number;
  };
};

export function ResultCard({ result, inputs }: ResultCardProps) {
  const {
    usableCapacity,
    totalKwh,
    baseKwh,
    conversionLossKwh,
    socPenaltyKwh,
    estimatedCost,
    estimatedTimeHours,
    comparison80,
  } = result;

  if (totalKwh === 0) {
    return (
      <div className="mt-4 rounded-lg border border-border bg-secondary/20 p-4 text-center text-muted-fg text-sm">
        Enter your charging details to see the estimate.
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3 rounded-lg border border-border bg-secondary/20 p-4 text-sm">
      <div>
        <p className="text-muted-fg">Estimated energy needed</p>
        <p className="font-semibold text-2xl text-fg tabular-nums">
          {totalKwh} kWh
        </p>
        <p className="text-muted-fg text-xs">
          {usableCapacity} kWh usable ({inputs.usablePercent}% of{' '}
          {inputs.totalCapacity} kWh)
        </p>
      </div>

      <div className="space-y-0.5 text-muted-fg">
        <p>{baseKwh} kWh for the charge itself</p>
        <p>{conversionLossKwh} kWh lost to conversion inefficiency</p>
        {socPenaltyKwh > 0 && <p>{socPenaltyKwh} kWh extra loss above 80%</p>}
      </div>

      {comparison80 && (
        <div className="rounded-md border border-border bg-background p-2">
          <p>
            If charged to 80% instead:{' '}
            <span className="font-medium text-fg">{comparison80.kwh} kWh</span>
            {' — '}
            <span className="font-medium text-accent-fg">
              save {comparison80.savings} kWh
            </span>
          </p>
        </div>
      )}

      {(estimatedCost !== undefined || estimatedTimeHours !== undefined) && (
        <div className="flex gap-4 text-muted-fg">
          {estimatedCost !== undefined && (
            <p>
              Cost:{' '}
              <span className="font-medium text-fg">
                ${estimatedCost.toFixed(2)}
              </span>
            </p>
          )}
          {estimatedTimeHours !== undefined && (
            <p>
              Time:{' '}
              <span className="font-medium text-fg">
                {formatTime(estimatedTimeHours)}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
