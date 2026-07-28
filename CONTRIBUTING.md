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

- Write unit tests for business logic in `*.test.ts`.
- Use `vitest` to run tests.
- `pnpm test` performs a one-time run.
- `pnpm test:ui` provides a visual interface for test debugging.

## Adding a New Tool

### Overview

Tools live as routes under `src/routes/_tools/<tool-name>/`. Business logic should be extracted into `src/lib/tools/<tool-name>/` when it is reusable or testable independently.

### Step 1: Create the Route

Create a new directory at `src/routes/_tools/<tool-name>/` and add an `index.tsx` file:

```typescript
import { createFileRoute } from '@tanstack/react-router';

const meta = {
  pageTitle: '<Tool Display Name>',
  description: '<What this tool does in 1 sentence>',
  slug: '<tool-slug>',
} as const;

export const Route = createFileRoute('/_tools/<tool-name>/')({
  component: ToolPage,
  staticData: { meta },
  head: () => ({
    meta: [
      { title: meta.pageTitle },
      { name: 'description', content: meta.description },
    ],
  }),
});

function ToolPage() {
  // Your tool component
}
```

### Step 2: Define route metadata

In your new route file (`src/routes/_tools/<tool-name>/index.tsx`), define metadata as a const:

```ts
const meta = {
  pageTitle: '<Tool Display Name>',
  description: '<What this tool does in 1 sentence>',
  slug: '<tool-slug>',
} as const;
```

Pass the metadata to the route's `staticData` and `head()` function:

```ts
export const Route = createFileRoute('/_tools/<tool-name>/')({
  staticData: { meta },
  head: () => ({
    meta: [
      { title: meta.pageTitle },
      { name: 'description', content: meta.description },
    ],
  }),
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

Create a corresponding test file alongside the adapter:
`src/lib/tools/<tool-name>/adapters/<tool>.test.ts`. Model your tests after
existing adapter tests — they use `vitest` with jsdom. See
`src/lib/tools/ev-charging-estimator/adapters/ev-charging.test.ts` for a
comprehensive example covering edge cases.

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
- Use `staticData.pageTitle` for the heading shown in the tool layout.
- Use the `head` export for per-route metadata (title, description, OG tags).
- All routes are client components (`'use client'`) currently.

## Pull Request Process

1. Ensure `pnpm check:turbo` (ultracite:check + type:check + test) passes, or run individually (`pnpm ultracite:check && pnpm type:check && pnpm test`).
2. Provide a clear description of changes in the PR.
3. Include screenshots for UI changes.
4. Update `SPEC.md` if any architectural invariants are changed.
5. Update `AGENTS.md` if new high-level patterns are introduced.
