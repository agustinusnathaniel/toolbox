import { Button } from '@/lib/components/ui/button';

export interface ToggleOption<T extends string> {
  action: string;
  id: T;
  label: string;
}

interface ToggleBarProps<T extends string> {
  onSelectionChange: (id: T) => void;
  options: ReadonlyArray<ToggleOption<T>>;
  size?: 'sm';
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
          intent={value === option.id ? 'primary' : 'outline'}
          key={option.id}
          onPress={() => {
            onSelectionChange(option.id);
            track(option.action);
          }}
          size={size}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
