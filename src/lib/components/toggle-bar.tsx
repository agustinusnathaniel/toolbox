import { Button } from '@/lib/components/ui/button';

export interface ToggleOption<T extends string> {
  action: string;
  id: T;
  label: string;
}

interface ToggleBarProps<T extends string> {
  onSelectionChange: (id: T) => void;
  options: ReadonlyArray<ToggleOption<T>>;
  size?: React.ComponentProps<typeof Button>['size'];
  /** Analytics action fired alongside each selection. */
  track: (action: string) => void;
  value: T;
}

export function ToggleBar<T extends string>({
  onSelectionChange,
  options,
  size,
  track,
  value,
}: ToggleBarProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Button
          key={option.id}
          onClick={() => {
            onSelectionChange(option.id);
            track(option.action);
          }}
          size={size}
          variant={value === option.id ? 'default' : 'outline'}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
