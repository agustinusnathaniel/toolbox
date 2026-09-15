import { Input } from '@/lib/components/ui/input';

function clampInt(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

export function IterationsInput({
  iterations,
  max,
  min,
  onChange,
}: {
  iterations: number;
  max: number;
  min: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-muted-fg text-sm" htmlFor="iterations-input">
        Iterations:
      </label>
      <Input
        className="w-[72px]"
        id="iterations-input"
        max={max}
        min={min}
        onBlur={(event) => {
          const value = Number.parseInt(event.target.value, 10);
          if (!Number.isNaN(value)) {
            event.target.value = String(clampInt(value, min, max));
          }
        }}
        onChange={(event) => {
          const value = Number.parseInt(event.target.value, 10);
          if (!Number.isNaN(value)) {
            onChange(clampInt(value, min, max));
          }
        }}
        type="number"
        value={iterations}
      />
    </div>
  );
}

export function StabilityRoundsInput({
  max,
  min,
  onChange,
  rounds,
}: {
  max: number;
  min: number;
  onChange: (v: number) => void;
  rounds: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-muted-fg text-sm" htmlFor="stability-rounds-input">
        Rounds:
      </label>
      <Input
        className="w-[72px]"
        id="stability-rounds-input"
        max={max}
        min={min}
        onBlur={(event) => {
          const value = Number.parseInt(event.target.value, 10);
          if (!Number.isNaN(value)) {
            event.target.value = String(clampInt(value, min, max));
          }
        }}
        onChange={(event) => {
          const value = Number.parseInt(event.target.value, 10);
          if (!Number.isNaN(value)) {
            onChange(clampInt(value, min, max));
          }
        }}
        type="number"
        value={rounds}
      />
    </div>
  );
}

export function StabilityToggle({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className="flex cursor-pointer items-center gap-2 text-muted-fg text-sm"
      htmlFor="stability-mode-input"
    >
      <input
        checked={checked}
        className="size-4"
        disabled={disabled}
        id="stability-mode-input"
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      Stability mode
    </label>
  );
}
