# CONTRIBUTING.md

## Philosophy

We build for longevity and clarity. Our code should be readable by humans and easily interpreted by AI agents.

## Development Workflow

### 1. Requirements

- **Node.js**: ^24.16.x
- **Package Manager**: pnpm@11.8.0

### 2. Getting Started

```bash
git clone <repo-url>
cd toolbox
pnpm install
pnpm dev
```

The app will be available at `http://localhost:3000`.

### 3. Branching & Commits

- Use descriptive branch names: `feature/xxx`, `fix/xxx`, `chore/xxx`.
- **Commits**: Follow [Conventional Commits](https://www.conventionalcommits.org/).
  - Example: `feat(wa-link): add country code search filtering`
  - Enforced by `commitlint` via `.vite-hooks/` (set up by `vp config`).

## Code Standards

### Linting & Formatting

We use **Ultracite** (wrapping Biome) for both linting and formatting.

- Run `pnpm ultracite:check` to see issues.
- Run `pnpm ultracite:fix` to auto-fix.
- Your editor should have the Biome extension installed for real-time feedback.

### TypeScript

- Strict mode is enabled.
- Avoid type assertions (`as`).
- Use `interface` for object shapes, `type` for unions/others.

### Component Guidelines

- **Adding UI Components**: This project uses the `shadcn` CLI pattern with a custom registry from **IntentUI**. To add a new primitive component:
  ```bash
  pnpm dlx shadcn@latest add @intentui/<component-name>
  ```
  **Critical**: Do not manually copy component code from the documentation. Always use the CLI to ensure all dependencies and styles are correctly integrated.
- Place reusable UI components in `src/lib/components/ui`.
- Place route-specific components in a `-components` folder relative to the route file.
- Use `tailwind-variants` for styling logic.
- Prefer `lucide-react` for generic icons, and `@intentui/icons` for system icons.

### Testing

Tests are opt-in, not the default. Write them when there is a concrete, defensible benefit — meaningful regression protection for risky logic — not automatically for every change. Don't chase test count or coverage percentage; optimize for confidence, regression protection, signal-to-noise ratio, and maintenance cost.

When writing or reviewing tests:

- **Black-box behavior only.** Pass inputs, assert observable outputs. A test should only fail when a behavior is broken, never when the implementation behind it changes. No assertions on source-code strings, function shapes, or internal structure.
- **One behavior, one test.** A regression should produce exactly one failure. Prefer extending a module's existing test file over creating a new one.
- **No ceremony.** Plain assertions. Mock only genuinely external seams (clipboard, network, timers, workers) — if a test mocks the project's own logic, extract that logic into a pure `adapters/` function instead.
- **Prefer adapters over UI tests.** Pure functions in `src/lib/tools/<name>/adapters/` test without DOM mocking. For UI, a handful of behavioral/a11y checks (e.g. `diff-view-control.test.tsx`) beats component-internals testing.
- **Prefer runtime verification when it gives better signal.** For visual or integration-level changes, `pnpm dev` + browser verification can replace a test that would only mock the DOM.

Run tests with `pnpm test` (one-shot) or `pnpm test:ui` (visual interface for debugging).

## Adding a New Tool

### Overview

Tools live as routes under `src/routes/_tools/<tool-name>/`. Business logic should be extracted into `src/lib/tools/<tool-name>/` when it is reusable or testable independently.

### Step 1: Create the Route

Create a new directory at `src/routes/_tools/<tool-name>/`, add an `index.tsx` file, and add a `-meta.ts` sidecar:

```typescript
import { createFileRoute } from '@tanstack/react-router';

import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { meta } from './-meta';

export const Route = createFileRoute('/_tools/<tool-name>/')({
  component: ToolPage,
  ...createToolRouteMetadata(meta),
});

function ToolPage() {
  // Your tool component
}
```

### Step 2: Define route metadata

In `src/routes/_tools/<tool-name>/-meta.ts`, define route-owned metadata as a const:

```ts
export const meta = {
  pageTitle: '<Tool Display Name>',
  description: '<What this tool does in 1 sentence>',
  slug: '<tool-slug>',
} as const;
```

Pass the metadata through the typed helper in the route:

```ts
export const Route = createFileRoute('/_tools/<tool-name>/')({
  ...createToolRouteMetadata(meta),
  // ...
});
```

The navigation system (`src/lib/navigation/tool-registry.tsx`) automatically discovers registered routes by reading `staticData.meta` from each route definition. No manual registry update is needed.

See existing routes (e.g., `src/routes/_tools/qrcode/index.tsx`, `src/routes/_tools/ev-charging/index.tsx`) for concrete examples.

### Step 3: Add to Homepage Catalog

Update the tool lists in `src/routes/index.tsx` to include your new tool in either `currentTools` or `upcomingTools`.

### Step 4: Extract Business Logic (Recommended)

For non-trivial tools, extract pure logic into `src/lib/tools/<tool-name>/`.

Create a subdirectory called `adapters/` inside your tool's lib directory:
`src/lib/tools/<tool-name>/adapters/<tool>.ts`. This keeps pure functions
separate from UI components and makes them testable without DOM mocking.
See existing tools (e.g., `src/lib/tools/qrcode-generator/adapters/`,
`src/lib/tools/ev-charging-estimator/adapters/`) for the convention.

Add a test file alongside the adapter when the logic carries real regression
risk (parsing, formatting, math, shareable-URL state):
`src/lib/tools/<tool-name>/adapters/<tool>.test.ts`. Tests are opt-in — see
[Testing](#testing) before creating one. Model them after existing adapter
tests, e.g. `src/lib/tools/regex-tester/adapters/regex.test.ts` (behavioral
edge cases) and
`src/lib/tools/ev-charging-estimator/adapters/ev-charging-params.test.ts`
(shareable-URL state round-trips). They use `vitest` with jsdom via `vp test`.

Then import from your route:

```typescript
import { someFunction } from '@/lib/tools/<tool-name>';
```

### Step 5: Add Analytics Tracking (Optional)

Use the analytics hooks to track tool usage:

```typescript
import { useToolTracking } from '@/lib/analytics/use-analytics';

function ToolPage() {
  const { trackAction, trackComplete } = useToolTracking('<tool-id>', 'Tool Name');

  // Track actions
  trackAction('some_action');

  // Track completion
  trackComplete(true); // or false on error
}
```

### Business Logic Conventions

- Core logic in `src/lib/tools/<name>/` should contain only browser-safe, pure business logic.
- It should not depend on UI frameworks or route-specific state.
- It should export types and functions that can be tested independently.

### Route Conventions

- Routes live under `src/routes/_tools/<tool-name>/index.tsx`.
- Use `staticData.meta.pageTitle` for the heading shown in the tool layout.
- Use the `head` export for per-route metadata (title, description, OG tags).
- All routes are client components (`'use client'`) currently.

## Pull Request Process

1. Ensure `pnpm check:turbo` (ultracite:check + type:check + test) passes, or run individually (`pnpm ultracite:check && pnpm type:check && pnpm test`).
2. Provide a clear description of changes in the PR.
3. Include screenshots for UI changes.
4. Update `SPEC.md` if any architectural invariants are changed.
5. Update `AGENTS.md` if new high-level patterns are introduced.
