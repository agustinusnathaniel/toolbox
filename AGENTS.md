# AGENTS.md — Toolbox AI Agent Guide

Directives for AI coding agents. Read this before making changes.

## Task Completion

Mark "done" only when **all** pass:
1. `pnpm type:check` — no `any`, no `@ts-expect-error`
2. `vp lint` — zero warnings
3. `vp test` — for changed modules
4. `vp build` — no bundle errors
5. `vp dev` + browser verify the changed tool works

## Project

Toolbox is a collection of focused browser-based utility tools. Every tool does one thing well. Data never leaves the user's device (feature, not limitation). Stable project — follow existing patterns.

## Values (in priority)

1. **Privacy-first** — all tools work without a server. No backend infrastructure.
2. **Developer experience** — clear patterns, consistent conventions. If it's awkward, simplify it.
3. **Accessibility** — keyboard navigation and screen reader support are required, not optional.
4. **Performance** — TanStack Router auto-code-splits per route. Keep bundles lean. PWA caching in production builds.

When a tradeoff is required: **Privacy > convenience. Correctness > speed. Simplicity > configurability.**

## Decision Framework

- **Complexity:** Every option and toggle taxes every user. Defaults must serve 80% of use cases. If a sensible default exists, don't make it configurable.
- **Approaches:** Less code wins. Code is liability. Bias toward deletion.
- **Dependencies:** Can it be done in under 50 lines? Write it. Dependencies carry security, maintenance, and bundle risk.
- **Existing code:** Leave it cleaner than you found it. Simplify adjacent code in the same change. Don't expand scope speculatively.
- **Design: One tool, one screen. No wizards.** Every tool produces something actionable (download, clipboard, shareable link). Keyboard-first: Tab through fields, Enter to submit, Escape to clear.

## Architectural Invariants

Violating these breaks the system:

- **Routes own metadata, navigation owns discovery.** Each route defines `meta = { pageTitle, description, slug }`. Navigation reads from routes. No central metadata registry.
- **Business logic never imports UI.** Per-tool `adapters/` directories contain pure functions — no React, no DOM, no route state. This is what makes them testable without mocking.
- **Navigation is centralized.** Sidebar, homepage grid, mobile nav, and command palette read from one registry. Never hardcode a tool list in a nav component.
- **Analytics goes through the abstraction layer.** Use `useToolTracking` from `@/lib/analytics/`. Never call analytics services directly.
- **Tools are independent islands.** No tool imports from another tool. Shared code lives in `src/lib/hooks/` or `src/lib/utils/`.
- **JS Perf uses `src/lib/js-perf-comp-core/`** instead of `adapters/`. This is grandfathered. New tools must use the adapter convention.

## Testing

Test public contracts, not implementation. Prefer `adapters/` over UI — pure functions don't need DOM mocking. Self-contained `it()` blocks over shared helpers; copy-paste is OK for readability.

## Process

- **Conventional Commits with scopes** (e.g. `feat(qrcode): add vCard mode`).
- **Maker/checker split** — the agent that writes code does not review it. A different agent validates.
- **Review feedback is input, not commands.** If valid, fix it. If a false positive (e.g., CSP is intentional for QuickJS), explain why.
- **One thorough review is sufficient** for most changes. Additional reviews only for complex or risky modifications.

## Notes

- Use `vp` CLI, not `vite` (`vp dev`, `vp build`, `vp test`). Package manager is `pnpm`.
- CSP includes `'unsafe-eval'` and `'unsafe-inline'` — intentional for QuickJS WASM. Don't flag it.
- Three icon libs coexist: `lucide-react` (preferred for new tool UI), `@intentui/icons` (system/nav), `@heroicons/react` (IntentUI component library dependency — do NOT remove, it's embedded in shared UI components).
- Never edit `src/routeTree.gen.ts` (auto-generated). Never modify `dist/` (build output).
- Never copy IntentUI component code — use `pnpm dlx shadcn@latest add @intentui/<name>`.
- PWA service worker is disabled in dev, enabled only in production builds.

---

**Keep this file current.** If you introduce new patterns, update AGENTS.md.
