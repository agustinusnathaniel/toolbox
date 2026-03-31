---
title: "ADR-0002: Vite, React, and TanStack as the Toolbox Web Baseline"
status: "Accepted"
date: "2026-03-31"
authors: "Nathan, OpenCode"
tags: ["architecture", "decision", "frontend", "tooling"]
supersedes: ""
superseded_by: ""
---

# ADR-0002: Vite, React, and TanStack as the Toolbox Web Baseline

## Status

**Accepted** | Proposed | Rejected | Superseded | Deprecated

## Context

The unified toolbox platform needs a primary frontend baseline for:

- the new `apps/toolbox-web`
- future shared packages
- route composition and navigation
- consistent local development and build workflows

The existing tools do not share the same framework baseline:

- `zippy-img` already uses Vite, React 19, TanStack Router, Tailwind CSS 4, and Turbo
- `wa-link-helper` uses Next.js 16 with React 19 and Tailwind CSS 4

The target platform should minimize long-term framework duplication and align with the tool set that is already closest to the desired future state.

## Decision

Use the following as the primary baseline for `toolbox-web`:

- Vite
- React 19
- TanStack Router
- Tailwind CSS 4
- pnpm workspaces
- Turborepo
- Biome-based linting and formatting

The platform should use:

- the approved baseline of Vite, React 19, TanStack Router, Tailwind CSS 4, pnpm workspaces, Turborepo, and Biome
- `~/Personal/projects/templates/vite-starters/intent-dashboard` as the preferred scaffold source for `apps/toolbox-web`
- `pnpx create-xtarter-app` as the fallback scaffold source if the local template is unavailable or unsuitable

The starter should be adapted rather than rebuilt from scratch. Useful shell, route, and module structure from the starter should be retained where practical, with only light cleanup of clearly unused sample pages or modules.

## Consequences

### Positive

- **POS-001**: The baseline aligns closely with `zippy-img`, reducing migration cost for one of the existing tools.
- **POS-002**: Vite and TanStack Router provide a fast local development loop and straightforward route-based composition for a client-heavy toolbox app.
- **POS-003**: One frontend baseline avoids carrying both Vite and Next.js as first-class long-term frameworks.
- **POS-004**: Tailwind CSS 4 and React 19 are already present in the current ecosystem around these tools.

### Negative

- **NEG-001**: `wa-link-helper` must be ported from Next.js rather than preserved as-is.
- **NEG-002**: Platform capabilities tied to Next.js conventions, such as App Router structure, are not retained automatically.
- **NEG-003**: The starter may include sample pages, modules, or conventions that are not all needed for the toolbox platform.
- **NEG-004**: The team must define metadata and deployment conventions directly instead of inheriting them from Next.js defaults.
- **NEG-005**: The team must avoid over-cleaning the scaffold, or it will lose the delivery speed advantage the starter provides.

## Alternatives Considered

### Next.js as the Unified Baseline

- **ALT-001**: **Description**: Standardize the toolbox platform on Next.js and port `zippy-img` into it.
- **ALT-002**: **Rejection Reason**: This increases migration cost for the tool already closest to the desired route-driven SPA structure and adds framework overhead that is not necessary for the current toolbox scope.

### Dual-Framework Monorepo

- **ALT-003**: **Description**: Keep both Vite and Next.js as first-class long-term app frameworks in the monorepo.
- **ALT-004**: **Rejection Reason**: This preserves duplicated routing, metadata, deployment, and design integration concerns, reducing the benefits of unification.

### Hand-Built Minimal Scaffold

- **ALT-005**: **Description**: Build `apps/toolbox-web` from scratch with only the minimum Vite, React, and TanStack pieces.
- **ALT-006**: **Rejection Reason**: This throws away useful starter structure and increases the amount of foundation work that must be rebuilt manually.

## Implementation Notes

- **IMP-001**: Scaffold `apps/toolbox-web` from `~/Personal/projects/templates/vite-starters/intent-dashboard` when available, or from `pnpx create-xtarter-app` as fallback.
- **IMP-002**: Keep starter shell, route, and module structure where it helps the platform move faster.
- **IMP-003**: Keep package tasks defined at the package level and orchestrated through `turbo run`.
- **IMP-004**: Remove or simplify only clearly unused sample pages, demo modules, and placeholder data.
- **IMP-005**: Avoid premature shared UI extraction; keep the first migrations focused on route and package boundaries.

## References

- **REF-001**: `docs/INIT.md`
- **REF-002**: `docs/adr/adr-0001-single-app-toolbox-web.md`
- **REF-003**: Existing source repos: `../zippy-img`, `../wa-link-helper`
