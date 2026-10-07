import { useCallback, useRef, useState } from 'react';

import {
  type City,
  searchCities,
} from '@/lib/tools/meeting-time-finder/adapters/cities';

interface CitySearchProps {
  existingIds: ReadonlySet<string>;
  onAdd: (city: City) => void;
}

interface CityDropdownProps {
  highlightedIndex: number;
  onSelect: (city: City) => void;
  results: Array<City>;
}

function CityDropdown({
  results,
  highlightedIndex,
  onSelect,
}: CityDropdownProps) {
  return (
    <div
      className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-input bg-popover p-1 shadow-md"
      id="city-search-listbox"
      role="listbox"
    >
      {results.slice(0, 10).map((city, i) => (
        <div
          aria-selected={i === highlightedIndex}
          className={`flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm ${
            i === highlightedIndex ? 'bg-accent' : ''
          }`}
          key={city.id}
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(city);
          }}
          role="option"
          tabIndex={-1}
        >
          <span>{city.name}</span>
          <span className="text-muted-foreground text-xs">{city.country}</span>
        </div>
      ))}
    </div>
  );
}

export function CitySearch({ onAdd, existingIds }: CitySearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = searchCities(query).filter((c) => !existingIds.has(c.id));

  const handleSelect = useCallback(
    (city: City) => {
      onAdd(city);
      setQuery('');
      setIsOpen(false);
      inputRef.current?.focus();
    },
    [onAdd]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || results.length === 0) {
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((i) => (i + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((i) => (i - 1 + results.length) % results.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSelect(results[highlightedIndex]);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    },
    [isOpen, results, highlightedIndex, handleSelect]
  );

  return (
    <div className="relative">
      <input
        aria-controls="city-search-listbox"
        aria-expanded={isOpen}
        aria-label="Search for a city to add"
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
          setHighlightedIndex(0);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Add a city..."
        ref={inputRef}
        role="combobox"
        type="text"
        value={query}
      />
      {isOpen && results.length > 0 && (
        <CityDropdown
          highlightedIndex={highlightedIndex}
          onSelect={handleSelect}
          results={results}
        />
      )}
    </div>
  );
}
