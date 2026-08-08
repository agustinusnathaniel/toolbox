# SPEC.md — Toolbox Platform

## Overview

Toolbox is a unified web platform that hosts multiple focused utility tools under one branded experience. The platform is built as a single-page application using TanStack Start (SPA mode, built on TanStack Router) for routing and prerendering, with business logic co-located alongside route components.

## Architecture

### Repository Structure

```
toolbox/
├── src/
│   ├── routes/             # TanStack Start file-based routes
│   │   └── _tools/         # Individual tool routes
│   └── lib/
│       ├── analytics/      # Event tracking
│       ├── components/     # Shared UI components
│       │   ├── animations/ # Animation wrappers
│       │   ├── global-command-menu/  # Command palette
│       │   └── ui/         # shadcn/IntentUI component primitives
│       ├── hooks/          # Shared React hooks
│       ├── js-perf-comp-core/  # JS perf comparison engine (grandfathered)
│       ├── layout/         # Root layout, sidebar, footer
│       ├── navigation/     # Tool registry
│       ├── pages/          # Info pages (changelog)
│       ├── styles/         # CSS, design tokens, globals
│       ├── tools/          # Per-tool business logic (adapters/)
│       └── utils/          # Shared utilities
├── content/                # MDX content (changelog)
└── public/                 # Static assets
```

### Core Concepts

#### 1. Route-Based Tool Composition

Each tool lives as a route under `src/routes/_tools/<tool-name>/`. The root layout provides:

- Global navigation sidebar
- Tool-specific headings via `staticData.meta.pageTitle`
- Consistent page structure

#### 2. Core Logic

Business logic is co-located with routes under `src/lib/tools/<tool-name>/`:

- **Pure logic only**: No UI imports, no route-specific state
- **Browser-safe**: No server-only APIs
- **Testable independently**: Can be unit tested without the full app

#### 3. Metadata System

Each tool route owns its metadata in `src/routes/_tools/<tool-name>/-meta.ts` (with `pageTitle`, `description`, and `slug`). The route module imports that sidecar for both `staticData.meta` and its `head` export. The leading `-` keeps the sidecar out of TanStack Router's file-route scan. The navigation catalog imports only those lightweight route metadata sidecars, then combines them with navigation-only discovery configuration such as category, icon, order, and mobile label. It never imports tool route implementations, so `/homepage` remains free of tool runtime code. A shared utility in `src/lib/utils/metadata.ts` provides site-level constants (`SITE_NAME`, `SITE_DESCRIPTION`) and the configured public origin. Set `VITE_PUBLIC_SITE_URL` for the deployment origin; a fixed canonical fallback is used when it is absent so generated URLs do not depend on the request host.

#### 4. Route Shells and Marketing Entry

The root route uses the app shell by default. `/` remains the fast PWA utility catalog and keeps the PWA manifest `start_url` at `/`. The promotional `/homepage` route opts into the marketing shell with `staticData.shell: 'marketing'`; that shell intentionally omits the app sidebar, breadcrumbs, command menu, and mobile bottom navigation. Existing tool routes and other informational routes continue to use the default app shell.

#### 5. Analytics Instrumentation

The `src/lib/analytics/` module provides:

- Event tracking (`track`, `page`)
- Tool-specific helpers (`trackToolEntry`, `trackToolCompletion`, `trackAction`)
- Development-mode logging (enable with `VITE_ANALYTICS_DEBUG=true`)
- Extensible tracker interface for future analytics provider integration

### State Management

- **Component-local state**: `useState`/`useRef` for component-level concerns
- **Shareable state**: URL search params via `validateSearch` + Zod (shareable, bookmarkable)
- **Persisted preferences**: `usePersistedState` for localStorage-backed settings

### Design System

Built on:

- **React Aria Components**: Accessible UI primitives
- **Tailwind CSS 4**: Styling via `@theme` tokens
- **Tailwind Variants**: Component-level variant logic

## Data Flow

```mermaid
graph TD
    A[Entry: src/router.tsx + getRouter()] --> B[TanStack Start (SPA)]
    B --> C[Root Layout]
    C --> D[Tool Layout]
    D --> E[Tool Route Component]

    E --> F[Core Package]
    F --> G[Pure Business Logic]

    E --> H[Analytics]
    H --> I[Console in Dev]
    H --> J[Tracker Interface]
```

## Tool Addition Workflow

1. Create route at `src/routes/_tools/<tool-name>/index.tsx`
2. Create `src/routes/_tools/<tool-name>/-meta.ts` with the route's `pageTitle`, `description`, and `slug`; import it into the route's `staticData.meta` and `head`
3. Import the metadata sidecar and add navigation-only discovery fields to `src/lib/navigation/tool-catalog.tsx`; do not copy title or description strings there
4. Extract business logic to `src/lib/tools/<tool-name>/`
5. (Optional) Add analytics tracking with `useToolTracking`

See **CONTRIBUTING.md** for detailed instructions.

## Non-Goals

- **SSR**: This is a client-side only (Vite) application.
- **Multi-tenant**: Assumes single organization context.
- **Backend API**: All tools are browser-based with no server dependency.

## Known Limitations

- PWA service worker is disabled by default.
- Auth is not implemented (no user accounts or personalization).
- All tools are client-side only; no data persists across sessions.
