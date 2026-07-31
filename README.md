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
- **JSON Formatter** — Format, validate, and minify JSON
- **Color Converter** — Convert colors between HEX, RGB, HSL, and OKLCH formats
- **Add to Calendar** — Generate Add to Calendar links for Google Calendar events
- **Base64 Encoder/Decoder** — Encode and decode text between UTF-8 and Base64
- **Password Generator** — Generate strong, random passwords with selectable character sets

## Tech Stack

- **React 19** + **Vite** — Cutting-edge performance and latest React features
- **TanStack Router** — Fully type-safe file-based routing
- **Tailwind CSS 4** — Modern styling with native OKLCH support
- **React Aria Components** — Accessible UI primitives out of the box
- **pnpm** — Fast, efficient package manager

## Getting Started

### Prerequisites

- Node.js ^24.16.x
- pnpm@11.8.0

### Installation

```bash
pnpm install
```

3. Copy `.env.example` to `.env` and adjust if needed (most tools work without configuration):

   ```bash
   cp .env.example .env
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
│   ├── routes/             # TanStack Router file-based routes
│   │   └── _tools/         # Individual tool routes
│   └── lib/
│       ├── analytics/      # Event tracking
│       ├── components/     # Shared UI components
│       │   ├── animations/ # Animation wrappers (stagger-children)
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
