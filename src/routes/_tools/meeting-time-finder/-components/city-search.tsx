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
            <span>{city.name}</span>
            <span className="text-muted-foreground text-xs">
              {city.country}
            </span>
          </ComboBoxItem>
        )}
      </ComboBoxContent>
    </ComboBox>
  );
}
