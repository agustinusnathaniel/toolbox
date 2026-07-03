# Toolbox

A unified web platform for focused utility tools. Compress images, generate QR codes, check user agents, and more — all in one place, all browser-based.

---

## Features

- **WA Link Helper** — Generate WhatsApp links with pre-filled messages
- **zippy** — Compress images securely in-browser with no server upload
- **UA Check** — Inspect your browser and device user agent
- **QR Code Generator** — Create QR codes for URLs or vCard contact info
- **JS Performance Comparator** — Compare JavaScript snippet execution in sandboxed runtimes
- **EV Charging Estimator** — Estimate how much kWh you need to charge your EV, accounting for charging losses
- **Add to Calendar** — Generate Add to Calendar links for Google Calendar events

## Tech Stack

- **React 19** + **Vite** — Cutting-edge performance and latest React features
- **TanStack Router** — Fully type-safe file-based routing
- **Tailwind CSS 4** — Modern styling with native OKLCH support
- **React Aria Components** — Accessible UI primitives out of the box
- **pnpm** — Fast, efficient package manager

## Getting Started

### Prerequisites

- Node.js ^24.11.x
- pnpm@10.24.0

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`.

### Building

```bash
pnpm build
```

### Testing

```bash
pnpm test          # Run all tests
pnpm test:ui       # Run tests with UI
```

## Project Structure

```
toolbox/
├── src/
│   ├── routes/          # TanStack Router file-based routes
│   │   └── _tools/      # Individual tool routes
│   └── lib/
│       ├── components/  # UI primitives
│       ├── analytics/   # Event tracking
│       └── utils/       # Shared utilities
├── public/              # Static assets
└── docs/                # (reserved for future ADRs)
```

## Documentation

- [**SPEC.md**](./SPEC.md) — System specification and architecture
- [**CONTRIBUTING.md**](./CONTRIBUTING.md) — How to add new tools and code guidelines
- [**AGENTS.md**](./AGENTS.md) — Guidance for AI coding agents

## Deployment

The app can be deployed to any static hosting:

- **Vercel**: Zero-config via `vercel.json`
- **Netlify**: Configured via `netlify.toml`
- **Other**: Build output in `dist/` can be served statically

## License

MIT
