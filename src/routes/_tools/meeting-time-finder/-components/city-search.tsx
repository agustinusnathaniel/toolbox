import { useMemo, useState } from 'react';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/lib/components/ui/combobox';
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
    <div className="w-full">
      <Combobox
        aria-label="Search for a city to add"
        inputValue={query}
        items={results}
        itemToStringLabel={(city: City) => city.name}
        itemToStringValue={(city: City) => city.name}
        onInputValueChange={setQuery}
        onValueChange={(city: City | null) => {
          if (city) {
            onAdd(city);
            setQuery('');
          }
        }}
        value={null}
      >
        <ComboboxInput placeholder="+ Add a city..." />
        <ComboboxContent>
          <ComboboxEmpty>No cities found.</ComboboxEmpty>
          <ComboboxList>
            {(city: City) => (
              <ComboboxItem key={city.id} value={city}>
                <span className="col-span-full flex w-full items-baseline gap-1.5">
                  <span className="truncate">{city.name}</span>
                  <span className="shrink-0 text-muted-foreground text-xs">
                    {city.country}
                  </span>
                  <span className="ml-auto shrink-0 font-mono text-muted-foreground text-xs tabular-nums">
                    {getCurrentTimeLabel(city.timezone)}
                  </span>
                </span>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
