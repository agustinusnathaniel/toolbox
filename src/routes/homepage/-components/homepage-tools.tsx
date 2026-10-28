import { Link } from '@tanstack/react-router';
import { ArrowUpRight, Search, X } from 'lucide-react';
import { type RefObject, useRef, useState } from 'react';

import { Button, buttonStyles } from '@/lib/components/ui/button';
import { Input, InputGroup } from '@/lib/components/ui/input';
import { SearchField } from '@/lib/components/ui/search-field';
import { ToggleGroup, ToggleGroupItem } from '@/lib/components/ui/toggle-group';
import { TOOL_CATEGORIES } from '@/lib/navigation/tool-catalog';
import type { ToolNavItem } from '@/lib/navigation/tool-registry';

import { allTools, sectionClass } from './homepage-sections';

type ToolCategoryGroup = {
  category: string;
  items: Array<ToolNavItem>;
};

function groupToolsByCategory(
  tools: Array<ToolNavItem>
): Array<ToolCategoryGroup> {
  return TOOL_CATEGORIES.map((category) => ({
    category,
    items: tools.filter((tool) => tool.category === category),
  })).filter((group) => group.items.length > 0);
}

const ALL_CATEGORY = 'all';

function ToolSearchControls({
  categories,
  category,
  inputRef,
  onCategoryChange,
  onQueryChange,
  query,
}: {
  categories: Array<ToolCategoryGroup>;
  category: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onCategoryChange: (value: string) => void;
  onQueryChange: (value: string) => void;
  query: string;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4">
      <SearchField
        aria-label="Search tools"
        className="w-full max-w-md"
        onChange={(value) => onQueryChange(value)}
        value={query}
      >
        <InputGroup>
          <Search aria-hidden="true" data-slot="icon" />
          <Input
            placeholder="Search by name, task, or category"
            ref={inputRef}
          />
          {query ? (
            <Button
              aria-label="Clear search"
              intent="plain"
              onPress={() => onQueryChange('')}
              size="sq-sm"
            >
              <X aria-hidden="true" className="size-4" />
            </Button>
          ) : null}
        </InputGroup>
      </SearchField>

      <ToggleGroup
        aria-label="Filter tools by category"
        className="flex flex-wrap"
        disallowEmptySelection
        onSelectionChange={(keys) => {
          const next = Array.from(keys)[0];
          if (typeof next === 'string') {
            onCategoryChange(next);
          }
        }}
        selectedKeys={[category]}
        selectionMode="single"
        size="sm"
      >
        <ToggleGroupItem id={ALL_CATEGORY}>All</ToggleGroupItem>
        {categories.map(({ category: name }) => (
          <ToggleGroupItem id={name} key={name}>
            {name}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

function ToolRows({
  onReset,
  tools,
}: {
  onReset: () => void;
  tools: Array<ToolNavItem>;
}) {
  if (tools.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-bg p-8 text-center">
        <h3 className="text-balance font-semibold text-fg">No tools match.</h3>
        <p className="mx-auto mt-2 max-w-md text-pretty text-muted-fg text-sm">
          Try a different search term or category.
        </p>
        <Button className="mt-5" intent="outline" onPress={onReset} size="md">
          Clear search and filters
        </Button>
      </div>
    );
  }
  return (
    <ul className="grid list-none gap-x-8 p-0 lg:grid-cols-2">
      {tools.map((tool) => (
        <li className="min-w-0 border-border border-b" key={tool.slug}>
          <Link
            className="flex items-start gap-4 py-4 text-fg no-underline hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
            to={tool.path}
          >
            <span
              aria-hidden="true"
              className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-subtle text-primary-subtle-fg"
            >
              <span className="[&_svg]:size-4">{tool.icon}</span>
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <h3 className="wrap-anywhere text-balance font-semibold text-fg text-sm">
                  {tool.title}
                </h3>
                <span className="wrap-anywhere min-w-0 text-muted-fg text-xs">
                  {tool.category}
                </span>
              </div>
              {tool.description ? (
                <p
                  className="wrap-anywhere mt-0.5 line-clamp-3 text-pretty text-muted-fg text-sm"
                  title={tool.description}
                >
                  {tool.description}
                </p>
              ) : null}
            </div>
            <ArrowUpRight
              aria-hidden="true"
              className="mt-1 size-4 shrink-0 text-muted-fg"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}

const WHITESPACE_PATTERN = /\s+/;

function matchesTool(
  tool: ToolNavItem,
  query: string,
  category: string
): boolean {
  if (category !== ALL_CATEGORY && tool.category !== category) {
    return false;
  }
  const tokens = query
    .trim()
    .toLowerCase()
    .split(WHITESPACE_PATTERN)
    .filter(Boolean);
  if (tokens.length === 0) {
    return true;
  }
  const haystack =
    `${tool.title} ${tool.description} ${tool.category} ${tool.slug}`.toLowerCase();
  return tokens.every((token) => haystack.includes(token));
}

const numberFormat = new Intl.NumberFormat('en');

function pluralize(count: number, one: string, many: string): string {
  return `${numberFormat.format(count)} ${count === 1 ? one : many}`;
}

function NoToolsAvailable() {
  return (
    <section className={`${sectionClass} py-12 sm:py-16`} id="tools">
      <div className="mb-8 max-w-2xl">
        <h2 className="text-balance font-semibold text-3xl text-fg sm:text-4xl">
          Find the right tool.
        </h2>
        <p className="mt-3 text-pretty text-muted-fg">
          Search by name, task, or category.
        </p>
      </div>
      <p className="text-pretty text-muted-fg" role="status">
        No tools available.
      </p>
      <div className="mt-6">
        <Link
          className={buttonStyles({ intent: 'outline', size: 'lg' })}
          to="/"
        >
          Return to Toolbox
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

export function HomepageTools({
  tools = allTools,
}: {
  tools?: Array<ToolNavItem>;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(ALL_CATEGORY);
  const [limit, setLimit] = useState(12);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const categories = groupToolsByCategory(tools);
  const starters = categories
    .flatMap((group) => group.items.slice(0, 1))
    .slice(0, 6);
  const isFiltering = query.trim().length > 0 || category !== ALL_CATEGORY;
  const matches = isFiltering
    ? tools.filter((tool) => matchesTool(tool, query, category))
    : [];
  const shown = matches.slice(0, limit);
  const capped = matches.length > limit;
  const visible = isFiltering ? shown : starters;
  const filterLabel = capped
    ? `Showing ${pluralize(shown.length, 'result', 'results')} of ${pluralize(matches.length, 'matching tool', 'matching tools')}`
    : pluralize(matches.length, 'matching tool', 'matching tools');
  const defaultLabel = `${pluralize(visible.length, 'suggestion', 'suggestions')} from ${pluralize(tools.length, 'tool', 'tools')}`;

  if (tools.length === 0) {
    return <NoToolsAvailable />;
  }

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setLimit(12);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setLimit(12);
  };

  const handleReset = () => {
    setQuery('');
    setCategory(ALL_CATEGORY);
    setLimit(12);
    inputRef.current?.focus();
  };

  return (
    <section className={`${sectionClass} py-12 sm:py-16`} id="tools">
      <div className="mb-8 max-w-2xl">
        <h2 className="text-balance font-semibold text-3xl text-fg sm:text-4xl">
          Find the right tool.
        </h2>
        <p className="mt-3 text-pretty text-muted-fg">
          Search by name, task, or category.
        </p>
      </div>
      <ToolSearchControls
        categories={categories}
        category={category}
        inputRef={inputRef}
        onCategoryChange={handleCategoryChange}
        onQueryChange={handleQueryChange}
        query={query}
      />
      <p className="mb-4 text-muted-fg text-sm tabular-nums" role="status">
        {isFiltering ? filterLabel : defaultLabel}
      </p>
      <ToolRows onReset={handleReset} tools={visible} />
      {isFiltering && capped ? (
        <div className="mt-6 flex justify-center">
          <Button
            intent="outline"
            onPress={() => setLimit((value) => value + 12)}
            size="md"
          >
            Show more tools
          </Button>
        </div>
      ) : null}
      <div className="mt-8 flex justify-center">
        <Link
          className={buttonStyles({ intent: 'outline', size: 'lg' })}
          to="/"
        >
          View all {pluralize(tools.length, 'tool', 'tools')}
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
