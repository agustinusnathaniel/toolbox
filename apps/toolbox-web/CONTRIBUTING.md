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
cd intent-dashboard
pnpm install
pnpm dev
```

### 3. Branching & Commits

- Use descriptive branch names: `feature/xxx`, `fix/xxx`, `chore/xxx`.
- **Commits**: Follow [Conventional Commits](https://www.conventionalcommits.org/).
  - Example: `feat(ui): add new data-table component`
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

## Pull Request Process

1. Ensure `pnpm check:turbo` (linting + type check + tests) passes.
2. Provide a clear description of changes in the PR.
3. Include screenshots for UI changes.
4. Update `SPEC.md` if any architectural invariants are changed.
5. Update `AGENTS.md` if new high-level patterns are introduced.
