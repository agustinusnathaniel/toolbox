---
title: "ADR-0001: Single-App Toolbox Web Architecture"
status: "Accepted"
date: "2026-03-31"
authors: "Nathan, OpenCode"
tags: ["architecture", "decision", "toolbox", "platform"]
supersedes: ""
superseded_by: ""
---

# ADR-0001: Single-App Toolbox Web Architecture

## Status

**Accepted** | Proposed | Rejected | Superseded | Deprecated

## Context

The current tools were built as separate projects for separate needs. The `toolbox` repo is intended to become the unified platform where those tools live under one brand and one consistent experience.

The first tools in scope are:

- `zippy-img`, a browser-side image compression tool
- `wa-link-helper`, a WhatsApp link generator
- a new JS performance comparator

The platform needs to support:

- unified branding and navigation
- easier maintenance and release management
- future addition of more tools without duplicating shell code
- a clear migration path from existing standalone projects

Two main structural options were considered:

- a single primary web app that hosts all tool routes
- a portal app that links to separate tool apps inside one monorepo

## Decision

Build a single primary web application at `apps/toolbox-web` and port the existing tools into that app as first-class routes.

Shared business logic should be extracted into `packages/*-core` packages, but the user-facing experience should remain centered in one app.

This decision is intended to optimize for product cohesion, easier maintenance, and a cleaner future path for adding tools.

## Consequences

### Positive

- **POS-001**: Users get one cohesive experience with one navigation model, one catalog, and one visual language.
- **POS-002**: Product-level concerns such as metadata, analytics, branding, and layout are implemented once.
- **POS-003**: New tools can be added as routes while sharing the existing shell and platform conventions.
- **POS-004**: Porting the current small apps into one app reduces long-term operational duplication.

### Negative

- **NEG-001**: Existing standalone apps cannot be copied in wholesale; they must be migrated into the new route model.
- **NEG-002**: Some app-local UI code will be rewritten rather than preserved exactly.
- **NEG-003**: The single app must be designed carefully so tool-specific needs do not create tight coupling.
- **NEG-004**: Large future tools may eventually challenge the single-app model and require reevaluation.

## Alternatives Considered

### Portal Plus Separate Tool Apps

- **ALT-001**: **Description**: Keep each tool in its own app inside one monorepo and unify with a top-level catalog or shell.
- **ALT-002**: **Rejection Reason**: This preserves framework and deployment duplication, weakens the sense of one product, and pushes UX inconsistency forward instead of resolving it.

### Keep Independent Repos

- **ALT-003**: **Description**: Leave each tool in its own repository and create a lightweight landing page elsewhere.
- **ALT-004**: **Rejection Reason**: This fails the maintenance and unification goals, keeps release work fragmented, and does not provide a true platform experience.

## Implementation Notes

- **IMP-001**: Build `apps/toolbox-web` first, then port existing tools into route-based slices.
- **IMP-002**: Extract pure logic into `packages/wa-link-core`, `packages/zippy-core`, and `packages/js-perf-comp-core`.
- **IMP-003**: Keep shared UI extraction out of the critical path until at least two tool routes are stable.
- **IMP-004**: Prefer vertical migrations: foundation, shell, one migrated tool, next migrated tool, then new tool.

## References

- **REF-001**: `docs/INIT.md`
- **REF-002**: `docs/adr/adr-0002-vite-react-tanstack-platform-baseline.md`
- **REF-003**: Existing source repos: `../zippy-img`, `../wa-link-helper`
