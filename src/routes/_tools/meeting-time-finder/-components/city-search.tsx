import { useMemo, useState } from 'react';

import {
  ComboBox,
  ComboBoxContent,
  ComboBoxInput,
  ComboBoxItem,
} from '@/lib/components/ui/combo-box';
import {
  type City,
  searchCities,
} from '@/lib/tools/meeting-time-finder/adapters/cities';
import { getCurrentTimeLabel } from '@/lib/tools/meeting-time-finder/adapters/meeting-time-finder';

interface CitySearchProps {
  existingIds: ReadonlySet<string>;
  onAdd: (city: City) => void;
}

export function CitySearch({ onAdd, existingIds }: CitySearchProps) {
  const [query, setQuery] = useState('');

  const results = useMemo(
    () => searchCities(query).filter((c) => !existingIds.has(c.id)),
    [query, existingIds]
  );

  return (
    <ComboBox
      aria-label="Search for a city to add"
      className="w-full"
      inputValue={query}
      items={results}
      menuTrigger="focus"
      onInputChange={setQuery}
      onSelectionChange={(key) => {
        const city = results.find((c) => c.id === key);
        if (city) {
          onAdd(city);
          setQuery('');
        }
      }}
    >
      <ComboBoxInput placeholder="Add a city..." />
      <ComboBoxContent>
        {(city: City) => (
          <ComboBoxItem id={city.id} textValue={`${city.name} ${city.country}`}>
            <span className="col-span-full flex w-full items-baseline gap-1.5">
              <span className="truncate">{city.name}</span>
              <span className="shrink-0 text-muted-foreground text-xs">
                {city.country}
              </span>
              <span className="ml-auto shrink-0 font-mono text-muted-foreground text-xs tabular-nums">
                {getCurrentTimeLabel(city.timezone)}
              </span>
            </span>
          </ComboBoxItem>
        )}
      </ComboBoxContent>
    </ComboBox>
  );
}
