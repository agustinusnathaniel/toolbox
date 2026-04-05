# CONTRIBUTING.md

## Philosophy

We build for longevity and clarity. Our code should be readable by humans and easily interpreted by AI agents.

## Development Workflow

### 1. Requirements

- **Node.js**: ^24.11.x
- **Package Manager**: pnpm@10.24.0

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
  - Enforced by `commitlint` and `husky`.

## Code Standards

### Linting & Formatting

We use **Biome** for both linting and formatting. It is significantly faster than ESLint/Prettier.

- Run `pnpm biome:check` to see issues.
- Run `pnpm biome:fix` to auto-fix.
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

Tools live as routes under `src/routes/tools/<tool-name>/`. Business logic should be extracted into a corresponding `packages/<tool-name>-core` package when it is reusable or testable independently.

### Step 1: Create the Route

Create a new directory at `src/routes/tools/<tool-name>/` and add an `index.tsx` file:

```typescript
import { createFileRoute } from '@tanstack/react-router';
import { TOOL_META } from '@/lib/utils/metadata';

const meta = TOOL_META['<tool-id>'];

export const Route = createFileRoute('/tools/<tool-name>/')({
  component: ToolPage,
  staticData: {
    pageTitle: meta.title,
  },
  head: () => ({
    meta: [
      { title: meta.title },
      { name: 'description', content: meta.description },
      { property: 'og:title', content: meta.title },
      { property: 'og:description', content: meta.description },
      { property: 'og:type', content: 'website' },
    ],
  }),
});

function ToolPage() {
  // Your tool component
}
```

### Step 2: Register Metadata

Add an entry to `src/lib/utils/metadata.ts` in the `TOOL_META` constant:

```typescript
export const TOOL_META = {
  // ...existing entries
  '<tool-id>': {
    title: 'Tool Display Name',
    description: 'Brief description of what the tool does.',
    path: '/tools/<tool-name>',
  },
} as const;
```

### Step 3: Add to Homepage Catalog

Update the tool lists in `src/routes/index.tsx` to include your new tool in either `currentTools` or `upcomingTools`.

### Step 4: Extract Business Logic (Recommended)

For non-trivial tools, extract pure logic into a package:

1. Create `packages/<tool-name>-core/` with:
   - `src/index.ts` — public exports
   - `src/*.ts` — pure functions, types, and models
   - `*.test.ts` — unit tests

2. Add the package to `apps/toolbox-web/package.json`:
   ```json
   "@toolbox/<tool-name>-core": "workspace:*"
   ```

3. Import from the package in your route:
   ```typescript
   import { someFunction } from '@toolbox/<tool-name>-core';
   ```

### Step 5: Add Analytics Tracking (Optional)

Use the analytics hooks to track tool usage:

```typescript
import { useToolTracking } from '@/lib/analytics/useAnalytics';

function ToolPage() {
  const { trackAction, trackComplete } = useToolTracking('<tool-id>', 'Tool Name');

  // Track actions
  trackAction('some_action');

  // Track completion
  trackComplete(true); // or false on error
}
```

### Package Conventions

- **Core packages** (`packages/<name>-core/`) should contain only browser-safe, pure business logic.
- They should not import from `apps/toolbox-web` or depend on UI frameworks.
- They should export types and functions that can be tested independently.

### Route Conventions

- Routes live under `src/routes/tools/<tool-name>/index.tsx`.
- Use `staticData.pageTitle` for the heading shown in the tool layout.
- Use the `head` export for per-route metadata (title, description, OG tags).
- All routes are client components (`'use client'`) currently.

## Pull Request Process

1. Ensure `pnpm check:turbo` (linting + type check + tests) passes.
2. Provide a clear description of changes in the PR.
3. Include screenshots for UI changes.
4. Update `SPEC.md` if any architectural invariants are changed.
5. Update `AGENTS.md` if new high-level patterns are introduced.
